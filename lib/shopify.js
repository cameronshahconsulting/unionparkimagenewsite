// Shopify helpers — Storefront API (catalog) + Admin API (exact-price draft checkout).

/** Host only — strips https:// if pasted into Vercel env by mistake. */
function shopifyHost(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  return s
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .split("/")[0];
}

const DOMAIN = shopifyHost(process.env.SHOPIFY_STORE_DOMAIN);
const TOKEN = String(process.env.SHOPIFY_STOREFRONT_TOKEN || "").trim();
/** Custom app Client ID + secret → short-lived Admin token (auto-refreshed, ~24h). */
const API_KEY = String(
  process.env.SHOPIFY_API_KEY || process.env.SHOPIFY_CLIENT_ID || ""
).trim();
const API_SECRET = String(
  process.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_CLIENT_SECRET || ""
).trim();

export const shopifyConfigured = Boolean(DOMAIN && TOKEN);
/** Exact pricing via client-credentials Admin token exchange. */
export const shopifyExactCheckoutConfigured = Boolean(DOMAIN && API_KEY && API_SECRET);
/** Checkout works with Admin (exact) or Storefront (list prices only). */
export const shopifyCheckoutConfigured = shopifyExactCheckoutConfigured || shopifyConfigured;

/** In-memory cache for client-credentials Admin tokens (~24h TTL). */
let cachedAdminToken = null;
let cachedAdminTokenExpiresAt = 0;
let adminTokenInflight = null;

/**
 * Exchange SHOPIFY_API_KEY + SHOPIFY_API_SECRET for an Admin access token.
 * Cached in memory and refreshed automatically before expiry — no manual rotation.
 */
async function getAdminAccessToken() {
  if (!DOMAIN || !API_KEY || !API_SECRET) {
    throw new Error(
      "Shopify Admin API is not configured. Set SHOPIFY_API_KEY and SHOPIFY_API_SECRET."
    );
  }

  const skewMs = 60_000; // refresh 1 minute early
  if (cachedAdminToken && Date.now() < cachedAdminTokenExpiresAt - skewMs) {
    return cachedAdminToken;
  }

  if (adminTokenInflight) return adminTokenInflight;

  adminTokenInflight = (async () => {
    const res = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: API_KEY,
        client_secret: API_SECRET,
      }),
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.access_token) {
      const detail =
        json.error_description ||
        json.error ||
        (Object.keys(json).length ? JSON.stringify(json) : `HTTP ${res.status}`);
      throw new Error(`Shopify Admin token exchange failed: ${detail}`);
    }
    cachedAdminToken = json.access_token;
    const expiresIn = Number(json.expires_in) || 86399;
    cachedAdminTokenExpiresAt = Date.now() + expiresIn * 1000;
    return cachedAdminToken;
  })().finally(() => {
    adminTokenInflight = null;
  });

  return adminTokenInflight;
}

async function storefront(query, variables = {}, { cache } = {}) {
  if (!shopifyConfigured) throw new Error("Shopify Storefront is not configured");
  const res = await fetch(`https://${DOMAIN}/api/2024-07/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    ...(cache === "no-store" ? { cache: "no-store" } : { next: { revalidate: 300 } }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function admin(query, variables = {}) {
  if (!shopifyExactCheckoutConfigured) {
    throw new Error(
      "Shopify Admin API is not configured. Set SHOPIFY_API_KEY and SHOPIFY_API_SECRET."
    );
  }
  const accessToken = await getAdminAccessToken();
  const res = await fetch(`https://${DOMAIN}/admin/api/2024-07/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

export async function getProducts(first = 24) {
  const data = await storefront(
    `query($first:Int!){ products(first:$first){ edges{ node{
      id handle title description
      priceRange{ minVariantPrice{ amount currencyCode } }
      featuredImage{ url altText }
      variants(first:10){ edges{ node{ id sku title availableForSale price{ amount } } } }
    }}}}`,
    { first }
  );
  return data.products.edges.map((e) => e.node);
}

/**
 * Build sku → variant GID map from the Storefront catalog (paginated).
 */
export async function variantIdBySku() {
  if (!shopifyConfigured) return {};
  const map = {};
  let cursor = null;
  for (;;) {
    const data = await storefront(
      `query($cursor:String){
        products(first:50, after:$cursor){
          pageInfo{ hasNextPage endCursor }
          edges{ node{
            variants(first:50){ edges{ node{ id sku } } }
          }}
        }
      }`,
      { cursor }
    );
    for (const { node: p } of data.products.edges) {
      for (const { node: v } of p.variants?.edges || []) {
        if (v.sku) map[String(v.sku).trim()] = v.id;
      }
    }
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
  return map;
}

export async function createCart(lines, attributes = []) {
  const data = await storefront(
    `mutation($lines:[CartLineInput!]!,$attrs:[AttributeInput!]){
      cartCreate(input:{ lines:$lines, attributes:$attrs }){
        cart{ id checkoutUrl }
        userErrors{ field message }
      }
    }`,
    { lines, attrs: attributes },
    { cache: "no-store" }
  );
  const payload = data.cartCreate;
  if (payload.userErrors?.length) {
    throw new Error(payload.userErrors.map((e) => e.message).join("; "));
  }
  return payload.cart;
}

export async function applyDiscountCodes(cartId, codes = []) {
  const data = await storefront(
    `mutation($cartId:ID!,$codes:[String!]!){
      cartDiscountCodesUpdate(cartId:$cartId, discountCodes:$codes){
        cart{
          id
          checkoutUrl
          discountCodes{ code applicable }
          cost{
            subtotalAmount{ amount currencyCode }
            totalAmount{ amount currencyCode }
          }
        }
        userErrors{ field message }
      }
    }`,
    { cartId, codes: codes.filter(Boolean) },
    { cache: "no-store" }
  );
  const payload = data.cartDiscountCodesUpdate;
  if (payload.userErrors?.length) {
    throw new Error(payload.userErrors.map((e) => e.message).join("; "));
  }
  return payload.cart;
}

/** Create a cart, optionally apply discount codes, return checkout URL. */
export async function checkoutWithCart({ lines, attributes = [], discountCodes = [] }) {
  const cart = await createCart(lines, attributes);
  if (!cart?.id) throw new Error("Could not create Shopify cart");
  if (discountCodes.length) {
    const updated = await applyDiscountCodes(cart.id, discountCodes);
    return updated || cart;
  }
  return cart;
}

/**
 * Exact-price checkout via Draft Order (Admin API).
 * Line items keep Shopify variant IDs; volume % is applied as a line discount.
 * Delivery is a custom shipping line matching the on-site flat rate.
 */
export async function checkoutWithDraftOrder({
  lineItems,
  shippingLine = null,
  note = "",
  tags = [],
  customAttributes = [],
  discountCodes = [],
  email = null,
  shippingAddress = null,
}) {
  const input = {
    lineItems,
    note: note || undefined,
    tags: tags.length ? tags : undefined,
    customAttributes: customAttributes.length ? customAttributes : undefined,
    acceptAutomaticDiscounts: false,
    taxExempt: false,
  };

  if (email) {
    input.email = String(email).trim().slice(0, 120);
  }

  if (shippingAddress && typeof shippingAddress === "object") {
    input.shippingAddress = {
      address1: String(shippingAddress.address1 || "").slice(0, 255),
      address2: shippingAddress.address2
        ? String(shippingAddress.address2).slice(0, 255)
        : undefined,
      city: String(shippingAddress.city || "").slice(0, 100),
      provinceCode: String(shippingAddress.provinceCode || shippingAddress.province || "")
        .slice(0, 10)
        .toUpperCase(),
      zip: String(shippingAddress.zip || "").slice(0, 20),
      countryCode: String(shippingAddress.countryCode || "US").slice(0, 2).toUpperCase(),
      firstName: shippingAddress.firstName
        ? String(shippingAddress.firstName).slice(0, 80)
        : undefined,
      lastName: shippingAddress.lastName
        ? String(shippingAddress.lastName).slice(0, 80)
        : undefined,
      phone: shippingAddress.phone ? String(shippingAddress.phone).slice(0, 40) : undefined,
    };
  }

  if (shippingLine) {
    input.shippingLine = {
      title: String(shippingLine.title).slice(0, 100),
      price: Number(shippingLine.price || 0).toFixed(2),
    };
  }

  if (discountCodes?.length) {
    input.discountCodes = discountCodes.filter(Boolean);
  }

  const data = await admin(
    `mutation($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          name
          invoiceUrl
          status
          totalPrice
        }
        userErrors { field message }
      }
    }`,
    { input }
  );

  const payload = data.draftOrderCreate;
  if (payload.userErrors?.length) {
    throw new Error(payload.userErrors.map((e) => e.message).join("; "));
  }
  const draft = payload.draftOrder;
  if (!draft?.invoiceUrl) {
    throw new Error("Draft order created but no invoice/checkout URL was returned.");
  }
  return {
    checkoutUrl: draft.invoiceUrl,
    draftOrderId: draft.id,
    draftName: draft.name,
    totalPrice: draft.totalPrice,
    pricingExact: true,
  };
}

/**
 * Sum paid order merchandise subtotals via Admin API (needs read_orders).
 * Used for the cancer-research progress estimate (revenue × allocation rate).
 * Returns null when Admin isn't configured or the query can't run.
 */
export async function getPaidOrderRevenue({ maxPages = 40 } = {}) {
  if (!shopifyExactCheckoutConfigured) return null;

  let revenue = 0;
  let orderCount = 0;
  let cursor = null;
  let pages = 0;

  for (;;) {
    const data = await admin(
      `query($cursor: String) {
        orders(
          first: 100
          after: $cursor
          query: "financial_status:paid"
          sortKey: CREATED_AT
          reverse: true
        ) {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              currentSubtotalPriceSet { shopMoney { amount } }
            }
          }
        }
      }`,
      { cursor }
    );

    const conn = data?.orders;
    if (!conn) return null;

    for (const { node } of conn.edges || []) {
      revenue += Number(node?.currentSubtotalPriceSet?.shopMoney?.amount || 0);
      orderCount += 1;
    }

    pages += 1;
    if (!conn.pageInfo?.hasNextPage || pages >= maxPages) break;
    cursor = conn.pageInfo.endCursor;
  }

  return { revenue, orderCount };
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "./Toast";
import { friendlyName, displaySize } from "@/lib/plant-visuals";
import { plantBySku } from "@/lib/inventory";

const Ctx = createContext(null);
const STORAGE_KEY = "upl-cart-v1";
const LEGACY_STORAGE_KEY = "annies-cart-v1";

function loadCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function cartDisplayName(product) {
  if (product.kind === "christmas") return product.name;
  const common = friendlyName(product);
  return common || product.name || "Plant";
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const toastApi = useToast();

  useEffect(() => {
    const loaded = loadCart();
    // Drop any line that's since been pulled from sale (see lib/plant-restrictions) —
    // a stale cart can hold a SKU from before it was restricted.
    const dropped = loaded.some(
      (x) => x.kind !== "christmas" && x.sku && plantBySku(x.sku)?.availableForSale === false
    );
    const clean = loaded.filter(
      (x) => x.kind === "christmas" || !x.sku || plantBySku(x.sku)?.availableForSale !== false
    );
    setItems(clean);
    setReady(true);
    if (dropped) {
      toastApi?.toast?.({
        title: "Cart updated",
        message: "One item is no longer available and has been removed from your cart.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = (product, qty = 1, opts = {}) => {
    const q = Math.max(1, Math.floor(Number(qty) || 1));
    const key = product.cartKey || product.sku;
    const name = cartDisplayName(product);
    const size = product.kind === "christmas" ? product.size || "" : displaySize(product.size) || product.size || "";
    setItems((prev) => {
      const i = prev.findIndex((x) => (x.cartKey || x.sku) === key);
      if (i >= 0 && product.kind !== "christmas") {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + q };
        return next;
      }
      // Christmas reservations stay qty 1; same size/week replaces rather than stacking.
      if (i >= 0 && product.kind === "christmas") {
        const next = [...prev];
        next[i] = {
          ...next[i],
          ...product,
          cartKey: key,
          qty: 1,
          price: Number(product.price) || 0,
          name,
          size,
        };
        return next;
      }
      return [
        ...prev,
        {
          cartKey: key,
          sku: product.sku,
          name,
          botanical: product.kind === "christmas" ? null : product.name || null,
          price: Number(product.price) || 0,
          art: product.art || "/plants/HY-SC-3G.jpg",
          variantId: product.variantId || null,
          size,
          qty: product.kind === "christmas" ? 1 : q,
          kind: product.kind || "plant",
          meta: product.meta || null,
        },
      ];
    });
    if (!opts.silent) {
      toastApi?.toast?.({
        title: product.kind === "christmas" ? "Tree reserved" : "Added to cart",
        message: q > 1 && product.kind !== "christmas" ? `${q} × ${name}` : name,
      });
    }
  };

  /** @deprecated Prefer addItem — kept for accidental call sites. */
  const add = (productOrQty, qty = 1) => {
    if (productOrQty && typeof productOrQty === "object" && productOrQty.sku) {
      addItem(productOrQty, qty);
    }
  };

  const setQty = (skuOrKey, qty) => {
    const q = Math.floor(Number(qty) || 0);
    setItems((prev) => {
      if (q <= 0) return prev.filter((x) => (x.cartKey || x.sku) !== skuOrKey && x.sku !== skuOrKey);
      return prev.map((x) =>
        (x.cartKey || x.sku) === skuOrKey || x.sku === skuOrKey
          ? { ...x, qty: x.kind === "christmas" ? 1 : q }
          : x
      );
    });
  };

  const removeItem = (skuOrKey) =>
    setItems((prev) =>
      prev.filter((x) => (x.cartKey || x.sku) !== skuOrKey && x.sku !== skuOrKey)
    );
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <Ctx.Provider value={{ items, count, ready, addItem, add, setQty, removeItem, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => useContext(Ctx);

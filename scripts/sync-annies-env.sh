#!/usr/bin/env bash
# Copy Annie's .env.local into this repo with labeled sections.
# Usage: ./scripts/sync-annies-env.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANNIE_ENV="${ANNIE_ENV:-$HOME/Documents/GitHub/anniesonlinenursery/.env.local}"
DEST="$ROOT/.env.local"

if [[ ! -f "$ANNIE_ENV" ]]; then
  echo "Missing Annie env: $ANNIE_ENV" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a
# Export keys without executing arbitrary content: parse KEY=VALUE lines only
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  [[ "$line" != *=* ]] && continue
  key="${line%%=*}"
  val="${line#*=}"
  key="$(echo "$key" | xargs)"
  printf -v "$key" '%s' "$val"
  export "$key"
done < "$ANNIE_ENV"
set +a

cat > "$DEST" << EOF
# =============================================================================
# Union Park Landscaping — local secrets
# Synced from Annie's Online Nursery so the shared garden designer works here.
# Source: $ANNIE_ENV
# DO NOT commit (.gitignore: .env*)
# =============================================================================

# -----------------------------------------------------------------------------
# Shopify — Annie's store (plant catalog + cart / checkout URLs)
# -----------------------------------------------------------------------------
# Store domain only (no https://)
SHOPIFY_STORE_DOMAIN=${SHOPIFY_STORE_DOMAIN:-}
# Storefront API token (cart create / catalog)
SHOPIFY_STOREFRONT_TOKEN=${SHOPIFY_STOREFRONT_TOKEN:-}
# Admin custom-app Client ID + secret (draft orders / exact pricing)
SHOPIFY_API_KEY=${SHOPIFY_API_KEY:-}
SHOPIFY_API_SECRET=${SHOPIFY_API_SECRET:-}

# -----------------------------------------------------------------------------
# Supabase — shared design storage (permalinks, images, OTP / quota)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}
# Server-only — never expose to the browser
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-}

# -----------------------------------------------------------------------------
# Gemini — AI plant plans + yard image renders (server only)
# -----------------------------------------------------------------------------
GEMINI_API_KEY=${GEMINI_API_KEY:-}
GEMINI_PLAN_MODEL=${GEMINI_PLAN_MODEL:-}
GEMINI_PLAN_FALLBACK_MODEL=${GEMINI_PLAN_FALLBACK_MODEL:-}
GEMINI_IMAGE_MODEL=${GEMINI_IMAGE_MODEL:-}
GEMINI_IMAGE_FALLBACK_MODEL=${GEMINI_IMAGE_FALLBACK_MODEL:-}

# -----------------------------------------------------------------------------
# Resend — designer email OTP + lead / install emails
# -----------------------------------------------------------------------------
RESEND_API_KEY=${RESEND_API_KEY:-}
# From-address (shared Annie sender is fine for OTP)
RESEND_FROM_EMAIL=${RESEND_FROM_EMAIL:-}
# Annie's contact inbox
CONTACT_TO_EMAIL=${CONTACT_TO_EMAIL:-}
# UPL lead delivery (install quotes from this site)
LEAD_EMAIL_TO=unionparklandscaping@gmail.com
LEAD_EMAIL_FROM=${RESEND_FROM_EMAIL:-}
UPL_INSTALL_EMAIL=unionparklandscaping@gmail.com

# -----------------------------------------------------------------------------
# Public site / compliance
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_NURSERY_LICENSE=${NEXT_PUBLIC_NURSERY_LICENSE:-}
NEXT_PUBLIC_COMPANY_ADDRESS=${NEXT_PUBLIC_COMPANY_ADDRESS:-}

# -----------------------------------------------------------------------------
# Impact / cancer-research progress (Annie's Shopify sales math)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_DONATION_GOAL=${NEXT_PUBLIC_DONATION_GOAL:-}
NEXT_PUBLIC_DONATION_RAISED=${NEXT_PUBLIC_DONATION_RAISED:-}

# -----------------------------------------------------------------------------
# Security helpers
# -----------------------------------------------------------------------------
RATE_LIMIT_SALT=${RATE_LIMIT_SALT:-}
CRON_SECRET=${CRON_SECRET:-}
EOF

echo "Wrote $DEST"
echo "Keys:"
grep -E '^[A-Z_]+=' "$DEST" | cut -d= -f1 | sed 's/^/  - /'
echo
echo "Restart the dev server so Next picks up the new env."

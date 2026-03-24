---
id: 008
type: bug
severity: high
status: new
found: 2026-03-24
phase: audit
---

## Checkout flow drives 25% of the score but has only 1 scenario that doesn't test cart or checkout

**What:** The checkout-flow category carries 25% of the composite score, but only has a single scenario (`shopify-cart-update.yaml`) that checks if the *search results* contain a `product_id` field. It never actually calls `add_to_cart` or `checkout` tools. This means a store could score 100% on checkout flow without MCPLens ever verifying that cart or checkout actually works.

**Where:** `scanner/scenarios/shopify/checkout-flow/` — only contains `shopify-cart-update.yaml`

**Evidence:**

The single checkout scenario (`shopify-cart-update.yaml`) does this:
1. Setup: calls `search` with `{ query: "shoes", limit: 3 }`
2. Assertions: checks that `search_results.products` is non-empty and that `search_results.products.0.product_id` exists

That's it. No `add_to_cart` call. No `checkout` call. No cart mutation verification.

Compare to the scoring weight from `scanner/src/constants.ts`:
```typescript
checkout: { weight: 0.25 }  // 25% of total score
```

And the capability mapper recognizes these tools:
```typescript
"add_to_cart" → add_to_cart, cart_add, create_cart, update_cart, get_cart
"checkout" → checkout, create_order, place_order, purchase
```

But no scenario ever uses these capabilities.

Additionally found in the audit:
- `shopify-filtered-search.yaml` checks field presence but never tests an actual filter query
- `shopify-variant-check.yaml` assumes all products have variants (will false-negative on simple products)
- `shopify-description-check.yaml` has redundant duplicate assertions on the `title` field (lines 19-34)
- `shopify-price-check.yaml` score_killer_cap of 50 is too harsh — missing 1 price in 10 products tanks the entire category

**Why this matters:** A Shopify store owner pays for MCPLens to understand how well AI agents can buy from their store. The checkout flow — can an agent actually add something to cart and start a purchase? — is arguably the *most* important question. Yet MCPLens currently gives a checkout score based solely on whether product IDs exist in search results.

This creates two problems:
1. **False confidence:** A store owner sees "Checkout: 95/100" and thinks their checkout works for AI agents, when it was never tested. If they later discover agents can't actually buy, they lose trust in MCPLens entirely.
2. **Missed value:** The stores that would benefit most from MCPLens are the ones with broken checkout flows. By not testing this, MCPLens is missing the highest-value findings it could deliver.

For a product positioning itself as "Lighthouse for agent commerce," having a hollow checkout score is like Lighthouse giving a perfect accessibility score without checking color contrast.

**Suggested Fix:** Add 2 new scenarios to `scanner/scenarios/shopify/checkout-flow/`:

1. **`shopify-add-to-cart.yaml`** — setup: search for a product → step: call `add_to_cart` with the product's ID → assert: cart response contains the item, has a total, and returns a cart ID. If `add_to_cart` capability doesn't exist, mark as "Not Tested" rather than passing silently.

2. **`shopify-checkout-initiation.yaml`** — setup: add item to cart → step: call `checkout` → assert: response contains a checkout URL or order confirmation. Score killer if checkout tool exists but fails.

Also consider:
- Adding an inventory/stock availability scenario (data-quality) — agents need to know what's in stock
- Softening the price-check score_killer_cap from 50 to 65 (one missing price in 10 shouldn't halve the category)
- Fixing the variant assertion to handle products without variants

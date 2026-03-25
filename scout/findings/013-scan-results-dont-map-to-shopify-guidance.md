---
id: 013
type: feature
severity: high
status: new
found: 2026-03-25
phase: product
---

## Scan results don't connect to Shopify's own agentic readiness guidance

**What:** Shopify published official guidance telling merchants exactly what to fix to be "agentic-ready" (structured variants, precise taxonomy, literal descriptions, real-time pricing). MCPLens scans for many of these same issues — but the scan results use generic category names ("Data Quality," "Product Discovery") and internal assertions that don't reference Shopify's language. A store owner who just read Shopify's blog post won't recognize that MCPLens is testing exactly what Shopify told them to fix.

**Where:** Scan results page (`frontend/src/pages/public/ScanResultPage.tsx`) and scenario descriptions (`scanner/scenarios/shopify/`)

**Evidence:**

Shopify's official "Agentic-Ready Product Data" guide (https://www.shopify.com/enterprise/blog/agentic-ready-product-data) tells merchants to:

1. **"Audit data location"** — check if product info is structured for AI, not hidden in JavaScript/templates
2. **"Structure variants correctly"** — group variants under parent products
3. **"Use precise taxonomy"** — use specific product types, not vague categories
4. **"Write literal descriptions"** — avoid marketing fluff in product fields

MCPLens tests related things:
- `shopify-variant-check.yaml` tests variant structure → maps to Shopify's #2
- `shopify-description-check.yaml` tests description presence → loosely maps to #4
- `shopify-price-check.yaml` tests price data → maps to real-time accuracy concern

But the scan results never say "Shopify recommends X, your store does Y." The findings use internal language like "Products missing 'variant_id'" instead of "Shopify's agentic readiness guide recommends structuring variants under parent products — your store's variants are missing identifiers that AI agents need."

Meanwhile, Shopify tells merchants to use tools like "Catalog Mapping" and "Combined Listings" — but doesn't offer a way to verify the result. MCPLens is the verification step, but doesn't position itself that way.

**Why this matters:** Store owners are getting pressure from multiple directions to become "agent-ready" — Shopify's blog, TechCrunch articles, agency consultants. When they search for how to check their readiness, they find guides telling them what to do but no tool to verify they did it right. MCPLens IS that verification tool, but the scan results speak in protocol language ("variant_id missing") instead of merchant language ("Shopify says structure your variants — here's what we found").

By mapping findings directly to Shopify's published guidance, MCPLens becomes the natural "after" step: "You read Shopify's guide → you made changes → now scan to verify." This creates an SEO funnel (people searching "Shopify agentic ready check" find MCPLens), a trust signal (aligned with Shopify's own recommendations), and a clearer value prop (we verify what Shopify tells you to do).

**Suggested Fix:** Add a "Shopify Guidance" reference to each finding in the scan results. When a finding maps to official Shopify advice, show it:

```
⚠ 34% of products missing structured price data

Shopify's agentic readiness guide recommends: "Pricing and inventory
must be current at moment of inquiry, not based on outdated scraping."

Your store: 34% of products returned by the MCP endpoint have no
price_range field. AI agents can't compare or purchase these products.

→ Fix: Add price data to these products in your Shopify admin, or
  check that your theme isn't hiding prices behind JavaScript logic.
```

This also opens an SEO opportunity — a blog post or landing page titled "How to verify Shopify's agentic readiness checklist" that drives organic traffic from merchants searching for exactly this.

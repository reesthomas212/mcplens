---
id: 023
type: feature
severity: high
status: implementing
found: 2026-03-25
phase: product
---

## MCPLens doesn't test the policies/FAQ tool — Shopify's 4th MCP capability is invisible

**What:** Shopify's Storefront MCP server exposes exactly 4 tools: `search_shop_catalog`, `search_shop_policies_and_faqs`, `get_cart`, and `update_cart`. MCPLens tests 3 of these (search, cart, checkout equivalents) but completely ignores `search_shop_policies_and_faqs`. This tool is how AI agents answer questions about shipping, returns, refund policies, and store FAQs — critical information buyers need before making a purchase. MCPLens's capability mapper doesn't recognize it, no scenarios test it, and no scoring category covers it.

**Where:**
- `scanner/src/constants.ts` — capability keyword dictionary (lines 10-35) has no "policies" or "FAQ" capability
- `scanner/scenarios/shopify/` — no scenario tests policy/FAQ queries
- Shopify docs: https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront — lists `search_shop_policies_and_faqs` as a core tool

**Evidence:**

Shopify's 4 MCP tools:
1. `search_shop_catalog` → MCPLens maps to `search` capability ✓
2. `search_shop_policies_and_faqs` → **NOT MAPPED, NOT TESTED** ✗
3. `get_cart` → MCPLens maps to `add_to_cart` capability ✓
4. `update_cart` → MCPLens maps to `add_to_cart`/`checkout` ✓

The policies tool accepts `{ query: "what's your return policy?", context: "..." }` and returns policy answers. AI agents use it when a buyer asks "do they offer free returns?" or "how long does shipping take?" — questions that directly influence purchase decisions.

MCPLens's keyword dictionary in `constants.ts`:
```typescript
// 4 capabilities defined: search, get_detail, add_to_cart, checkout
// No "policies" or "faq" capability
```

**Why this matters:** When an AI agent shops for a customer, the flow isn't just "find product → add to cart → checkout." The agent also needs to answer pre-purchase questions: "What's the return policy? Is shipping free? Do they accept PayPal?" These questions go through `search_shop_policies_and_faqs`. If a store's policy data is incomplete or poorly structured, the AI agent can't answer these questions confidently — and may recommend a competitor whose policies are clear.

For MCPLens specifically:
1. **Incomplete score** — a store could score 90/100 but have completely broken policy data. The score gives false confidence.
2. **Missing value for store owners** — the #1 reason AI agents fail to convert is buyer uncertainty about shipping/returns. MCPLens doesn't diagnose this.
3. **Differentiation opportunity** — no competitor tests this. Adding a "Policy Readiness" sub-category (or expanding Data Quality) to cover shipping, returns, and FAQ accessibility would make MCPLens the only tool that checks the full AI shopping experience.
4. **Aligns with Shopify guidance** — Shopify's enterprise blog says agents need to "answer questions about policies, shipping, returns, and FAQs" — MCPLens should verify this works.

**Suggested Fix:**

1. Add a `policies` capability to `constants.ts`:
```typescript
{
  capability: "policies",
  nameKeywords: ["search_shop_policies", "policies", "faq", "policy", "shipping_info"],
  descriptionKeywords: ["policy", "faq", "shipping", "returns", "help"],
  requiredParamPatterns: ["query"],
},
```

2. Add a new scenario `scanner/scenarios/shopify/data-quality/shopify-policies-check.yaml`:
```yaml
name: shopify-policies-check
description: "Verify the store's MCP endpoint can answer common buyer questions about shipping, returns, and policies"
category: data-quality
requires_capabilities: [policies]
setup:
  - action: policies
    params: { query: "what is your return policy?" }
    save_as: policy_result
steps:
  - assertion: field_present
    source: policy_result
    field: answer
    severity: high
    score_weight: 8
    message: "Store cannot answer return policy questions — AI agents will flag uncertainty to buyers"
```

3. Consider adding this to the scan results as a visible category or sub-section: "Can AI agents answer buyer questions about your store?"

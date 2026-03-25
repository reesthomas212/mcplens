---
id: 024
type: ux
severity: high
status: new
found: 2026-03-25
phase: product
---

## 32% of scanned stores get 100/100 — perfect scores kill the conversion funnel

**What:** Of the 107 stores scanned so far, 32% of the top 50 get a perfect 100/100 score. Major brands like Allbirds, Cotopaxi, and dozens of others all score 100 across all categories. When a store owner runs a free scan and gets 100/100, the product says "you're perfect" — so they have zero reason to sign up, pay for tracking, or explore paid features. The free scan that's meant to be the top-of-funnel hook is telling a third of users "you're done, nothing to fix."

**Where:**
- `https://mcplens.dev/api/benchmarks` — average 64, but the top stores all cluster at 100
- `https://mcplens.dev/api/leaderboard?limit=50` — 16 of 50 stores score exactly 100
- Scan results page: a 100/100 score shows green across all categories with no findings, no upsell context

**Evidence:**

Live benchmark data (107 stores):
```
Average: 64 | Median: 66
p10: 27 | p25: 36 | p50: 66 | p75: 92 | p90: 100

Top 50 leaderboard distribution:
  Perfect 100:  16 stores (32%)
  80-99:        23 stores (46%)
  50-79:        11 stores (22%)
  Below 50:     0 stores
```

Allbirds scan: 100/100 across all 4 categories. 10 scenarios, 5.9 seconds. No findings, no score killers, no recommendations.

A store owner who sees this thinks: "I'm already perfect. Why would I pay $29/mo?" The AI assessment and buyer simulation (paid features) might reveal real issues — description quality, product relevance, checkout friction — but the free scan says "all clear" with no hint that deeper analysis matters.

**Why this matters:** MCPLens's business model depends on the free scan creating urgency: "Your score is 47, agents are skipping your store, here's what to fix — upgrade to get the full fix guide." But when the score is 100, the urgency is zero. The conversion funnel breaks:

1. **No reason to sign up** — "I'm at 100, what would tracking give me?"
2. **No reason to buy AI assessment** — "Everything passed, why pay for deeper analysis?"
3. **No reason to come back** — "My score is perfect, nothing changes"

This is especially problematic because the stores most likely to be MCPLens customers (large Shopify brands with budgets for tools) are the ones most likely to score 100 — Shopify's MCP implementation handles the basics well for established stores.

The core issue: **the free scan tests Shopify's MCP implementation, not the store's product data quality.** The basic scenarios check "does the endpoint return products with prices?" — which Shopify handles automatically. The real value (and differentiation) is in the AI assessment: "are your descriptions good enough for agents to compare?", "does your search return relevant results for natural queries?", "can a buyer agent complete a full shopping journey?" These are the paid features, but they're positioned as add-ons rather than the core experience.

**Suggested Fix:** For stores that score above 90/100, add a "Going Deeper" section to the results page that reframes the narrative:

```
🎉 Your store's MCP endpoint is healthy — the basics work.

But that's what Shopify handles automatically. The real question is:
when an AI agent asks "find me comfortable running shoes under $150,"
does YOUR store win the comparison?

Your next step:
→ Get AI Quality Assessment ($5 or included in Pro) — we analyze
  whether your product descriptions, images, and pricing are competitive
  enough to win when AI agents compare you against other stores.
→ Run Buyer Simulation ($10 or included in Max) — watch an AI agent
  try to complete a real shopping journey in your store.
```

This reframes the 100/100 from "you're done" to "you passed the baseline — now compete." It shifts the value prop from "fix what's broken" to "optimize what works" — which is the real value for high-scoring stores that are already paying for other commerce tools.

Also consider adjusting the free scan to include at least one differentiation signal — e.g., a "Description Quality" sub-score that evaluates whether product descriptions are literal and structured (per Shopify's guidance) rather than just checking if they exist.

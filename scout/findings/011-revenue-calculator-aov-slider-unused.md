---
id: 011
type: bug
severity: medium
status: new
found: 2026-03-25
phase: product
---

## Revenue Calculator's AOV slider has no effect on the output — erodes trust

**What:** The Revenue Calculator on the pricing page has three sliders: Monthly Revenue, Agent Readiness Score, and Average Order Value (AOV). The AOV slider renders, the user can drag it, the value updates — but it's never used in the calculation. The output formula is `revenue × 5% × scoreGap × 5x`, which doesn't reference AOV at all. The user adjusts three inputs but only two affect the result.

**Where:** `frontend/src/components/RevenueCalculator.tsx` — lines 71-78

**Evidence:**

```typescript
const [aov, setAov] = useState(75);          // line 71: AOV state exists

const agentCommerceShare = 0.05;              // line 73
const scoreGap = (100 - score) / 100;         // line 74
const agentConversionMultiplier = 5;          // line 75

const monthlyLoss = revenue * agentCommerceShare * scoreGap * agentConversionMultiplier;  // line 77
// ↑ `aov` is not referenced anywhere in this calculation

const annualLoss = monthlyLoss * 12;          // line 78
```

The AOV slider (lines 157-178) renders with full styling, label, and value display. A user who drags it will see the number change on the slider but the annual loss figure stays exactly the same.

**Why this matters:** The Revenue Calculator is one of the strongest conversion tools on the pricing page — it makes the abstract ("agent commerce") feel personal ("you're leaving $X/yr on the table"). But a store owner who drags the AOV slider and notices nothing changes will immediately question the credibility of the entire calculation. It's a small detail that breaks trust at the exact moment you need the user to feel confident enough to click "Start 30-Day Trial."

Store owners are savvy about revenue calculators — they see them on every SaaS pricing page. A dead slider signals "this number was made up" rather than "this is a real estimate." It also means the estimate itself is less accurate — a store with $200 AOV has different agent commerce dynamics than one with $30 AOV.

**Suggested Fix:** Either incorporate AOV into the formula or remove the slider:

**Option A — Use AOV in the calculation** (better, makes the estimate more credible):
```typescript
// Agent commerce tends to capture higher-AOV purchases (research-heavy buying)
const agentAovMultiplier = aov > 100 ? 1.3 : aov > 50 ? 1.0 : 0.8;
const monthlyLoss = revenue * agentCommerceShare * scoreGap * agentConversionMultiplier * agentAovMultiplier;
```
This reflects that AI agents are more likely to drive purchases for higher-priced items (where comparison shopping is worth automating).

**Option B — Remove the slider** (simpler):
Delete lines 71, 82, and 156-179. Two sliders is cleaner than three, and the current formula works without AOV.

Option A is stronger — three inputs feels more thorough and the AOV data could also be used for personalized recommendations in the scan results ("At your $150 AOV, each agent conversion is worth X").

---
id: 009
type: ux
severity: high
status: new
found: 2026-03-24
phase: product
---

## Free scan results page has no clear "what should I do next?" moment

**What:** After a store owner runs a free scan and sees their score, the results page gives them a lot of data (score circle, 4 category cards, score killer alerts) but never pauses to tell them what this means or what they should do first. The page immediately scrolls into two upsell boxes (AI Assessment $5, Buyer Simulation $10) and then an email gate for fix details. A store owner who just learned they scored 47/100 is thinking "oh no, is that bad? what do I fix first?" — but the page answers "want to buy deeper analysis?" instead of "here's your biggest problem and here's how to start fixing it."

**Where:** `frontend/src/pages/public/ScanResultPage.tsx` — lines 1002-1230 (results section)

**Evidence:**

The results page layout after the score hero is:
1. **Score circle + composite number** (line 1005-1075) — clear, good
2. **Market benchmark** (line 1078-1106) — "Top X% of stores scanned" — nice but only useful if the store owner already understands what the score means
3. **Score cap alerts** (line 1109-1116) — red boxes saying things like "Score Cap Active — Data Quality: no search results, capped at 30" — technically accurate but terrifying without context
4. **Category breakdown** (line 1118-1126) — four cards with numbers
5. **AI Assessment upsell** (line 1128-1153) — "Want deeper analysis? $5"
6. **Buyer Simulation upsell** (line 1160-1185) — "See how AI agents shop your store. $10"
7. **Email-gated findings** (line 1187-1230) — "Enter your email to see fix details"
8. **Pro plans CTA** (line 1216-1226) — only appears AFTER email unlock, links to `/scan` (not `/plan`)

**Problems from a store owner's perspective:**

1. **No interpretation of the score.** A store owner sees "47/100" but doesn't know: is 47 terrible? Average? What score should they aim for? The benchmark helps but doesn't say "this means agents are likely skipping your store" in plain English.

2. **Score cap alerts are scary without actionable context.** "Score Cap Active — capped at 30" reads as an alarm bell, but the fix details are locked behind an email gate further down the page. The store owner sees the problem but not the solution.

3. **Two upsells before any free value.** The AI Assessment ($5) and Buyer Simulation ($10) upsells appear before the store owner has seen a single fix recommendation. They haven't gotten value from the free scan yet, and they're already being asked to pay. This feels premature.

4. **The "View Pro Plans" CTA links to `/scan`, not `/plan`.** (Line 1222) — this is likely a bug. After unlocking fixes, the upsell says "Want automated scans, CI/CD integration, and store tracking?" but links to the scan page instead of the pricing page.

5. **No "quick win" or "fix this first" callout.** The most valuable thing MCPLens could do after a free scan is say: "Your biggest issue is missing price data on 34% of products. Here's how to fix it in 5 minutes." Instead, the findings are email-gated and presented as a flat list with no prioritization visible before the gate.

**Why this matters:** The free scan is MCPLens's entire top-of-funnel. Every paying customer starts here. If the results page feels like a wall of numbers followed by paywalls, store owners will screenshot the score (for social proof or internal use) and leave — they got the headline number without needing to come back. The conversion path from free scan → paid plan depends on the store owner feeling: "I see my problems, I can see the fix is close, I just need the full details." Right now the page skips from "here are your problems" to "pay for deeper analysis" without the middle step that creates desire for the paid features.

**Suggested Fix:** Add a "Priority Fix" section between the category breakdown and the upsells:

```
## Your Top Priority

[Red/amber indicator] 34% of products missing price data
This is your biggest score impact. AI agents can't compare or purchase
products without prices — this alone is costing you visibility.

[Blurred/teased fix preview] "Add price_range to your product feed by..."
→ Enter your email to see the full fix  |  Or upgrade to Pro for all fixes + code snippets
```

This gives free users a taste of actionable value before asking them to pay. It creates the "aha moment" that makes the upsell feel natural rather than premature.

Also fix the "View Pro Plans" link to point to `/plan` instead of `/scan` (line 1222).

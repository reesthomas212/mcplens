---
id: 021
type: ux
severity: medium
status: new
found: 2026-03-25
phase: product
---

## Ecosystem Report page is built but orphaned — no links point to it

**What:** The `/report` page (EcosystemReportPage) is a fully functional data-driven page showing aggregate scan statistics — total stores scanned, average/median scores, percentile distribution chart, and auto-generated insights. But no page in the entire frontend links to it. It's not in any navigation, not mentioned on the landing page, leaderboard, or scan results. A user can only find it by guessing the URL.

**Where:**
- `frontend/src/pages/public/EcosystemReportPage.tsx` — the page (190 lines, well-built)
- `frontend/src/App.tsx` line 162 — route exists at `/report`
- No `<Link to="/report">` anywhere in the codebase (searched all frontend files)

**Evidence:**

The page is imported and routed:
```typescript
// App.tsx:71
import EcosystemReportPage from './pages/public/EcosystemReportPage';
// App.tsx:162
<Route path="/report" element={<EcosystemReportPage />} />
```

But searching the entire frontend for any link to it:
```
grep -ri "ecosystem\|/report" frontend/src/ → no navigation links found
```

The leaderboard page links to `/scan` but not `/report`. The landing page links to `/scan`, `/pricing`, `/how-it-works`, `/leaderboard` but not `/report`. The scan results page links to `/scan`, `/plan` but not `/report`.

**Why this matters:** The Ecosystem Report is one of MCPLens's most valuable content marketing assets. It provides data-backed industry insights ("the average Shopify store scores X/100 for agent readiness") that:

1. **Drive organic traffic** — store owners and agencies googling "Shopify AI agent readiness statistics 2026" would find this
2. **Build authority** — MCPLens positions as the source of truth for agent commerce readiness data
3. **Motivate action** — a store owner seeing "average score is 47, 90th percentile is 82" immediately wants to know where they stand
4. **Justify agency sales** — agencies can share this report with clients to demonstrate the market gap

But none of this works if nobody can find the page. It's like having a white paper locked in a filing cabinet. The page also has a strong CTA ("Where does your store rank? Scan Free") but no traffic to convert.

**Suggested Fix:** Add `/report` links in these locations:

1. **Landing page footer** or nav — "Ecosystem Report" link
2. **Leaderboard page** — "See the full ecosystem report" link below the table
3. **Scan results page** — after the benchmark section ("Your store is in the top X% — see the full ecosystem report")
4. **How It Works page** — "See how the ecosystem scores" link in the CTA section

The scan results page connection is the highest-value link — a user who just saw their percentile ranking naturally wants to understand the full distribution.

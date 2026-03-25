---
id: 012
type: bug
severity: high
status: new
found: 2026-03-25
phase: audit
---

## Dashboard chart renders garbage values when tracked stores have no scan history

**What:** The DashboardPage and StoreDetailPage both call `Math.min(...allScores)` and `Math.max(...allScores)` on arrays that can be empty. When the spread array is empty, `Math.min()` returns `Infinity` and `Math.max()` returns `-Infinity`. This produces NaN chart coordinates, broken axis labels, and a visually corrupted chart.

**Where:**
- `frontend/src/pages/app/DashboardPage.tsx` — lines 66-72
- `frontend/src/pages/app/StoreDetailPage.tsx` — lines 37-38

**Evidence:**

DashboardPage.tsx lines 66-72:
```typescript
const allScores = series.flatMap(s => s.points.map(p => p.score));
const minScore = Math.max(0, Math.min(...allScores) - 10);  // Math.min(...[]) → Infinity
const maxScore = Math.min(100, Math.max(...allScores) + 10); // Math.max(...[]) → -Infinity

const allDates = series.flatMap(s => s.points.map(p => new Date(p.date).getTime()));
const minDate = Math.min(...allDates);   // Infinity if no dates
const maxDate = Math.max(...allDates);   // -Infinity if no dates
```

The guard at line 60 checks `series.length === 0` but doesn't account for series with zero points. A tracked store that was just added (no scans yet) or a comparison query that returns series with empty `points` arrays will pass the length check but produce empty `allScores`/`allDates` arrays.

Same pattern in StoreDetailPage.tsx lines 37-38:
```typescript
const scores = sorted.map(s => s.compositeScore);
const minScore = Math.max(0, Math.min(...scores) - 10);
const maxScore = Math.min(100, Math.max(...scores) + 10);
```

**Why this matters:** This bug hits every new paying customer at the worst possible time — right after they sign up and add their first tracked store. They've just paid $29-79/mo, they navigate to the dashboard excited to see their data, and the chart is broken with NaN values or invisible lines. First impressions of the paid product are critical for retention. A broken chart on first login says "this product isn't ready" and increases early churn risk. The fix is trivial but the impact on the onboarding experience is significant.

**Suggested Fix:** Add an empty array guard before the Math operations:

```typescript
// DashboardPage.tsx
const allScores = series.flatMap(s => s.points.map(p => p.score));
if (allScores.length === 0) {
  // Render "No scan data yet — run your first scan" message instead of chart
  return <EmptyChartState />;
}
const minScore = Math.max(0, Math.min(...allScores) - 10);
const maxScore = Math.min(100, Math.max(...allScores) + 10);
```

Apply the same pattern in StoreDetailPage.tsx.

**Additional frontend issues found (for future findings):**
- ComparePage.tsx: race condition triggers duplicate scans if scan already running (line 79-82)
- ComparePage.tsx + HowItWorksPage.tsx: missing OG meta tags (same pattern as finding 003)
- WhiteLabelTab.tsx: silent `.catch(() => {})` swallows all errors including 402 (line 31)
- WhiteLabelTab.tsx: no URL scheme validation on logo input — accepts `javascript:` URLs (line 78-83)

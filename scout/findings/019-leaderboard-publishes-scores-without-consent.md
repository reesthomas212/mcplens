---
id: 019
type: ux
severity: high
status: new
found: 2026-03-25
phase: product
---

## Leaderboard publishes store scores publicly without owner consent

**What:** Any user can scan any Shopify store domain, and the result automatically appears on the public leaderboard at `/leaderboard`. There's no opt-in, no opt-out, and no way for a store owner to remove their score. A competitor, disgruntled employee, or random person can scan a store and its score (potentially low) becomes permanently visible on a public ranking page indexed by search engines.

**Where:**
- `frontend/src/pages/public/LeaderboardPage.tsx` — shows all scanned stores ranked by score
- `backend/internal/scanner/benchmarks.go` — `GetLeaderboard()` returns top N stores with no filtering
- No consent or opt-out mechanism exists anywhere in the codebase

**Evidence:**

The leaderboard page fetches `/api/leaderboard?limit=50` and displays every store with its domain, score, and last scan date. Each entry links to the full scan result at `/scan/{domain}`:

```typescript
// LeaderboardPage.tsx:78-95
{stores.map((store, i) => (
  <Link key={store.domain} to={`/scan/${store.domain}`} ...>
    <Medal rank={i + 1} />
    <div>{store.domain}</div>
    <span style={{ color: scoreColor(store.score) }}>{store.score}</span>
  </Link>
))}
```

The backend returns all unique domains' latest scores sorted by score descending:
```go
// benchmarks.go:201-211 — GetLeaderboard aggregation
// No filter for consent, opt-in, or visibility preference
```

Grepping for "opt-in", "opt-out", "consent", "leaderboard.*private", or "exclude.*leaderboard" across the entire codebase returns zero results.

**Why this matters:** This is both a legal/reputation risk and a product problem:

1. **Reputation risk for store owners:** A store that scores 23/100 doesn't want that published. They came to MCPLens to diagnose and fix their readiness — not to be publicly shamed. If a store owner discovers their low score is on a public leaderboard they never consented to, they'll be angry at MCPLens, not grateful.

2. **Competitor weaponization:** An agency could scan a prospect's store, then show them their low public score as a sales tactic — "look, you're #47 on the MCPLens leaderboard." This makes MCPLens a tool for embarrassment rather than improvement.

3. **Trust erosion:** Store owners need to trust MCPLens enough to share their domain and potentially sign up. If they learn scores are public by default, some will avoid scanning entirely — the opposite of what you want for top-of-funnel.

4. **GDPR/privacy considerations:** While domain scores aren't personal data, publishing business performance metrics without consent is a gray area that could generate complaints.

The leaderboard itself is a great growth feature — store owners love benchmarking. But it should be opt-in, not auto-populated from every scan.

**Suggested Fix:** Three options (from simplest to most robust):

**Option A (Quick):** Only show stores with scores above a threshold (e.g., 60+) on the leaderboard. Low-scoring stores aren't displayed publicly. This naturally protects struggling stores while showcasing success stories.

**Option B (Better):** Make the leaderboard opt-in. Add a "Show on leaderboard" toggle in tracked store settings. Only stores whose owners explicitly opt in appear. The leaderboard becomes a badge of honor ("we're #3!") instead of an involuntary ranking.

**Option C (Best):** Option B + allow anyone who scans to see their own benchmark position ("You're in the top 35% of stores scanned") without appearing on the public leaderboard. This gives the competitive motivation without the public exposure.

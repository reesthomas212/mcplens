# Scout Run Log

<!-- Append-only log of each scout cycle -->

## Run 2026-03-24 20:00
- Phase completed: health
- Finding: 001 - Resend email API returning 401 Unauthorized
- Site status: up (machine auto-stopped earlier, cold-start caused brief 502)
- Also noted: Google/GitHub/Microsoft OAuth not configured, DataDog not configured (lower priority)

## Run 2026-03-24 20:45
- Phase completed: health + audit (scanner)
- Finding: 002 - Command injection vulnerability in scanner CLI exec() calls (CRITICAL)
- Verification: 001 marked regression — Resend 401 still in logs at 20:37:32, no new deployment
- Site status: up
- Scanner audit found 26 total issues (1 critical, 6 high, 10 medium, 2 low) — will file remaining in future cycles

## Run 2026-03-24 21:00
- Phase completed: health + audit (frontend)
- Finding: 003 - Missing meta/OG tags on 4 public pages
- Verification: 002 VERIFIED — execFile() confirmed in code. 001 still regression (Resend 401 at 20:59:59)
- Site status: up (deploy v27, new image)
- Frontend audit found ~15 issues total — will file remaining in future cycles (accessibility, mobile nav, broken /plan link)

## Run 2026-03-24 21:15
- Phase completed: health + audit (backend-handlers)
- Finding: 004 - API v1 missing entitlement checks — paid AI features broken for API users
- 001 still regression (Resend 401 at 21:05, 21:10). Same deploy v27.
- Site status: up (auto-stopped, health warning during cold start)
- Backend audit found 10 issues total — SSRF risk, error leakage, race condition queued for future cycles

## Run 2026-03-24 21:30 (Phase 1b — PR verification)
- PR #2 (Finding 003, OG tags): MERGED at 21:22, deployed (new image 01KMGW2E7M5FJV9FJDF2H3KH41). Code verified — og:title present in ScanPage, TermsPage, PrivacyPage. → `verified`
- PR #3 (Finding 004, API entitlements): OPEN, still in review
- Finding 001 (Resend 401): Last 401 at 21:26:29, subsequent startups (21:29, 21:31) show NO Resend errors. Appears fixed — likely secret was updated. → `verified`
- Finding 002: Previously verified, no change
- Site status: up (deploy v28+, new image after PR #2 merge)

## Run 2026-03-24 21:45
- Phase completed: health + Phase 1b (PR verification)
- Finding: 005 - MongoDB duplicate key race in distributed rate limiter
- Verification: PR #3 (finding 004) merged at 21:33, deployed v31. Entitlement checks confirmed in api_v1.go. → `verified`
- No Resend 401 in latest logs (001 stays verified)
- New issue spotted in logs: E11000 duplicate key errors in rate_limits collection — race condition in ratelimit.go:156-177
- Site status: up (deploy v31)

## Run 2026-03-24 22:00
- Phase completed: health + Phase 1b + audit (config)
- Finding: 006 - Docker container runs as root (no USER directive)
- Phase 1b: 005 still implementing, no PR opened yet. No duplicate key errors in latest logs.
- New deploy image (01KMGXBS8M928PWS5M9WP5Y97T) from master features, not builder fixes.
- Config audit found 12 issues — root container, cold-start config, missing env vars, image bloat queued for future
- Site status: up

## Run 2026-03-24 22:15
- Cycle type: product
- Phase completed: product (landing page copy + competitive research)
- Finding: 007 - Landing page assumes store owners know what MCP is
- Phase 1b: PRs #4 and #5 still open. No new errors in logs.
- Research: Shopify has 6.9M stores, most not prepared for AI agents. No direct competitor to MCPLens found — market is guides/consulting (wearepresta, ucphub.ai), not scanning tools. MCPLens has first-mover advantage but needs to bridge the knowledge gap for non-technical store owners.
- Site status: up

## Run 2026-03-24 22:30
- Cycle type: code
- Phase completed: audit (scenarios)
- Finding: 008 - Checkout flow has 25% score weight but only 1 scenario that never tests cart/checkout
- Phase 1b: PRs #4 and #5 still open. No errors in logs.
- Scenarios audit found 16 issues total: hollow checkout scoring, missing inventory test, redundant assertions, aggressive score killers, variant assumption bugs
- Site status: up

## Run 2026-03-24 22:45
- Cycle type: product
- Phase completed: product (scan results conversion flow analysis)
- Finding: 009 - Free scan results lack "what to do next" — upsells appear before value, broken CTA link
- Verification: 005 VERIFIED (IsDuplicateKeyError added, no errors in logs). 006 VERIFIED (USER appuser in Dockerfile).
- Also found: "View Pro Plans" CTA on line 1222 links to /scan instead of /plan (likely a bug)
- Site status: up

## Run 2026-03-25 02:30
- Cycle type: code
- Phase completed: audit (scanner — SSRF + new scenario review)
- Finding: 010 - SSRF — scanner accepts localhost, private IPs, cloud metadata endpoints (CRITICAL)
- Verification: 008 VERIFIED (2 new checkout scenarios added). 009 VERIFIED (CTA links to /plan now).
- Note: duplicate key error still appeared once at 02:10:56 — may need deploy of rate limiter fix
- New checkout scenarios (cart-readiness, checkout-readiness) are well-structured, read-only approach is pragmatic
- Site status: up

## Run 2026-03-25 02:45
- Cycle type: product
- Phase completed: product (pricing page + revenue calculator analysis)
- Finding: 011 - Revenue Calculator AOV slider has no effect on output
- New pages detected: PricingPage.tsx, HowItWorksPage.tsx, ComparePage.tsx, batch-scan scripts
- Revenue Calculator is a strong conversion tool but AOV slider is dead — user adjusts it, nothing changes
- Pricing page structure is solid, Revenue Calculator adds urgency well
- Site status: up (new deploy image)

## Run 2026-03-25 03:00
- Cycle type: code
- Phase completed: audit (frontend — new pages + dashboard)
- Finding: 012 - Dashboard chart crashes on empty scan data (Math.min on empty array)
- 010 picked up by builder (implementing). Clean logs, no errors.
- Frontend audit found 11 issues across 5 files: chart crash, race condition in ComparePage, missing meta tags on new pages, silent error handling in WhiteLabelTab
- Site status: up

## Run 2026-03-25 03:30
- Cycle type: code
- Phase completed: audit (backend-handlers — auth + billing)
- Finding: 014 - Refresh token lookup missing userId check
- Verification: 010 (SSRF) marked REGRESSION — PR merged but code not in service.go. 011 (AOV slider) VERIFIED — aovMultiplier now in formula.
- Auth audit: strong fundamentals overall (lockout, rate limiting, token family rotation, webhook signatures). ForgotPassword timing leak and inactive plan checkout are lower priority.
- PR #10 (chart crash) still open
- Site status: up

## Run 2026-03-25 04:45
- Cycle type: product
- Phase completed: product (leaderboard + How It Works review)
- Finding: 019 - Leaderboard publishes store scores without owner consent
- How It Works page is excellent — addresses finding 007 ("Your store already talks to AI agents"), renamed Protocol Compliance to Technical Health
- Leaderboard shows all scanned stores publicly with no opt-in/out. Competitor weaponization risk.
- PR #11 still open. Clean logs.
- Site status: up

## Run 2026-03-25 15:45
- Cycle type: product
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 15:30
- Cycle type: code
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 15:15
- Cycle type: product
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 15:00 (Cycle 60)
- Cycle type: code
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified. Steady state monitoring.

## Run 2026-03-25 14:45
- Cycle type: product
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 14:30
- Cycle type: code
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 14:15
- Cycle type: product
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 14:00
- Cycle type: code
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 13:45
- Cycle type: product
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 13:30
- Cycle type: code
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 13:15
- Cycle type: product
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 13:00
- Cycle type: code
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 12:45
- Cycle type: product
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 12:30 (Cycle 50 milestone)
- Cycle type: code
- Phase completed: routine check
- Finding: No new finding
- **Milestone: 50 cycles completed.** 28 findings filed, 19 verified, 7 deferred, 1 wontfix, 1 new.
- Clean logs. Site up. Codebase stable.

## Run 2026-03-25 12:15
- Cycle type: product
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 12:00
- Cycle type: code
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 11:45
- Cycle type: product
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 11:30
- Cycle type: code
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 11:15
- Cycle type: product
- Phase completed: routine check
- Finding: No new finding
- Noted: HTTP proxy errors from ams region at 10:47 — machine was auto-stopped, cold-start pattern. Not a new issue.
- Clean otherwise. Site up. 19/28 verified.

## Run 2026-03-25 11:00
- Cycle type: code
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 10:45
- Cycle type: product
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 10:30
- Cycle type: code
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 10:15
- Cycle type: product
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 10:00
- Cycle type: code
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 09:45
- Cycle type: product
- Phase completed: routine check
- Finding: No new finding
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 09:30
- Cycle type: code
- Phase completed: routine check (maintenance)
- Finding: No new finding — no changes since last cycle
- Clean logs. Site up. 19/28 verified.

## Run 2026-03-25 09:15
- Cycle type: product
- Phase completed: routine check (maintenance)
- Finding: No new finding — steady state, no changes since last cycle
- No code changes, no open items. 19 verified, 7 deferred, 1 wontfix.
- Clean logs. Site up.

## Run 2026-03-25 09:00
- Cycle type: code
- Phase completed: verification
- Finding: No new finding — verified 027 (GitHub Action injection fix)
- Verification: 027 VERIFIED — inputs moved to env vars, domain regex validation added. No more ${{ }} interpolation in bash.
- 19 findings now verified. Clean logs. Site up.

## Run 2026-03-25 08:45
- Cycle type: product
- Phase completed: routine check (maintenance mode)
- Finding: No new finding — all major flows audited across 35 cycles
- 028 marked wontfix (deploy issue, not code bug — confirmed last cycle)
- API healthy: benchmarks returns 107 stores, avg 64, median 66. Leaderboard responds in 249ms.
- PR #17 (finding 027) still open.
- 28 total findings: 18 verified, 7 deferred, 1 wontfix, 1 PR open, 1 new.
- Site status: up, clean logs

## Run 2026-03-25 08:30
- Cycle type: code
- Phase completed: audit (backend static file serving)
- Finding: No new finding — corrected 028 diagnosis
- Investigation: SPA handler code (main.go:61-62) correctly checks os.Stat before fallback. Finding 028 is a deploy issue, not a code bug. The deployed image predates PR #15 (SEO files). Live index.html still references vite.svg (not favicon.svg). Just needs `fly deploy -c fly.saas.toml`.
- Updated finding 028 description with corrected root cause.
- PR #17 open for 027. Clean logs. Site up.

## Run 2026-03-25 08:15
- Cycle type: product
- Phase completed: product (competitive analysis + live site verification)
- Finding: 028 - robots.txt/sitemap/favicon NOT SERVED — SPA catch-all returns index.html for all three
- CRITICAL: finding 022 regression — files exist in source but Go backend doesn't serve them. curl confirms all return HTML.
- Competitor analysis: ucptools.dev ($9/mo monitoring), shopaudit.app (free, checks llms.txt). Neither tests live MCP endpoint. MCPLens's moat is live scenarios but this isn't communicated.
- Finding 022 re-marked as NOT verified (files exist but aren't served).
- Site status: up, clean logs

## Run 2026-03-25 08:00
- Cycle type: code
- Phase completed: audit (GitHub Action security)
- Finding: 027 - GitHub Action script injection via ${{ inputs.domain }}
- inputs.domain interpolated directly into bash — classic script injection pattern. Could exfiltrate API keys.
- Fix: use env vars instead of ${{ }} interpolation + validate domain format.
- 19 verified, 7 deferred. Clean logs. Site up.

## Run 2026-03-25 07:45
- Cycle type: product
- Phase completed: product (competitive research)
- Finding: 026 - At least 4 competitors launched — first-mover window closing
- Competitors: shopaudit.app, ucptools.dev, fudge.ai, zeodyn.com — all offer free AI readiness scans
- ucptools.dev and fudge.ai already test UCP (finding 025 gap). zeodyn.com uses 6-dimension scoring.
- MCPLens moat: actual MCP protocol testing with live scenarios (not just metadata/structured data checks). Need to communicate this.
- App had cold-start connection errors (normal Fly.io auto-stop behavior).
- 19 verified, 7 deferred. Site up.

## Run 2026-03-25 07:30
- Cycle type: code
- Phase completed: routine check (maintenance mode)
- Finding: No new finding — codebase stable after 25 findings across 30 cycles
- No code changes since last cycle. All recent commits are scout/builder finding fixes.
- Attempted test suites: scanner needs npm install, Go not installed locally. Builds happen in Docker/CI.
- Scout entering maintenance mode: monitoring regressions, verifying new fixes, researching market changes.
- 19 verified, 6 deferred. Clean logs. Site up.

## Run 2026-03-25 07:15
- Cycle type: product
- Phase completed: product (market research — UCP protocol analysis)
- Finding: 025 - UCP (Universal Commerce Protocol) launched, MCPLens doesn't test or mention it
- Research: Shopify + Google launched UCP in March 2026 — transaction layer on top of MCP. Adds checkout completion, identity linking, order management. 20+ retailers/platforms adopted. MCPLens tests MCP discovery layer but not UCP transaction layer.
- Positioning opportunity: expand from "MCP readiness" to "full agent commerce stack" (MCP + UCP). SEO opportunity on "UCP readiness" searches.
- No open findings to verify. 19 verified, 6 deferred. Clean logs.
- Site status: up

## Run 2026-03-25 07:00
- Cycle type: code
- Phase completed: verification + code review
- Finding: No new finding — codebase mature, focused on verification
- Verification: 023 VERIFIED — policies capability added to constants.ts (line 36-40), types.ts, CAPABILITY_CHECK_ORDER, and new shopify-policies-check.yaml scenario. All assertion types used (schema_match, field_present, field_non_empty) exist in assertion engine.
- 19 findings now verified. Codebase stable.
- Site status: up, clean logs

## Run 2026-03-25 06:45
- Cycle type: product
- Phase completed: product (live scan analysis + conversion funnel)
- Finding: 024 - 32% of stores get 100/100 — perfect scores kill conversion
- Tested live scans: allbirds.com=100, fashionnova.com=97, skims.com=97. 16/50 leaderboard stores score exactly 100.
- Core issue: free scan tests Shopify's MCP implementation (which works well), not the store's actual AI competitiveness. Real differentiation is in paid features but they're positioned as add-ons not the core experience.
- Builder has PR #16 open for 023. Clean logs.
- Site status: up

## Run 2026-03-25 06:30
- Cycle type: code
- Phase completed: audit (backend-scanner — tracked_store + agency_branding)
- Finding: No new finding — codebase mature, reviewed tracked_store.go and agency_branding.go
- Noted: accentColor in agency branding report is injected into CSS without validation (line 299) — low severity, Agency plan only, affects downloaded HTML reports only
- Noted: AddTrackedStore calls sanitiseDomain but not validateDomain — but ScanStore (called by rescan) does validate, so no actual SSRF
- 18 findings verified. Site status: up, clean logs.

## Run 2026-03-25 06:15
- Cycle type: product
- Phase completed: product (Shopify MCP spec research + gap analysis)
- Finding: 023 - MCPLens doesn't test Shopify's policies/FAQ tool (4th of 4 MCP tools)
- Verification: 021 VERIFIED (report linked from landing nav, mobile nav, footer, leaderboard). 022 VERIFIED (robots.txt, sitemap.xml, favicon.svg all correct).
- Research: Shopify's Storefront MCP has exactly 4 tools. MCPLens tests 3 but ignores search_shop_policies_and_faqs — how AI agents answer "what's your return policy?" questions.
- 18 findings now verified. Site status: up, clean logs.

## Run 2026-03-25 06:00
- Cycle type: code
- Phase completed: verification (backend-handlers)
- Finding: No new finding — verification cycle
- Verification: 018 VERIFIED (hooks.slack.com prefix + validateWebhookURL at auth.go:1908-1916). 020 VERIFIED (API v1, MCPLENS_API_KEY required, jq, 20s delay). Previous 018 "regression" was a false alarm — grep was too narrow.
- 16 findings now verified. Builder has PR #14 open for 021.
- Site status: up, clean logs

## Run 2026-03-25 05:45
- Cycle type: product
- Phase completed: product (SEO infrastructure + navigation audit)
- Finding: 022 - No robots.txt, sitemap.xml, or favicon
- Landing page hero updated: "AI agents are shopping for your customers. Is your store ready?" — much clearer, finding 007 effectively addressed
- Compare page still uses "Protocol Compliance" (should be "Technical Health" per How It Works page)
- Compare page orphaned like Ecosystem Report (021 pattern)
- Clean logs. PR #13 open.
- Site status: up

## Run 2026-03-25 05:30
- Cycle type: code
- Phase completed: verification + frontend audit
- Finding: No new finding — codebase stabilizing after 21 findings
- Verification: 013 VERIFIED (SHOPIFY_GUIDANCE map, ShopifyBadge, "Technical Health" rename). 018 REGRESSION — marked done but no validation code added to Slack webhook path (auth.go:1907 stores NotificationPrefs directly).
- Reviewed TestEntitlementsPage (admin-only, properly gated). Rate limit duplicate key errors still occasional but fallback works.
- 14 findings verified. 018 in regression.
- Site status: up

## Run 2026-03-25 05:15
- Cycle type: product
- Phase completed: product (Ecosystem Report + leaderboard review)
- Finding: 021 - Ecosystem Report page orphaned — no links anywhere
- /report page is well-built (percentile distribution, insights, CTA) but not linked from any navigation
- Noted: rate limit duplicate key errors still appearing occasionally (scan: prefix) but fallback works
- Noted: someone scanned mcplens.dev itself — scanner fails with 404 on /api/mcp (expected, not a Shopify store)
- Builder implementing 020. PR #12 (finding 018) still open. Clean otherwise.
- Site status: up

## Run 2026-03-25 05:00
- Cycle type: code
- Phase completed: audit (scanner/scripts + verification)
- Finding: 020 - Batch scan script hits production without auth or rate protection
- Verification: 016 VERIFIED (debug logging gone). Finding 013 (Shopify guidance) implemented by master.
- 13 findings verified. Site status: up

## Run 2026-03-25 04:30
- Cycle type: code
- Phase completed: audit (rescan service — backend-scanner/config rotation)
- Finding: 018 - Slack webhook URL not validated — SSRF via notification preferences
- Rescan service well-structured: leader locking, batch processing, weekly digests, score change alerts
- But Slack webhook URL stored from user input is used in http.DefaultClient.Do() with no SSRF checks
- Same class as finding 010 but through a different code path — validateWebhookURL exists but isn't used here
- 016 PR #11 still open. Clean logs.
- Site status: up

## Run 2026-03-25 04:15
- Cycle type: product
- Phase completed: product (CI/CD + developer experience analysis)
- Finding: 017 - CI/CD integration is a paid selling point but has zero documentation
- GitHub Action exists and is well-built, but no docs page, no /developers route, no links from product
- "CLI tool + CI/CD integration" on pricing is unverifiable before signup and undiscoverable after
- Same issue for Agency "API access" — no API reference page
- Builder implementing 016. Clean logs.
- Site status: up

## Run 2026-03-25 04:00
- Cycle type: code
- Phase completed: audit (backend-scanner — benchmarks + service)
- Finding: 016 - Benchmark debug logging runs in production every 15 min
- Verification: 010 VERIFIED (validateDomain at line 218). 012 VERIFIED (empty array guard at line 68). 014 VERIFIED (userId in FindOne at line 501).
- All 12 findings now verified. 3 deferred (007, 013, 015). 016 new.
- Site status: up

## Run 2026-03-25 03:45
- Cycle type: product
- Phase completed: product (onboarding flow analysis)
- Finding: 015 - Onboarding skips first scan — empty dashboard after signup
- Onboarding is profile → team invite → empty dashboard. Never prompts user to add their store or run a scan. The signup intent (track my 47/100 score) is disconnected from the paid experience.
- PR #10 still open. Clean logs.
- Site status: up

## Run 2026-03-25 03:15
- Cycle type: product
- Phase completed: product (market research + scan results value alignment)
- Finding: 013 - Scan results don't map to Shopify's own agentic readiness guidance
- PRs #8 and #9 still open. Clean logs.
- Key research: Shopify published "Agentic-Ready Product Data" guide telling merchants exactly what to fix (audit data, structure variants, precise taxonomy, literal descriptions). MCPLens tests these same things but doesn't connect results to Shopify's language. Huge positioning opportunity: "We verify what Shopify tells you to do."
- Only ~30 merchants on OpenAI Instant Checkout so far. AI shopping orders up 15x since Jan 2025. Shopify making every store "agent-ready by default."
- Site status: up

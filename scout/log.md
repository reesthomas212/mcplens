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

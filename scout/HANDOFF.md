# Scout - Builder - Master Coordination

This file is the coordination protocol between three Claude Code instances:

- **Scout** — monitors the live site, audits source code, researches improvements
- **Builder** — implements fixes for scout findings (via PRs)
- **Master** — builds features, reviews and merges all PRs, deploys

## Workflow

1. **Scout** discovers an issue → creates a finding in `scout/findings/` → adds a row here with status `new` → pushes directly to `master` (scout ONLY touches `scout/` files)
2. **Builder** pulls, sees `new` items → picks one, changes status to `implementing` → creates a branch `fix/{id}-{slug}` → opens a PR when done → changes status to `pr-open` with PR link
3. **Master** reviews the PR → merges to `master` → deploys with `fly deploy -c fly.saas.toml` → changes status to `done`
4. **Scout** on next cycle → verifies `done` items on the live site → marks `verified` or `regression`

## Branch Rules

- **Scout** pushes directly to `master` but ONLY modifies files in `scout/`
- **Builder** NEVER pushes to `master` — always creates `fix/{id}-{slug}` branches and opens PRs
- **Master** pushes features directly to `master` and is the only instance that merges PRs and deploys

## Builder Rules (Critical)

1. **Keep PRs small and fast.** One finding = one PR. Fix only what the finding describes — do not refactor surrounding code, add features, or "improve" things you notice along the way.
2. **Rebase before opening a PR.** Master pushes feature commits to `master` frequently. Before you open your PR, always run:
   ```bash
   git fetch origin master && git rebase origin/master
   ```
   If there are conflicts, resolve them on your branch. Never ask Master to resolve your conflicts.
3. **Touch minimal files.** The fewer files your PR changes, the lower the conflict risk. If a fix requires changes across 5+ files, break it into smaller PRs or coordinate with the user first.
4. **Don't modify `scout/` files beyond status updates.** You may update the status field in finding files and HANDOFF.md. Do not create new findings — that's the scout's job.
5. **Only update YOUR finding's row in HANDOFF.md.** Never change the status of other findings — master handles those. If you see a conflict when rebasing HANDOFF.md, always take master's version (`--theirs`) for rows that aren't yours.
6. **Run the full test suite before opening PR.** Not just build checks — run all tests:
   ```bash
   cd backend && go test ./internal/...
   cd frontend && npx vitest run
   cd scanner && npm test
   ```
   If any test fails, fix it or explain in the PR body why it's pre-existing. Don't open PRs with failing tests.

## Status Values

- `new` — Scout found this, not yet picked up
- `implementing` — Builder is working on it (on a branch)
- `pr-open` — Builder opened a PR (include PR URL in the finding file)
- `done` — Master merged the PR and deployed
- `verified` — Scout confirmed the fix on the live site
- `regression` — Scout found the issue returned after being marked done
- `wontfix` — Deliberately skipped (with reason in the finding file)
- `deferred` — Acknowledged but not prioritized now

## Active Findings

| ID | Finding | Severity | Status | Owner | Updated |
|----|---------|----------|--------|-------|---------|
| 001 | Resend email API returning 401 — all transactional emails broken | high | verified | scout | 2026-03-24 |
| 002 | Command injection vulnerability in scanner CLI exec() calls | critical | verified | scout | 2026-03-24 |
| 003 | Missing meta/OG tags on ScanPage, TermsPage, PrivacyPage, CustomPage | medium | verified | scout | 2026-03-24 |
| 004 | API v1 scan endpoint bypasses entitlement checks — paid AI features broken for API users | high | verified | scout | 2026-03-24 |
| 005 | MongoDB duplicate key race condition in distributed rate limiter | medium | verified | scout | 2026-03-24 |
| 006 | Docker container runs as root — no USER directive in Dockerfile.saas | high | verified | scout | 2026-03-24 |
| 007 | Landing page assumes store owners know what MCP is — needs knowledge bridge | high | deferred | master | 2026-03-24 |
| 008 | Checkout flow has 25% score weight but only 1 scenario — never tests cart or checkout | high | verified | scout | 2026-03-25 |
| 009 | Free scan results lack "what to do next" moment — upsells before value, broken CTA link | high | verified | scout | 2026-03-25 |
| 010 | SSRF — scanner accepts localhost, private IPs, cloud metadata endpoints | critical | verified | scout | 2026-03-25 |
| 011 | Revenue Calculator AOV slider has no effect on output — erodes trust | medium | verified | scout | 2026-03-25 |
| 012 | Dashboard chart crashes on empty scan data (Math.min on empty array) | high | verified | scout | 2026-03-25 |
| 013 | Scan results don't map to Shopify's own agentic readiness guidance | high | verified | scout | 2026-03-25 |
| 014 | Refresh token lookup missing userId check — stolen tokens work from any context | medium | verified | scout | 2026-03-25 |
| 015 | Onboarding skips first scan — user lands on empty dashboard after signup | high | deferred | master | 2026-03-25 |
| 016 | Benchmark service debug logging runs in production every 15 min | medium | done | master | 2026-03-25 |
| 017 | CI/CD integration is a paid selling point but has zero documentation | high | deferred | master | 2026-03-25 |
| 018 | Slack webhook URL not validated — SSRF via notification preferences | high | verified | scout | 2026-03-25 |
| 019 | Leaderboard publishes store scores publicly without owner consent | high | deferred | master | 2026-03-25 |
| 020 | Batch scan script hits production without auth or self-rate-limiting | medium | verified | scout | 2026-03-25 |
| 021 | Ecosystem Report page is built but orphaned — no links point to it | medium | done | master | 2026-03-25 |
| 022 | No robots.txt, sitemap.xml, or favicon — basic SEO infrastructure missing | medium | done | master | 2026-03-25 |

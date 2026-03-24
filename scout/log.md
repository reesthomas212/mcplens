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

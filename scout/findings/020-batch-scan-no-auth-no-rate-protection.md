---
id: 020
type: performance
severity: medium
status: implementing
found: 2026-03-25
phase: audit
---

## Batch scan script hits production without authentication and no self-rate-limiting awareness

**What:** The `scripts/batch-scan.sh` script defaults to hitting the production public endpoint (`https://mcplens.dev/api/scan`) with 327 domains at a 3-second delay. Each scan triggers a Node.js CLI execution that takes ~15 seconds. On the single Fly.io machine (1 shared CPU, 1GB RAM), running 327 sequential scans creates ~80 minutes of continuous load. During this window, real users trying to scan their own stores will experience degraded performance or timeouts.

**Where:** `scripts/batch-scan.sh` — lines 9, 10, 36-39

**Evidence:**

```bash
# Line 9: defaults to production
API_URL="${2:-https://mcplens.dev/api/scan}"

# Line 10: 3-second delay between scans
DELAY=3

# Line 36-39: uses public endpoint, no auth
RESPONSE=$(curl -sf -w "\n%{http_code}" "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"domain\": \"$domain\"}" \
  --max-time 60 2>&1)
```

Problems:
1. **No authentication** — uses public endpoint, scans have no tenant context, no AI assessment
2. **3-second delay is too short** — each scan takes ~15 seconds on the server, so scans overlap and queue up
3. **No concurrency awareness** — doesn't check if the server is healthy before sending the next scan
4. **Defaults to production** — running `./scripts/batch-scan.sh` without arguments hits prod
5. **JSON injection risk** — `$domain` interpolated directly into JSON string (line 38), breaks on domains with special characters

The 327 domains in `shopify-domains.txt` include major brands (Allbirds, Gymshark, Glossier) whose scans may take longer due to larger catalogs.

**Why this matters:** The batch scan is needed to seed benchmark data (which powers the leaderboard, percentile rankings, and ecosystem report). But running it against production without safeguards risks degrading the experience for real users at the exact moment the batch scan populates the leaderboard and drives organic traffic. A store owner who visits mcplens.dev during a batch run and gets a timeout on their first scan will leave and not come back. The fix is straightforward: use the authenticated API v1 endpoint, increase the delay, and add a health check between scans.

**Suggested Fix:**

```bash
# Use authenticated API for proper tenant tracking
API_URL="${2:-https://mcplens.dev/api/v1/scan}"
AUTH_HEADER="Authorization: Bearer ${MCPLENS_API_KEY:?Set MCPLENS_API_KEY}"

# Increase delay to avoid overlapping scans (scan takes ~15s)
DELAY=20

# Add health check between scans
check_health() {
  curl -sf --max-time 5 "https://mcplens.dev/health" > /dev/null
}

# In the loop, before each scan:
if ! check_health; then
  echo "Server unhealthy, waiting 60s..."
  sleep 60
fi

# Fix JSON injection — use jq for safe JSON construction
RESPONSE=$(curl -sf -w "\n%{http_code}" "$API_URL" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg d "$domain" '{domain: $d}')" \
  --max-time 90 2>&1)
```

#!/bin/bash
# Batch scan Shopify stores to seed benchmark data
# Usage: ./scripts/batch-scan.sh [domains-file] [api-url]
#
# Requires MCPLENS_API_KEY environment variable for authenticated scans.
# The domains file should have one domain per line.

set -euo pipefail

DOMAINS_FILE="${1:-scripts/shopify-domains.txt}"
API_URL="${2:-https://mcplens.dev/api/v1/scan}"
DELAY=20  # seconds between scans (~15s scan time + buffer to avoid overlap)
LOGFILE="scripts/batch-scan.log"

# Require API key for authenticated access
if [ -z "${MCPLENS_API_KEY:-}" ]; then
  echo "Error: MCPLENS_API_KEY environment variable is required."
  echo "Get your API key from https://mcplens.dev/settings"
  exit 1
fi

if [ ! -f "$DOMAINS_FILE" ]; then
  echo "Error: Domains file not found: $DOMAINS_FILE"
  echo "Create it with one Shopify domain per line."
  exit 1
fi

# Check if jq is available for safe JSON construction
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required for safe JSON encoding. Install it: brew install jq / apt install jq"
  exit 1
fi

TOTAL=$(wc -l < "$DOMAINS_FILE" | tr -d ' ')
echo "Starting batch scan of $TOTAL stores..."
echo "API: $API_URL"
echo "Log: $LOGFILE"
echo "Delay: ${DELAY}s between scans"
echo "---"

COUNT=0
SUCCESS=0
FAIL=0

while IFS= read -r domain || [ -n "$domain" ]; do
  # Skip empty lines and comments
  [[ -z "$domain" || "$domain" == \#* ]] && continue

  COUNT=$((COUNT + 1))
  echo -n "[$COUNT/$TOTAL] Scanning $domain... "

  # Use jq for safe JSON construction (prevents injection via domain names)
  PAYLOAD=$(jq -n --arg d "$domain" '{domain: $d}')

  RESPONSE=$(curl -sf -w "\n%{http_code}" "$API_URL" \
    -H "Authorization: Bearer $MCPLENS_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    --max-time 90 2>&1)

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -n -1)

  if [ "$HTTP_CODE" = "200" ]; then
    SCORE=$(echo "$BODY" | grep -o '"compositeScore":[0-9]*' | head -1 | cut -d: -f2)
    echo "OK (score: ${SCORE:-?})"
    echo "$(date -Iseconds) OK $domain score=$SCORE" >> "$LOGFILE"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "FAIL (HTTP $HTTP_CODE)"
    echo "$(date -Iseconds) FAIL $domain http=$HTTP_CODE" >> "$LOGFILE"
    FAIL=$((FAIL + 1))
  fi

  sleep $DELAY
done < "$DOMAINS_FILE"

echo "---"
echo "Done. $SUCCESS succeeded, $FAIL failed out of $COUNT total."
echo "Results are stored in the MCPLens database and will appear on the leaderboard and ecosystem report."

---
id: 018
type: security
severity: high
status: implementing
found: 2026-03-25
phase: audit
---

## Slack webhook URL is not validated — SSRF via notification preferences

**What:** Users can set a "Slack webhook URL" in their notification preferences. This URL is stored as-is and used directly in `http.DefaultClient.Do()` whenever a score change triggers an alert. No URL validation is applied — a user can set their webhook to `http://localhost:27017`, `http://169.254.169.254/latest/meta-data/`, or any internal/private address, and the server will POST to it on every score change event.

**Where:**
- `backend/internal/rescan/service.go` — lines 401-411 (uses the webhook) and line 533-549 (`sendSlack` function)
- `backend/internal/models/user.go` — line 52 (stores the URL)

**Evidence:**

The webhook URL flows from user settings directly to an HTTP request with no validation:

```go
// service.go:401 — reads URL from user prefs
if webhook := owner.NotificationPrefs.SlackWebhook; webhook != "" {
    // ...
    s.sendSlack(webhook, fmt.Sprintf(...))
}

// service.go:533-548 — sends HTTP POST to the URL
func (s *Service) sendSlack(webhookURL, text string) {
    payload, _ := json.Marshal(map[string]string{"text": text})
    req, err := http.NewRequestWithContext(ctx, "POST", webhookURL, bytes.NewReader(payload))
    // ...
    resp, err := http.DefaultClient.Do(req)  // ← No URL validation
}
```

The scan endpoint already has SSRF protection via `validateDomain()` (finding 010, verified). The outgoing webhook handler has it via `validateWebhookURL()`. But the Slack notification path bypasses both.

Attack scenario:
1. Attacker signs up, adds a tracked store
2. Sets `slackWebhook` to `http://169.254.169.254/latest/meta-data/iam/security-credentials/`
3. Waits for a rescan to trigger a score change (or manually rescans)
4. Server POSTs to the metadata endpoint, response is logged in Slack error handling

**Why this matters:** This is the same class of vulnerability as finding 010 (SSRF), but through a different path. Finding 010 was fixed on the scan endpoint, but the Slack webhook path uses a completely separate code path that doesn't benefit from `validateDomain()`. An authenticated user (free tier is enough — just need to sign up and add a store) can use MCPLens as a proxy to probe internal services. The fix is straightforward — apply the same `validateWebhookURL()` logic from `webhooks.go` before storing or using the Slack webhook URL.

**Suggested Fix:** Validate the Slack webhook URL when the user saves their preferences. Reuse the existing `validateWebhookURL()` from `webhooks.go`:

```go
// In the notification preferences update handler:
if req.SlackWebhook != "" {
    if err := validateWebhookURL(req.SlackWebhook); err != nil {
        respondWithError(w, http.StatusBadRequest, "Invalid Slack webhook URL: "+err.Error())
        return
    }
    // Also verify it starts with https://hooks.slack.com/ for additional safety
    if !strings.HasPrefix(req.SlackWebhook, "https://hooks.slack.com/") {
        respondWithError(w, http.StatusBadRequest, "Slack webhook must be a hooks.slack.com URL")
        return
    }
}
```

Validating at save time (not at send time) prevents the URL from ever reaching the database in an invalid state.

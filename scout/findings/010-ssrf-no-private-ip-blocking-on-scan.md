---
id: 010
type: security
severity: critical
status: implementing
found: 2026-03-25
phase: audit
---

## SSRF vulnerability — scanner accepts localhost, private IPs, and cloud metadata endpoints

**What:** The public scan endpoint (`POST /api/scan`) accepts any domain without blocking private IP ranges, localhost, or cloud metadata endpoints. A user can submit `localhost:27017`, `169.254.169.254`, or `10.0.0.1` and the scanner will attempt to connect to `https://{domain}/api/mcp`, probing internal services from the server.

**Where:**
- `backend/internal/scanner/service.go` — `sanitiseDomain()` (lines 198-210) only strips schemes/paths, no IP validation
- `backend/internal/api/handlers/scanner.go` — `TriggerScan` (line 35-74) passes domain to scanner with no SSRF check
- `scanner/src/cli.ts` — (line 224) constructs `https://${domain}/api/mcp` and connects

**Evidence:**

The sanitise function:
```go
func sanitiseDomain(domain string) string {
    for _, scheme := range []string{"https://", "http://"} {
        domain = strings.TrimPrefix(domain, scheme)
    }
    if idx := strings.IndexByte(domain, '/'); idx >= 0 {
        domain = domain[:idx]
    }
    domain = strings.TrimSpace(domain)
    return domain
}
```

No IP validation. The test file even proves it — `service_test.go` line 22 shows `"localhost:3000/api"` is accepted and sanitised to `"localhost:3000"`.

Meanwhile, the **webhook handler already has full SSRF protection** at `backend/internal/api/handlers/webhooks.go` lines 136-178:
```go
func validateWebhookURL(rawURL string) error {
    // Blocks localhost, resolves DNS, checks IsLoopback(), IsPrivate(),
    // IsLinkLocalUnicast(), blocks 169.254.169.254 metadata endpoint
}
```

The fix already exists in the codebase — it just wasn't applied to the scan endpoint.

Attack scenarios:
- `{"domain": "localhost:27017"}` → probes MongoDB
- `{"domain": "169.254.169.254"}` → Fly.io metadata (could leak instance credentials)
- `{"domain": "10.0.0.1"}` → internal network scan
- `{"domain": "127.0.0.1:8080"}` → probes the app itself

The public scan endpoint is unauthenticated and rate-limited only by IP, so an attacker can enumerate internal services.

**Why this matters:** This is a textbook SSRF vulnerability on an unauthenticated endpoint. MCPLens runs on Fly.io where internal services (MongoDB, other apps) may be reachable from the container. An attacker could use MCPLens as a proxy to scan internal infrastructure, and on cloud providers, the metadata endpoint (`169.254.169.254`) can leak IAM credentials, instance metadata, and secrets. For a product that handles Stripe billing data and store analytics, this is a real risk — not theoretical. It would also fail any security audit from enterprise or agency customers evaluating MCPLens.

**Suggested Fix:** Extract the existing `validateWebhookURL` logic into a shared utility and apply it to domains before scanning:

```go
// In service.go, add after sanitiseDomain():
func validateDomain(domain string) error {
    host, _, _ := net.SplitHostPort(domain)
    if host == "" {
        host = domain
    }
    if host == "localhost" || host == "0.0.0.0" || host == "[::1]" {
        return fmt.Errorf("cannot scan localhost")
    }
    ips, err := net.LookupHost(host)
    if err != nil {
        ip := net.ParseIP(host)
        if ip == nil {
            return nil // Let DNS fail later at connection time
        }
        ips = []string{host}
    }
    for _, ipStr := range ips {
        ip := net.ParseIP(ipStr)
        if ip != nil && (ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() || ip.IsUnspecified()) {
            return fmt.Errorf("cannot scan private or internal addresses")
        }
        if ip.Equal(net.ParseIP("169.254.169.254")) {
            return fmt.Errorf("cannot scan metadata endpoints")
        }
    }
    return nil
}
```

Then call `validateDomain(domain)` in `ScanStore()` right after `sanitiseDomain()`.

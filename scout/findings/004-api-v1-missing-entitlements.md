---
id: 004
type: security
severity: high
status: new
found: 2026-03-24
phase: audit
---

## API v1 scan endpoint bypasses entitlement checks — free access to paid AI features

**What:** The `APIV1Handler.TriggerScan` in `api_v1.go` does not apply entitlement checks for AI assessment, agent simulation, or cross-agent personas. It calls `h.service.ScanStore()` without passing `ScanOptions`, meaning API key holders get basic scans only — BUT the missing check means if the scanner service defaults change or if `ScanOptions` are ever auto-populated, paid features would be accessible for free. More importantly, the API v1 handler doesn't pass scan options at all, so API users can never access features they've paid for either — it's broken in both directions.

**Where:** `backend/internal/api/handlers/api_v1.go` — lines 27-56

**Evidence:**
```go
// api_v1.go:27-56 — TriggerScan
if tenant, ok := middleware.GetTenantFromContext(ctx); ok {
    id := tenant.ID
    tenantID = &id
}
// Missing entirely:
// scanOpts.Assess = h.hasAIAssessmentEntitlement(...)
// scanOpts.Simulate = h.hasSimulationEntitlement(...)
// scanOpts.Personas check

stored, err := h.service.ScanStore(ctx, req.Domain, tenantID)  // No scanOpts!
```

Compare with the public handler in `scanner.go` (lines 60-64) which correctly checks entitlements:
```go
scanOpts.Assess = h.hasAIAssessmentEntitlement(ctx, tenant)
scanOpts.Simulate = h.hasSimulationEntitlement(ctx, tenant)
// etc.
```

**Why this matters:** MCPLens sells AI assessment ($5 one-time or Pro+) and agent simulation ($10 one-time or Max+) as premium features. The API v1 endpoint is designed for CI/CD integration — it's how paying customers automate scans. Right now, even if a Pro/Max/Agency customer uses their API key, they get a basic scan without the AI features they're paying for. This is a broken paid feature that directly impacts the value proposition for your highest-tier customers (Agency at $249/mo). Fixing this also prevents future risk if defaults change and free users get paid features through the API.

**Suggested Fix:** Mirror the entitlement logic from `scanner.go` into `api_v1.go`:

```go
func (h *APIV1Handler) TriggerScan(w http.ResponseWriter, r *http.Request) {
    // ... existing code ...

    var scanOpts scanner.ScanOptions
    if tenant, ok := middleware.GetTenantFromContext(ctx); ok {
        id := tenant.ID
        tenantID = &id
        scanOpts.Assess = h.hasAIAssessmentEntitlement(ctx, tenant)
        scanOpts.Simulate = h.hasSimulationEntitlement(ctx, tenant)
        // Copy persona check from scanner.go
    }

    stored, err := h.service.ScanStoreWithOptions(ctx, req.Domain, tenantID, scanOpts)
    // ...
}
```

**Additional backend issues found (for future findings):**
- SSRF risk: domain validation doesn't block private IPs (127.0.0.1, 169.254.169.254, 10.x.x.x) — service.go:191-203
- Internal error messages leaked to API clients — scanner.go:69, api_v1.go:51
- TOCTOU race condition in tracked store limit check — scanner.go:240-255
- Fragile string-based error matching — scanner.go:291, 344

---
id: 016
type: performance
severity: medium
status: new
found: 2026-03-25
phase: audit
---

## Benchmark service has debug logging running in production every 15 minutes

**What:** The `BenchmarkService.refresh()` method contains two debug log statements that run on every cache refresh (every 15 minutes) in production. They log the total document count, a sample document's raw field names, domain, and compositeScore. This is development debugging code that was never removed before shipping.

**Where:** `backend/internal/scanner/benchmarks.go` — lines 114-126

**Evidence:**

```go
// Line 114-116: Debug log 1 — counts all docs in collection every refresh
totalDocs, countErr := b.col.CountDocuments(ctx, bson.M{})
slog.Info("Benchmark refresh: collection stats", "totalDocs", totalDocs, "countErr", countErr)

// Line 119-126: Debug log 2 — reads one raw document and logs field names
var rawDoc bson.M
if err := b.col.FindOne(ctx, bson.M{}).Decode(&rawDoc); err == nil {
    keys := make([]string, 0, len(rawDoc))
    for k := range rawDoc {
        keys = append(keys, k)
    }
    slog.Info("Benchmark debug: sample doc fields", "keys", keys, "domain", rawDoc["domain"], "compositeScore", rawDoc["compositeScore"])
}
```

These run every 15 minutes (the cache TTL at line 44). Each refresh does:
1. `CountDocuments` — full collection count scan on MongoDB
2. `FindOne` + decode — reads an arbitrary document
3. Logs raw field names and domain data

The `CountDocuments` call is particularly wasteful — it scans the entire collection just to log a count. On a collection that grows with every scan, this becomes progressively slower.

**Why this matters:** Three impacts: (1) **Log noise** — these Info-level messages appear every 15 minutes in production, making it harder to spot real issues. The Fly.io log viewer has limited retention, and debug lines push out useful entries. (2) **Unnecessary MongoDB load** — `CountDocuments` with an empty filter scans the entire collection. As the batch scanning script seeds hundreds of stores, this query gets slower. (3) **Data exposure** — the debug log leaks raw document field names and sample domain data to the log stream. Not a security issue per se, but unnecessary exposure of internal schema details.

**Suggested Fix:** Remove lines 114-126 entirely. The actual benchmark aggregation at line 128 and the "Benchmark refresh complete" log at line 144 provide all the production observability needed. If field-name debugging is needed in the future, gate it behind a debug flag or log level:

```go
// Remove lines 114-126 entirely, or replace with:
if slog.Default().Enabled(ctx, slog.LevelDebug) {
    // Only log in debug mode, never in production
    totalDocs, _ := b.col.CountDocuments(ctx, bson.M{})
    slog.Debug("Benchmark refresh: collection stats", "totalDocs", totalDocs)
}
```

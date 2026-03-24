---
id: 005
type: bug
severity: medium
status: implementing
found: 2026-03-24
phase: health
---

## MongoDB duplicate key race condition in distributed rate limiter

**What:** The distributed rate limiter has a race condition that causes `E11000 duplicate key` errors when concurrent requests hit an expired rate limit window. Two requests simultaneously see `ErrNoDocuments` (no valid window), then both attempt to upsert a new document with the same `_id` key. The second upsert fails with a duplicate key error, causing a fallback to the in-memory limiter and a warning log on every affected request.

**Where:** `backend/internal/middleware/ratelimit.go` — lines 156-177

**Evidence:** Fly.io logs show repeated errors for the same IP:
```
2026/03/24 21:40:25 WARN distributed rate-limit check failed, falling back to local
  key=2605:59ca:20ab:8308:98e3:eea5:47cd:fb9d
  error="(DuplicateKey) Plan executor error during findAndModify :: caused by ::
  E11000 duplicate key error collection: mcplens.rate_limits index: _id_
  dup key: { _id: \"2605:59ca:20ab:8308:98e3:eea5:47cd:fb9d\" }"
```
This appeared 3 times within 2 minutes (21:40:25, 21:42:14, 21:42:23).

The code flow:
```go
// Line 157: First attempt — find existing valid window
err := rl.collection.FindOneAndUpdate(ctx,
    bson.M{"_id": key, "windowEnd": bson.M{"$gt": now}},  // No match if window expired
    bson.M{"$inc": bson.M{"count": 1}},
    opts,  // upsert: true
).Decode(&doc)

if err == mongo.ErrNoDocuments {
    // Line 166: RACE — both requests reach here simultaneously
    err = rl.collection.FindOneAndUpdate(ctx,
        bson.M{"_id": key},  // Both try to upsert same _id
        bson.M{"$set": bson.M{"count": 1, "windowEnd": windowEnd, ...}},
        opts,  // upsert: true → E11000 on second request
    ).Decode(&doc)
}
```

**Why this matters:** While the fallback to in-memory rate limiting means users aren't blocked, this bug has three real impacts: (1) Log noise — every affected request generates a WARN log, making it harder to spot real issues in production monitoring. (2) Rate limit bypass risk — when the distributed limiter fails, the in-memory fallback doesn't share state across Fly.io machines, so if MCPLens scales to multiple machines, users could exceed rate limits by hitting different instances. (3) Unnecessary MongoDB load — the failed upsert is a wasted round-trip to the database on every concurrent request at a window boundary.

**Suggested Fix:** Replace the two-step approach with a single atomic upsert that handles both cases. Use MongoDB's `$setOnInsert` combined with `$inc`:

```go
func (rl *RateLimiter) allowDistributed(key string, config RateLimitConfig) (bool, int, time.Time, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel()

    now := time.Now()
    windowEnd := now.Add(config.Window)
    expiresAt := windowEnd.Add(time.Minute)

    // Single atomic operation: increment if window valid, or reset if expired/new.
    opts := options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After)
    var doc rateLimitDoc

    // First try: increment within valid window
    err := rl.collection.FindOneAndUpdate(ctx,
        bson.M{"_id": key, "windowEnd": bson.M{"$gt": now}},
        bson.M{"$inc": bson.M{"count": 1}},
        opts,
    ).Decode(&doc)

    if err == mongo.ErrNoDocuments {
        // Window expired or new key. Use ReplaceOne with upsert to avoid the race.
        _, err = rl.collection.ReplaceOne(ctx,
            bson.M{"_id": key},
            rateLimitDoc{Key: key, Count: 1, WindowEnd: windowEnd, ExpiresAt: expiresAt},
            options.Replace().SetUpsert(true),
        )
        if err != nil {
            return false, 0, now, err
        }
        return true, config.MaxRequests - 1, windowEnd, nil
    }
    // ... rest unchanged
}
```

Alternatively, simply catch the duplicate key error and retry once:
```go
if mongo.IsDuplicateKeyError(err) {
    // Another request just created the doc — retry the increment
    err = rl.collection.FindOneAndUpdate(ctx,
        bson.M{"_id": key, "windowEnd": bson.M{"$gt": now}},
        bson.M{"$inc": bson.M{"count": 1}},
        opts,
    ).Decode(&doc)
}
```

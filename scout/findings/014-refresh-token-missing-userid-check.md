---
id: 014
type: security
severity: medium
status: new
found: 2026-03-25
phase: audit
---

## Refresh token lookup doesn't verify user ID — stolen tokens work from any context

**What:** The `/auth/refresh` endpoint validates the refresh token JWT and checks that it exists in the database, but the stored token lookup doesn't include the user ID in the query. This means a stolen refresh token can be used without any cross-check that the requesting context matches the token's owner.

**Where:** `backend/internal/api/handlers/auth.go` — lines 478-559 (Refresh handler)

**Evidence:**

The refresh endpoint extracts user claims from the JWT (line 485), then looks up the stored token by hash only:

```go
claims, err := h.jwtService.ValidateRefreshToken(req.RefreshToken)  // line 485
// claims.UserID is available here

tokenHash := hashToken(req.RefreshToken)
var storedToken models.RefreshToken
err = h.db.RefreshTokens().FindOne(r.Context(), bson.M{
    "tokenHash": tokenHash,  // ← only checks hash, NOT user ID
}).Decode(&storedToken)
```

Compare with the login handler which correctly uses `DummyCompare` for timing protection (line 325), and the token family replay detection (lines 502-513) which handles token reuse — both are well-implemented. The missing piece is just the user ID in the FindOne query.

The codebase has strong auth patterns overall:
- Token family rotation with replay detection
- Account lockout after 5 failed attempts
- Rate limiting on all auth endpoints
- 12-char password minimum with complexity requirements
- SHA256 token hashing before storage

This one gap is inconsistent with the otherwise careful auth handling.

**Why this matters:** MCPLens stores billing data, scan history, and tracked store configurations behind auth. If an attacker obtains a refresh token (via XSS, leaked logs, shared device), they can mint new access tokens indefinitely. Adding the user ID to the lookup is a defense-in-depth measure — the JWT signature already binds the token to a user, but the database query should enforce this too. It also makes the MongoDB query more efficient (uses the userId index instead of scanning by hash alone). This is a 1-line fix.

**Suggested Fix:** Add `userId` to the FindOne query:

```go
err = h.db.RefreshTokens().FindOne(r.Context(), bson.M{
    "tokenHash": tokenHash,
    "userId":    primitive.ObjectIDFromHex(claims.UserID),  // add this
}).Decode(&storedToken)
```

**Additional auth findings (for future cycles):**
- ForgotPassword has a timing-based user enumeration leak — returns faster when user doesn't exist vs when user exists and email is sent (lines 656-708). Login handler correctly uses DummyCompare for this, but ForgotPassword doesn't do equivalent dummy work.
- Billing checkout doesn't validate `plan.isActive` before creating Stripe session — could allow checkout for deactivated plans (mitigated by Stripe server-side pricing).

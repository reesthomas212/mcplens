---
id: 006
type: security
severity: high
status: new
found: 2026-03-24
phase: audit
---

## Docker container runs as root — no USER directive in Dockerfile.saas

**What:** The production Dockerfile (`Dockerfile.saas`) has no `USER` directive in the final runtime stage. The Go binary, Node.js scanner, and all processes run as root (UID 0) inside the container. If an attacker exploits a vulnerability in the app (e.g., the SSRF risk in domain validation, or any future RCE), they get root access inside the container.

**Where:** `Dockerfile.saas` — final stage (lines 28-53), no USER directive anywhere in the runtime stage

**Evidence:**
```dockerfile
# Line 28: Final runtime stage
FROM alpine:3.21

# Lines 29-52: copies binaries, installs node, sets up dirs...
# NO "USER" directive anywhere

# Line 53:
CMD ["./mcplens"]
# Runs as root
```

Confirmed by checking the entire file — `USER` appears zero times. The `COPY` directives use default ownership (root:root). The process runs as PID 1 under root.

**Why this matters:** Running as root is a container security anti-pattern that violates CIS Docker Benchmark (Section 4.1) and is flagged by every container security scanner (Trivy, Snyk, Docker Scout). For MCPLens specifically: (1) The scanner CLI executes user-supplied domains as arguments to Node.js — if there's ever a code execution path, root amplifies the blast radius. (2) Enterprise/agency customers evaluating MCPLens for their security-conscious Shopify stores will run container security scans and flag this immediately. (3) It's a 3-line fix with zero functional impact — there's no reason not to do it.

**Suggested Fix:** Add a non-root user to the final stage of `Dockerfile.saas`:

```dockerfile
# After line 30 (RUN apk add --no-cache nodejs npm):
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup

# After all COPY directives but before CMD:
RUN chown -R appuser:appgroup /app
USER appuser
```

Also add `scout/` to `.dockerignore` so scout findings aren't copied into the production image:
```
scout/
```

**Additional config issues found (for future findings):**
- `fly.saas.toml`: min_machines_running=0 causes cold-start latency (~3s) on every first request after idle
- `.env.example`: missing 5 vars (STRIPE_PUBLISHABLE_KEY, WEBHOOK_ENCRYPTION_KEY, DATADOG_*)
- Dockerfile: unnecessary node_modules copied to runtime (image bloat)
- scanner/package.json: `cp -r` in copy-assets breaks on Windows

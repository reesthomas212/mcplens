---
id: 028
type: bug
severity: high
status: new
found: 2026-03-25
phase: product
---

## robots.txt, sitemap.xml, and favicon.svg not served — likely needs a deploy (not a code bug)

**Update (cycle 34):** The SPA handler code at `main.go:61-62` correctly checks if files exist before falling back to `index.html`. The issue is that the live deployment predates the PR #15 merge that added these files. The deployed `index.html` still references `vite.svg` (not `favicon.svg`), confirming a stale deploy. Fix: run `fly deploy -c fly.saas.toml` to pick up the SEO files.

**What:** Finding 022 added `robots.txt`, `sitemap.xml`, and `favicon.svg` to `frontend/public/`. The files exist in the source code and were verified there. But on the live site, requesting any of these URLs returns the SPA's `index.html` shell instead of the actual file. The Go backend's catch-all static file handler serves `index.html` for every path that doesn't match an API route — swallowing the static files.

**Where:**
- `https://mcplens.dev/robots.txt` → returns `<!doctype html>` (SPA shell)
- `https://mcplens.dev/sitemap.xml` → returns `<!doctype html>` (SPA shell)
- `https://mcplens.dev/favicon.svg` → returns `<!doctype html>` (SPA shell)
- Backend static file serving: `backend/cmd/server/main.go` — the catch-all handler

**Evidence:**

```bash
$ curl -sf https://mcplens.dev/robots.txt | head -1
<!doctype html>

$ curl -sf https://mcplens.dev/sitemap.xml | head -1
<!doctype html>

$ curl -sf https://mcplens.dev/favicon.svg | head -1
<!doctype html>
```

All three return HTML instead of their actual content. The files exist in `frontend/public/` (verified in source — finding 022), and Vite includes them in the `dist/` output during build. But the Go backend serves the React SPA as a catch-all, and these file paths don't have explicit route handlers, so they hit the fallback.

**Why this matters:** This completely negates finding 022 (which was marked verified). Google and other search engines:
- Cannot discover the sitemap → pages aren't indexed efficiently
- Cannot read robots.txt → may crawl admin pages and API endpoints
- Cannot load the favicon → browser tabs show no icon or a broken icon reference

The irony is especially bad: MCPLens is an **AI readiness tool** that tells Shopify stores to make their endpoints machine-readable, but MCPLens's own site isn't machine-readable by search engines. Competitors like shopaudit.app specifically check robots.txt as part of their AI readiness audit — MCPLens would fail its own competitors' tests.

**Suggested Fix:** The Go backend needs to serve static files from `frontend/dist/` **before** the SPA catch-all. The fix depends on how the backend serves static files, but typically:

```go
// In main.go — serve specific static files BEFORE the SPA catch-all
router.PathPrefix("/robots.txt").Handler(http.FileServer(http.Dir(staticDir)))
router.PathPrefix("/sitemap.xml").Handler(http.FileServer(http.Dir(staticDir)))
router.PathPrefix("/favicon").Handler(http.FileServer(http.Dir(staticDir)))

// Then the SPA catch-all comes last
router.PathPrefix("/").Handler(spaHandler(staticDir))
```

Or more broadly, check if the requested file exists in `staticDir` before falling back to `index.html`:

```go
func spaHandler(dir string) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        path := filepath.Join(dir, r.URL.Path)
        if _, err := os.Stat(path); err == nil {
            http.ServeFile(w, r, path)  // File exists → serve it
            return
        }
        http.ServeFile(w, r, filepath.Join(dir, "index.html"))  // Fallback → SPA
    })
}
```

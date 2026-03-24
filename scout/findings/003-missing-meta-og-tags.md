---
id: 003
type: ux
severity: medium
status: implementing
found: 2026-03-24
phase: audit
---

## Missing meta tags and OG tags on 4 public pages

**What:** Four public-facing pages have no or incomplete meta tags — missing `og:title`, `og:description`, `og:image`, `twitter:card`, and in some cases even `document.title` and `meta description`. This means when these pages are shared on social media, Slack, or indexed by search engines, they show generic or blank previews.

**Where:**
- `frontend/src/pages/public/CustomPage.tsx` (lines 25-42) — sets title and description but missing all OG tags
- `frontend/src/pages/public/TermsPage.tsx` — no meta tags or dynamic title at all
- `frontend/src/pages/public/PrivacyPage.tsx` — no meta tags or dynamic title at all
- `frontend/src/pages/public/ScanPage.tsx` — no meta tags at all

**Evidence:** `ScanResultPage.tsx` (lines 5-19, 779-802) and `LandingPage.tsx` (lines 63-90) correctly set OG tags dynamically. The other 4 pages don't follow this pattern:

```typescript
// ScanResultPage does this correctly:
document.title = `${domain} MCP Score: ${result.score}/100 | MCPLens`;
// Sets og:title, og:description, og:image, twitter:card

// TermsPage does nothing — no useEffect, no meta tags
// PrivacyPage — same
// ScanPage — same
// CustomPage — partial (title + description only, no OG tags)
```

**Why this matters:** MCPLens is an early-stage product trying to gain organic traffic and social sharing. When someone shares a scan result, it looks great (OG tags work). But if someone shares the main scan page (`/scan`), terms, or a custom landing page, the preview is blank or shows the browser default. The `/scan` page is especially important — it's the entry point for the core product flow and the most likely page to be shared ("check out this tool"). Missing OG tags on this page means every social share is a missed conversion opportunity. This is a 15-minute fix with outsized impact on organic growth.

**Suggested Fix:** Add a `useEffect` to each page that sets `document.title` and creates/updates meta tags. Follow the same pattern used in `ScanResultPage.tsx`:

```typescript
// Example for ScanPage.tsx:
useEffect(() => {
  document.title = "Scan Your Shopify Store | MCPLens";
  const setMeta = (property: string, content: string) => {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) { el = document.createElement("meta"); el.setAttribute("property", property); document.head.appendChild(el); }
    el.setAttribute("content", content);
  };
  setMeta("og:title", "Scan Your Shopify Store | MCPLens");
  setMeta("og:description", "Find out how ready your Shopify store is for AI buying agents. Free instant scan.");
  setMeta("og:image", `${window.location.origin}/og-image.png`);
  setMeta("og:type", "website");
  // cleanup on unmount...
}, []);
```

**Additional frontend issues found (for future findings):**
- 8-10 accessibility issues (missing SVG aria-labels, form labels without `<label>`, missing `aria-expanded`)
- Mobile nav doesn't close on link click (LandingPage line 161-170)
- Potential broken link to `/plan` from ScanResultPage (lines 944, 971)
- Inconsistent logo rendering — some pages use `<Logo />` component, others render manually
- Missing error handling on checkout API call (ScanResultPage line 680-688)

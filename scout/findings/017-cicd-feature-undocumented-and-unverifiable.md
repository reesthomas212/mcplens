---
id: 017
type: ux
severity: high
status: new
found: 2026-03-25
phase: product
---

## CI/CD integration is a paid selling point but has zero documentation or discoverability

**What:** "CLI tool + CI/CD integration" is listed as a Pro feature ($29/mo) on the pricing page, and a GitHub Action exists in the repo at `.github/actions/scan/action.yml`. But there's no documentation page, no setup guide, no API reference, and no link from the product to the Action. A developer evaluating whether Pro is worth it for CI/CD has no way to see what the integration looks like, how to set it up, or what it does — before or after signing up.

**Where:**
- `frontend/src/pages/public/PricingPage.tsx` line 118 — lists "CLI tool + CI/CD integration" as Pro feature
- `.github/actions/scan/action.yml` — the actual GitHub Action (well-built, clean)
- No docs page, no `/developers` route, no API reference page exists

**Evidence:**

The pricing page Pro tier includes:
```typescript
['Everything in Free', '3 tracked stores', 'Unlimited AI quality assessments',
 'Fix instructions with code snippets', 'Weekly automated rescans',
 'Email + Slack alerts', 'CLI tool + CI/CD integration']
```

The GitHub Action is solid — supports authenticated/unauthenticated scans, `fail-under` threshold, produces GitHub Step Summary with score table, outputs `score` and `report-url`. But nobody can find it:

1. No "Developers" or "Docs" link in any navigation
2. No `/docs` or `/developers` route in the app
3. The scan results page doesn't mention CI/CD even though it shows a README badge (line 1243-1268)
4. The HowItWorksPage has no CI/CD section
5. The npm package name is registered (`mcplens`) but may not be published (v0.1.0 in package.json)

A developer considering Pro sees "CLI tool + CI/CD integration" → clicks "Start 30-Day Trial" → signs up → gets a dashboard with no mention of CLI or CI/CD → has no idea how to use the feature they just paid for.

**Why this matters:** CI/CD integration is the strongest retention hook for MCPLens. A store owner who manually scans once might not come back. A developer who wires MCPLens into their deploy pipeline becomes a permanent customer — every deploy checks agent readiness automatically. But this only works if the developer can:

1. **Evaluate before buying** — see the Action, read the docs, understand what they get
2. **Set up after buying** — find their API key, copy the Action config, test it

Right now neither is possible. The CI/CD feature is invisible. It's like having a feature that would lock in customers but never showing them the door.

This also matters for the Agency tier ($249/mo) which lists "API access + batch scanning." Same problem — where are the API docs?

**Suggested Fix:** Create a `/developers` page (or add a section to HowItWorksPage) with:

```
## CI/CD Integration

Add agent readiness checks to your deploy pipeline.
Score drops? The build fails. Score improves? Ship with confidence.

### GitHub Actions (2 minutes to set up)

```yaml
- uses: reesthomas212/mcplens/.github/actions/scan@master
  with:
    domain: 'your-store.com'
    fail-under: 70
    api-key: ${{ secrets.MCPLENS_API_KEY }}
```

### API (for custom integrations)

```bash
curl -X POST https://mcplens.dev/api/v1/scan \
  -H "Authorization: Bearer lsk_..." \
  -H "Content-Type: application/json" \
  -d '{"domain": "your-store.com"}'
```

[Get your API key →](/settings)
```

Also link to this page from:
- The scan results page (near the README badge section)
- The pricing page Pro tier (make "CLI tool + CI/CD integration" a link)
- The dashboard (for paying users)

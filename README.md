# MCPLens

**Agent-commerce visibility and QA for Shopify teams and agencies.**

MCPLens connects to any Shopify store's public commerce agent interface, runs agent-commerce scenarios, and generates a scored report showing whether AI buyer agents can discover, evaluate, and transact with the store.

The near-term GTM is agency-first: free public scans, paid human-reviewed audits, and white-label/batch reports for Shopify agencies and ecommerce consultants.

## Quick Start

```bash
# Scan any Shopify store
npx mcplens scan allbirds.com

# Compare stores
npx mcplens scan allbirds.com rothy.com --compare

# Use in CI/CD
npx mcplens scan mystore.com --non-interactive --fail-under 70
```

## How It Works

MCPLens connects to `https://{domain}/api/mcp` when available and simulates what an AI buyer agent would do:

1. **Discover available tools** - what can agents do on this store?
2. **Run test scenarios** across 4 categories
3. **Score each category** and generate a composite 0-100 score
4. **Generate a report** with specific issues and fix instructions

## Scoring

| Category | Weight | What It Tests |
|---|---:|---|
| Data Quality | 35% | Price data, descriptions, images, structured attributes |
| Product Discovery | 30% | Search functionality, filtering, result completeness |
| Checkout Flow | 25% | Cart operations, checkout initiation |
| Technical Health | 10% | Interface reliability, response shape, error handling |

Scores are color-coded: 80-100 good, 50-79 needs work, 0-49 critical.

## Web Scanner

Try it without installing anything: [mcplens.dev/scan](https://mcplens.dev/scan)

## CLI Reference

```bash
# Basic scan
mcplens scan <domain>

# Multiple flags
mcplens scan <domain> [options]

Options:
  --format <html|json>    Output format (default: html)
  --out <path>            Output file path
  --non-interactive       CI/CD mode (no prompts)
  --fail-under <score>    Exit code 1 if below threshold
  --compare               Side-by-side comparison (multiple domains)
  --verbose               Show detailed scan logs
  --open                  Open report in browser

# Batch scanning
mcplens batch --domains list.txt --output results/ --delay 1000
```

## CI/CD Integration

Add to your GitHub Actions:

```yaml
name: Agent Commerce QA
on: [push]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npx mcplens scan mystore.com --non-interactive --fail-under 70
```

## Pricing And GTM

MCPLens is **open source and free** for scanning. The strongest paid motions are one-off audits and agency reporting before broad merchant self-serve subscriptions:

| | Free | Human Audit ($199) | Pro ($79/mo) | Agency ($600/mo) |
|---|---|---|---|---|
| Automated scan + score | Yes | Yes | Yes | Yes |
| Shareable report URL | Yes | Yes | Yes | Yes |
| Human-reviewed fix report | No | Yes | No | Yes |
| Fix instructions | No | Yes | Yes | Yes |
| Store tracking | No | No | 15 stores | 100 stores |
| Scheduled scans | No | No | Daily | Daily |
| CI/CD integration | No | No | Yes | Yes |
| Email alerts | No | No | Yes | Yes |
| Simulated buyer agent | No | No | Yes | Yes |
| LLM quality assessment | No | No | Yes | Yes |
| White-label reports | No | No | No | Yes |
| API access | No | No | No | Yes |
| Batch scanning | No | No | No | Yes |
| Team/multi-user | No | No | No | Yes |

Validation target: sell $99-$299 audits first, then convert agencies that need repeated white-label reports into the $600/month plan.

## Why MCPLens?

Agentic commerce is moving quickly, but merchant demand is still early. Most teams do not need another abstract MCP dashboard; they need a concrete answer to one question: can agent-mediated shoppers find the right products, understand the offer, and reach checkout?

MCPLens fills that gap: **scan -> score -> fix -> package**.

- **Scan** Shopify stores without setup
- **Score** across 4 categories with a 0-100 composite
- **Fix** with specific, actionable recommendations
- **Package** the findings into client-ready agency reports

## 30-Day Validation

See [docs/gtm-validation.md](docs/gtm-validation.md) for the agency-first validation plan.

## Tech Stack

- **Scanner:** TypeScript (Node.js)
- **Backend:** Go (LastSaaS framework)
- **Frontend:** React + TypeScript
- **Database:** MongoDB
- **Billing:** Stripe

## License

MIT - see [LICENSE](LICENSE) for details.

---

Built with Claude Code | [Web Scanner](https://mcplens.dev/scan) | [GitHub](https://github.com/reesthomas212/mcplens)

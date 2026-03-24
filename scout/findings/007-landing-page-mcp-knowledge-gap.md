---
id: 007
type: copy
severity: high
status: new
found: 2026-03-24
phase: product
---

## Landing page assumes store owners know what MCP is

**What:** The landing page hero is strong — "Are AI agents skipping your store?" creates urgency. But it then jumps to "public MCP endpoint" and "10 agent commerce scenarios" without ever explaining what MCP is, why every Shopify store has one, or what it does. Most Shopify store owners have heard the press ("AI agents will change everything" — TechCrunch, Shopify's own blog) but have no idea their store already has a machine-readable interface that AI agents use to shop. The page talks *about* MCP without ever explaining it.

**Where:** `frontend/src/pages/public/LandingPage.tsx`

Key spots where MCP jargon appears without explanation:
- Line 305: "Every Shopify store now has a public MCP endpoint" — stated as fact, never explained
- Line 306: "the interface AI agents use to shop your store" — closest thing to an explanation, but buried in a paragraph
- Line 356: "10 agent commerce scenarios against the live interface" — what interface? What scenarios?
- Line 525: "Protocol Compliance" category — meaningless to a store owner

**Evidence:**

The "Why This Matters Now" section (lines 296-316) is the right place for this explanation, and it almost gets there:

> "Every Shopify store now has a public MCP endpoint — the interface AI agents use to shop your store."

But this is a single subordinate clause doing the work of an entire concept introduction. A store owner reading this thinks: "Wait, my store has a what? When did that happen? Did I set it up? Is it secure?" These questions go unanswered.

Compare to how the market is talking about this:
- Shopify's own press (March 2026): "Agentic Storefronts lets you list and sell products through ChatGPT, Google AI Mode, Gemini"
- TechCrunch (March 16, 2026): "Shopify is preparing for AI shopping agents to change everything"
- The knowledge gap: store owners know AI shopping is coming, but don't know their store already has the interface for it

The trust stats section (line 465) says "100+ stores scanned" — that's a low number that might actually hurt credibility more than help at this stage.

**Why this matters:** MCPLens is competing for the attention of Shopify's 6.9M store owners, most of whom "are not yet prepared to interact with AI agents" (per market research). These owners have heard the press hype but don't understand the mechanics. MCPLens's unique value is that it turns the abstract ("AI agents are coming") into the concrete ("here's your score, here are your gaps"). But the landing page skips the bridge — it goes from urgency (hero) to mechanics (scan) without the "aha moment" that connects them. A store owner who doesn't understand what an MCP endpoint is won't understand what they're scanning, why the score matters, or what the categories mean. They'll bounce before they ever enter a domain.

**Suggested Fix:** Add a brief, visual "What's an MCP endpoint?" explainer between the hero and the "Why This Matters Now" section. Keep it simple, zero jargon:

```
Your Shopify store already speaks to AI agents.

Shopify quietly gave every store a machine-readable interface — think of
it as your store's "front door" for AI. When someone asks ChatGPT or
Google to "find me running shoes under $150," the AI agent walks through
this door to browse your products, check prices, and start checkout.

The problem? Most stores' doors are broken. Missing prices. Incomplete
descriptions. Checkout flows that dead-end. The AI agent tries your
store, fails, and moves to a competitor.

MCPLens checks your door in 15 seconds.
```

Also consider:
- Replacing "Protocol Compliance" with "Standards" or "Technical Health" in the scoring categories — store owners don't think in protocols
- Removing or updating the "100+ stores scanned" stat until the number is more impressive (or replace with "Used by stores doing $X in monthly revenue")
- Adding a one-line tooltip or explainer on the scan results page for each scoring category

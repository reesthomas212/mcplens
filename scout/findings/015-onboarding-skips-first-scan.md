---
id: 015
type: ux
severity: high
status: new
found: 2026-03-25
phase: product
---

## Onboarding never prompts the user to scan their store — empty dashboard on first login

**What:** After signing up, the onboarding flow asks for a display name (step 1), team invitations (step 2), then says "You're all set!" and drops the user on an empty dashboard with no stores, no scans, and no data. The most important moment — connecting the user to their first scan — is completely missing. The user signed up because they saw a score and want to track it. The onboarding doesn't connect that intent to the product.

**Where:** `frontend/src/pages/app/OnboardingPage.tsx` — lines 1-191

**Evidence:**

The three onboarding steps:
```typescript
const steps: { key: Step; label: string; icon: typeof User }[] = [
  { key: 'profile', label: 'Profile', icon: User },    // Confirm name
  { key: 'team', label: 'Team', icon: Users },          // Invite team
  { key: 'complete', label: 'Done', icon: CreditCard }, // "You're all set!"
];
```

After completing onboarding, the user navigates to `/dashboard` (line 53):
```typescript
const handleComplete = async () => {
  await authApi.completeOnboarding();
  await refreshUser();
  navigate('/dashboard');
};
```

The dashboard will show an empty tracked stores list and a chart with no data (which we know crashes from finding 012).

The signup page does accept a `returnTo` param (line 35: `const returnTo = searchParams.get('returnTo') || '/dashboard'`), which means if a user came from a scan result page, the intent data exists — but the onboarding doesn't use it. The user's scan result (which motivated the signup) is lost.

**Why this matters:** The #1 predictor of SaaS retention is "time to first value." For MCPLens, the first value moment is seeing your store's score tracked over time with the ability to monitor improvements. The current onboarding delays this moment by:

1. Asking for a display name (low-urgency, could be set later in settings)
2. Asking to invite team members (irrelevant for a solo store owner who just wants to track their score)
3. Landing them on an empty dashboard where they have to figure out "add tracked store" on their own

A store owner who ran a free scan, saw their 47/100 score, and signed up to track it — now has to remember their domain, find the "add store" button, and manually re-add it. The scan that motivated the signup is disconnected from the paid experience.

**Suggested Fix:** Replace the current 3-step flow with a scan-first onboarding:

```
Step 1: "Add your store"
  - Pre-fill domain if they came from a scan result (via returnTo or query param)
  - Or show input: "Enter your Shopify domain to start tracking"
  - Automatically add as tracked store + trigger first scan

Step 2: "Your dashboard is ready" (merge profile + complete)
  - Show their score (from the scan they just triggered)
  - "We'll email you when your score changes"
  - Optional: set display name, invite team (collapsed, not required)
```

This gets the user to their first tracked store in one click, connects the free scan to the paid experience, and eliminates the empty dashboard state entirely. The team invite step should move to settings — it's a power-user feature, not an onboarding step for solo merchants.

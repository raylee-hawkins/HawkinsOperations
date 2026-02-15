CONTEXT_FILE: C:\RH\OPS\BUILD\agents\codex\codex_context_latest.txt

# AGENTS.md — HawkinsOperations (Codex instructions)

## Project identity
- Purpose: evidence-first SOC portfolio for job hunting
- Target roles: Primary SOC Analyst (T1/T2); Secondary junior detection + automation
- Clearance line (use verbatim everywhere): “Eligible to obtain clearance; willing to pursue sponsorship.”

## Environment constraints
- Windows 11 + Linux Mint dual-boot
- When giving commands:
  - Prefer PowerShell (`pwsh`) for verification scripts and Windows workflows
  - Use fish-compatible syntax on Linux (avoid bashisms)
- Deployment primary: Cloudflare Pages (production)
- Deployment: Cloudflare Pages only (production + rollback path)
- Site publish directory is `site/` (static HTML/CSS/JS, no framework)

## Source of truth (numbers)
- All public numbers MUST match `PROOF_PACK/VERIFIED_COUNTS.md`
- Never use “200+ detections” or any inflated claims
- Never change counts unless verification passes and the source-of-truth file is updated

## Files you must not break
- `PROOF_PACK/VERIFIED_COUNTS.md`
- `START_HERE.md`
- `README.md`
- `site/index.html`
- `scripts/verify/verify-counts.ps1`

## Hosting guardrails
- Cloudflare Pages is the production host.
- Cloudflare project must publish from `site/` and track `main` for production.
- `site/_redirects` supports pretty URLs (`/security -> /security.html`, etc.)
- `site/_headers` exists (security headers)
- `site/404.html` exists (custom 404)
- Resume PDF must exist at: `site/assets/Raylee_Hawkins_Resume.pdf`
- Resume link must be: `/assets/Raylee_Hawkins_Resume.pdf` (absolute path)

## Phase ordering update (0-2B+hosting)
1) Complete current phase work (Phase 0 through Phase 2B) with verified-lane checks.
2) Execute hosting transfer to Cloudflare Pages and complete Hosting Transfer Proof Pack.
3) Continue remaining polish phases only after hosting transfer evidence is complete and reviewed.

## Hosting Transfer Proof Pack
- Required artifact root: `PROOF_PACK/hosting_transfer_cloudflare/`
- Required artifacts:
  - `CF_PAGES_PROJECT_SETTINGS.md` (build/publish settings, branch mappings)
  - `DNS_CUTOVER_RECORDS.md` (before/after DNS values and timestamps)
  - `ROUTING_AND_HEADERS_VALIDATION.md` (redirect/header parity checks)
  - `ROLLBACK_PLAN_AND_TRIGGER.md` (clear rollback conditions and DNS/provider fallback steps)
  - `DEPLOY_LOG_LINKS.md` (Cloudflare deploy URLs + commit SHAs)
- Stress test checklist:
  - Repeat deploys from at least 3 consecutive commits and verify deterministic output.
  - Validate routes: `/`, `/security`, `/projects`, `/resume`, `/proof`, `/lab`, `/triage`, custom `404`.
  - Validate resume PDF download and absolute path `/assets/Raylee_Hawkins_Resume.pdf`.
  - Verify `_headers` and `_redirects` behavior parity after cutover.
  - Confirm no stale cached assets after hard refresh (desktop + mobile).
- Evidence capture checklist:
  - Cloudflare Pages production + preview deploy screenshots/log links.
  - DNS propagation evidence (timestamped checks from two resolvers).
  - Header/redirect validation command outputs.
  - Rollback drill evidence showing provider fallback procedure.

## Standard workflow (no vibes)
1) Check repo state first (`git status`, recent commits/PR context if relevant)
2) Make smallest change that satisfies the requested phase
3) Run verification + local test before calling it “done”
4) Keep diffs small; do not add dependencies unless explicitly requested
5) Never print or commit secrets/tokens

## Verification / local test
- Verify counts:
  - `pwsh -File scripts/verify/verify-counts.ps1`
- Serve site locally:
  - `python -m http.server --directory site 8000`
- Minimum click-test paths:
  - `/`, `/security`, `/projects`, `/resume` (PDF download), `/proof`, `/lab`, `/triage`

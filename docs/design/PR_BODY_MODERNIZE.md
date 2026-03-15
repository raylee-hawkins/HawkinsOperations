# [MODERNIZE] Visual upgrade: tokens, reference components, and mockups

## Description

**What does this PR do:**
Adds a static-first visual upgrade package for HawkinsOperations. The package recommends MODERNIZE, defines three upgrade modes, provides token/CSS/Tailwind/TSX reference artifacts, and includes deterministic SVG mockups for homepage, AutoSOC project, and demo layouts.

**Related Issue:**
N/A

---

## Type of Change

- [ ] New detection rule (Sigma/Splunk/Wazuh)
- [ ] New IR playbook
- [x] Documentation improvement
- [ ] Bug fix
- [ ] Script/automation enhancement
- [x] Other (design/reference package)

---

## Detection Rule Details (if applicable)

**MITRE ATT&CK Techniques:**
- N/A - design/reference package only

**Platform:**
- [ ] Sigma
- [ ] Splunk
- [ ] Wazuh

**Detection Summary:**
Not applicable. This PR does not add or modify detection content.

**False Positives:**
Not applicable.

---

## IR Playbook Details (if applicable)

**Scenario:**
Not applicable. This PR does not add or modify IR playbooks.

**MITRE ATT&CK Techniques:**
- N/A - design/reference package only

**Time Estimates:**
- Triage: N/A
- Investigation: N/A
- Containment: N/A

---

## Testing

**I have tested this by:**
- [x] Running verification script (`.\scripts\verify\verify-counts.ps1`)
- [ ] Building Wazuh bundle (`.\scripts\build-wazuh-bundle.ps1`)
- [x] Validating YAML/XML syntax
- [x] Checking for sanitization issues (no real IPs, credentials, PII)
- [ ] Testing detection logic (if applicable)

**Test Results:**
```text
- Token JSON parses successfully.
- verify-counts.ps1 passes.
- drift_scan.py passes.
- Reference TSX files are structured for copy/paste use in a stock Next.js + Tailwind app.
- SVG mockups open as deterministic fixtures for visual review.
- No live site routes or infra behavior changed in this package.
```

---

## Sanitization Checklist

- [x] No real IP addresses (use 10.x.x.x or 192.168.x.x)
- [x] No real hostnames (use generic names like WORKSTATION-01)
- [x] No credentials or API keys
- [x] No email addresses or PII
- [x] No internal company names
- [x] Followed [PROOF_PACK/EVIDENCE_CHECKLIST.md](../../PROOF_PACK/EVIDENCE_CHECKLIST.md)

---

## Quality Checklist

- [x] Code follows the style guidelines in [CONTRIBUTING.md](../../CONTRIBUTING.md)
- [x] I have performed a self-review of my changes
- [x] I have commented my code where necessary (especially detection logic)
- [x] My changes generate no new warnings
- [x] I have updated documentation as needed
- [ ] MITRE ATT&CK tags are accurate and complete
- [x] Commit messages are clear and descriptive

---

## Screenshots/Evidence (if applicable)

- `docs/design/mockups/home-desktop.svg`
- `docs/design/mockups/project-desktop.svg`
- `docs/design/mockups/demo-desktop.svg`

---

## Additional Context

**Dependencies:**
No new runtime dependencies. The reference code assumes a standard Next.js + Tailwind environment if copied into a separate app.

**Breaking Changes:**
None. Production continues to publish from `site/` and this PR is design/reference documentation only.

**Future Work:**
- Promote MODERNIZE tokens into a canary CSS path for the static site.
- Test hero, project cards, and project page layout in Cloudflare preview.
- Decide whether a future component extraction warrants a separate `web/` app.

---

## Reviewer Notes

**Focus areas for review:**
- Is MODERNIZE the right recommendation for hiring-manager ROI?
- Are the contrast tables and accessibility targets concrete enough to implement?
- Do the reference components preserve the repo's proof-first tone?

**Questions for reviewers:**
- Should canary testing happen via `site/modernize/` or a `?variant=modernize` CSS path?
- Are the current proof and resume paths still the right CTAs for homepage priority?

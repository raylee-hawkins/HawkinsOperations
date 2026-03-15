# Pull Request

## Description

**What does this PR do:**
Provide a clear and concise description of the changes.

**Related Issue:**
Closes #(issue number)

---

## Type of Change

- [ ] New detection rule (Sigma/Splunk/Wazuh)
- [ ] New IR playbook
- [ ] Documentation improvement
- [ ] Bug fix
- [ ] Script/automation enhancement
- [ ] Other (specify)

---

## Detection Rule Details (if applicable)

**MITRE ATT&CK Techniques:**
- T#### - Technique Name
- T#### - Technique Name

**Platform:**
- [ ] Sigma
- [ ] Splunk
- [ ] Wazuh

**Detection Summary:**
Brief description of what this rule detects.

**False Positives:**
Known scenarios that may trigger false positives.

---

## IR Playbook Details (if applicable)

**Scenario:**
What incident scenario does this playbook address?

**MITRE ATT&CK Techniques:**
- T#### - Technique Name

**Time Estimates:**
- Triage: X minutes
- Investigation: X minutes
- Containment: X minutes

---

## Testing

**I have tested this by:**
- [ ] Running verification script (\`.\_verify_counts.ps1\`)
- [ ] Building Wazuh bundle (\`.\scripts\build-wazuh-bundle.ps1\`)
- [ ] Validating YAML/XML syntax
- [ ] Checking for sanitization issues (no real IPs, credentials, PII)
- [ ] Testing detection logic (if applicable)

**Test Results:**
\`\`\`
Paste verification output or test results here
\`\`\`

---

## Sanitization Checklist

- [ ] No real IP addresses (use 10.x.x.x or 192.168.x.x)
- [ ] No real hostnames (use generic names like WORKSTATION-01)
- [ ] No credentials or API keys
- [ ] No email addresses or PII
- [ ] No internal company names
- [ ] Followed [PROOF_PACK/EVIDENCE_CHECKLIST.md](../PROOF_PACK/EVIDENCE_CHECKLIST.md)

---

## Quality Checklist

- [ ] Code follows the style guidelines in [CONTRIBUTING.md](../CONTRIBUTING.md)
- [ ] I have performed a self-review of my changes
- [ ] I have commented my code where necessary (especially detection logic)
- [ ] My changes generate no new warnings
- [ ] I have updated documentation as needed
- [ ] MITRE ATT&CK tags are accurate and complete
- [ ] Commit messages are clear and descriptive

---

## Screenshots/Evidence (if applicable)

If this adds sample content to PROOF_PACK or changes UI/docs, include screenshots.

---

## Additional Context

**Dependencies:**
List any dependencies or related PRs.

**Breaking Changes:**
Describe any breaking changes and migration steps.

**Future Work:**
Note any follow-up work or related issues.

---

## Reviewer Notes

**Focus areas for review:**
Point reviewers to specific areas that need extra attention.

**Questions for reviewers:**
Any specific questions or concerns you have about this PR.

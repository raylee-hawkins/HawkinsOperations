# Incident Response Index

Incident response content is organized into three lanes:

- `playbooks/` full response procedures
- `templates/` starting templates for new playbooks
- `checklists/` condensed operational references

## Full-Detail Playbooks

These three playbooks are fully built out with time-boxed triage steps, investigation commands, and evidence requirements:

- [IR-001-LSASS-Access.md](./playbooks/IR-001-LSASS-Access.md) — T1003.001 Credential Dumping
- [IR-002-Suspicious-PowerShell.md](./playbooks/IR-002-Suspicious-PowerShell.md) — T1059.001 Script Execution
- [IR-003-Ransomware-Detected.md](./playbooks/IR-003-Ransomware-Detected.md) — T1486 Data Encrypted for Impact

## Framework Playbooks

The following playbooks use the standardized 7-step framework with TTP-specific detection signals, containment, and recovery steps. They are intentional scope boundaries — depth is in the full-detail set above.

- [IR-004-Brute-Force.md](./playbooks/IR-004-Brute-Force.md) — T1110
- [IR-005-Malware.md](./playbooks/IR-005-Malware.md) — T1204
- [IR-006-Priv-Esc.md](./playbooks/IR-006-Priv-Esc.md) — T1068
- [IR-007-AD-Compromise.md](./playbooks/IR-007-AD-Compromise.md) — T1003.006 DCSync
- [IR-008-Lateral-Movement.md](./playbooks/IR-008-Lateral-Movement.md) — T1021
- [IR-015-Exfiltration.md](./playbooks/IR-015-Exfiltration.md) — T1041
- [IR-022-Supply-Chain.md](./playbooks/IR-022-Supply-Chain.md) — T1195

## Quick Reference Checklists

> **Note on numbering:** The quick reference uses its own sequential ID scheme (IR-004 through IR-030) covering 27 operational scenarios. These IDs are independent of the named playbook files above — they are a separate condensed reference layer, not extensions of the playbook set.

- [IR-004-to-030-Quick-Reference.md](./checklists/IR-004-to-030-Quick-Reference.md) — 27 scenario quick references (credential access, lateral movement, persistence, evasion, exfil, and more)

## Templates

- [IR-Template.md](./templates/IR-Template.md)
- [IR-Playbook-Template.md](./templates/IR-Playbook-Template.md)

# Wazuh Rules-As-Code Pack

This directory is the source-of-truth lane for Wazuh operational content:
- packable rules/decoders/lists
- repeatable validation inputs
- suppression rationale and false-positive tracking
- response playbooks and Sigma-to-Wazuh mapping notes

## Layout

- `pack/` deployable artifacts for manager paths (`rules`, `decoders`, `lists`)
- `suppression/` tuning decisions and noise backlog
- `playbooks/` analyst runbooks tied to detection outcomes
- `sigma/` portable Sigma logic and mapping notes for Wazuh implementation

## Deployment Workflow

Run from repository root:

```powershell
pwsh -NoProfile -File .\scripts\validate_wazuh_pack.ps1
pwsh -NoProfile -File .\scripts\deploy_wazuh_pack.ps1
```

Evidence from each deploy is written to:
- `evidence/wazuh/run_MM-DD-YYYY_HHMMSS/`


# Lab Automation and Detection Validation (Phase 6A)

## Scope

This document is repo-first scaffolding for Phase 6A infra validation.
It inventories the lab at a sanitized level only and does not execute infra changes.

## Redaction Requirement

Before publishing any evidence for this lab, apply:

- `PROOF_PACK/REDACTION_RULES.md`
- `PROOF_PACK/EVIDENCE_CHECKLIST.md`

## Sanitized Environment Inventory

Use this structure for evidence and runbooks. Keep all identifiers redacted.

### Control Plane

- Hypervisor platform: `[REDACTED_INTERNAL_PLATFORM]`
- Management node label: `[REDACTED_INTERNAL_HOST]`
- Access model: VPN + SSH + web UI (all identifiers redacted)
- Admin account references: role-based labels only (`analyst`, `admin`, `operator`)

### Workload Plane

- Linux validation VM: `[REDACTED_INTERNAL_VM_LINUX]`
- Windows validation VM: `[REDACTED_INTERNAL_VM_WINDOWS]`
- Detection test VM: `[REDACTED_INTERNAL_VM_TEST]`
- Optional GPU-enabled VM: `[REDACTED_INTERNAL_VM_GPU]`

### Tooling Inventory

- SIEM/EDR stack: `[REDACTED_INTERNAL_SIEM]`
- Rule source directories: repo paths only
- Automation stack:
  - IaC: `projects/lab/iac/` (templates only)
  - Test harness: `projects/lab/testing/` (scaffold only)
  - Evidence outputs: `PROOF_PACK/features/`

### Network and Identity Rules

- Never publish:
  - IP addresses
  - Hostnames
  - Domain names
  - Email addresses
  - Usernames tied to real identity
  - Serial numbers, asset tags, license keys
  - Tokens, keys, secrets
- Use placeholders:
  - `[REDACTED_INTERNAL]`
  - `[REDACTED]`
  - `example.local`
  - `10.0.0.0/24` only when clearly synthetic

## What Exists in Phase 6A

- Sanitized inventory and documentation scaffolding in this file
- Redaction policy in `PROOF_PACK/REDACTION_RULES.md`
- Execution note in `docs/execution/PHASE_6A_INFRA_VALIDATION.md`
- Evidence run folder under `PROOF_PACK/features/phase6a-infra-validation-doc/`

## What Is Not Executed in Phase 6A

- No VM creation or modification
- No Terraform apply/destroy
- No endpoint enrollment changes
- No external system configuration changes

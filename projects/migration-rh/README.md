# migration-rh

Entry point for the RH migration project within HawkinsOperations.

## What It Is

This project represents the RH filesystem migration program and proof trail.

This repository intentionally uses **link mode** (Option B): it does not copy the full `RH_MIGRATION_2026_V2` code/history into this repo. Instead, it links to the standalone source-of-truth release and keeps lightweight reference material.

## What It Proves

- Phase-governed migration execution model
- Contract/audit spine enforcement
- Objective phase verification and proof promotion
- Published release receipt for Phase 08 completion

## Canonical Source

- Repo: `raylee-hawkins/RH_MIGRATION_2026_V2`
- Release: [`v0.9.0` — Phase 08 complete (100% core phases)](https://github.com/raylee-hawkins/RH_MIGRATION_2026_V2/releases/tag/v0.9.0)

## Verification Commands

Use these in the standalone repository clone:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "tools\preflight.ps1"
pwsh -NoProfile -ExecutionPolicy Bypass -File "tools\audit_phase.ps1" -Phase 08
pwsh -NoProfile -ExecutionPolicy Bypass -File "tools\status.ps1"
```

Expected: phases `00` through `08` report `COMPLETE`.

## Local Contents in This Subtree

- `PROOF_PACK/` curated project proof links and verification notes
- `reference/imports/` raw imported reference snapshots
- `reference/migration-patterns/` migration documentation patterns used during integration


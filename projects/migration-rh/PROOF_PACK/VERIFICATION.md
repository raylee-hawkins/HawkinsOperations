# migration-rh Verification

Run in `RH_MIGRATION_2026_V2`:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "tools\preflight.ps1"
pwsh -NoProfile -ExecutionPolicy Bypass -File "tools\audit_phase.ps1" -Phase 08
pwsh -NoProfile -ExecutionPolicy Bypass -File "tools\status.ps1"
```

Expected:

- `preflight` passes.
- `audit_phase -Phase 08` passes.
- `status` lists phases `00` to `08` as `COMPLETE`.

Reference release:

- https://github.com/raylee-hawkins/RH_MIGRATION_2026_V2/releases/tag/v0.9.0


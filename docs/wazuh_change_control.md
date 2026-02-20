# Wazuh Change Control

## Scope

Rules-as-code deployment flow for:
- `wazuh/pack/rules/*.xml`
- `wazuh/pack/decoders/*.xml`
- `wazuh/pack/lists/*`

## Process

1. Open PR with change notes, tuning context, and impacted rule IDs.
2. Run local validation:
   - `pwsh -NoProfile -File .\scripts\validate_wazuh_pack.ps1`
3. Merge only after review and validation success.
4. Deploy from trusted operator workstation:
   - `pwsh -NoProfile -File .\scripts\deploy_wazuh_pack.ps1`
5. Confirm:
   - manager service active
   - no startup parse errors
   - expected detections still fire
6. Store run evidence under:
   - `evidence/wazuh/run_MM-DD-YYYY_HHMMSS/`

## Rollback

If deploy causes instability or false-positive flood:

1. Restore from backup path recorded in `deploy_report.md`:
   - `/var/ossec/backup/wazuh_pack_MM-DD-YYYY_HHMMSS/`
2. Copy back `rules_backup`, `decoders_backup`, and `lists_backup` into manager paths.
3. Restart manager:
   - `systemctl restart wazuh-manager`
4. Verify service health and alert normalization.
5. Open follow-up issue with root cause and corrective action.


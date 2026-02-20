# System Update + Security + Junk Cleanup Baseline

Generated: 2026-02-20
Host root: C:\RH\OPS

## 1) Actions completed in this run

- Ran package audit with winget and identified 23 available upgrades.
- Applied bulk application upgrades with `winget upgrade --all --include-unknown`.
- Retried remaining upgrades individually.
- Successfully updated Microsoft Teams (personal) and App Installer package payload.
- Queried Windows Update API for pending OS/security updates.
- Queried Defender baseline state and refreshed signatures.
- Checked cleanup targets (temp/cache/recycle bin) for space recovery baseline.

## 2) Current state snapshot (2026-02-20)

### Package upgrades (winget)
- Initial available upgrades: 23
- Remaining shown by winget after upgrade run: 2
  - `ZedIndustries.Zed` -> reported as available but "No applicable upgrade found" on install attempt.
  - `Microsoft.AppInstaller` -> install command returned success, but current winget session still reports old version (likely requires process/session restart or index refresh).

### Windows Update (OS/security)
- Pending software updates discovered: 4
  - KB890830 (MSRT)
  - KB5007651 (Windows Security platform)
  - KB2267602 (Defender intelligence update)
  - KB5077181 (2026-02 security update)
- Driver updates pending: 0
- API install attempt result: failed with `0x80240044` for all 4 updates (per-machine update access denied in current token context).
- Fallback `UsoClient` trigger executed (scan/download/install), but updates still show pending.

### Defender/security posture
- AV service enabled: True
- Real-time protection enabled: True
- IOAV/NIS enabled: True
- Signature version after refresh: `1.445.153.0`
- Signature last updated: `2026-02-19 20:31:35`
- Quick scan age: 1 day
- Full scan age: 94 days

### Cleanup footprint
- `%TEMP%` (`C:\Users\Raylee\AppData\Local\Temp`): ~2.02 GB, 13,878 files
- `C:\Windows\Temp`: ~0.00 GB, 0 files
- `C:\Windows\SoftwareDistribution\Download`: ~2.76 GB, 14,391 files
- Recycle Bin: 0 items (~0.00 GB)
- Total immediate cleanup target (safe temp/cache): ~4.78 GB

## 3) Baseline maintenance plan

### Daily (5-10 min)
1. Update Defender signatures:
   - `Update-MpSignature`
2. Verify Defender real-time status:
   - `Get-MpComputerStatus | Select AMServiceEnabled,AntivirusEnabled,RealTimeProtectionEnabled,AntivirusSignatureVersion,AntivirusSignatureLastUpdated`
3. Run quick app upgrade check:
   - `winget upgrade`

### Weekly (20-40 min)
1. Apply all app upgrades:
   - `winget upgrade --all --include-unknown --accept-source-agreements --accept-package-agreements --disable-interactivity`
2. Run Defender quick scan:
   - `Start-MpScan -ScanType QuickScan`
3. Review temp/cache growth:
   - `%TEMP%`
   - `C:\Windows\SoftwareDistribution\Download`

### Monthly (45-90 min)
1. Run Windows cumulative/security updates from an elevated **Administrator** PowerShell or Windows Settings UI.
2. Reboot immediately after cumulative updates.
3. Run Defender full scan:
   - `Start-MpScan -ScanType FullScan`
4. Validate disk health and free space trend.

## 4) Required admin-context fixes

To clear the 4 pending Windows updates, run one of these in a true elevated Administrator context:

1. Windows Settings -> Windows Update -> Check for updates -> Install all -> Reboot.
2. Elevated PowerShell with Windows Update tooling (if your policy allows module install) and then install updates.

The current automation shell token can read update state but cannot install per-machine Windows updates (`0x80240044`).

## 5) Junk cleanup safety baseline

- Do not hard-delete in automation by default.
- Prefer staged cleanup (report first, then execute).
- Restrict cleanup scope to known safe temporary/cache locations.
- Keep one rollback window for large cleanup actions before permanent deletion.

Recommended first cleanup scope for this host:
- `%TEMP%` files older than 7 days.
- `C:\Windows\SoftwareDistribution\Download` cache after successful Windows Update cycle.


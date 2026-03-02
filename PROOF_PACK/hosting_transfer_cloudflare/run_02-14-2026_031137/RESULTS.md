# Hosting Transfer Run Results
AS_OF_UTC: 2026-02-14T03:30:00Z
RUN_FOLDER: `PROOF_PACK/hosting_transfer_cloudflare/run_02-14-2026_031137/`

## Summary
- Objective: close Phase 3 hosting transfer execution evidence gates.
- Host under test: `https://hawkinsops.com`
- Validation lane: Cloudflare Pages production + preview/check metadata.

## Pass/Fail
- Deploy log completion (production + preview/check mapping): `PASS`
- Deterministic deploy evidence (3 consecutive main commits): `PASS`
- Route coverage (`/`, `/security`, `/projects`, `/resume`, `/proof`, `/lab`, `/triage`): `PASS`
- Unknown route custom 404 behavior: `PASS`
- `_headers` parity on production routes: `PASS`
- `_redirects` parity for resume canonicalization redirects: `PASS`
- Hard refresh parity (desktop + mobile no-cache checks): `PASS`
- DNS resolver checks ([REDACTED_IP] + [REDACTED_IP]): `PASS`
- DNS before->after backfill record: `PASS`
- Rollback drill receipt (controlled simulation): `PASS`

## Evidence Index
- Deploy mapping:
  - `evidence/logs/deploy_mapping_capture_02-14-2026.txt`
  - `evidence/logs/deterministic_deploy_capture_02-14-2026.txt`
- Route/header/redirect/404:
  - `evidence/logs/route_header_validation_02-14-2026.txt`
  - `evidence/logs/route_clicktest_status_02-14-2026.txt`
  - `evidence/logs/route_body_behavior_404_02-14-2026.txt`
  - `evidence/logs/redirect_parity_02-14-2026.txt`
- Hard refresh parity:
  - `evidence/logs/hard_refresh_desktop_mobile_02-14-2026.txt`
- DNS:
  - `evidence/logs/dns_before_after_backfill_02-14-2026.txt`
- Rollback drill:
  - `evidence/logs/rollback_drill_simulation_02-14-2026.txt`
- Screenshots:
  - `evidence/screenshots/home_02-14-2026.png`
  - `evidence/screenshots/projects_02-14-2026.png`
  - `evidence/screenshots/security_02-14-2026.png`
  - `evidence/screenshots/resume_02-14-2026.png`
  - `evidence/screenshots/proof_02-14-2026.png`
  - `evidence/screenshots/lab_02-14-2026.png`
  - `evidence/screenshots/triage_02-14-2026.png`
  - `evidence/screenshots/404_02-14-2026.png`

## Notes
- The rollback drill was executed as a controlled simulation to avoid live DNS churn during active production serving.
- All claims above are tied to explicit logs/screenshots in this run folder.


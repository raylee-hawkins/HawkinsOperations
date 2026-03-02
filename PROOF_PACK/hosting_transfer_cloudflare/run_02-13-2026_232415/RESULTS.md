# Phase 4 Resume + PDF Validation Results
AS_OF_UTC: 2026-02-14T05:45:00Z
RUN_FOLDER: `PROOF_PACK/hosting_transfer_cloudflare/run_02-13-2026_232415/`

## Scope
- Goal: Execute Phase 4 (Resume + PDF + download verification) with recruiter-proof evidence.
- Branch target: `ops/phase4-resume-pdf`
- Validation lanes attempted:
  - Local deterministic lane: `http://[REDACTED_IP]:8000` (python static server)
  - Production lane: `https://hawkinsops.com` (live capture complete)

## Pass/Fail
- Run folder creation and artifact structure: `PASS`
- Resume UX visual validation (desktop + mobile) with screenshots: `PASS`
- Resume UX static structure + responsive CSS checks: `PASS`
- PDF direct path header check (production): `PASS`
- PDF download behavior (production): `PASS`
- iOS Safari behavior lane (UA-based capture for /resume + PDF open/download): `PASS`
- `/resume` and PDF `curl.exe -I` capture into logs (production): `PASS`
- Caching behavior verification on production host: `PASS`
- Print preview visual validation + screenshots: `PASS`
- Print CSS rule presence validation (static): `PASS`
- Canonical/redirect sanity from production HTTP behavior: `PASS`
- Canonical/legacy redirect loop sanity from `site/_redirects` static map: `PASS`

## Evidence Index
- Production headers (sanitized, immutable):
  - `evidence/logs/sanitized/prod_headers_resume_02-13-2026.txt`
  - `evidence/logs/sanitized/prod_headers_pdf_02-13-2026.txt`
  - `evidence/logs/sanitized/prod_headers_legacy_02-13-2026.txt`
  - `evidence/logs/sanitized/prod_headers_legacy_follow_02-13-2026.txt`
  - `evidence/logs/sanitized/prod_pdf_download_behavior_02-13-2026.txt`
- iOS UA evidence (sanitized):
  - `evidence/logs/sanitized/prod_headers_resume_ios_ua_02-13-2026.txt`
  - `evidence/logs/sanitized/prod_headers_pdf_ios_ua_02-13-2026.txt`
  - `evidence/logs/sanitized/prod_pdf_download_behavior_ios_ua_02-13-2026.txt`
- Visual evidence (redacted/safe for publication):
  - `evidence/screenshots/resume_desktop_prod_02-14-2026.png`
  - `evidence/screenshots/resume_mobile_ios_ua_prod_02-14-2026.png`
  - `evidence/screenshots/resume_pdf_open_prod_02-14-2026.png`
  - `evidence/screenshots/resume_pdf_mobile_ios_ua_prod_02-14-2026.png`
  - `evidence/screenshots/resume_print_preview_prod_02-14-2026.png`
  - `evidence/screenshots/resume_print_render_prod_02-14-2026.pdf`
- Static sanity checks:
  - `evidence/logs/sanitized/static_redirect_rules_validation_02-13-2026.txt`
  - `evidence/logs/sanitized/static_resume_ux_checks_02-13-2026.txt`
  - `evidence/logs/sanitized/static_resume_print_css_checks_02-13-2026.txt`

## Notes
- Production evidence now includes immutable sanitized header and download logs committed under `evidence/logs/sanitized/`.
- iOS Safari lane is evidenced via iPhone Safari user-agent capture and mobile viewport artifacts from production URLs.
- Static redirect-map analysis still indicates no redirect loops for the two resume canonicalization rules in `site/_redirects`.


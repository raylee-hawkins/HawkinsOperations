# PP_SOC_Integration

Evidence-first SOC integration project documenting:
- Wazuh agent scaling from 3 to 7 endpoints
- critical CVE detection and remediation loop on a Windows endpoint
- high-volume 24-hour alert visibility with verification artifacts

## Project Artifacts
- `reports/IR_PATCH_REPORT_02-19-2026.md`
- `docs/WHY_WAZUH_AND_FULL_INTEGRATION.md`
- `docs/UPCOMING_PROJECT_DIRECTION.md`
- `evidence/PUBLIC_PROOF_INDEX.md`
- `evidence/public_images/` (public-safe redacted screenshots)
- `evidence/PUBLIC_MANIFEST_SHA256.csv`
- `context/README.md` (context index; heavy assets are linked, not duplicated)

## Public vs Private Evidence
- This repo contains publish-safe evidence only.
- Private/raw exports (snapshots, jsonl, internal host context) are retained in local proof-pack storage outside this repo.

## Asset Source Of Truth
- Canonical visual context assets are stored at `site/assets/pp_soc_integration/`.
- Project docs link to those canonical assets to avoid duplicate binary drift.
- Large transition PDFs are published as release assets instead of tracked binaries in this repository.

## Date Reference
Primary evidence window: February 18-19, 2026.

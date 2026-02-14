# START_HERE

Use this file for a fast technical validation path.

## 5-Minute Proof Path

1. Open [PROOF_PACK/PROOF_INDEX.md](PROOF_PACK/PROOF_INDEX.md) to see the evidence layout.
2. Open [PROOF_PACK/VERIFIED_COUNTS.md](PROOF_PACK/VERIFIED_COUNTS.md) for current rule/playbook counts.
3. Open [detection-rules/INDEX.md](detection-rules/INDEX.md) to inspect detection coverage and platform layout.
4. Open [incident-response/INDEX.md](incident-response/INDEX.md) to review the IR catalog.
5. Open [projects/migration-rh/README.md](projects/migration-rh/README.md) for migration project proof linkage.

## Reproduce Locally

Run from repository root:

```powershell
pwsh -NoProfile -File ".\scripts\verify\verify-counts.ps1"
pwsh -NoProfile -File ".\scripts\verify\generate-verified-counts.ps1" -OutFile ".\PROOF_PACK\VERIFIED_COUNTS.md"
pwsh -NoProfile -File ".\scripts\build-wazuh-bundle.ps1"
```

Expected:

- `PROOF_PACK/VERIFIED_COUNTS.md` updates with current counts.
- `dist/wazuh/local_rules.xml` is generated.

## Reviewer Notes

- This repository is evidence-first: claims are backed by reproducible commands.
- `PROOF_PACK/` is the curated review lane; raw imports and legacy material are not part of the front-door proof path.
- Phase execution notes: `docs/execution/PHASE_1_COUNT_RECON.md`, `docs/execution/PHASE4_RESUME_ATS_TXT_ENDPOINT.md`, `docs/execution/PHASE_5_DEFERRED_EXTERNAL_PROFILE.md`

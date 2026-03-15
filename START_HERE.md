# START_HERE

Use this file for a fast technical validation path.

## 5-Minute Proof Path

1. Open [CANONICAL_FACTS_2026-03-14.md](CANONICAL_FACTS_2026-03-14.md) for the current approved public facts.
2. Open [proof/README.md](proof/README.md) to see the public proof layout.
3. Open [proof/verified-counts.md](proof/verified-counts.md) for current rule/playbook counts.
4. Open [content/detection-rules/INDEX.md](content/detection-rules/INDEX.md) to inspect detection coverage and platform layout.
5. Open [content/incident-response/INDEX.md](content/incident-response/INDEX.md) to review the IR catalog.

## Reproduce Locally

Run from repository root:

```powershell
pwsh -NoProfile -File ".\scripts\verify\verify-counts.ps1"
pwsh -NoProfile -File ".\scripts\verify\generate-verified-counts.ps1" -OutFile ".\PROOF_PACK\VERIFIED_COUNTS.md"
python .\scripts\drift_scan.py --refresh
pwsh -NoProfile -File ".\scripts\build-wazuh-bundle.ps1"
```

Expected:

- `proof/verified-counts.md` mirrors the current verified counts for the public proof lane.
- `site/assets/verified-counts.json` updates from verified counts (and `PROOF_PACK/verified_counts.json` updates when `--with-proof-pack` is used for release/proof packaging).
- `dist/wazuh/local_rules.xml` is generated.

## Reviewer Notes

- This repository is evidence-first: claims are backed by reproducible commands.
- `CANONICAL_FACTS_2026-03-14.md` is the human-readable claim contract for public repo and site surfaces.
- `proof/` is the canonical public review lane; raw imports and legacy material are not part of the front-door proof path.
- Sanitization and redaction standards: `PROOF_PACK/REDACTION_RULES.md`, `PROOF_PACK/EVIDENCE_CHECKLIST.md`
- Lab infrastructure context: `content/projects/lab/README.md`


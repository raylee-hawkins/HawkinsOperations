# Verification Scripts

- `verify-counts.ps1` prints current detection/playbook counts.
- `generate-verified-counts.ps1` updates `PROOF_PACK/VERIFIED_COUNTS.md` from live repository counts.
- `hosting-cloudflare-only.js` enforces Cloudflare-only hosting consistency.
  - Notes: allows archived `PROOF_PACK/hosting_transfer_cloudflare/run_*/` evidence logs while blocking new legacy hosting references in active repo files.
- `public-safety-scan.ps1` blocks merge/publish of public-surface token/path/IP leakage patterns.
- `autosoc-publish-contract-scan.ps1` blocks commits that stage runtime AutoSOC output, incident firehose paths, too many files, or oversized files.
- `install-precommit-public-safety.ps1` installs an optional local pre-commit hook that runs both `public-safety-scan.ps1` and `autosoc-publish-contract-scan.ps1`.

Count rules:

- Sigma includes both `*.yml` and `*.yaml` under `detection-rules/sigma/`.
- IR playbooks include only `IR-*.md` under `incident-response/playbooks/`.

Run from repository root:

```powershell
pwsh -NoProfile -File ".\scripts\verify\verify-counts.ps1"
pwsh -NoProfile -File ".\scripts\verify\generate-verified-counts.ps1" -OutFile ".\PROOF_PACK\VERIFIED_COUNTS.md"
node .\scripts\verify\hosting-cloudflare-only.js
pwsh -NoProfile -File ".\scripts\verify\public-safety-scan.ps1"
pwsh -NoProfile -File ".\scripts\verify\autosoc-publish-contract-scan.ps1"
pwsh -NoProfile -File ".\scripts\verify\install-precommit-public-safety.ps1"
node .\scripts\generate-media-manifest.js
```

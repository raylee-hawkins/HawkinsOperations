# Verification Scripts

- `verify-counts.ps1` prints current detection/playbook counts.
- `generate-verified-counts.ps1` updates `PROOF_PACK/VERIFIED_COUNTS.md` from live repository counts.
- `no-netlify.js` enforces Cloudflare-only hosting consistency.
  - Notes: allows archived `PROOF_PACK/hosting_transfer_cloudflare/run_*/` evidence logs while blocking new legacy hosting references in active repo files.

Count rules:

- Sigma includes both `*.yml` and `*.yaml` under `detection-rules/sigma/`.
- IR playbooks include only `IR-*.md` under `incident-response/playbooks/`.

Run from repository root:

```powershell
pwsh -NoProfile -File ".\scripts\verify\verify-counts.ps1"
pwsh -NoProfile -File ".\scripts\verify\generate-verified-counts.ps1" -OutFile ".\PROOF_PACK\VERIFIED_COUNTS.md"
node .\scripts\verify\no-netlify.js
node .\scripts\generate-media-manifest.js
```

# Detection Rules Index

Primary detection content is grouped by platform, with supporting mapping artifacts for implementation contexts.

## Layout

- `content/detection-rules/sigma/` Sigma YAML rules by ATT&CK tactic
- `content/detection-rules/splunk/` SPL query packs
- `content/detection-rules/wazuh/` Wazuh XML modules (`rules/`)
- `content/detection-rules/mappings/` platform and automation mapping artifacts

## Verification

Use repository scripts:

```powershell
pwsh -NoProfile -File ".\scripts\verify\verify-counts.ps1"
pwsh -NoProfile -File ".\scripts\verify\generate-verified-counts.ps1" -OutFile ".\PROOF_PACK\VERIFIED_COUNTS.md"
```

`proof/verified-counts.md` is the public proof mirror for the live verified file counts.

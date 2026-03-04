# Wazuh Detection Rules

- Source rule modules: `content/detection-rules/wazuh/rules/*.xml`
- Bundle script: `scripts/build-wazuh-bundle.ps1` or `scripts/build-wazuh-bundle.sh`
- Generated artifact: `dist/wazuh/local_rules.xml`

Some XML modules contain multiple `<rule id="...">` blocks; use rule-block counts from `PROOF_PACK/VERIFIED_COUNTS.md` for accurate reporting.


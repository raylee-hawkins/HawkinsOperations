# Wazuh Detection Harness (v0)

This harness validates whether expected detections appear in Wazuh after you manually run Atomic tests on endpoints.

It does not execute Atomic tests. It only verifies ingestion/detection and produces evidence artifacts.

## What This Harness Does

- Reads expected detections from `expected_detections.yaml`
- Queries Wazuh Indexer (`wazuh-alerts-4.x-*`) over REST
- Evaluates pass/fail per expected test
- Writes a run folder with:
  - `report.md`
  - `matches.json`
  - `query_debug.json`

## Environment Variables

Set these before running:

- `WAZUH_INDEXER_HOST` (example: `[REDACTED_IP]` or your indexer DNS name)
- `WAZUH_INDEXER_USER`
- `WAZUH_INDEXER_PASS`
- Optional: `WAZUH_TLS_INSECURE=true` for self-signed certs in lab

Example:

```bash
export WAZUH_INDEXER_HOST='[REDACTED_IP]'
export WAZUH_INDEXER_USER='admin'
export WAZUH_INDEXER_PASS='REDACTED'
export WAZUH_TLS_INSECURE='true'
```

## Run a Verification

From this directory:

```bash
./scripts/new_run.sh
```

This creates a folder like:

- `run_MM-DD-YYYY_HHMMSS/`

and exits non-zero if any expected test fails.

## Add New Expected Detections

Edit `expected_detections.yaml` and add entries with:

- `test_name`
- `platform`
- `agent_name`
- `lookback_minutes`
- `expected` block with one or more:
  - `rule_id`
  - `rule_groups`
  - `mitre_ids`
  - `must_contain`

If a rule ID is unknown, keep it empty (`""`) and rely on other conditions until observed.

## Safety Notes

- No active response automation in this harness
- No changes to Wazuh server configuration
- Do not expose Wazuh dashboard publicly while testing
- Keep access internal (for example Tailscale/internal network only)


# AutoSOC Scripts (Steps 2-7)

Location: `C:\RH\OPS\50_System\Scripts\Automation\auto-soc`

## Scripts
- `poll-alerts.py` - ingest alerts from Wazuh Indexer into `Build/Queue/`
- `triage.py` - apply policy/known FP rules and create case directories
- `redact.py` - sanitize case artifacts into `case/redacted/`
- `assemble-pack.py` - generate required report pack files
- `create-pr.py` - copy escalated pack to repo + update `content/incidents.json` + optional PR
- `reconcile-state.py` - reconcile ledger escalations against repo incident folders and `content/incidents.json`
- `coverage-check.py` - verify required machine telemetry coverage from recent processed alerts
- `run-pipeline.py` - orchestrate poll -> triage -> redact -> assemble -> create-pr
- `policy-audit.py` - weekly audit of processed alerts with classification recommendations

## Required Config (Step 1)
Create these files in `C:\RH\OPS\30_Projects\Active\AutoSOC\Build\Config\`:
- `policy.yaml`
- `known_fps.yaml`
- `.env` (from `.env.template`)

Note: `policy.yaml` and `known_fps.yaml` intentionally use JSON-formatted YAML.

## Quick Test
```powershell
python C:\RH\OPS\50_System\Scripts\Automation\auto-soc\run-pipeline.py --sample-alert C:\path\to\sample-alert.json
```

## Production Run
```powershell
python C:\RH\OPS\50_System\Scripts\Automation\auto-soc\run-pipeline.py
```

Open PR mode for escalated cases:
```powershell
python C:\RH\OPS\50_System\Scripts\Automation\auto-soc\run-pipeline.py --open-pr
```

Log retention tuning (default 30 days):
```powershell
python C:\RH\OPS\50_System\Scripts\Automation\auto-soc\run-pipeline.py --log-retention-days 45
```

Strict reconciliation mode (fail run on index drift):
```powershell
python C:\RH\OPS\50_System\Scripts\Automation\auto-soc\run-pipeline.py --reconcile-strict
```

Single-run lock tuning (default 5400s / 90 min):
```powershell
python C:\RH\OPS\50_System\Scripts\Automation\auto-soc\run-pipeline.py --lock-ttl-seconds 5400
```

Note: `run-pipeline.py` now runs unit tests first by default and aborts on failures.
Emergency bypass (not recommended):
```powershell
python C:\RH\OPS\50_System\Scripts\Automation\auto-soc\run-pipeline.py --skip-tests
```

## Poller Resilience and Monitoring
`poll-alerts.py` includes retry/backoff for transient connection failures and fail-fast behavior on `401 Unauthorized`.

```powershell
python C:\RH\OPS\50_System\Scripts\Automation\auto-soc\poll-alerts.py --retries 3 --backoff-seconds 2
```

Status fields emitted every poll run:
- `POLLED=<n>`
- `SAVED=<n>`
- `QUEUE_OVERFLOW_ARCHIVED=<n>`
- `NO_NEW_ALERTS=TRUE|FALSE`
- `SECRET_SOURCE=ENV|PASS_FILE|DOTENV_LEGACY|SAMPLE_ALERT`
- `LAG_OLDEST_SECONDS=<seconds>`
- `LAG_NEWEST_SECONDS=<seconds>`

Recommended secret model:
- Set `WAZUH_INDEXER_PASS` as an environment variable on the runner, or
- Set `WAZUH_INDEXER_PASS_FILE` to a local file path with only the password value.
- Dotenv password is still supported as a legacy fallback and emits `WARN=USING_DOTENV_PASSWORD_LEGACY`.

Queue growth guard (default cap `2000` queue files):
```powershell
python C:\RH\OPS\50_System\Scripts\Automation\auto-soc\poll-alerts.py --max-queue-files 2000
```

## Weekly Policy Audit
```powershell
python C:\RH\OPS\50_System\Scripts\Automation\auto-soc\policy-audit.py --max-files 1000 --min-recommend-count 10
```

Outputs:
- `C:\RH\OPS\30_Projects\Active\AutoSOC\Output\policy_audit_latest.md`
- `C:\RH\OPS\30_Projects\Active\AutoSOC\Output\policy_audit_latest.json`

## Reconciliation Snapshot
```powershell
python C:\RH\OPS\50_System\Scripts\Automation\auto-soc\reconcile-state.py
```

Outputs:
- `C:\RH\OPS\30_Projects\Active\AutoSOC\Output\reconciliation_latest.json`
- `C:\RH\OPS\30_Projects\Active\AutoSOC\Output\reconciliation_latest.md`

## Machine Coverage Snapshot
```powershell
python C:\RH\OPS\50_System\Scripts\Automation\auto-soc\coverage-check.py --window-hours 168
```

Outputs:
- `C:\RH\OPS\30_Projects\Active\AutoSOC\Output\coverage_latest.json`
- `C:\RH\OPS\30_Projects\Active\AutoSOC\Output\coverage_latest.md`

Note: `run-pipeline.py` now executes `coverage-check.py` after reconciliation each cycle.

## Pipeline Runtime Metrics
`run-pipeline.py` now writes runtime timing/throughput snapshots:
- `C:\RH\OPS\30_Projects\Active\AutoSOC\Output\run_metrics_latest.json`
- `C:\RH\OPS\30_Projects\Active\AutoSOC\Output\run_metrics_history.jsonl`

Fields include:
- `run_seconds`
- `steps` (per-step duration map)
- `cases_scanned`
- `cases_processed`

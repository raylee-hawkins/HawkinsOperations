# Canonical Facts

Status date: 2026-03-14
Scope: recruiter-safe public repo and site claims

## Project Identity

- Canonical flagship name: AutoSOC
- Deprecated / do-not-use public alias: TriageLoop
- Canonical case-study path: `/case-study-autosoc`
- Canonical short description: Closed-loop SOC triage pipeline for Wazuh alerts with deterministic disposition logic, reconciliation, redaction, and reviewable escalation artifacts.

## Verified Content Inventory

- Sigma: 103
- Wazuh rule blocks: 28
- Splunk: 8
- IR playbooks: 10
- Total detections: 139

Source of truth:
- `C:\RH\OPS\10_Portfolio\HawkinsOperations\PROOF_PACK\VERIFIED_COUNTS.md`
- `C:\RH\OPS\10_Portfolio\HawkinsOperations\proof\verified-counts.md`

## AutoSOC Public Operations Snapshot

- Snapshot generated UTC: 2026-03-14T15:59:35Z
- Coverage: 8/8 PASS
- Reconciliation: PASS
- Reconciliation mismatch count: 0
- Heartbeat: SUCCESS
- Freshness: PASS
- Case corpus: 28716
- Benign auto-closures: 20942
- Known false-positive auto-closures: 4176
- Published escalation artifacts: 2478
- Pending staged escalations: 43

Source of truth:
- `C:\RH\OPS\30_Projects\Active\AutoSOC\Output\ledger.json`
- `C:\RH\OPS\30_Projects\Active\AutoSOC\Output\reconciliation_latest.json`
- `C:\RH\OPS\50_System\Runs\Reports\AutoSOC_RETROACTIVE_BACKLOG_CLEANUP_LATEST.md`

## Public Positioning

- Target roles: SOC Analyst I/II, junior Detection Engineer, junior Security Automation Engineer
- Required public clearance line: Eligible to obtain clearance; willing to pursue sponsorship.

## Do Not Publish

- TriageLoop as the primary flagship name
- 6/8 coverage language
- 03-04-2026 or 02-26-2026 as the current AutoSOC operations snapshot date
- 105 / 29 / 142 unless the repo content inventory actually changes and verified counts are regenerated
- Claims that conflict with `PROOF_PACK/VERIFIED_COUNTS.md` or `proof/verified-counts.md`

## Manual External Surface

- GitHub repository description / social preview metadata is an external surface and must be updated separately if it still advertises `142 verified detections (105 Sigma, 29 Wazuh, 8 Splunk)`.

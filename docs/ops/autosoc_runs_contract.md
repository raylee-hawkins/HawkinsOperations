# AutoSOC Runs Contract

## Purpose
Define strict boundaries between runtime data, operator-facing outputs, and immutable archive truth.

## Lanes
- Runtime lane: `30_Projects/Active/AutoSOC/Build/` (ephemeral, never truth)
- Operator lane: `30_Projects/Active/AutoSOC/Output/` (small curated surface + `*_LATEST`)
- Archive lane: `50_System/Runs/AutoSOC/YYYY/MM/run_MM-DD-YYYY_HHMMSS/` (append-only truth)

## Non-Negotiables
- Archive runs are immutable and never renamed.
- `LATEST` markers are forbidden inside archive run folders.
- Every archive run must include `Logs/`, `Reports/`, `Diagnostics/`, one `run_manifest_run_*.json`, and one `verify_*.md`.
- Indexes are generated from manifests only (never hand-edited).

## Script Order (Sequential)
1. `build_run_manifest.ps1 -Execute`
2. `build_runs_index.ps1 -Execute`
3. `build_march_truth_index.ps1 -Execute`
4. `validate_runs_contract.ps1 -Execute`

Do not run index/truth generation in parallel with manifest generation unless a manifest barrier exists.

## Repository Boundary
This repository stores automation code and sanitized documentation, not local run exhaust.
Never commit local `Runs` logs/diagnostics dumps or local catalogs with sensitive path disclosure.

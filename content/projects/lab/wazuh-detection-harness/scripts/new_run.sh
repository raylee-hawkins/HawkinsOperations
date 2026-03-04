#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_NAME="run_$(date -u +%m-%d-%Y_%H%M%S)"
RUN_DIR="$ROOT_DIR/$RUN_NAME"

mkdir -p "$RUN_DIR"

set +e
"$ROOT_DIR/scripts/verify_alerts.py" \
  --expected "$ROOT_DIR/expected_detections.yaml" \
  --run-dir "$RUN_DIR"
RC=$?
set -e

if [[ $RC -ne 0 ]]; then
  echo "Verification completed with failures. See: $RUN_DIR/report.md"
  exit $RC
fi

echo "Verification passed. Artifacts: $RUN_DIR"
exit 0

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TS="$(date +"%m-%d-%Y_%H%M%S")"
RUN_DIR="${ROOT_DIR}/run_${TS}"

mkdir -p "${RUN_DIR}"

cat > "${RUN_DIR}/instructions.txt" <<'EOF'
Manual step: Capture a Grafana dashboard screenshot.
Suggested filename: grafana_honeypot_ops.png
Dashboard: "Honeypot Ops"
Time range: Last 24 hours
EOF

if [[ -z "${WAZUH_INDEXER_HOST:-}" || -z "${WAZUH_INDEXER_USER:-}" || -z "${WAZUH_INDEXER_PASS:-}" ]]; then
  echo "Missing required env vars: WAZUH_INDEXER_HOST, WAZUH_INDEXER_USER, WAZUH_INDEXER_PASS" >&2
  exit 2
fi

TLS_FLAG=""
if [[ "${WAZUH_TLS_INSECURE:-false}" == "true" ]]; then
  TLS_FLAG="--insecure"
fi

QUERY='{
  "size": 1000,
  "query": {
    "bool": {
      "filter": [
        { "range": { "@timestamp": { "gte": "now-24h", "lte": "now" } } },
        { "query_string": { "query": "rule.groups:cowrie" } }
      ]
    }
  }
}'

curl -sS ${TLS_FLAG} \
  -u "${WAZUH_INDEXER_USER}:${WAZUH_INDEXER_PASS}" \
  -H "Content-Type: application/json" \
  -X POST "https://${WAZUH_INDEXER_HOST}:9200/wazuh-alerts-4.x-*/_search" \
  -d "${QUERY}" \
  > "${RUN_DIR}/honeypot_events_24h.json"

echo "Run artifacts written to: ${RUN_DIR}"

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

command -v docker >/dev/null 2>&1 || fail "docker is not installed or not in PATH"

if [[ ! -f ".env" ]]; then
  fail ".env not found. Run: cp .env.example .env"
fi

echo "==> docker compose config"
docker compose config >/dev/null || fail "compose render validation failed"

echo "==> docker compose up -d --remove-orphans"
docker compose up -d --remove-orphans || fail "compose up failed"

echo "==> docker compose ps"
docker compose ps || fail "unable to list compose services"

echo "==> health status"
docker ps --format '{{.Names}} {{.Status}}' || fail "unable to inspect container status"

echo "==> endpoint checks"
if [[ -n "${GRAFANA_PORT:-}" ]]; then
  curl -sS -I "http://127.0.0.1:${GRAFANA_PORT}" | head -n 1 || fail "Grafana endpoint check failed on port ${GRAFANA_PORT}"
else
  curl -sS -I "http://127.0.0.1:3000" | head -n 1 || fail "Grafana endpoint check failed on default port 3000"
fi

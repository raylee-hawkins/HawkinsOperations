# honeypot-grafana-wazuh

Minimal, auditable Cowrie + Grafana setup that feeds Wazuh Indexer and produces a recruiter-proof dashboard.

## Quick Start
1. Copy `.env.example` to `.env` and fill in values.
2. Start services:
   - `docker compose up -d`
3. Open Grafana on `http://LAN_BIND_IP:GRAFANA_PORT` and confirm the “Honeypot Ops” dashboard loads.

## Environment Variables
All secrets stay in your `.env` file (not committed).
- `LAN_BIND_IP` (default `[REDACTED_IP]`)
- `COWRIE_SSH_PORT`, `COWRIE_TELNET_PORT`
- `GRAFANA_PORT`, `GRAFANA_ADMIN_USER`, `GRAFANA_ADMIN_PASS`
- `WAZUH_INDEXER_URL`, `WAZUH_INDEXER_HOST`
- `WAZUH_INDEXER_USER`, `WAZUH_INDEXER_PASS`
- `WAZUH_TLS_INSECURE` (`true` or `false`)

## Run Artifacts
Generate a run folder with a 24h JSON export and screenshot instructions:
- `./scripts/new_run.sh`

Artifacts are written to `run_MM-DD-YYYY_HHMMSS/` and include:
- `instructions.txt`
- `honeypot_events_24h.json`

## Verification
1. `cp .env.example .env`
2. `./scripts/verify_stack.sh`

Expected result:
- `docker compose ps` shows `cowrie` and `grafana` in `Up` status.
- Grafana header check returns an HTTP response on localhost (for example, `302 Found` is expected before login).

## Notes
- Cowrie and Grafana bind to `LAN_BIND_IP` only (no public exposure by default).
- No credentials are written to disk by any script in this repo.


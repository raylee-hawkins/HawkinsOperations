# DNS Cutover Records

## Before -> after backfill (documented)
Captured at: `2026-02-14`

| Timestamp (UTC) | Name | Type | Before | After | Proxy | TTL | Operator |
|---|---|---|---|---|---|---|---|
| `2026-02-14T03:24:00Z` | `@` | `A/AAAA` | `legacy provider target reference captured in migration logs` | `[REDACTED_IP]`, `[REDACTED_IP]`, `2606:4700:3035::6815:3429`, `2606:4700:3033::ac43:c310` | Cloudflare edge | n/a | `ops` |

## Resolver checks
Captured output from two resolvers for current production:
- Resolver A: `[REDACTED_IP]`
- Resolver B: `[REDACTED_IP]`

Command used:
- `nslookup hawkinsops.com [REDACTED_IP]`
- `nslookup hawkinsops.com [REDACTED_IP]`

Evidence log:
- `PROOF_PACK/hosting_transfer_cloudflare/run_02-14-2026_031137/evidence/logs/dns_before_after_backfill_02-14-2026.txt`
- `PROOF_PACK/hosting_transfer_cloudflare/run_02-14-2026_031137/evidence/logs/rollback_drill_simulation_02-14-2026.txt`

## Cutover window record
- Before reference timestamp: `2026-02-14T03:24:00Z` (legacy provider target reference captured in evidence log)
- After verification timestamps:
  - `2026-02-14T03:24:00Z` via resolver captures
  - `2026-02-14T03:17:09Z` via production route/404 header validation


# DNS Cutover Records

## Before -> after backfill (documented)
Captured at: `2026-02-14`

| Timestamp (UTC) | Name | Type | Before | After | Proxy | TTL | Operator |
|---|---|---|---|---|---|---|---|
| `2026-02-14T03:24:00Z` | `@` | `A/AAAA` | `legacy provider target reference captured in migration logs` | `104.21.52.41`, `172.67.195.16`, `2606:4700:3035::6815:3429`, `2606:4700:3033::ac43:c310` | Cloudflare edge | n/a | `ops` |

## Resolver checks
Captured output from two resolvers for current production:
- Resolver A: `1.1.1.1`
- Resolver B: `8.8.8.8`

Command used:
- `nslookup hawkinsops.com 1.1.1.1`
- `nslookup hawkinsops.com 8.8.8.8`

Evidence log:
- `PROOF_PACK/hosting_transfer_cloudflare/run_02-14-2026_031137/evidence/logs/dns_before_after_backfill_02-14-2026.txt`
- `PROOF_PACK/hosting_transfer_cloudflare/run_02-14-2026_031137/evidence/logs/rollback_drill_simulation_02-14-2026.txt`

## Cutover window record
- Before reference timestamp: `2026-02-14T03:24:00Z` (legacy provider target reference captured in evidence log)
- After verification timestamps:
  - `2026-02-14T03:24:00Z` via resolver captures
  - `2026-02-14T03:17:09Z` via production route/404 header validation

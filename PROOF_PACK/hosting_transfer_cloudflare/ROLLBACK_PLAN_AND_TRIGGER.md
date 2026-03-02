# Rollback Plan and Trigger

## Trigger conditions
Rollback to previous DNS provider/records if one or more occurs:
- Production cutover causes route failures on required endpoints.
- Required security headers are missing after Cloudflare deployment.
- Cloudflare production deployment for `main` fails and cannot be corrected within 15 minutes.

## Rollback procedure
1. Select last known good commit SHA.
2. Restore previous known-good DNS records/provider targets.
3. Validate routes and headers on restored DNS target.
4. Confirm resolver propagation on two resolvers.
5. Record timeline, owner, and outcome in this file and `DEPLOY_LOG_LINKS.md`.

## Exit criteria for rollback state
- Restored DNS target serves all required routes correctly.
- Resume PDF path works.
- Required headers and redirects are confirmed.

## Roll-forward criteria
- Cloudflare Pages deploy is green for a fixed commit.
- Full stress test passes.
- DNS points back to Cloudflare with propagation confirmed.

## Drill receipt (2026-02-14)
- Drill type: controlled simulation (no live DNS mutation during active production window)
- Trigger simulated: route failure + header regression scenario
- Resolver pre-check and post-check captured for `[REDACTED_IP]` and `[REDACTED_IP]`
- Planned rollback steps documented and timed in evidence log
- Evidence: `PROOF_PACK/hosting_transfer_cloudflare/run_02-14-2026_031137/evidence/logs/rollback_drill_simulation_02-14-2026.txt`


# Repo Audit

Date: 2026-03-14
Canonical source: `C:\RH\OPS\10_Portfolio\HawkinsOperations\CANONICAL_FACTS_2026-03-14.md`

## Critical

- GitHub repo description is externally advertising `142 / 105 / 29`, while the repository file inventory and proof lane still verify `139 / 103 / 28`. This is credibility-breaking because the repo body and proof files disagree with the platform metadata.
- Public claims are split across two truth lanes:
  - verified content counts from `PROOF_PACK/VERIFIED_COUNTS.md`
  - AutoSOC operations state from `content/metrics/autosoc_latest.json`
  This is why counts and operational status drift independently.
- Current repo root does not contain a canonical contract file, so public numbers are being propagated from generators without a human-readable decision record.

## Major

- `README.md`, `START_HERE.md`, and several case-study pages still point to older dated runbooks and older operational framing even after the current `2026-03-14` AutoSOC recovery and cleanup state.
- The repo contains parallel proof lanes:
  - `PROOF_PACK/`
  - `proof/`
  They are partially documented, but the distinction is still weak enough to create reviewer confusion.
- Multiple public docs repeat AutoSOC status claims in longform execution notes. They are useful as deep proof, but they also increase claim-surface area and future drift risk.

## Minor

- Root-level dated discovery logs are still visible and add noise to the reviewer surface.
- Internal workflow docs such as `CLAUDE.md` and `AGENTS.md` contain public-positioning rules that are valid operationally but not useful for most reviewers.

## Recommended Structure

- Keep the public front door narrow:
  - `README.md`
  - `START_HERE.md`
  - `proof/`
  - `site/`
  - `CANONICAL_FACTS_2026-03-14.md`
- Treat `PROOF_PACK/` as the generator / internal proof source and `proof/` as the reviewer-facing mirror.
- Archive or de-emphasize one-off dated discovery notes after the public claims are normalized.

## Immediate Fix Order

1. Add canonical facts contract.
2. Normalize README + homepage + proof page against that contract.
3. Refresh generated site data from canonical proof and ops metrics.
4. Update external GitHub repo description manually to match repo truth.

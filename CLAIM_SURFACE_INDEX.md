# Claim Surface Index

Date: 2026-03-14
Canonical source: `C:\RH\OPS\10_Portfolio\HawkinsOperations\CANONICAL_FACTS_2026-03-14.md`

## Critical Conflicts

| File | Category | Matched claim | Conflict |
|---|---|---|---|
| `site/index.html` | status | `6/8` coverage fallback | Conflicts with canonical `8/8 PASS` |
| `site/index.html` | date | `02-26-2026` verified date fallback | Conflicts with canonical `2026-03-14` AutoSOC ops snapshot |
| External GitHub repo description | metric | `142 verified detections (105 Sigma, 29 Wazuh, 8 Splunk)` | Conflicts with canonical repo inventory `139 / 103 / 28 / 8` |

## High-Signal Public Claim Files

| File | Category | Current role |
|---|---|---|
| `README.md` | branding, metrics, status | Main repo narrative |
| `START_HERE.md` | status, reviewer flow | Front-door validation path |
| `proof/verified-counts.md` | metrics | Canonical public count mirror |
| `site/index.html` | branding, metrics, status, date, positioning | Homepage |
| `site/proof.html` | branding, metrics | Proof lane |
| `site/detections.html` | branding, metrics | Detection library lane |
| `site/resume-content.md` | positioning | Resume source |
| `content/metrics/autosoc_latest.json` | status | AutoSOC public ops payload |
| `PROOF_PACK/VERIFIED_COUNTS.md` | metrics | Count generation source |
| `PROOF_PACK/verified_counts.json` | metrics | Site-count generation source |

## Naming Surface

- `AutoSOC` appears across the repo-backed case-study, proof, and README surfaces and is the practical canonical public name in this codebase.
- `TriageLoop` should be treated as deprecated drift until a full rename is executed across repo, site, routes, and proof artifacts.

## Positioning Surface

- Repo-local policy currently requires the clearance line verbatim:
  - `Eligible to obtain clearance; willing to pursue sponsorship.`
- Because that is a repo-level instruction, it is not treated as a contradiction in this patch set.

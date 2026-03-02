# HawkinsOperations

> Evidence-first SOC portfolio: detection engineering + incident response + reproducible proof artifacts.

[![Verification](https://img.shields.io/github/actions/workflow/status/raylee-hawkins/HawkinsOperations/verify.yml?branch=main&label=verify)](https://github.com/raylee-hawkins/HawkinsOperations/actions/workflows/verify.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Release update (03-02-2026)
- AutoSOC production hardening completed for pipeline resilience and operator visibility:
  - poll retry/backoff handling for transient indexer connectivity failures
  - explicit no-new-alert telemetry for idle cycles
  - queue growth guard with overflow archive into processed lane
  - pipeline log retention control and per-run log metadata
- End-to-end workflow validated through live alert processing:
  - ingest -> triage -> redact -> pack -> repo-staged incident output
  - scheduler runs stable with `Last Result: 0` during healthy cycles
- Homepage visual refresh:
  - front-and-center hero asset upgraded to an AutoSOC system map
  - OG/Twitter share image aligned to the new map for consistent external previews
- Operations documentation added:
  - `docs/execution/AUTOSOC_OPERATIONS_RUNBOOK_03-02-2026.md`

---

## Portfolio site and quick CTAs
- Site: [hawkinsops.com](https://hawkinsops.com)
- Proof Pack: [`PROOF_PACK/PROOF_INDEX.md`](PROOF_PACK/PROOF_INDEX.md)
- Clone + Verify: [`scripts/verify/verify-counts.ps1`](scripts/verify/verify-counts.ps1)
- Projects: [`projects/`](projects/)

---

## What this repo is (in one breath)
A security operations portfolio repository focused on verifiable detection content (Sigma, Splunk, Wazuh), structured IR playbooks, and reproducible artifacts you can validate locally or via CI.
If a claim cannot be verified, it does not belong here.

---

## Choose your path (pick one)

| You are... | Start here | What you can validate fast |
|---|---|---|
| Recruiter / Hiring Manager | [`START_HERE.md`](START_HERE.md) | Proof lane + sample artifacts in minutes |
| Technical Reviewer | [`PROOF_PACK/VERIFIED_COUNTS.md`](PROOF_PACK/VERIFIED_COUNTS.md) | Live counts + exact locations |
| Detection Engineer | [`detection-rules/INDEX.md`](detection-rules/INDEX.md) | Rule structure across Sigma/Splunk/Wazuh |
| Incident Responder | [`incident-response/INDEX.md`](incident-response/INDEX.md) | Playbook catalog + consistent framework |
| Portfolio Reviewer | [`PROOF_PACK/PROOF_INDEX.md`](PROOF_PACK/PROOF_INDEX.md) | Curated reviewer lane |
| SOC integration direction | [`projects/lab/PP_SOC_Integration/README.md`](projects/lab/PP_SOC_Integration/README.md) | Rules verified, now running in production-sim workflow |

---

## Current verified inventory (generated from repo content)
Source of truth: [`PROOF_PACK/VERIFIED_COUNTS.md`](PROOF_PACK/VERIFIED_COUNTS.md)

### Detection rules
| Platform | Count | Location |
|---|---:|---|
| Sigma (YAML) | 103 rules | `detection-rules/sigma/` |
| Splunk (SPL) | 8 queries | `detection-rules/splunk/` |
| Wazuh (XML) | 24 files / 28 rule blocks | `detection-rules/wazuh/rules/` |

### Incident response
| Type | Count | Location |
|---|---:|---|
| IR Playbooks (`IR-*.md`) | 10 playbooks | `incident-response/playbooks/` |

Why two Wazuh counts: files and rule blocks are different when some XML modules contain multiple `<rule id=...>` blocks.

---

## 90-second proof
1. Open [`START_HERE.md`](START_HERE.md) for the 5-minute validation path.
2. Check [`PROOF_PACK/VERIFIED_COUNTS.md`](PROOF_PACK/VERIFIED_COUNTS.md) for current counts.
3. Inspect 2-3 artifacts in `PROOF_PACK/SAMPLES/` via [`PROOF_PACK/PROOF_INDEX.md`](PROOF_PACK/PROOF_INDEX.md).

---

## Quick verification (local, reproducible)
Run from repo root (PowerShell):

```powershell
pwsh -NoProfile -File ".\scripts\verify\verify-counts.ps1"
pwsh -NoProfile -File ".\scripts\verify\generate-verified-counts.ps1" -OutFile ".\PROOF_PACK\VERIFIED_COUNTS.md"
python .\scripts\drift_scan.py --refresh
pwsh -NoProfile -File ".\scripts\build-wazuh-bundle.ps1"
node .\scripts\build-site-includes.js
node .\scripts\generate-site-data.js
node .\scripts\generate-site-content.js
node .\scripts\generate-media-manifest.js
node .\scripts\verify\hosting-cloudflare-only.js
# Release/proof-pack JSON mirror (optional in normal UI commits)
node .\scripts\generate-site-data.js --with-proof-pack
python -m http.server --directory site 8000
```

Expected artifacts:
- `PROOF_PACK/VERIFIED_COUNTS.md`
- `site/assets/verified-counts.json`
- `dist/wazuh/local_rules.xml`

---

## Repo Map

| Area | What it contains | Why it exists |
|---|---|---|
| `lab/` | live infra docs, VM notes, lab runbooks | operational context for the home lab |
| `PROOF_PACK/` | curated artifacts + evidence lane | reviewable proof path for interviews |
| `detection-rules/` | Sigma/Splunk/Wazuh + mappings | multi-platform detection engineering |
| `incident-response/` | playbooks + templates + index | consistent IR execution model |
| `threat-hunting/` | hunt matrices + hypothesis notes | structured hunting practice |
| `tools/` | helper utilities and migration tooling | repeatable maintenance and packaging support |
| `scripts/` | verification + bundle builders | reproducibility + deployable artifacts |
| `docs/` | execution notes and supporting documentation | implementation decisions and reviewer context |
| `site/` | static portfolio site source | published recruiter-facing web content |
| `content/` | structured site content (JSON) | source-of-truth for content-driven listings |
| `components/` | design-system contracts | UI/section architecture conventions |
| `projects/` | reference/archive project subtrees | non-canonical, time-boxed, or legacy workstreams |

---

## How content flows (repo -> proof -> deploy)

```text
detection-rules/*                incident-response/*
      |                                 |
      |-- verify-counts.ps1             |-- IR-*.md (counted)
      |
      |-- generate-verified-counts.ps1  -> PROOF_PACK/VERIFIED_COUNTS.md
      |
      '-- build-wazuh-bundle.ps1        -> dist/wazuh/local_rules.xml

content/projects.json + content/detections.json
      |-- generate-site-content.js      -> site/assets/data/*.json
      '-- portfolio-data.js             -> rendered listings + filters

PROOF_PACK/VERIFIED_COUNTS.md
      |-- generate-site-data.js         -> site/assets/verified-counts.json
      '-- generate-site-data.js --with-proof-pack -> PROOF_PACK/verified_counts.json (release mirror)
      '-- drift_scan.py                 -> fail on markdown/json/site drift
```

This maps to the documented Wazuh deployment flow: modules -> bundle -> `/var/ossec/etc/rules/local_rules.xml` -> restart manager.

---

## Security and sanitization
- Security policy: [`SECURITY.md`](SECURITY.md)
- Sanitization checklist: [`PROOF_PACK/EVIDENCE_CHECKLIST.md`](PROOF_PACK/EVIDENCE_CHECKLIST.md)

Repo standard: no real credentials/tokens, no internal IPs, and no accidental identity leakage. Use `[REDACTED_INTERNAL]` for sensitive internal details.

---

## Deeper docs
- Architecture + coverage: `PROOF_PACK/ARCHITECTURE.md`
- Contribution workflow: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Proof lane index: [`PROOF_PACK/PROOF_INDEX.md`](PROOF_PACK/PROOF_INDEX.md)

---

## Site Architecture (Static + Content-driven)

- Runtime remains static HTML/CSS/JS under `site/` (no framework lock-in).
- Design tokens and fluid layout primitives: `site/assets/design-system.css`.
- Content-driven pages:
  - `site/projects.html` reads `site/assets/data/projects.json`.
  - `site/security.html` reads `site/assets/data/detections.json`.
- Source content files:
  - `content/projects.json`
  - `content/detections.json`
- Build sync scripts:
  - `scripts/generate-site-data.js` (verified counts JSON generation + detections count sync)
  - `scripts/drift_scan.py` (drift gate: markdown -> json -> site claim surfaces)
  - `scripts/generate-site-content.js` (content JSON publish step)
  - `scripts/generate-media-manifest.js` (media manifest + triage report + safe media copy)

Cloudflare Pages production build:
- `node scripts/generate-site-data.js && node scripts/generate-site-content.js && node scripts/generate-media-manifest.js && node scripts/verify/hosting-cloudflare-only.js`
- Output directory: `site`

---

## License
MIT. See [LICENSE](LICENSE).

# HawkinsOperations

> Evidence-first SOC portfolio: live automated detection pipeline, multi-platform detection library, and reproducible proof artifacts.

[![Verification](https://img.shields.io/github/actions/workflow/status/raylee-hawkins/HawkinsOperations/verify.yml?branch=main&label=verify)](https://github.com/raylee-hawkins/HawkinsOperations/actions/workflows/verify.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What this repo is

HawkinsOps is the umbrella portfolio and publishing surface for SignalFoundry. SignalFoundry is an AI-augmented security triage and evidence pipeline. AutoSOC is the current operating engine behind that workflow. Public inventory counts and current publish-safe operations metrics are intentionally kept in the proof lane and live data files instead of being hardcoded into this README. If a claim cannot be reproduced, it does not belong here.

---

## Latest update (03-14-2026)

SignalFoundry public state is published through the proof lane and live metrics payload:

- Current public proof entrypoint: [`proof/README.md`](proof/README.md)
- Current verified inventory snapshot: [`proof/verified-counts.md`](proof/verified-counts.md)
- Current public ops source: [`content/metrics/autosoc_latest.json`](content/metrics/autosoc_latest.json)
- Current claim contract: [`CANONICAL_FACTS_2026-03-14.md`](CANONICAL_FACTS_2026-03-14.md)

---

## Choose your path

| You are… | Start here | What you validate |
|---|---|---|
| Recruiter / Hiring Manager | [`START_HERE.md`](START_HERE.md) | Proof lane + sample artifacts in under 5 minutes |
| Technical Reviewer | [`proof/verified-counts.md`](proof/verified-counts.md) | Script-generated counts, exact locations, reproducible |
| Detection Engineer | [`content/detection-rules/INDEX.md`](content/detection-rules/INDEX.md) | Current public detection inventory and platform layout |
| Incident Responder | [`content/incident-response/INDEX.md`](content/incident-response/INDEX.md) | Current IR catalog and execution format |
| SignalFoundry Reviewer | [`CANONICAL_FACTS_2026-03-14.md`](CANONICAL_FACTS_2026-03-14.md) | Current public counts, current system state, and banned stale claims |
| Portfolio Reviewer | [`proof/README.md`](proof/README.md) | Canonical public proof lane |

---

## Current verified inventory

Public proof mirror: [`proof/verified-counts.md`](proof/verified-counts.md) — generated from the verified inventory workflow.

Use the proof lane for current counts instead of this README. The proof snapshot and generated site data remain the canonical recruiter-safe inventory surfaces.

Proof-pack technique map: [`PROOF_PACK/technique_map.csv`](PROOF_PACK/technique_map.csv) — MITRE ATT&CK technique map generated from the repo rule sources via `scripts\generate-technique-map.py --enrich`.

---

## 90-second proof

1. Open [`START_HERE.md`](START_HERE.md) for the 5-minute validation path.
2. Check [`proof/verified-counts.md`](proof/verified-counts.md) for current counts.
3. Inspect [`proof/README.md`](proof/README.md) for the canonical public proof lane.

---

## Quick verification (local, reproducible)

Run from repo root (PowerShell):

```powershell
pwsh -NoProfile -File ".\scripts\verify\verify-counts.ps1"
pwsh -NoProfile -File ".\scripts\verify\generate-verified-counts.ps1" -OutFile ".\PROOF_PACK\VERIFIED_COUNTS.md"
python .\scripts\drift_scan.py --refresh
pwsh -NoProfile -File ".\scripts\build-wazuh-bundle.ps1"
node .\scripts\generate-site-data.js
node .\scripts\generate-site-content.js
node .\scripts\generate-media-manifest.js
node .\scripts\verify\hosting-cloudflare-only.js
```

Expected artifacts:
- `PROOF_PACK/VERIFIED_COUNTS.md`
- `site/assets/data/verified-counts.json`
- `dist/wazuh/local_rules.xml`

---

## Repo map

| Area | What it contains | Why it exists |
|---|---|---|
| `content/detection-rules/` | Sigma, Splunk, and Wazuh detection content organized by MITRE tactic | Multi-platform detection library, triage-ready |
| `content/incident-response/` | IR playbooks, templates, and AutoSOC-generated incident packs | Consistent execution model + live pipeline output |
| `proof/` | Public proof lane for verified counts and generated artifacts | Canonical reviewer-facing proof path |
| `docs/execution/` | AutoSOC operations runbook, rootcheck closeout, lab change control | Operational context for the live pipeline |
| `docs/` | Lab architecture, Wazuh change control, hosting docs | Implementation decisions and reviewer context |
| `content/projects/lab/` | PP_SOC_Integration, detection harness, honeypot stack | Lab proof artifacts — published evidence of live operations |
| `scripts/` | Verification pipeline, bundle builders, site data generators | Reproducibility gate — CI runs these on every push |
| `site/` | Static portfolio site source (Cloudflare Pages → hawkinsops.com) | Recruiter-facing published content |
| `content/` | Structured site content (JSON) | Source of truth for content-driven site listings |
| `content/threat-hunting/` | Hunt matrices and hypothesis notes | Structured hunting practice documentation |
| `content/lab/` | Proxmox/Wazuh infrastructure docs, VM runbooks | Live lab context for the detection environment |
| `content/wazuh/` | Deployment pack: decoders, lists, suppression, active-response | What actually gets pushed to the Wazuh manager |
| `tools/` | Python utilities for proof pack generation and Wazuh data | Repeatable maintenance and packaging support |

---

## How content flows

```text
Wazuh Manager (live alerts)
      |
      |-- AutoSOC pipeline (poll → triage → redact → pack)
      |       |
      |       '-- content/incident-response/incidents/YYYY/  (repo-staged packs)
      |
content/detection-rules/*                content/incident-response/playbooks/*
      |                                 |
      |-- verify-counts.ps1 ────────────'
      |-- generate-verified-counts.ps1  ──>  PROOF_PACK/VERIFIED_COUNTS.md
      |-- build-wazuh-bundle.ps1        ──>  dist/wazuh/local_rules.xml
      |
content/projects.json + content/detections.json
      |-- generate-site-content.js  ──>  site/assets/data/*.json
      |-- portfolio-data.js         ──>  rendered listings + filters
      |
proof/verified-counts.md
      |-- generate-site-data.js     ──>  site/assets/data/verified-counts.json
      '-- drift_scan.py             ──>  fail on markdown/json/site count drift
```

---

## Security and sanitization

- Security policy: [`SECURITY.md`](SECURITY.md)
- Sanitization checklist: keep using `PROOF_PACK/EVIDENCE_CHECKLIST.md` internally until the public proof lane is fully migrated.
- Redaction rules: keep using `PROOF_PACK/REDACTION_RULES.md` internally until the public proof lane is fully migrated.

No real credentials, internal IPs, or identity leakage in committed files. Use `[REDACTED_INTERNAL]` for sensitive internal details.

---

## Site architecture

- Static HTML/CSS/JS under `site/` — no framework, no build step, no runtime dependencies.
- Design tokens and fluid layout: `site/assets/design-system.css`
- Content-driven pages pull from `site/assets/data/` (generated by `scripts/generate-site-content.js`)
- Cloudflare Pages: publish directory `site/`, branch `main`

---

## Deeper docs

- Public proof lane: [`proof/README.md`](proof/README.md)
- Contribution workflow: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Proof lane index: [`proof/README.md`](proof/README.md)
- AutoSOC pipeline: [`docs/execution/AUTOSOC_OPERATIONS_RUNBOOK_03-02-2026.md`](docs/execution/AUTOSOC_OPERATIONS_RUNBOOK_03-02-2026.md)

---

## License

MIT. See [LICENSE](LICENSE).

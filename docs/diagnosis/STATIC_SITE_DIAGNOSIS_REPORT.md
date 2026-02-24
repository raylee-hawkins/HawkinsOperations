# Static Site Diagnosis Report

Generated: `2026-02-24T13:29:53.237Z`
Root: `C:\RH\OPS\PUBLISH\GITHUB\repos\HawkinsOperations`
Site directory: `site`

## Scope
- HTML asset path consistency audit across all `site/*.html` pages
- Trailing slash and canonicalization hazard analysis
- Static-host URL resolution simulation for local assets
- JS fetch/XHR URL audit
- Generated data artifact and hosting build expectations
- Rename regression checks (`raylee-hawkins`, `legacy-hosting`, raw GitHub URLs)
- DOM mount contract checks (JS selectors vs page IDs)

## Sample Run Output
```text
HTML files scanned: 17
JS files scanned: 8
Fetch calls found: 0
Trailing-slash hazards: 0
Missing local asset resolutions: 0
Legacy owner hits: 143
Legacy hosting hits: 0
```

## A) Asset Path Consistency Audit (HTML)
Site-wide local asset convention inferred: `absolute_root`
Homepage absolute + inner-page relative pattern detected: `false`

| Page | Absolute Local | Relative Local | External | Mixed | Canonical |
| --- | --- | --- | --- | --- | --- |
| `site/404.html` | 3 | 0 | 1 | no | `https://hawkinsops.com/404` |
| `site/blog-python2-to-python3.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/blog-python2-to-python3` |
| `site/case-study-cve-patch.html` | 8 | 0 | 4 | no | `https://hawkinsops.com/case-study-cve-patch` |
| `site/case-study-detection-harness.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/case-study-detection-harness` |
| `site/case-study-honeypot.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/case-study-honeypot` |
| `site/case-study-ir-howe01.html` | 7 | 0 | 4 | no | `https://hawkinsops.com/case-study-ir-howe01` |
| `site/case-study-ir-playbooks.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/case-study-ir-playbooks` |
| `site/case-study-sigma-library.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/case-study-sigma-library` |
| `site/case-study-soc-integration.html` | 6 | 0 | 4 | no | `https://hawkinsops.com/case-study-soc-integration` |
| `site/case-study.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/case-study` |
| `site/index.html` | 6 | 0 | 4 | no | `https://hawkinsops.com/` |
| `site/lab.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/lab` |
| `site/projects.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/projects` |
| `site/proof.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/proof` |
| `site/resume.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/resume` |
| `site/security.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/security` |
| `site/triage.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/triage` |

## B) Trailing Slash + Canonicalization Hazards
Canonicalization intent inferred: `pretty_no_slash`
- `site/_redirects` present: `true`
- `site/_headers` present: `true`

Trailing-slash hazard examples:
- No relative-asset slash hazards detected.

## C) Local Static-Serve Fetch/Path Simulation
- `python -m http.server --directory site 8000`
- `Open http://127.0.0.1:8000/ in a browser.`
- `Test both /security and /security/ to validate relative-path behavior.`
- Missing local asset resolutions: 0

## D) JS Runtime Fetch Audit
- Inconsistent local fetch strategy: `false`
- Files with fetch but no timeout primitives: 0
| Fetch Site | URL | Class | Loaded By | Local Check |
| --- | --- | --- | --- | --- |
Suspicious fetch URLs:
- None

## E) Data Artifact Presence + Generation Expectations
- `site/assets/verified-counts.json` -> present
- `site/assets/data/detections.json` -> present
- `site/assets/data/media.json` -> present
- `site/assets/data/projects.json` -> present
Generation script evidence:
- `scripts/diagnose-site.js:16` "site/assets/verified-counts.json",
- `scripts/diagnose-site.js:17` "site/assets/data/detections.json",
- `scripts/diagnose-site.js:18` "site/assets/data/media.json",
- `scripts/diagnose-site.js:19` "site/assets/data/projects.json"
- `scripts/diagnose-site.js:586` "Check Cloudflare build logs for generation script execution and verify deployed files under /assets/data and /assets/verified-counts.json.",
- `scripts/generate-site-data.js:9` const siteOutPath = path.join(root, "site", "assets", "verified-counts.json");
- `scripts/smoke-production.js:9` `${baseUrl}/assets/data/detections.json`,
- `scripts/smoke-production.js:10` `${baseUrl}/assets/data/media.json`,
- `scripts/smoke-production.js:11` `${baseUrl}/assets/verified-counts.json`
- `scripts/smoke-production.js:15` `${baseUrl}/assets/data/detections.json`,
- `scripts/smoke-production.js:16` `${baseUrl}/assets/data/media.json`,
- `scripts/smoke-production.js:17` `${baseUrl}/assets/verified-counts.json`
- `scripts/smoke-production.ps1:106` "$BaseUrl/assets/data/detections.json",
- `scripts/smoke-production.ps1:107` "$BaseUrl/assets/data/media.json",
- `scripts/smoke-production.ps1:108` "$BaseUrl/assets/verified-counts.json"
- `scripts/smoke-production.ps1:122` "$BaseUrl/assets/data/detections.json",
- `scripts/smoke-production.ps1:123` "$BaseUrl/assets/data/media.json",
- `scripts/smoke-production.ps1:124` "$BaseUrl/assets/verified-counts.json"
Cloudflare output evidence:
- `README.md:82` - `site/assets/verified-counts.json`
- `README.md:99` \| `site/` \| static portfolio site source \| published recruiter-facing web content \|
- `README.md:118` \|-- generate-site-content.js      -> site/assets/data/*.json
- `README.md:122` \|-- generate-site-data.js         -> PROOF_PACK/verified_counts.json + site/assets/verified-counts.json
- `README.md:147` - Runtime remains static HTML/CSS/JS under `site/` (no framework lock-in).
- `README.md:148` - Design tokens and fluid layout primitives: `site/assets/design-system.css`.
- `README.md:150` - `site/projects.html` reads `site/assets/data/projects.json`.
- `README.md:151` - `site/security.html` reads `site/assets/data/detections.json`.
- `README.md:161` Cloudflare Pages production build:
- `START_HERE.md:27` - `PROOF_PACK/verified_counts.json` and `site/assets/verified-counts.json` stay in sync with verified counts.
- `site/README_DEPLOY.md:15` - Primary production hosting: **Cloudflare Pages**
- `site/README_DEPLOY.md:16` - Publish directory: `site/`
- `docs/hosting/CLOUDFLARE_PAGES.md:1` # Cloudflare Pages Production Settings
- `docs/hosting/CLOUDFLARE_PAGES.md:3` This repository is a static site deployment from `site/`.
- `docs/hosting/CLOUDFLARE_PAGES.md:7` - Why: pages are static HTML/CSS/JS in `site/`, and data artifacts are generated by Node scripts before publish.
- `docs/hosting/CLOUDFLARE_PAGES.md:9` ## Exact Cloudflare Pages UI settings
- `docs/hosting/CLOUDFLARE_PAGES.md:14` - Build output directory: `site`
- `docs/execution/HOSTING_TRANSFER_PROOF_PACK.md:4` Docs-only execution checklist for Cloudflare Pages hosting validation.
- `docs/execution/HOSTING_TRANSFER_PROOF_PACK.md:7` - Cloudflare Pages = production primary
- `docs/execution/HOSTING_TRANSFER_PROOF_PACK.md:15` - build command, publish directory (`site/`), branch mapping, environment notes
- `docs/execution/HOSTING_TRANSFER_PROOF_PACK.md:33` - [ ] Cloudflare Pages production deploy screenshot/log link.
- `docs/execution/HOSTING_TRANSFER_PROOF_PACK.md:34` - [ ] Cloudflare Pages preview deploy screenshot/log link.

## F) Old Identifier / Rename Regression Checks
Current owner baseline: `raylee-hawkins`
Legacy owners detected: `alessandroz`, `gentilkiwi`, `sigmahq`, `swiftonsecurity`, `your-username`

raylee-hawkins/old owner hits:
- `.github/ISSUE_TEMPLATE/config.yml:4` [raylee-hawkins] url: https://github.com/raylee-hawkins/HawkinsOperations/blob/main/docs/VERIFY_COMMANDS_POWERSHELL.md
- `.github/ISSUE_TEMPLATE/config.yml:7` [raylee-hawkins] url: https://github.com/raylee-hawkins/HawkinsOperations/blob/main/SECURITY.md
- `CONTRIBUTING.md:80` [raylee-hawkins] git remote add upstream https://github.com/raylee-hawkins/HawkinsOperations.git
- `PROOF_PACK/features/resume-ats-txt-endpoint/run_02-14-2026_000051/evidence/logs/local_headers_resume_html_02-14-2026.txt:94` [raylee-hawkins] <a href="https://github.com/raylee-hawkins" target="_blank" rel="noreferrer">GitHub</a> \|
- `PROOF_PACK/features/resume-ats-txt-endpoint/run_02-14-2026_000051/evidence/logs/local_headers_resume_html_02-14-2026.txt:96` [raylee-hawkins] <a href="https://linkedin.com/in/raylee-hawkins" target="_blank" rel="noreferrer">LinkedIn</a>
- `PROOF_PACK/features/resume-ats-txt-endpoint/run_02-14-2026_000051/evidence/logs/local_headers_resume_html_02-14-2026.txt:173` [raylee-hawkins] <a href="https://github.com/raylee-hawkins/HawkinsOperations" target="_blank" rel="noreferrer">GitHub</a>
- `PROOF_PACK/features/resume-ats-txt-endpoint/run_02-14-2026_000051/evidence/logs/local_headers_resume_html_02-14-2026.txt:174` [raylee-hawkins] <a href="https://linkedin.com/in/raylee-hawkins" target="_blank" rel="noreferrer">LinkedIn</a>
- `PROOF_PACK/features/resume-ats-txt-endpoint/run_02-14-2026_000051/evidence/logs/local_server_output_02-14-2026.txt:13` [raylee-hawkins] GitHub: https://github.com/raylee-hawkins
- `PROOF_PACK/features/resume-ats-txt-endpoint/run_02-14-2026_000051/evidence/logs/local_server_output_02-14-2026.txt:15` [raylee-hawkins] LinkedIn: https://linkedin.com/in/raylee-hawkins
- `README.md:5` [raylee-hawkins] [![Verification](https://img.shields.io/github/actions/workflow/status/raylee-hawkins/HawkinsOperations/verify.yml?branch=main&label=verify)](https://github.com/raylee-hawkins/HawkinsOperations/actions/workflows/verify.yml)
- `content/detections.json:13` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/detection-rules/sigma"
- `content/detections.json:17` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/PROOF_PACK/VERIFIED_COUNTS.md"
- `content/detections.json:31` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/detection-rules/wazuh/rules"
- `content/detections.json:35` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/scripts/build-wazuh-bundle.ps1"
- `content/detections.json:49` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/detection-rules/splunk"
- `content/detections.json:53` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/detection-rules/mappings/mitre_coverage_matrix.md"
- `content/detections.json:67` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/incident-response/playbooks"
- `content/detections.json:71` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/incident-response/checklists/IR-004-to-030-Quick-Reference.md"
- `content/projects.json:10` [raylee-hawkins] "repo_url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/detection-rules",
- `content/projects.json:15` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/PROOF_PACK/VERIFIED_COUNTS.md"
- `content/projects.json:19` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/detection-rules/wazuh/rules"
- `content/projects.json:30` [raylee-hawkins] "repo_url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects/migration-rh",
- `content/projects.json:35` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/projects/migration-rh/README.md"
- `content/projects.json:39` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects/migration-rh/PROOF_PACK"
- `content/projects.json:50` [raylee-hawkins] "repo_url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/site/triage.html",
- `content/projects.json:59` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/incident-response/incidents"
- `content/projects.json:70` [raylee-hawkins] "repo_url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/incident-response/playbooks",
- `content/projects.json:75` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/incident-response/playbooks"
- `content/projects.json:79` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/incident-response/INDEX.md"
- `content/projects.json:90` [raylee-hawkins] "repo_url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects/lab/wazuh-detection-harness",
- `content/projects.json:95` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/projects/lab/wazuh-detection-harness/README.md"
- `content/projects.json:99` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/projects/lab/wazuh-detection-harness/runs/run_02-19-2026_034113/report.md"
- `content/projects.json:110` [raylee-hawkins] "repo_url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects/lab/honeypot-grafana-wazuh",
- `content/projects.json:115` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/projects/lab/honeypot-grafana-wazuh/README.md"
- `content/projects.json:119` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/projects/lab/honeypot-grafana-wazuh/docker-compose.yml"
- `projects/migration-rh/PROOF_PACK/PROOF_INDEX.md:7` [raylee-hawkins] - Standalone release receipt: [`v0.9.0`](https://github.com/raylee-hawkins/RH_MIGRATION_2026_V2/releases/tag/v0.9.0)
- `projects/migration-rh/PROOF_PACK/PROOF_INDEX.md:8` [raylee-hawkins] - Standalone source repository: [`raylee-hawkins/RH_MIGRATION_2026_V2`](https://github.com/raylee-hawkins/RH_MIGRATION_2026_V2)
- `projects/migration-rh/PROOF_PACK/VERIFICATION.md:19` [raylee-hawkins] - https://github.com/raylee-hawkins/RH_MIGRATION_2026_V2/releases/tag/v0.9.0
- `projects/migration-rh/README.md:20` [raylee-hawkins] - Repo: `raylee-hawkins/RH_MIGRATION_2026_V2`
- `projects/migration-rh/README.md:21` [raylee-hawkins] - Release: [`v0.9.0` — Phase 08 complete (100% core phases)](https://github.com/raylee-hawkins/RH_MIGRATION_2026_V2/releases/tag/v0.9.0)
- `projects/migration-rh/SRC/reference/imports/README.md:16` [raylee-hawkins] **Source:** raylee-hawkins/RH_MIGRATION_2026_V2 (private, active project)
- `projects/repo-history/CONSOLIDATION_MAP.md:5` [raylee-hawkins] **PR:** https://github.com/raylee-hawkins/HawkinsOperations/pull/2
- `projects/repo-history/CONSOLIDATION_MAP.md:22` [raylee-hawkins] - **URL:** https://github.com/raylee-hawkins/hawkinsops-framework
- `projects/repo-history/CONSOLIDATION_MAP.md:29` [raylee-hawkins] - **URL:** https://github.com/raylee-hawkins/hawkins_ops
- `projects/repo-history/CONSOLIDATION_MAP.md:36` [raylee-hawkins] - **URL:** https://github.com/raylee-hawkins/hawkinsops-site
- `projects/repo-history/CONSOLIDATION_MAP.md:43` [raylee-hawkins] - **URL:** https://github.com/raylee-hawkins/RH_MIGRATION_2026_V2 (private)
- `projects/repo-history/CONSOLIDATION_MAP.md:50` [raylee-hawkins] - **URL:** https://github.com/raylee-hawkins/hawkinsops-soc-content (already archived)
- `projects/repo-history/CONSOLIDATION_MAP.md:191` [raylee-hawkins] gh repo archive raylee-hawkins/hawkinsops-framework --yes
- `projects/repo-history/CONSOLIDATION_MAP.md:192` [raylee-hawkins] gh repo archive raylee-hawkins/hawkins_ops --yes
- `projects/repo-history/CONSOLIDATION_MAP.md:193` [raylee-hawkins] gh repo archive raylee-hawkins/hawkinsops-site --yes
- `projects/repo-history/CONSOLIDATION_MAP.md:194` [raylee-hawkins] gh repo archive raylee-hawkins/RH_MIGRATION_2026_V2 --yes
- `projects/repo-history/CONSOLIDATION_MAP.md:250` [raylee-hawkins] - **Pull Request:** https://github.com/raylee-hawkins/HawkinsOperations/pull/2
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:30` [raylee-hawkins] git clone https://github.com/raylee-hawkins/hawkinsops-framework.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:37` [raylee-hawkins] git clone https://github.com/raylee-hawkins/HawkinsOperations.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:52` [raylee-hawkins] git clone https://github.com/raylee-hawkins/hawkins_ops.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:59` [raylee-hawkins] git clone https://github.com/raylee-hawkins/HawkinsOperations.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:74` [raylee-hawkins] git clone https://github.com/raylee-hawkins/hawkinsops-site.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:81` [raylee-hawkins] git clone https://github.com/raylee-hawkins/HawkinsOperations.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:95` [raylee-hawkins] git clone https://github.com/raylee-hawkins/RH_MIGRATION_2026_V2.git  # Private repo
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:102` [raylee-hawkins] git clone https://github.com/raylee-hawkins/HawkinsOperations.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:141` [raylee-hawkins] run: git clone https://github.com/raylee-hawkins/hawkinsops-framework.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:144` [raylee-hawkins] run: git clone https://github.com/raylee-hawkins/hawkins_ops.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:151` [raylee-hawkins] run: git clone https://github.com/raylee-hawkins/HawkinsOperations.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:168` [raylee-hawkins] See [hawkinsops-framework](https://github.com/raylee-hawkins/hawkinsops-framework)
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:171` [raylee-hawkins] See [HawkinsOperations/tools](https://github.com/raylee-hawkins/HawkinsOperations/tree/main/tools)
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:177` [raylee-hawkins] git clone https://github.com/raylee-hawkins/hawkins_ops.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:180` [raylee-hawkins] git clone https://github.com/raylee-hawkins/HawkinsOperations.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:190` [raylee-hawkins] git clone https://github.com/raylee-hawkins/HawkinsOperations.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:229` [raylee-hawkins] - **Issues:** Report at https://github.com/raylee-hawkins/HawkinsOperations/issues
- `projects/repo-history/RELEASE_NOTES_v1.1.0.md:185` [raylee-hawkins] **Repository:** https://github.com/raylee-hawkins/HawkinsOperations
- `site/README_DEPLOY.md:20` [raylee-hawkins] - `raylee-hawkins/HawkinsOperations`
- `site/assets/components/sections/listing-renderer.js:31` [raylee-hawkins] ? `https://github.com/raylee-hawkins/HawkinsOperations/tree/main/${esc(item.location \|\| "")}`
- `site/assets/data/detections.json:13` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/detection-rules/sigma"
- `site/assets/data/detections.json:17` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/PROOF_PACK/VERIFIED_COUNTS.md"
- `site/assets/data/detections.json:31` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/detection-rules/wazuh/rules"
- `site/assets/data/detections.json:35` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/scripts/build-wazuh-bundle.ps1"
- `site/assets/data/detections.json:49` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/detection-rules/splunk"
- `site/assets/data/detections.json:53` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/detection-rules/mappings/mitre_coverage_matrix.md"
- `site/assets/data/detections.json:67` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/incident-response/playbooks"
- `site/assets/data/detections.json:71` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/incident-response/checklists/IR-004-to-030-Quick-Reference.md"
- `site/assets/data/projects.json:10` [raylee-hawkins] "repo_url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/detection-rules",
- `site/assets/data/projects.json:15` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/PROOF_PACK/VERIFIED_COUNTS.md"
- `site/assets/data/projects.json:19` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/detection-rules/wazuh/rules"
- `site/assets/data/projects.json:30` [raylee-hawkins] "repo_url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects/migration-rh",
- `site/assets/data/projects.json:35` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/projects/migration-rh/README.md"
- `site/assets/data/projects.json:39` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects/migration-rh/PROOF_PACK"
- `site/assets/data/projects.json:50` [raylee-hawkins] "repo_url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/site/triage.html",
- `site/assets/data/projects.json:59` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/incident-response/incidents"
- `site/assets/data/projects.json:70` [raylee-hawkins] "repo_url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/incident-response/playbooks",
- `site/assets/data/projects.json:75` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/incident-response/playbooks"
- `site/assets/data/projects.json:79` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/incident-response/INDEX.md"
- `site/assets/data/projects.json:90` [raylee-hawkins] "repo_url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects/lab/wazuh-detection-harness",
- `site/assets/data/projects.json:95` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/projects/lab/wazuh-detection-harness/README.md"
- `site/assets/data/projects.json:99` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/projects/lab/wazuh-detection-harness/runs/run_02-19-2026_034113/report.md"
- `site/assets/data/projects.json:110` [raylee-hawkins] "repo_url": "https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects/lab/honeypot-grafana-wazuh",
- `site/assets/data/projects.json:115` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/projects/lab/honeypot-grafana-wazuh/README.md"
- `site/assets/data/projects.json:119` [raylee-hawkins] "url": "https://github.com/raylee-hawkins/HawkinsOperations/blob/main/projects/lab/honeypot-grafana-wazuh/docker-compose.yml"
- `site/assets/home.js:3` [raylee-hawkins] username: "raylee-hawkins",
- `site/blog-python2-to-python3.html:112` [raylee-hawkins] <a href="https://github.com/raylee-hawkins/HawkinsOperations" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository (opens in a new tab)">GitHub</a>
- `site/blog-python2-to-python3.html:113` [raylee-hawkins] <a href="https://linkedin.com/in/raylee-hawkins" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">LinkedIn</a>
- `site/case-study-soc-integration.html:139` [raylee-hawkins] <li><a href="https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects/lab/PP_SOC_Integration/evidence" target="_blank" rel="noopener noreferrer">PP_SOC_Integration evidence directory (GitHub)</a> — Wazuh alert screenshots, agent status, CVE remediation artifacts.</li>
- `site/case-study-soc-integration.html:140` [raylee-hawkins] <li><a href="https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects/lab/PP_SOC_Integration" target="_blank" rel="noopener noreferrer">Full project package (GitHub)</a> — README, docs, and structured proof artifacts.</li>
- `site/case-study-soc-integration.html:141` [raylee-hawkins] <li><a href="https://github.com/raylee-hawkins/HawkinsOperations/blob/main/projects/lab/PP_SOC_Integration/docs/UPCOMING_PROJECT_DIRECTION.md" target="_blank" rel="noopener noreferrer">Upcoming project direction doc</a> — next phase priorities and expansion plan.</li>
- `site/case-study-soc-integration.html:176` [raylee-hawkins] <a class="btn btn-p" href="https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects/lab/PP_SOC_Integration/evidence" target="_blank" rel="noopener noreferrer">View evidence artifacts</a>
- `site/case-study-soc-integration.html:196` [raylee-hawkins] <a href="https://github.com/raylee-hawkins/HawkinsOperations" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository (opens in a new tab)">GitHub</a>
- `site/case-study-soc-integration.html:197` [raylee-hawkins] <a href="https://linkedin.com/in/raylee-hawkins" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">LinkedIn</a>
- `site/case-study.html:131` [raylee-hawkins] <a href="https://github.com/raylee-hawkins/HawkinsOperations" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository (opens in a new tab)">GitHub</a>
- `site/case-study.html:132` [raylee-hawkins] <a href="https://linkedin.com/in/raylee-hawkins" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">LinkedIn</a>
- `site/index.html:102` [raylee-hawkins] <a class="btn btn-p" href="https://github.com/raylee-hawkins/HawkinsOperations" target="_blank" rel="noopener noreferrer">Clone the repo</a>
- `site/index.html:108` [raylee-hawkins] <div class="lupd">Counts and links align to <code>raylee-hawkins/HawkinsOperations</code> (verified, reproducible today).</div>
- `site/index.html:149` [raylee-hawkins] <a class="card" href="https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects/lab/PP_SOC_Integration" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block">
- `site/index.html:172` [raylee-hawkins] <a class="btn btn-p" href="https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects/lab/PP_SOC_Integration/evidence" target="_blank" rel="noopener noreferrer">View proof artifacts</a>
- `site/index.html:173` [raylee-hawkins] <a class="btn btn-g" href="https://github.com/raylee-hawkins/HawkinsOperations/blob/main/projects/lab/PP_SOC_Integration/docs/UPCOMING_PROJECT_DIRECTION.md" target="_blank" rel="noopener noreferrer">Read upcoming direction</a>
- `site/index.html:391` [raylee-hawkins] <a href="https://github.com/raylee-hawkins/HawkinsOperations" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository (opens in a new tab)">GitHub</a>
- `site/index.html:392` [raylee-hawkins] <a href="https://linkedin.com/in/raylee-hawkins" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">LinkedIn</a>
- `site/lab.html:133` [raylee-hawkins] <a href="https://github.com/raylee-hawkins/HawkinsOperations" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository (opens in a new tab)">GitHub</a>
- `site/lab.html:134` [raylee-hawkins] <a href="https://linkedin.com/in/raylee-hawkins" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">LinkedIn</a>
- `site/projects.html:72` [raylee-hawkins] <a class="card" href="https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects/lab/PP_SOC_Integration" target="_blank" rel="noopener noreferrer" style="text-decoration:none">
- `site/projects.html:78` [raylee-hawkins] <a class="card" href="https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects" target="_blank" rel="noopener noreferrer" style="text-decoration:none">
- `site/projects.html:84` [raylee-hawkins] <a class="card" href="https://github.com/raylee-hawkins/HawkinsOperations/tree/main/detection-rules" target="_blank" rel="noopener noreferrer" style="text-decoration:none">
- `site/projects.html:90` [raylee-hawkins] <a class="card" href="https://github.com/raylee-hawkins/HawkinsOperations/tree/main/incident-response/playbooks" target="_blank" rel="noopener noreferrer" style="text-decoration:none">
- `site/projects.html:204` [raylee-hawkins] <p><a href="https://github.com/raylee-hawkins/HawkinsOperations/tree/main/projects" target="_blank" rel="noopener noreferrer">Open projects folder on GitHub</a></p>
- `site/projects.html:214` [raylee-hawkins] <p><a href="https://github.com/raylee-hawkins/hawkinsops-framework" target="_blank" rel="noopener noreferrer">Open hawkinsops-framework</a></p>
- `site/projects.html:224` [raylee-hawkins] <p><a href="https://github.com/raylee-hawkins/hawkins_ops" target="_blank" rel="noopener noreferrer">Open hawkins_ops</a></p>
- `site/projects.html:230` [raylee-hawkins] <p><a href="https://github.com/raylee-hawkins/HawkinsOperations" target="_blank" rel="noopener noreferrer">Open HawkinsOperations</a></p>
- `site/projects.html:236` [raylee-hawkins] <p><a href="https://github.com/raylee-hawkins/hawkinsops-framework" target="_blank" rel="noopener noreferrer">Open hawkinsops-framework</a></p>
- `site/projects.html:252` [raylee-hawkins] <a href="https://github.com/raylee-hawkins/HawkinsOperations" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository (opens in a new tab)">GitHub</a>
- `site/projects.html:253` [raylee-hawkins] <a href="https://linkedin.com/in/raylee-hawkins" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">LinkedIn</a>
- `site/proof.html:79` [raylee-hawkins] <div class="card-sub"><a href="https://github.com/raylee-hawkins/HawkinsOperations" target="_blank" rel="noopener noreferrer">raylee-hawkins/HawkinsOperations</a></div>
- `site/proof.html:104` [raylee-hawkins] <pre id="cProofPS" class="term-b">git clone https://github.com/raylee-hawkins/HawkinsOperations
- `site/proof.html:160` [raylee-hawkins] <a href="https://github.com/raylee-hawkins/HawkinsOperations" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository (opens in a new tab)">GitHub</a>
- `site/proof.html:161` [raylee-hawkins] <a href="https://linkedin.com/in/raylee-hawkins" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">LinkedIn</a>
- `site/resume-content.md:3` [raylee-hawkins] raylee@hawkinsops.com \| https://github.com/raylee-hawkins \| https://hawkinsops.com \| https://linkedin.com/in/raylee-hawkins
- `site/resume.html:100` [raylee-hawkins] <a href="https://github.com/raylee-hawkins" target="_blank" rel="noopener noreferrer">GitHub</a> \|
- `site/resume.html:102` [raylee-hawkins] <a href="https://linkedin.com/in/raylee-hawkins" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">LinkedIn</a>
- `site/resume.html:179` [raylee-hawkins] <a href="https://github.com/raylee-hawkins/HawkinsOperations" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository (opens in a new tab)">GitHub</a>
- `site/resume.html:180` [raylee-hawkins] <a href="https://linkedin.com/in/raylee-hawkins" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">LinkedIn</a>
- `site/resume.txt:6` [raylee-hawkins] GitHub: https://github.com/raylee-hawkins
- `site/resume.txt:8` [raylee-hawkins] LinkedIn: https://linkedin.com/in/raylee-hawkins
- `site/security.html:336` [raylee-hawkins] <a href="https://github.com/raylee-hawkins/HawkinsOperations" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository (opens in a new tab)">GitHub</a>
- `site/security.html:337` [raylee-hawkins] <a href="https://linkedin.com/in/raylee-hawkins" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">LinkedIn</a>
- `site/triage.html:185` [raylee-hawkins] <a href="https://github.com/raylee-hawkins/HawkinsOperations" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository (opens in a new tab)">GitHub</a>
- `site/triage.html:186` [raylee-hawkins] <a href="https://linkedin.com/in/raylee-hawkins" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">LinkedIn</a>
raw.githubusercontent.com hits:
legacy-hosting hits:

## G) Content/DOM Mount Mismatch Checks
Duplicate ID findings: 0
Missing script mount IDs by page: 0

## H) Ranked Top 5 Causes of Progressive Degradation
### 1. Mixed local asset path strategies + trailing slash route variance
- Why intermittent: Relative asset URLs can resolve differently for /page versus /page/, so different canonicalization outcomes produce different asset paths per deploy and cache state.
- How to confirm: In DevTools Network, compare requests for /security and /security/. Look for /security/assets/... 404s versus /assets/... 200s.
- Minimal fix: Standardize local asset references to root-absolute paths (/assets/...) across all HTML pages.
- Evidence: `{"siteConvention":"absolute_root","homepageAbsoluteInnerRelativePattern":false,"trailingHazardCount":0,"missingAssetCount":0}`

### 2. Fetch URL inconsistency and missing timeout/fallback behavior
- Why intermittent: Relative fetch URLs are document-URL dependent and can fail under slash variants; fetches without timeout/fallback can leave permanent loading placeholders.
- How to confirm: Use DevTools Network + Console on live pages and force slow/offline mode. Failed JSON requests without UI fallback indicate hanging lanes.
- Minimal fix: Use root-absolute fetch URLs (/assets/data/...) and enforce a 1.5-2.0s timeout with fallback rendering.
- Evidence: `{"inconsistentStrategies":false,"timeoutRiskFiles":[],"suspiciousFetches":0}`

### 3. Generated artifacts can drift from deployment inputs
- Why intermittent: If generated JSON artifacts are not consistently present (or generated from stale content), deploy output can differ even when source HTML appears unchanged.
- How to confirm: Check Cloudflare build logs for generation script execution and verify deployed files under /assets/data and /assets/verified-counts.json.
- Minimal fix: Guarantee generation step in build command and add CI assertion that required artifacts exist before deploy.
- Evidence: `{"artifacts":[{"file":"site/assets/verified-counts.json","exists":true},{"file":"site/assets/data/detections.json","exists":true},{"file":"site/assets/data/media.json","exists":true},{"file":"site/assets/data/projects.json","exists":true}]}`

### 4. Edge/browser cache mixing old HTML with newer JS/CSS payloads
- Why intermittent: A stale HTML shell can reference outdated script paths or mount contracts while newer assets are cached separately, causing progressive inconsistent behavior.
- How to confirm: Hard refresh + cache-disabled devtools test. Compare response headers and ETags for HTML vs JS assets across affected and unaffected sessions.
- Minimal fix: Set short cache for HTML and immutable cache strategy for fingerprinted assets; purge cache on critical routing/path changes.
- Evidence: `{"cloudflareEvidenceCount":22}`

### 5. Repository/owner rename leftovers and external raw URL dependencies
- Why intermittent: Old owner URLs may redirect unpredictably across mirrors/caches; raw.githubusercontent dependencies are sensitive to owner/repo/path changes.
- How to confirm: Search deployed source for raylee-hawkins and raw.githubusercontent.com, then test those links directly for redirects or 404s.
- Minimal fix: Replace old owner references with raylee-hawkins and prefer same-origin packaged assets over raw external URLs.
- Evidence: `{"legacyOwnerHits":143,"rawGithubHits":0,"legacyHostingHits":0}`

## Minimal Safe Fix Plan
1. Standardize local asset references in HTML to root-absolute `/assets/...`.
2. Standardize local fetch URLs in JS to root-absolute `/assets/data/...`.
3. Add canonical slash redirects in `site/_redirects` if pretty-no-slash is canonical.
4. Enforce timeout + fallback rendering for all async loading lanes.
5. Add CI sanity gate: `node scripts/diagnose-site.js --fail-on-issues`.

### Recommended Fix Patch Sections
#### HTML asset path rewrites
#### JS fetch path rewrites
#### _redirects canonical suggestions
- No canonical redirect additions suggested.
#### CI sanity check
- Fail CI if relative local asset references, slash-hazard paths, or unresolved local assets are detected.
- Command: `node scripts/diagnose-site.js --fail-on-issues`

## Re-run Instructions
- Node only: `node scripts/diagnose-site.js`
- Fail CI on issues: `node scripts/diagnose-site.js --fail-on-issues`
- Report outputs: `docs/diagnosis/STATIC_SITE_DIAGNOSIS_REPORT.md`, `docs/diagnosis/STATIC_SITE_DIAGNOSIS_REPORT.json`

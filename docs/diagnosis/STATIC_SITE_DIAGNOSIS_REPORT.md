# Static Site Diagnosis Report

Generated: `2026-02-18T00:25:33.941Z`
Root: `C:\RH\OPS\PUBLISH\GITHUB\repos\HawkinsOperations`
Site directory: `site`

## Scope
- HTML asset path consistency audit across all `site/*.html` pages
- Trailing slash and canonicalization hazard analysis
- Static-host URL resolution simulation for local assets
- JS fetch/XHR URL audit
- Generated data artifact and hosting build expectations
- Rename regression checks (`raylee-ops`, `netlify`, raw GitHub URLs)
- DOM mount contract checks (JS selectors vs page IDs)

## Sample Run Output
```text
HTML files scanned: 10
JS files scanned: 8
Fetch calls found: 0
Trailing-slash hazards: 0
Missing local asset resolutions: 0
Legacy owner hits: 41
Netlify hits: 14
```

## A) Asset Path Consistency Audit (HTML)
Site-wide local asset convention inferred: `absolute_root`
Homepage absolute + inner-page relative pattern detected: `false`

| Page | Absolute Local | Relative Local | External | Mixed | Canonical |
| --- | --- | --- | --- | --- | --- |
| `site/404.html` | 3 | 0 | 1 | no | `https://hawkinsops.com/404` |
| `site/blog-python2-to-python3.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/blog-python2-to-python3` |
| `site/case-study.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/case-study` |
| `site/index.html` | 5 | 0 | 1 | no | `https://hawkinsops.com/` |
| `site/lab.html` | 6 | 0 | 1 | no | `https://hawkinsops.com/lab` |
| `site/projects.html` | 7 | 0 | 1 | no | `https://hawkinsops.com/projects` |
| `site/proof.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/proof` |
| `site/resume.html` | 5 | 0 | 4 | no | `https://hawkinsops.com/resume` |
| `site/security.html` | 7 | 0 | 1 | no | `https://hawkinsops.com/security` |
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
- `scripts/generate-site-data.js:8` const outPath = path.join(root, "site", "assets", "verified-counts.json");
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
- `README.md:95` \| `site/` \| static portfolio site source \| published recruiter-facing web content \|
- `README.md:114` \|-- generate-site-content.js      -> site/assets/data/*.json
- `README.md:139` - Runtime remains static HTML/CSS/JS under `site/` (no framework lock-in).
- `README.md:140` - Design tokens and fluid layout primitives: `site/assets/design-system.css`.
- `README.md:142` - `site/projects.html` reads `site/assets/data/projects.json`.
- `README.md:143` - `site/security.html` reads `site/assets/data/detections.json`.
- `README.md:152` Cloudflare Pages production build:
- `site/README_DEPLOY.md:15` - Primary production hosting: **Cloudflare Pages**
- `site/README_DEPLOY.md:16` - Publish directory: `site/`
- `site/README_DEPLOY.md:18` - Cloudflare Pages build command:
- `site/README_DEPLOY.md:35` - `site/assets/verified-counts.json`
- `site/README_DEPLOY.md:36` - `site/assets/data/projects.json`
- `site/README_DEPLOY.md:37` - `site/assets/data/detections.json`
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
Legacy owners detected: `alessandroz`, `gentilkiwi`, `raylee-ops`, `sigmahq`, `swiftonsecurity`, `your-username`

raylee-ops/old owner hits:
- `.github/ISSUE_TEMPLATE/config.yml:4` [raylee-ops] url: https://github.com/raylee-ops/HawkinsOperations/blob/main/docs/VERIFY_COMMANDS_POWERSHELL.md
- `.github/ISSUE_TEMPLATE/config.yml:7` [raylee-ops] url: https://github.com/raylee-ops/HawkinsOperations/blob/main/SECURITY.md
- `projects/migration-rh/PROOF_PACK/PROOF_INDEX.md:7` [raylee-ops] - Standalone release receipt: [`v0.9.0`](https://github.com/raylee-ops/RH_MIGRATION_2026_V2/releases/tag/v0.9.0)
- `projects/migration-rh/PROOF_PACK/PROOF_INDEX.md:8` [raylee-ops] - Standalone source repository: [`raylee-ops/RH_MIGRATION_2026_V2`](https://github.com/raylee-ops/RH_MIGRATION_2026_V2)
- `projects/migration-rh/PROOF_PACK/VERIFICATION.md:19` [raylee-ops] - https://github.com/raylee-ops/RH_MIGRATION_2026_V2/releases/tag/v0.9.0
- `projects/migration-rh/README.md:20` [raylee-ops] - Repo: `raylee-ops/RH_MIGRATION_2026_V2`
- `projects/migration-rh/README.md:21` [raylee-ops] - Release: [`v0.9.0` — Phase 08 complete (100% core phases)](https://github.com/raylee-ops/RH_MIGRATION_2026_V2/releases/tag/v0.9.0)
- `projects/migration-rh/SRC/reference/imports/README.md:16` [raylee-ops] **Source:** raylee-ops/RH_MIGRATION_2026_V2 (private, active project)
- `projects/repo-history/CONSOLIDATION_MAP.md:5` [raylee-ops] **PR:** https://github.com/raylee-ops/HawkinsOperations/pull/2
- `projects/repo-history/CONSOLIDATION_MAP.md:22` [raylee-ops] - **URL:** https://github.com/raylee-ops/hawkinsops-framework
- `projects/repo-history/CONSOLIDATION_MAP.md:29` [raylee-ops] - **URL:** https://github.com/raylee-ops/hawkins_ops
- `projects/repo-history/CONSOLIDATION_MAP.md:36` [raylee-ops] - **URL:** https://github.com/raylee-ops/hawkinsops-site
- `projects/repo-history/CONSOLIDATION_MAP.md:43` [raylee-ops] - **URL:** https://github.com/raylee-ops/RH_MIGRATION_2026_V2 (private)
- `projects/repo-history/CONSOLIDATION_MAP.md:50` [raylee-ops] - **URL:** https://github.com/raylee-ops/hawkinsops-soc-content (already archived)
- `projects/repo-history/CONSOLIDATION_MAP.md:191` [raylee-ops] gh repo archive raylee-ops/hawkinsops-framework --yes
- `projects/repo-history/CONSOLIDATION_MAP.md:192` [raylee-ops] gh repo archive raylee-ops/hawkins_ops --yes
- `projects/repo-history/CONSOLIDATION_MAP.md:193` [raylee-ops] gh repo archive raylee-ops/hawkinsops-site --yes
- `projects/repo-history/CONSOLIDATION_MAP.md:194` [raylee-ops] gh repo archive raylee-ops/RH_MIGRATION_2026_V2 --yes
- `projects/repo-history/CONSOLIDATION_MAP.md:250` [raylee-ops] - **Pull Request:** https://github.com/raylee-ops/HawkinsOperations/pull/2
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:30` [raylee-ops] git clone https://github.com/raylee-ops/hawkinsops-framework.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:37` [raylee-ops] git clone https://github.com/raylee-ops/HawkinsOperations.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:52` [raylee-ops] git clone https://github.com/raylee-ops/hawkins_ops.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:59` [raylee-ops] git clone https://github.com/raylee-ops/HawkinsOperations.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:74` [raylee-ops] git clone https://github.com/raylee-ops/hawkinsops-site.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:81` [raylee-ops] git clone https://github.com/raylee-ops/HawkinsOperations.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:95` [raylee-ops] git clone https://github.com/raylee-ops/RH_MIGRATION_2026_V2.git  # Private repo
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:102` [raylee-ops] git clone https://github.com/raylee-ops/HawkinsOperations.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:141` [raylee-ops] run: git clone https://github.com/raylee-ops/hawkinsops-framework.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:144` [raylee-ops] run: git clone https://github.com/raylee-ops/hawkins_ops.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:151` [raylee-ops] run: git clone https://github.com/raylee-ops/HawkinsOperations.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:168` [raylee-ops] See [hawkinsops-framework](https://github.com/raylee-ops/hawkinsops-framework)
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:171` [raylee-ops] See [HawkinsOperations/tools](https://github.com/raylee-ops/HawkinsOperations/tree/main/tools)
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:177` [raylee-ops] git clone https://github.com/raylee-ops/hawkins_ops.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:180` [raylee-ops] git clone https://github.com/raylee-ops/HawkinsOperations.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:190` [raylee-ops] git clone https://github.com/raylee-ops/HawkinsOperations.git
- `projects/repo-history/MIGRATION_GUIDE_FOR_USERS.md:229` [raylee-ops] - **Issues:** Report at https://github.com/raylee-ops/HawkinsOperations/issues
- `projects/repo-history/RELEASE_NOTES_v1.1.0.md:185` [raylee-ops] **Repository:** https://github.com/raylee-ops/HawkinsOperations
- `PROOF_PACK/features/resume-ats-txt-endpoint/run_02-14-2026_000051/evidence/logs/local_headers_resume_html_02-14-2026.txt:94` [raylee-ops] <a href="https://github.com/raylee-ops" target="_blank" rel="noreferrer">GitHub</a> \|
- `PROOF_PACK/features/resume-ats-txt-endpoint/run_02-14-2026_000051/evidence/logs/local_headers_resume_html_02-14-2026.txt:173` [raylee-ops] <a href="https://github.com/raylee-ops/HawkinsOperations" target="_blank" rel="noreferrer">GitHub</a>
- `PROOF_PACK/features/resume-ats-txt-endpoint/run_02-14-2026_000051/evidence/logs/local_headers_resume_txt_02-14-2026.txt:13` [raylee-ops] GitHub: https://github.com/raylee-ops
- `README.md:5` [raylee-ops] [![Verification](https://img.shields.io/github/actions/workflow/status/raylee-ops/HawkinsOperations/verify.yml?branch=main&label=verify)](https://github.com/raylee-ops/HawkinsOperations/actions/workflows/verify.yml)
raw.githubusercontent.com hits:
netlify hits:
- `.github/workflows/verify.yml:33` node .\scripts\verify\no-netlify.js
- `docs/hosting/CLOUDFLARE_PAGES.md:13` - Build command: `node scripts/generate-site-data.js && node scripts/generate-site-content.js && node scripts/generate-media-manifest.js && node scripts/verify/no-netlify.js`
- `docs/ui/REFRACTOR_PR_PLAN.md:7` - Add `scripts/verify/no-netlify.js` and wire it into verification workflow.
- `PROOF_PACK/hosting_transfer_cloudflare/run_02-14-2026_031137/evidence/logs/dns_before_after_backfill_02-14-2026.txt:2` Legacy provider target reference (Netlify hostname): hawkinsoperations.netlify.app
- `PROOF_PACK/hosting_transfer_cloudflare/run_02-14-2026_031137/evidence/logs/dns_before_after_backfill_02-14-2026.txt:4` === nslookup hawkinsoperations.netlify.app 8.8.8.8 ===
- `PROOF_PACK/hosting_transfer_cloudflare/run_02-14-2026_031137/evidence/logs/dns_before_after_backfill_02-14-2026.txt:8` Name:    hawkinsoperations.netlify.app
- `README.md:73` node .\scripts\verify\no-netlify.js
- `README.md:153` - `node scripts/generate-site-data.js && node scripts/generate-site-content.js && node scripts/generate-media-manifest.js && node scripts/verify/no-netlify.js`
- `scripts/verify/no-netlify.js:35` path.join("scripts", "verify", "no-netlify.js").replaceAll("\\", "/"),
- `scripts/verify/no-netlify.js:69` .replaceAll("scripts/verify/no-netlify.js", "scripts/verify/no-hosting-check.js")
- `scripts/verify/no-netlify.js:70` .replaceAll(".\\scripts\\verify\\no-netlify.js", ".\\scripts\\verify\\no-hosting-check.js");
- `scripts/verify/README.md:5` - `no-netlify.js` enforces Cloudflare-only hosting consistency.
- `scripts/verify/README.md:18` node .\scripts\verify\no-netlify.js
- `site/README_DEPLOY.md:19` - `node scripts/generate-site-data.js && node scripts/generate-site-content.js && node scripts/generate-media-manifest.js && node scripts/verify/no-netlify.js`

## G) Content/DOM Mount Mismatch Checks
Duplicate ID findings: 0
Missing script mount IDs by page: 25
- `site/assets/app.js:303` expects `#verified-date` on `site/blog-python2-to-python3.html` (guarded=true)
- `site/assets/app.js:303` expects `#verified-date` on `site/case-study.html` (guarded=true)
- `site/assets/app.js:303` expects `#verified-date` on `site/lab.html` (guarded=true)
- `site/assets/app.js:303` expects `#verified-date` on `site/projects.html` (guarded=true)
- `site/assets/app.js:303` expects `#verified-date` on `site/proof.html` (guarded=true)
- `site/assets/app.js:303` expects `#verified-date` on `site/resume.html` (guarded=true)
- `site/assets/app.js:303` expects `#verified-date` on `site/security.html` (guarded=true)
- `site/assets/app.js:303` expects `#verified-date` on `site/triage.html` (guarded=true)
- `site/assets/app.js:308` expects `#verified-source` on `site/blog-python2-to-python3.html` (guarded=true)
- `site/assets/app.js:308` expects `#verified-source` on `site/case-study.html` (guarded=true)
- `site/assets/app.js:308` expects `#verified-source` on `site/lab.html` (guarded=true)
- `site/assets/app.js:308` expects `#verified-source` on `site/projects.html` (guarded=true)
- `site/assets/app.js:308` expects `#verified-source` on `site/proof.html` (guarded=true)
- `site/assets/app.js:308` expects `#verified-source` on `site/resume.html` (guarded=true)
- `site/assets/app.js:308` expects `#verified-source` on `site/security.html` (guarded=true)
- `site/assets/app.js:308` expects `#verified-source` on `site/triage.html` (guarded=true)
- `site/assets/portfolio-data.js:264` expects `#detectionsChart` on `site/projects.html` (guarded=true)
- `site/assets/portfolio-data.js:266` expects `#securityTagMiniChart` on `site/projects.html` (guarded=true)
- `site/assets/portfolio-data.js:269` expects `#mitre-coverage-status` on `site/projects.html` (guarded=false)
- `site/assets/portfolio-data.js:273` expects `#coverage-chart` on `site/projects.html` (guarded=true)
- `site/assets/portfolio-data.js:273` expects `#coverage-chart` on `site/security.html` (guarded=true)
- `site/assets/portfolio-data.js:274` expects `#detections-tag-chart` on `site/projects.html` (guarded=true)
- `site/assets/portfolio-data.js:274` expects `#detections-tag-chart` on `site/security.html` (guarded=true)
- `site/assets/portfolio-data.js:275` expects `#proof-gallery-strip` on `site/projects.html` (guarded=false)
- `site/assets/portfolio-data.js:275` expects `#proof-gallery-strip` on `site/security.html` (guarded=false)

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
- Evidence: `{"cloudflareEvidenceCount":23}`

### 5. Repository/owner rename leftovers and external raw URL dependencies
- Why intermittent: Old owner URLs may redirect unpredictably across mirrors/caches; raw.githubusercontent dependencies are sensitive to owner/repo/path changes.
- How to confirm: Search deployed source for raylee-ops and raw.githubusercontent.com, then test those links directly for redirects or 404s.
- Minimal fix: Replace old owner references with raylee-hawkins and prefer same-origin packaged assets over raw external URLs.
- Evidence: `{"legacyOwnerHits":41,"rawGithubHits":0,"netlifyHits":14}`

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

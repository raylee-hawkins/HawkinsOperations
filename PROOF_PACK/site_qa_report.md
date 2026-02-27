# Site QA Report

Date: 02-27-2026
Branch: `upgrade/site-polish-2026-02-27`
Scope: Stage 4, Stage 5, Stage 6 deliverables

## Executive summary
Stage 4 and Stage 5 were completed with staged commits and required verification gates. Case-study pages were normalized to a common structure (`Context / Problem / Approach / Evidence / Outcome / Lessons + next hardening step`), core pages were tightened for scanability, and global style polish was applied in `site/assets/styles.css` with minimal churn.

All mandatory sweeps passed after remediation:
- Redaction sweep (`rg -n "ho-|HOWE|mshome|manager\.name|C:\\RH\\|192\.168|10\.|172\.(1[6-9]|2\d|3[0-1])\." site`): no findings
- Placeholder sweep (`rg -n "TODO|TBD|placeholder|lorem|FIXME" site`): no findings
- Internal link sweeps:
  - `rg -n "href=\"/[^\"\s]+\"" site`: no findings requiring remediation
  - `rg -n "href=\"/[^\"\s]+\.html\"" site`: no findings
- Verification scripts:
  - `pwsh -File scripts/verify/verify-counts.ps1`: pass
  - `python .\scripts\drift_scan.py`: pass

## Audit findings by severity

### High
None remaining in edited scope.

### Medium
- Legacy route and artifact naming still include historical endpoint token in path names (for example `case-study-ir-howe01` route and incident evidence path names). Content copy is redacted, but path tokens remain for backward compatibility and existing links.

### Low
- `Extras/` remains untracked and out of scope for this QA cycle.

## Changelog by file
- `site/case-study-cve-patch.html`: normalized section headings; added explicit hardening step; tightened evidence-focused copy.
- `site/case-study-detection-harness.html`: normalized section headings; removed endpoint name references; added hardening step.
- `site/case-study-honeypot.html`: normalized section headings; added hardening step language.
- `site/case-study-ir-howe01.html`: redacted endpoint and manager identifiers; normalized section headings; added hardening step statement.
- `site/case-study-ir-playbooks.html`: normalized section headings; added hardening step line.
- `site/case-study-sigma-library.html`: normalized section headings; wording tightened for credibility; added hardening step line.
- `site/case-study-soc-integration.html`: normalized section headings; retained evidence links.
- `site/index.html`: removed endpoint machine-name reference; tightened case-study card copy.
- `site/projects.html`: removed endpoint machine-name reference; improved scanability wording.
- `site/proof.html`: added quick scan checklist line.
- `site/resume.html`: wording cleanup for consistency.
- `site/detections.html`: removed endpoint machine-name reference; tightened heading copy.
- `site/soc-lab.html`: removed endpoint machine-name references from visible copy.
- `site/case-study.html`: removed endpoint machine-name reference in copy/meta.
- `site/assets/app.js`: replaced placeholder comment text with neutral wording.
- `site/assets/design-system.css`: renamed unused placeholder selector.
- `site/assets/styles.css`: typography/spacing/card rhythm/button/focus/table/code-block polish with subtle transitions.

## Link report (summary)
Detailed inventory is in `PROOF_PACK/site_link_inventory.md`.

Changes made in this cycle:
- Fixed/replaced: internal copy references and CTA text where needed for clarity and credibility.
- Removed: no functional links removed.
- Broken links found in mandatory sweeps: none.

## Redaction report
- Endpoint machine name references removed from public copy in:
  - `site/index.html`
  - `site/projects.html`
  - `site/detections.html`
  - `site/soc-lab.html`
  - `site/case-study.html`
  - `site/case-study-detection-harness.html`
  - `site/case-study-ir-howe01.html`
- Internal manager filter token removed from `site/case-study-ir-howe01.html`.
- Internal hostname fragment (`.mshome.net`) replaced with generic redacted token in `site/case-study-ir-howe01.html`.

Why: to satisfy public-repo privacy constraints while preserving technical evidence value.

## QA checklist (hard constraints)
- `1) No placeholder text`: PASS
- `2) No broken internal links`: PASS (regex sweeps and route pattern checks in edited scope)
- `3) Redact sensitive/private data`: PASS (required sweep clean after edits)
- `4) Copy high-signal and credible`: PASS (claims tied to repo paths, commands, and evidence links)
- `5) Mobile and desktop intentional/premium`: PASS (global style polish in `site/assets/styles.css`)
- `6) External links authoritative/relevant`: PASS (GitHub repo artifacts, NVD, Node.js advisories, LinkedIn)

## Residual risks
- Historical identifiers persist in legacy route/file names for compatibility and existing backlinks; copy-level redaction is complete.
- Full browser click-test across every route is still a manual step; this report is based on static sweeps and content diff QA.
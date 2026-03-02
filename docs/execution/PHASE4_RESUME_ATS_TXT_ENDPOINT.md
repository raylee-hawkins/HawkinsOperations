# Phase 4: ATS Plain-Text Resume Endpoint

## Feature
- Add an ATS-friendly plain-text resume endpoint at `/resume.txt`.
- Add a visible link from `/resume` labeled `Download plain-text (ATS)` pointing to `/resume.txt`.

## Scope
- In scope:
  - Static plain-text file in `site/resume.txt`.
  - Resume page link update in `site/resume.html`.
  - Local and production header/content verification evidence.
- Out of scope:
  - PDF generation pipeline changes.
  - Full resume content rewrite.
  - Typography or print CSS redesign.
  - i18n.

## Validation Commands
- Local static serve:
  - `python -m http.server --directory site 8000`
- Local header check:
  - `curl.exe -i http://[REDACTED_IP]:8000/resume.txt`
- Production header check:
  - `curl.exe -sI https://hawkinsops.com/resume.txt`

## Evidence Pack
- `PROOF_PACK/features/resume-ats-txt-endpoint/run_MM-DD-YYYY_HHMMSS/`
  - `RESULTS.md`
  - `evidence/logs/`
  - `evidence/screenshots/`


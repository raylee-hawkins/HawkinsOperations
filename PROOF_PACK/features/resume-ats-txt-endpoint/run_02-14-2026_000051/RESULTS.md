# Feature Results: ATS Plain-Text Resume Endpoint
AS_OF_UTC: 2026-02-14T06:07:00Z
FEATURE: `ATS-friendly plain-text resume endpoint (/resume.txt) + stable download link from /resume`
RUN_FOLDER: `PROOF_PACK/features/resume-ats-txt-endpoint/run_02-14-2026_000051/`

## Acceptance Criteria (AC)
- AC1: `/resume.txt` returns HTTP `200` in production.
- AC2: `/resume.txt` returns plain text content with no HTML tags.
- AC3: Headers include `Content-Type: text/plain; charset=utf-8` for `/resume.txt`.
- AC4: Text contains candidate name and email.
- AC5: Text contains at least two sections (for example `SKILLS` and `EXPERIENCE / PROJECTS`).
- AC6: `/resume` page includes a visible `Download plain-text (ATS)` link to `/resume.txt`.
- AC7: Feature works in local dev and production.

## Out Of Scope
- PDF generation pipeline changes.
- Full resume rewrite.
- Typography or print CSS changes.
- i18n.

## AC Status (Evidence-Backed)
- AC1: `FAIL (pre-merge production)`
  - Evidence: `evidence/logs/prod_headers_resume_txt_02-14-2026.txt` shows `HTTP/1.1 404 Not Found`.
- AC2: `PASS (local)`
  - Evidence: `evidence/logs/local_content_checks_resume_txt_02-14-2026.txt` -> `contains_html_tags=False`.
- AC3: `PARTIAL`
  - Implemented: `site/_headers` adds `/resume.txt` -> `Content-Type: text/plain; charset=utf-8`.
  - Local server evidence: `evidence/logs/local_headers_resume_txt_02-14-2026.txt` reports `Content-type: text/plain` (python `http.server` does not include charset by default).
  - Production proof pending deploy: `evidence/logs/prod_headers_resume_txt_02-14-2026.txt` currently 404.
- AC4: `PASS (local)`
  - Evidence: `evidence/logs/local_content_checks_resume_txt_02-14-2026.txt` -> `contains_name=True`, `contains_email=True`.
- AC5: `PASS (local)`
  - Evidence: `evidence/logs/local_content_checks_resume_txt_02-14-2026.txt` -> `contains_skills_section=True`, `contains_experience_projects_section=True`.
- AC6: `PASS (local)`
  - Evidence screenshot: `evidence/screenshots/resume_with_ats_link_02-14-2026.png`.
- AC7: `PARTIAL`
  - Local: PASS.
  - Production: pending merge/deploy; current prod endpoint is 404.

## Evidence Index
- Logs:
  - `evidence/logs/local_headers_resume_txt_02-14-2026.txt`
  - `evidence/logs/local_headers_resume_html_02-14-2026.txt`
  - `evidence/logs/local_content_checks_resume_txt_02-14-2026.txt`
  - `evidence/logs/prod_headers_resume_txt_02-14-2026.txt`
  - `evidence/logs/prod_headers_resume_page_02-14-2026.txt`
  - `evidence/logs/prod_headers_legacy_02-14-2026.txt`
  - `evidence/logs/prod_probe_resume_txt_02-14-2026.txt`
  - `evidence/logs/local_visual_capture_02-14-2026.txt`
- Screenshots (redacted-safe):
  - `evidence/screenshots/resume_with_ats_link_02-14-2026.png`
  - `evidence/screenshots/resume_txt_render_02-14-2026.png`

## Manual Validation Steps
- Local:
  - `python -m http.server --directory site 8000`
  - `curl.exe -i http://[REDACTED_IP]:8000/resume.txt`
  - Open `http://[REDACTED_IP]:8000/resume.html` and confirm `Download plain-text (ATS)` link.
- Production:
  - `curl.exe -sI https://hawkinsops.com/resume.txt`
  - Expected after deploy: `HTTP/1.1 200 OK` and `Content-Type: text/plain; charset=utf-8`.

## Constraints / Remaining TODO
- Remaining for full production PASS: deploy branch to production and re-capture `prod_headers_resume_txt_*.txt` showing HTTP 200 + text/plain charset header.


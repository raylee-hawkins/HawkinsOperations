# Website Audit

Date: 2026-03-14
Canonical source: `C:\RH\OPS\10_Portfolio\HawkinsOperations\CANONICAL_FACTS_2026-03-14.md`

## Critical

- Homepage fallback metrics are stale. The page still contains old fallback values for:
  - detections: `139`
  - verified date: `02-26-2026`
  - coverage: `6/8`
  These conflict with the current AutoSOC public operations snapshot of `8/8 PASS` on `2026-03-14`.
- Homepage operational copy still describes the coverage gate as if the system is currently failing, which is no longer true.
- Live branding drift exists between external deployment and repo-backed pages. The public site must use `AutoSOC` consistently unless a deliberate rename is executed across all surfaces.

## Major

- Proof and homepage copy are still tied to older dated runbooks and older generated asset timestamps.
- Reviewer understanding depends on fallback text being correct because the site uses client-side data replacement. If JavaScript fails or the data payload lags, the visitor sees stale claims immediately.
- The proof lane works structurally, but it needs one explicit statement that counts come from the verified proof lane while current system health comes from the AutoSOC metrics payload.

## Minor

- Several pages still rely on older CTA wording and could be more explicit about what a reviewer validates on click.
- The resume page is consistent with repo-local policy, but it is still a separate positioning surface that needs to stay aligned manually.

## Remediation Order

1. Fix homepage fallback metrics and status copy.
2. Fix proof page intro and proof-strip wording.
3. Refresh generated JSON / JS data artifacts.
4. Then handle broader page-by-page wording cleanup.

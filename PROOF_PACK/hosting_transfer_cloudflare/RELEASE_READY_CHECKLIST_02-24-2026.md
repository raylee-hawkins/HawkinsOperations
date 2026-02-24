# Release-Ready Checklist

Date: 02-24-2026

## Completed
- Cloudflare Pages production host confirmed on apex `hawkinsops.com`.
- `www.hawkinsops.com` now permanently redirects to apex.
- Apex crawl endpoints are healthy:
  - `https://hawkinsops.com/robots.txt` -> `200`
  - `https://hawkinsops.com/sitemap.xml` -> `200`
- www crawl endpoints redirect cleanly:
  - `https://www.hawkinsops.com/robots.txt` -> `301` to apex
  - `https://www.hawkinsops.com/sitemap.xml` -> `301` to apex
- Redirect behavior accepted as permanent (`301` or `308`) in verification standards.
- AI crawler access verified:
  - `ClaudeBot` and `GPTBot` return `200` on homepage, key pages, and crawl endpoints.
- Search Console sitemap submitted successfully for `https://hawkinsops.com/sitemap.xml`.

## Evidence Files
- `PROOF_PACK/hosting_transfer_cloudflare/CRAWLABILITY_AND_BOT_ACCESS_VALIDATION_02-24-2026.md`

## Human-Only Remaining
- In Google Search Console, run URL Inspection + Request Indexing for:
  - `https://hawkinsops.com/`
  - `https://hawkinsops.com/projects`
  - `https://hawkinsops.com/security`
  - `https://hawkinsops.com/proof`
  - `https://hawkinsops.com/resume`

## Security Cleanup
- Revoke any Cloudflare API tokens shared in chat.
- Reissue a short-lived least-privilege token only when needed.

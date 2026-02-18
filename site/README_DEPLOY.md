# HawkinsOps Static Site (v3)

This build is intentionally **static-first**:
- HTML renders real numbers and content (no JS counters that show `0` to crawlers).
- JS only enhances UX (expandable modals, copy buttons, mobile menu).

## Deploy
Upload **everything** in this folder to your site root:
- `index.html` + all `*.html` pages
- `assets/` (CSS/JS/PDF)

If you only upload `index.html`, the resume PDF and styling will 404 (because hosting platforms love chaos).

## Hosting strategy
- Primary production hosting: **Cloudflare Pages**
- Rollback hosting: **Netlify** (rollback-only, previews disabled to reduce credit burn)
- Publish directory for both hosts: `site/`

## Update counts
Counts are sourced from your repo releases / verification artifacts:
- `raylee-ops/HawkinsOperations`
- Local verification script: `scripts/verify/verify-counts.ps1`

When counts change, update the numbers on `index.html`, `security.html`, and `proof.html` (search for the digits).


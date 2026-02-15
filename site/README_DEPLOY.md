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
- Publish directory: `site/`
- Recommended Node version pin: read from `.node-version`
- Cloudflare Pages build command:
  - `node scripts/generate-site-data.js && node scripts/generate-site-content.js && node scripts/generate-media-manifest.js && node scripts/verify/no-netlify.js`

## Update counts and listing data
Counts and structured listing data are generated from repo source files:
- Verified counts source: `PROOF_PACK/VERIFIED_COUNTS.md`
- Listing content source: `content/projects.json` and `content/detections.json`

Generate publish artifacts:

```powershell
node .\scripts\generate-site-data.js
node .\scripts\generate-site-content.js
node .\scripts\generate-media-manifest.js
```

Generated files:
- `site/assets/verified-counts.json`
- `site/assets/data/projects.json`
- `site/assets/data/detections.json`

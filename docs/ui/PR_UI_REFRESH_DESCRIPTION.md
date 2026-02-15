# PR: UI Refresh (Before/After)

## Summary

This PR upgrades the portfolio UI from dense card walls to a higher-signal, narrative-first layout with content-driven listings.

## Before/After screenshot checklist

Capture from local preview (`python -m http.server --directory site 8000`):

1. Home hero + proof rail:
   - Before: boxed hero + dense card grids
   - After: fluid hero, right-side proof rail, narrative sections
2. Projects listing:
   - Before: hardcoded modal cards
   - After: content-driven list + filter chips + search
3. Security listing:
   - Before: modal-heavy tactic tiles
   - After: content-driven inventory + evidence links + filters
4. Mobile view:
   - Home
   - Projects filters/list
   - Security filters/list

## What changed

- Added design tokens and fluid section primitives.
- Added skip links and improved focus visibility.
- Reworked homepage into narrative blocks and timeline flow.
- Converted projects/security pages to data-driven rendering.
- Added content generation scripts for deploy-safe static output.

## Validation

- `pwsh -NoProfile -File scripts/verify/verify-counts.ps1`
- `node scripts/generate-site-data.js`
- `node scripts/generate-site-content.js`

# AutoSOC Redirect Fix - 03-05-2026

## Issue
`/case-study-autosoc` was observed in a redirect loop on production behavior.

## Root Cause
The previous rule forced extensionless to `.html` via internal rewrite:

```text
/case-study-autosoc /case-study-autosoc.html 200
```

On Cloudflare Pages, `.html` URL canonicalization can redirect back to extensionless path. Combined with the internal rewrite, this can loop:

1. `/case-study-autosoc` -> internal rewrite to `/case-study-autosoc.html` (200)
2. platform canonicalization -> `/case-study-autosoc` (301)
3. request repeats step 1

## Rule Change
Old rule removed:

```text
/case-study-autosoc /case-study-autosoc.html 200
```

New one-way normalizations added:

```text
/case-study-autosoc/ /case-study-autosoc 301
/case-study-autosoc.html /case-study-autosoc 301
```

This leaves one canonical route (`/case-study-autosoc`) and avoids extensionless-to-`.html` rewrites.

## Verification
Commands run:

```powershell
node .\scripts\verify\hosting-cloudflare-only.js
```

Result:

```text
Cloudflare-only hosting consistency check passed.
```

```powershell
# local redirect emulation (before/after) via inline Node
@'...script...'@ | node -
```

Result summary:

- BEFORE rules: loop detected for `/case-study-autosoc` and `/case-study-autosoc.html`.
- AFTER rules:
  - `/case-study-autosoc` -> final `200`
  - `/case-study-autosoc/` -> `301` -> `/case-study-autosoc` -> `200`
  - `/case-study-autosoc.html` -> `301` -> `/case-study-autosoc` -> `200`
- No loop detected after the fix.

## Files Changed
- `site/_redirects`
- `docs/autosoc_redirect_fix_03-05-2026.md`

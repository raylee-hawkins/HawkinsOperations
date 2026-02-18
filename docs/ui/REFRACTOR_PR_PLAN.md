# Refactor Plan (PR-sized)

## PR1: Repo cleanup + Cloudflare docs + consistency verifier + Node pin

- Remove legacy hosting artifacts and references from active files.
- Add `.node-version` for deterministic Cloudflare builds.
- Add `scripts/verify/hosting-cloudflare-only.js` and wire it into verification workflow.
- Update deploy docs with Cloudflare build command and output directory (`site`).

## PR2: Design tokens + starry background + layout primitives

- Add/update design system tokens for spacing, type scale, radii, shadows, focus.
- Implement atmospheric background (starfield layers + gradients + subtle drift motion).
- Add fluid section and narrative layout primitives with glass-like surfaces.

## PR3: Page redesign (`index` / `projects` / `security`) + reduced card-wall pattern

- Rework homepage toward narrative sections, timeline flow, and proof rail.
- Convert projects/security to content-driven listings with filter chips + search.
- Keep evidence links first-class and consistent in render output.

## PR4: Polish (a11y, perf, cleanup, consistency checks)

- Confirm landmarks/heading order/skip-link/focus behavior.
- Verify reduced-motion handling for animated background.
- Run data generation + counts verification + hosting consistency checks.
- Final docs pass: architecture overview and local verifier commands.


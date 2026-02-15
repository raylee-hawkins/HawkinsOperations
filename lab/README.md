# Lab Canonical Structure

`lab/` contains live infrastructure documentation and operational notes.

This area is for lab operations only. Canonical detection and response content remains in top-level folders.

Canonical top-level pillars:
- `detection-rules/`
- `incident-response/`
- `threat-hunting/`
- `PROOF_PACK/`
- `tools/`
- `scripts/`
- `docs/`
- `site/`

Redaction rules:
- Never store secrets, tokens, keys, or credentials.
- Never store internal IPs.
- Use `[REDACTED_INTERNAL]` for sensitive internal details.

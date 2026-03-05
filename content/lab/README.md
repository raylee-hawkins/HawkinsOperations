# Lab Canonical Structure

`content/lab/` contains live infrastructure documentation and operational notes.

This area is for lab operations only. Canonical detection and response content remains in top-level folders.

Canonical top-level pillars:
- `content/detection-rules/`
- `content/incident-response/`
- `content/threat-hunting/`
- `PROOF_PACK/`
- `tools/`
- `scripts/`
- `docs/`
- `site/`

Redaction rules:
- Never store secrets, tokens, keys, or credentials.
- Never store internal IPs.
- Use `[REDACTED_INTERNAL]` for sensitive internal details.



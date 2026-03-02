# Detection VM

## Purpose
- Dedicated lab VM for detection engineering workflows and validation.

## VM Identity
- VMID: `100`
- Hostname: `[REDACTED_HOST]`
- Role: Detection VM

## Snapshot and Reset Policy
- Keep a clean baseline snapshot before major changes.
- Reset to baseline after experiments that alter core tooling or system state.
- Record snapshot labels and reset triggers using `[REDACTED_INTERNAL]` where needed.

## Evidence to Collect (Redacted)
- Build and validation notes.
- Sanitized command outputs and screenshots.
- Redacted `qm config 100` text export in `exports/`.

## Redaction Rules
- No secrets, tokens, keys, or credentials.
- No internal IPs.
- Use `[REDACTED_INTERNAL]` for sensitive internal details.


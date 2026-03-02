# OpenClo VM

## Purpose
- Lab VM for OpenClo workflows and validation tasks.

## VM Identity
- VMID: `102`
- Hostname: `[REDACTED_HOST]`
- Role: OpenClo VM

## Snapshot and Reset Policy
- Keep a clean baseline snapshot before major changes.
- Reset to baseline after experiments that change core services or dependencies.
- Record snapshot labels and reset triggers using `[REDACTED_INTERNAL]` where needed.

## Evidence to Collect (Redacted)
- Build and validation notes.
- Sanitized command outputs and screenshots.
- Redacted `qm config 102` text export in `exports/`.

## Redaction Rules
- No secrets, tokens, keys, or credentials.
- No internal IPs.
- Use `[REDACTED_INTERNAL]` for sensitive internal details.


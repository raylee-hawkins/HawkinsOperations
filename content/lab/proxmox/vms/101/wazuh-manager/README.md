# Wazuh Manager VM

## Purpose
- Central lab VM for Wazuh manager operations and validation.

## VM Identity
- VMID: `101`
- Hostname: `[REDACTED_HOST]`
- Role: Wazuh Manager VM

## Snapshot and Reset Policy
- Keep a clean baseline snapshot before major changes.
- Reset to baseline after major config updates or troubleshooting sessions.
- Record snapshot labels and reset triggers using `[REDACTED_INTERNAL]` where needed.

## Evidence to Collect (Redacted)
- Service status and validation notes.
- Sanitized command outputs and screenshots.
- Redacted `qm config 101` text export in `exports/`.

## Redaction Rules
- No secrets, tokens, keys, or credentials.
- No internal IPs.
- Use `[REDACTED_INTERNAL]` for sensitive internal details.


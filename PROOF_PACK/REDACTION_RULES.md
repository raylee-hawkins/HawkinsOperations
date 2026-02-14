# Redaction Rules

Use these rules for any file, screenshot, log, or diagram committed as evidence.

## Redact These Values

- Internal IP addresses (IPv4/IPv6)
- Internal hostnames and FQDNs
- Email addresses
- Real user names and account IDs
- API keys, bearer tokens, passwords, secrets
- SSH keys and certificates
- Device serial numbers and asset tags
- VM IDs tied to internal inventory
- Repository or service URLs containing private tenant/project names

## Replacement Patterns

- Secrets: `[REDACTED]`
- Internal infrastructure identifiers: `[REDACTED_INTERNAL]`
- Example domains: `example.local`
- Example addresses: `10.0.0.10`, `10.0.0.20` only if synthetic and documented as synthetic
- Example users: `analyst01`, `admin01`

## Examples

### Logs

- Before: `ssh admin@host.internal.local`
- After: `ssh admin01@[REDACTED_INTERNAL_HOST]`

- Before: `token=ghp_xxxxxxxxxxxxxxxxxxxx`
- After: `token=[REDACTED]`

### Screenshots

- Blur or mask:
  - Browser address bar
  - Sidebar host inventory names
  - IP columns
  - User profile/email elements

### Config Files

- Before:
  - `api_url = "https://tenant.internal.local"`
  - `api_key = "abc123..."`
- After:
  - `api_url = "https://[REDACTED_INTERNAL]"`
  - `api_key = "[REDACTED]"`

## Verification Command Examples

Run from repo root before commit:

```powershell
rg -n -i "(password|token|secret|api[_-]?key|client[_-]?secret|bearer\\s+[A-Za-z0-9._-]+)" .
rg -n -i "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" .
rg -n -i "(\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b)" .
```

If a result is not clearly synthetic, redact before push.

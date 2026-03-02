# Proxmox VM Inventory

VM mapping for the lab:

| VMID | Hostname    | Purpose            | Path |
| ---- | ----------- | ------------------ | ---- |
| 100  | [REDACTED_HOST] | Detection VM       | `lab/proxmox/vms/100/detection-vm/` |
| 101  | [REDACTED_HOST] | Wazuh Manager VM   | `lab/proxmox/vms/101/wazuh-manager/` |
| 102  | [REDACTED_HOST] | OpenClo VM         | `lab/proxmox/vms/102/openclaw/` |

Guardrails:
- No internal IPs.
- No secrets, tokens, keys, or credentials.
- Use `[REDACTED_INTERNAL]` for sensitive internal details.


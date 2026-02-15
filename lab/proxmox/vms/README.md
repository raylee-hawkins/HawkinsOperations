# Proxmox VM Inventory

VM mapping for the lab:

| VMID | Hostname    | Purpose            | Path |
| ---- | ----------- | ------------------ | ---- |
| 100  | HO-SR-WP-01 | Detection VM       | `lab/proxmox/vms/100/detection-vm/` |
| 101  | HO-SR-WM-01 | Wazuh Manager VM   | `lab/proxmox/vms/101/wazuh-manager/` |
| 102  | HO-SR-AI-01 | OpenClo VM         | `lab/proxmox/vms/102/openclaw/` |

Guardrails:
- No internal IPs.
- No secrets, tokens, keys, or credentials.
- Use `[REDACTED_INTERNAL]` for sensitive internal details.

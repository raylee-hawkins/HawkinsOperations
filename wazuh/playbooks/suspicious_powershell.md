# Playbook: Suspicious PowerShell

## Trigger
- Wazuh rule hits for encoded PowerShell execution behavior.

## Steps
1. Confirm host, user context, and parent process lineage.
2. Pull full command line and relevant process metadata.
3. Validate against approved admin/script activity.
4. Escalate if unknown source or suspicious parent chain exists.
5. Document IOC/TTP and response decision in incident record.


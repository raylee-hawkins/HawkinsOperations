# Why Wazuh, And Why Integrate All Proxmox VMs and Endpoints

The short version is coverage and context.

If only one or two systems are monitored, alerts become isolated events. You can see a finding, but you cannot confidently measure how that finding fits into the rest of the environment. Expanding agent coverage closes that blind spot.

## Why Wazuh
Wazuh provides one operational surface for:
- endpoint visibility
- vulnerability findings
- event telemetry
- compliance and ATT&CK context

That single-pane workflow is what makes fast triage possible without losing traceability.

## Why Full Integration Across Proxmox and Endpoints
The environment includes Linux VMs and Windows endpoints with different risk profiles and behavior patterns. Wiring all of them into Wazuh enables:
- consistent detection coverage
- cross-host correlation
- measurable alert volume and noise
- proof-backed response timelines

This is the difference between a demo and a working SOC workflow.

## Operational Outcome
With seven active agents and centralized telemetry, it became possible to:
- detect a real critical vulnerability
- execute remediation quickly
- verify post-remediation state
- preserve evidence in a structured proof pack

That is the model used in this project: reproducible, evidence-first, and realistic enough to map to production thinking.

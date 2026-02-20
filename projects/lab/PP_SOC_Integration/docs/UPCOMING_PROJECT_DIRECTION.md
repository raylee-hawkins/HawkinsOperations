# Upcoming Project Direction - From Validated Lab to Running SOC

## What this project is becoming
The next phase is straightforward: move from validated detection content to a continuously running SOC implementation on my own hardware.

This means the rules are not just documented and tested in isolation. They are actively applied, monitored, and tuned across the systems I actually operate.

## Current operating model
- Primary workstation: Windows 11 Enterprise
- Core infrastructure access path: Windows endpoint to Proxmox-hosted server environment
- Detection and workflow platform: Wazuh as the operational center for collect, detect, triage, investigate, respond, improve

## Why this shift matters
The value is in execution quality:
- real telemetry instead of simulated traffic only
- direct ownership of detection quality and noise tuning
- repeatable incident workflow on systems under active use
- evidence that the SOC loop is functioning on real infrastructure

## What will be expanded next
1. Rule deployment coverage across all enrolled machines.
2. Validation reruns with pass/noise tracking on live data.
3. Hardening updates to templates and playbooks as drift appears.
4. Gap documentation and remediation tracking in the same proof lane.

## Context artifacts from prior post and transition planning
- `../context/t5-proxmox-redacted.png`
- `../context/t5-infrastructure-map.png`
- `../context/t3-workflow.png`
- `../context/LinkedIn Post.pdf`

## Narrative anchor
This is not "lab-only" security theater.  
It is an evidence-first SOC build where detection logic, triage discipline, response actions, and improvement cycles are all tied to real machines and tracked over time.

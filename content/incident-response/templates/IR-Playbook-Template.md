# IR Playbook Template

Use this template to create new incident response playbooks in this repo.

- **ID:** IR-XXX
- **Severity:** (Critical/High/Medium/Low)
- **Primary MITRE ATT&CK:** (Technique ID)

## 1) Detection
- What triggered the alert?
- What data sources does it rely on?

## 2) Triage (5 minutes)
- Immediate checks to confirm/deny
- Scope indicators (hosts/users/time window)

## 3) Investigation (30 minutes)
- Log sources to collect
- Key questions to answer
- Hypotheses to validate

## 4) Containment (15 minutes)
- Isolation / access control steps
- Blocking actions (hash/domain/IP) as applicable

## 5) Eradication
- Remove persistence and malware
- Patch/rotate/clean as required

## 6) Recovery
- Restore service safely
- Monitor for recurrence

## 7) Documentation
- Timeline, IOCs, root cause
- Lessons learned + follow-ups

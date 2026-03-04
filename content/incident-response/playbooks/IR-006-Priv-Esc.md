# Privilege Escalation

- **ID:** IR-006
- **Severity:** High
- **Primary MITRE ATT&CK:** T1068

## 1) Detection
**Typical signals**
- Exploit attempts; unusual admin group changes; token manipulation

**Immediate goal:** confirm the alert is real and scoped.

## 2) Triage (5 minutes)
- Identify impacted host(s)/user(s)
- Confirm timestamp window and alert source
- Check for obvious false positives (known maintenance, expected admin activity)

## 3) Investigation (30 minutes)
- Collect relevant logs (EDR, Windows Event Logs / Sysmon, authentication logs, proxy/DNS as needed)
- Identify initial vector and timeline
- Determine lateral movement / privilege escalation indicators

## 4) Containment (15 minutes)
- Isolate affected endpoint(s) if needed
- Disable or reset compromised accounts (coordinate with IAM/IT)
- Block malicious hashes/domains/URLs/IPs in your controls (SIEM/SOAR/EDR/firewall)

## 5) Eradication
- Remove persistence mechanisms (services, scheduled tasks, autoruns)
- Remove malicious binaries/scripts
- Patch exploited vulnerabilities and rotate exposed secrets

## 6) Recovery
- Restore from known-good backups if needed
- Re-enable accounts with strong controls (MFA, conditional access)
- Monitor for recurrence (same indicators + adjacent TTPs)

## 7) Documentation
- Record IOCs, timeline, and root cause
- Capture what worked/failed for tuning and prevention
- Create follow-up actions (hardening, detection improvements, user education)

## Notes
### False positives / tuning
- Legitimate admin activity; patching activity

### Artifacts to preserve
- Relevant event IDs/log sources
- Process trees / command lines
- Network indicators

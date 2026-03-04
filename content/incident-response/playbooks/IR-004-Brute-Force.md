# Brute Force Attack

- **ID:** IR-004
- **Severity:** High
- **Primary MITRE ATT&CK:** T1110

## 1) Detection
**Typical signals**
- Multiple failed logins in short window; lockouts; suspicious source IPs

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
- Block attacking source IPs at firewall/WAF/network controls
- Implement or verify account lockout policy is active on targeted systems
- Disable or reset targeted accounts if any successful authentication occurred (coordinate with IAM/IT)
- Alert on further login attempts from same source range

## 5) Eradication
- Reset passwords on any accounts that were successfully authenticated during the attack window
- Audit all successful logins during the attack window for unauthorized access
- Confirm no persistence was established if any login succeeded

## 6) Recovery
- Enforce MFA on all externally-facing authentication (VPN, OWA, RDP, SSH)
- Deploy or tune account lockout thresholds and alerting
- Monitor for resumed attacks, credential stuffing, or lateral pivot using any harvested credentials

## 7) Documentation
- Record IOCs, timeline, and root cause
- Capture what worked/failed for tuning and prevention
- Create follow-up actions (hardening, detection improvements, user education)

## Notes
### False positives / tuning
- Forgotten passwords, misconfigured services, password sprays during audits

### Artifacts to preserve
- Relevant event IDs/log sources
- Process trees / command lines
- Network indicators

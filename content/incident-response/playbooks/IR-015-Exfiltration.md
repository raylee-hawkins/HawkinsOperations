# Data Exfiltration

- **ID:** IR-015
- **Severity:** Critical
- **Primary MITRE ATT&CK:** T1041

## 1) Detection
**Typical signals**
- Large outbound transfers, unusual destinations, cloud upload spikes

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
- Block destination IPs/domains at firewall and proxy immediately to stop active transfer
- Terminate active network connections from the source endpoint
- Isolate the source endpoint if exfiltration is ongoing or if volume suggests bulk data movement
- Capture and preserve network flow data and proxy logs before blocking

## 5) Eradication
- Identify and remove any exfiltration tooling, scripts, or scheduled jobs on the source endpoint
- Audit all outbound connections during the exfiltration window — determine scope (what data, what volume, what destination)
- Identify the initial access vector that enabled the exfiltration capability and close it
- Determine if data requires breach notification review (PII, PHI, credentials, IP)

## 6) Recovery
- Implement or tune DLP controls for the identified exfil channel (HTTP, DNS, cloud upload, email)
- Tighten egress firewall rules — block outbound to file sharing sites and unusual destinations by default
- Monitor for resumed exfiltration attempts using same or alternate channels
- If sensitive data was confirmed exfiltrated, escalate to legal/compliance for breach determination

## 7) Documentation
- Record IOCs, timeline, and root cause
- Capture what worked/failed for tuning and prevention
- Create follow-up actions (hardening, detection improvements, user education)

## Notes
### False positives / tuning
- Legit bulk transfers, backups, migrations

### Artifacts to preserve
- Relevant event IDs/log sources
- Process trees / command lines
- Network indicators

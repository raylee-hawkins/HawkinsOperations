# Supply Chain Attack

- **ID:** IR-022
- **Severity:** Critical
- **Primary MITRE ATT&CK:** T1195

## 1) Detection
**Typical signals**
- Compromised update/package indicators, unexpected vendor behavior

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
- Identify and inventory all endpoints that received the compromised package/update
- Freeze the software update pipeline — prevent further distribution of the compromised version
- Block network connections to known C2 infrastructure embedded in the compromised package
- Quarantine or roll back the compromised software version across affected systems

## 5) Eradication
- Remove the compromised package or update; restore from a known-good baseline or perform clean install
- Audit all systems that executed the compromised version for post-exploitation indicators (new accounts, scheduled tasks, network beacons, credential access)
- Verify hash/signature of the clean replacement against an out-of-band authoritative source before redeployment
- Notify affected vendor and coordinate disclosure if applicable

## 6) Recovery
- Implement software supply chain verification controls: code signing validation, hash verification against vendor manifests
- Establish a vendor notification and verification process for future update packages
- Audit third-party software update procedures and restrict auto-update mechanisms for high-risk software categories
- Monitor for delayed-action payloads — supply chain implants may be dormant and trigger on schedule or condition

## 7) Documentation
- Record IOCs, timeline, and root cause
- Capture what worked/failed for tuning and prevention
- Create follow-up actions (hardening, detection improvements, user education)

## Notes
### False positives / tuning
- New vendor releases; internal packaging changes

### Artifacts to preserve
- Relevant event IDs/log sources
- Process trees / command lines
- Network indicators

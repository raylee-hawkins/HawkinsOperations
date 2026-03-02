# Active Directory Compromise

- **ID:** IR-007
- **Severity:** Critical
- **Primary MITRE ATT&CK:** T1003.006

## 1) Detection
**Typical signals**
- DC suspicious replication, DCSync indicators, credential theft evidence

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
- Disable the account used for DCSync replication immediately
- Isolate the origin system that triggered replication events
- Block DC replication traffic to/from the compromised host at the network level
- Escalate to senior analyst or IR lead — DCSync is a domain-level compromise indicator

## 5) Eradication
- Reset the **krbtgt** account password **twice** (with a minimum 10-hour interval between resets to invalidate all Kerberos tickets)
- Reset all privileged account passwords (Domain Admins, Enterprise Admins, service accounts with DCSync rights)
- Remove unauthorized DS-Replication-Get-Changes and DS-Replication-Get-Changes-All permissions from non-DC accounts
- Audit Active Directory for new accounts, group membership changes, and GPO modifications made during the compromise window

## 6) Recovery
- Audit all accounts with replication rights — scope to legitimate DCs and Azure AD Connect only
- Deploy Privileged Access Management (PAM) or tiered admin model to limit domain admin exposure
- Enable and alert on Event ID 4662 with DS-Replication properties in SIEM
- Monitor for Golden Ticket or Pass-the-Hash indicators post-recovery (attackers may have harvested hashes before detection)

## 7) Documentation
- Record IOCs, timeline, and root cause
- Capture what worked/failed for tuning and prevention
- Create follow-up actions (hardening, detection improvements, user education)

## Notes
### False positives / tuning
- Authorized AD replication tools; domain admin maintenance

### Artifacts to preserve
- Relevant event IDs/log sources
- Process trees / command lines
- Network indicators

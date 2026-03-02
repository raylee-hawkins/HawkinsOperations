# Assumptions & Placeholders

## Purpose
This document clearly identifies all assumptions made in creating the HawkinsOps Runbooks & Playbooks Pack, along with placeholders that need to be replaced with actual values from your specific environment.

**How to Use This Document**:
1. Read through all assumptions
2. For each item marked ❌ **REQUIRED**, update the corresponding runbooks/playbooks with actual values
3. For items marked ⚠️ **RECOMMENDED**, consider implementing for enhanced security and functionality
4. For items marked ℹ️ **OPTIONAL**, implement based on your specific needs and priorities

---

## Environment Assumptions

### Network Configuration

| Assumption | Actual Value | Status | Update Required In |
|------------|--------------|--------|-------------------|
| pfSense LAN IP: `[REDACTED_IP]` | _____________ | ❌ **REQUIRED** | All scenario files, playbooks, hawk_ops_env_mapping.md |
| LAN Subnet: `[REDACTED_IP]/24` | _____________ | ❌ **REQUIRED** | All network-related scenarios |
| Wazuh Server IP: `[REDACTED_IP]` | _____________ | ❌ **REQUIRED** | All scenarios, playbooks, hawk_ops_env_mapping.md |
| Windows Powerhouse IP: `[REDACTED_IP]` | _____________ | ⚠️ **RECOMMENDED** | Scenarios involving Windows |
| PRIMARY_OS IP: `[REDACTED_IP]` | _____________ | ⚠️ **RECOMMENDED** | Scenarios involving Linux |
| MINT-3 IP: `[REDACTED_IP]` | _____________ | ⚠️ **RECOMMENDED** | Scenarios involving MINT-3 |

**Action**: Update `hawk_ops_env_mapping.md` with actual IP addresses, then reference that document instead of memorizing IPs.

### Hostnames

| Assumption | Actual Value | Status | Notes |
|------------|--------------|--------|-------|
| pfSense hostname: `pfsense` or `pfSense` | _____________ | ❌ **REQUIRED** | Check: System → General Setup → Hostname |
| Wazuh Server hostname: `wazuh-server` | _____________ | ❌ **REQUIRED** | Check with: `hostname` command on Wazuh server |
| Windows hostname: `POWERHOUSE` or `WIN-POWERHOUSE` | _____________ | ❌ **REQUIRED** | Check: `hostname` in PowerShell |
| PRIMARY_OS hostname: `primary-mint` or `PRIMARY-OS` | _____________ | ❌ **REQUIRED** | Check: `hostname` command |
| MINT-3 hostname: `mint3` or `MINT-3` | _____________ | ❌ **REQUIRED** | Check: `hostname` command |

**Action**: Run `hostname` on each system and document actual values in `hawk_ops_env_mapping.md`.

---

## Wazuh Configuration

### Wazuh Rule IDs

**Assumption**: The following are common Wazuh rule IDs, but may vary based on Wazuh version and custom rules.

| Rule ID | Description | Verify In |
|---------|-------------|-----------|
| 5503 | Linux authentication failure | `/var/ossec/etc/rules/0095-sshd_rules.xml` |
| 5712 | SSH brute-force attempt | `/var/ossec/etc/rules/0095-sshd_rules.xml` |
| 60122 | Windows admin logon | `/var/ossec/etc/rules/0145-windows_rules.xml` |
| 87103 | Windows Defender malware detection | `/var/ossec/etc/rules/0345-windows-defender.xml` |
| 554 | File integrity monitoring - file added | `/var/ossec/etc/rules/0010-ossec_rules.xml` |
| 550 | File integrity monitoring - checksum changed | `/var/ossec/etc/rules/0010-ossec_rules.xml` |

**Action Items**:
- [ ] SSH into Wazuh server
- [ ] Check actual rule IDs in `/var/ossec/etc/rules/`
- [ ] Test rules with sample logs using `/var/ossec/bin/ossec-logtest`
- [ ] Update `event_id_and_log_reference.md` with confirmed rule IDs
- [ ] Note any rule IDs that don't exist and create custom rules if needed

**Command to verify**:
```bash
# On Wazuh server:
sudo grep -r "id=\"5503\"" /var/ossec/etc/rules/
```

### Wazuh Dashboard Access

| Assumption | Actual Value | Status |
|------------|--------------|--------|
| Dashboard URL: `https://[REDACTED_IP]:443` | _____________ | ❌ **REQUIRED** |
| Dashboard credentials: `wazuh-user` / [password] | _____________ | ❌ **REQUIRED** |
| API URL: `https://[REDACTED_IP]:55000` | _____________ | ℹ️ **OPTIONAL** |

**Action**: Document actual Wazuh dashboard URL and create secure password storage.

### Wazuh Agent Configuration

**Assumption**: Wazuh agents are installed and configured on all endpoints.

**Verify**:
- [ ] Windows Powerhouse has Wazuh agent (check Services: `wazuh` service running)
- [ ] PRIMARY_OS has Wazuh agent (check: `sudo systemctl status wazuh-agent`)
- [ ] MINT-3 has Wazuh agent (check: `sudo systemctl status wazuh-agent`)
- [ ] All agents reporting to Wazuh manager (Wazuh Dashboard → Management → Agents)

**If not installed**: See Wazuh documentation for agent deployment:
- Windows: https://documentation.wazuh.com/current/installation-guide/wazuh-agent/wazuh-agent-package-windows.html
- Linux: https://documentation.wazuh.com/current/installation-guide/wazuh-agent/wazuh-agent-package-linux.html

---

## Windows-Specific Assumptions

### Windows Event Logging

**Assumptions**:
- ✅ Security Event Log is enabled (default on Windows)
- ⚠️ **Command line process auditing is enabled** (Event 4688 shows command lines)
- ⚠️ **PowerShell logging is enabled** (Script Block Logging, Module Logging)
- ℹ️ **Sysmon is deployed** for enhanced logging

**Verify Command Line Auditing**:
```powershell
# Check current setting:
auditpol /get /category:"Detailed Tracking"

# If "Process Creation" shows "No Auditing", enable with:
auditpol /set /subcategory:"Process Creation" /success:enable /failure:enable

# Enable command line in events (Group Policy or Registry):
# GPO: Computer Config → Admin Templates → System → Audit Process Creation → "Include command line in process creation events" = Enabled
```

**Enable PowerShell Logging**:
```powershell
# Via GPO: Computer Config → Admin Templates → Windows Components → Windows PowerShell
# Enable:
# - "Turn on Module Logging"
# - "Turn on PowerShell Script Block Logging"

# Via Registry (if no GPO):
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging" -Name "EnableScriptBlockLogging" -Value 1 -Force
```

**Sysmon Deployment** (Highly Recommended):
```powershell
# Download Sysmon from Microsoft Sysinternals
# Use SwiftOnSecurity config: https://github.com/SwiftOnSecurity/sysmon-config

# Install:
sysmon64.exe -accepteula -i sysmonconfig.xml

# Verify:
Get-Service Sysmon64
Get-WinEvent -LogName "Microsoft-Windows-Sysmon/Operational" -MaxEvents 10
```

**Status**:
- [ ] Command line auditing verified
- [ ] PowerShell logging verified
- [ ] Sysmon deployed (optional but recommended)
- [ ] Wazuh agent configured to monitor Sysmon log (if deployed)

### Windows Defender

**Assumption**: Windows Defender is active and enabled.

**Verify**:
```powershell
Get-MpComputerStatus
```

**If disabled**: Re-enable via Windows Security settings or Group Policy.

---

## Linux-Specific Assumptions

### SSH Configuration

**Assumption**: SSH is enabled on PRIMARY_OS and MINT-3.

**Verify**:
```bash
sudo systemctl status sshd  # or ssh
```

**Hardening Recommendations** (from scenarios):
- [ ] Disable password authentication (use SSH keys only):
  ```bash
  sudo nano /etc/ssh/sshd_config
  # Set: PasswordAuthentication no
  sudo systemctl restart sshd
  ```
- [ ] Disable root login:
  ```bash
  # In /etc/ssh/sshd_config:
  # Set: PermitRootLogin no
  ```
- [ ] Deploy Fail2Ban for brute-force protection

### Fail2Ban

**Assumption**: Fail2Ban is **NOT** yet deployed (referenced as a hardening recommendation).

**To Deploy**:
```bash
sudo apt update
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configure SSH jail:
sudo nano /etc/fail2ban/jail.local

[sshd]
enabled = true
port = ssh
maxretry = 5
bantime = 3600

sudo systemctl restart fail2ban
```

**Status**:
- [ ] Fail2Ban installed on PRIMARY_OS
- [ ] Fail2Ban installed on MINT-3
- [ ] Verified blocking works with test

### File Integrity Monitoring Paths

**Assumption**: Wazuh FIM is configured to monitor critical directories.

**Verify** (on each Linux endpoint):
```bash
sudo cat /var/ossec/etc/ossec.conf | grep -A 10 "<syscheck>"
```

**Recommended FIM directories**:
- `/etc`
- `/bin`, `/sbin`, `/usr/bin`, `/usr/sbin`
- `/home/<user>/.ssh`
- `/var/www` (if web server)

**Add to ossec.conf** (if not present):
```xml
<syscheck>
  <frequency>3600</frequency>
  <directories check_all="yes">/etc</directories>
  <directories check_all="yes">/bin,/sbin,/usr/bin,/usr/sbin</directories>
  <directories check_all="yes">/home/hawkins/.ssh</directories>
</syscheck>
```

**Action**: Review and update FIM configuration, restart Wazuh agent after changes.

---

## pfSense Configuration

### pfSense Services

**Assumptions**:
- ✅ Firewall is operational
- ✅ DHCP server is running on LAN
- ✅ DNS resolver (Unbound) is active
- ⚠️ **Firewall logging is enabled** (required for scenarios)
- ℹ️ **Syslog to Wazuh is configured** (recommended)
- ℹ️ **Suricata IDS/IPS is deployed** (optional)
- ℹ️ **pfBlockerNG is deployed** (optional)

**Verify Firewall Logging**:
```
Navigate to: Status → System Logs → Settings → General Logging
Check: "Log packets matched from the default pass rules" = ✓ (if you want full visibility)
```

**Configure Syslog to Wazuh**:
```
Status → System Logs → Settings → Remote Logging
☑ Enable Remote Logging
Remote log servers: <Wazuh_Server_IP>:514
Remote Syslog Contents: Everything
```

**Verify in Wazuh**:
- Check Wazuh Dashboard for pfSense events
- May need to create custom decoder for pfSense log format

**Deploy Suricata** (Optional IDS/IPS):
```
System → Package Manager → Available Packages
Search: "suricata"
Install

Services → Suricata → Interfaces
Configure on WAN and/or LAN
Enable rule sets (ET Open, Abuse.ch, etc.)
```

**Deploy pfBlockerNG** (Optional ad/malware blocking):
```
System → Package Manager → Available Packages
Search: "pfblockerng-devel"
Install

Firewall → pfBlockerNG → DNSBL
Configure DNS blacklists (threat feeds)
```

**Status**:
- [ ] Firewall logging enabled and verified
- [ ] Syslog to Wazuh configured and tested
- [ ] Suricata deployed (optional)
- [ ] pfBlockerNG deployed (optional)

---

## Evidence Storage & Incident Response

### Incident Folder Structure

**Assumption**: Evidence and incident data stored in:
- **PRIMARY_OS**: `~/HAWKINS_OPS/incidents/`
- **Windows Powerhouse**: `C:\HAWKINS_OPS\incidents\` (if synced)

**Verify**:
```bash
# On PRIMARY_OS:
ls -la ~/HAWKINS_OPS/
```

**If not exists**:
```bash
mkdir -p ~/HAWKINS_OPS/incidents/
mkdir -p ~/HAWKINS_OPS/runbooks/  # (already created by this script)
```

**Action**: Ensure all analysts know to use this consistent folder structure.

### Incident Templates

**Assumption**: Incident templates exist in HawkinsOps autologging system (referenced in scenarios).

**If not exists**: Create basic incident report template:
```bash
nano ~/HAWKINS_OPS/templates/incident_report_template.md
```

**Template contents** (example):
```markdown
# Incident Report: [Incident Type] - [YYYY-MM-DD]

## Executive Summary
[Brief description of incident, impact, and resolution]

## Incident Details
- **Incident ID**: [YYYY-MM-DD-XXX]
- **Detection Time**: [YYYY-MM-DD HH:MM:SS]
- **Affected Systems**: [List systems]
- **Severity**: [Critical/High/Medium/Low]
- **Status**: [Open/Contained/Resolved/Closed]

## Timeline
- [YYYY-MM-DD HH:MM] - Initial detection
- [YYYY-MM-DD HH:MM] - Investigation began
- ...

## Technical Analysis
[Detailed technical findings]

## Indicators of Compromise (IOCs)
- IPs: [list]
- Domains: [list]
- File hashes: [list]
- ...

## Containment Actions Taken
[List all containment steps]

## Evidence Collected
[List evidence files and locations]

## Root Cause
[Analysis of how incident occurred]

## Lessons Learned
[What went well, what to improve]

## Recommendations
[Specific hardening or process improvements]

---
**Analyst**: [Name]
**Date Completed**: [YYYY-MM-DD]
```

---

## Tool Availability

### Forensic & Analysis Tools

**Assumptions about tools available**:

**On PRIMARY_OS** (verify with `which <command>`):
- [ ] `tcpdump` - packet capture
- [ ] `wireshark` or `tshark` - packet analysis
- [ ] `nmap` - network scanning (for authorized testing only)
- [ ] `dig` / `host` - DNS queries
- [ ] `whois` - IP/domain lookups
- [ ] `curl` / `wget` - web requests
- [ ] `sqlite3` - for browser history analysis
- [ ] `grep` / `awk` / `sed` - text processing
- [ ] Git - for version control of runbooks

**Install if missing**:
```bash
sudo apt update
sudo apt install tcpdump wireshark tshark nmap dnsutils whois curl wget sqlite3 git
```

**On Windows Powerhouse** (verify in PowerShell):
- [ ] `Get-WinEvent` cmdlet (built-in)
- [ ] ProcDump (Sysinternals) - process memory dumps
- [ ] Process Explorer (Sysinternals) - advanced process viewer
- [ ] Autoruns (Sysinternals) - persistence viewer
- [ ] Sysmon (Sysinternals) - enhanced logging

**Install Sysinternals Suite**:
- Download: https://docs.microsoft.com/en-us/sysinternals/downloads/
- Extract to: `C:\Tools\SysinternalsSuite\`
- Add to PATH for easy access

---

## Active Directory (Future)

**Assumption**: Active Directory is **NOT** currently deployed but planned for future.

**When Deployed - Update Required**:
1. **Environment Mapping**:
   - Add Domain Controller to `hawk_ops_env_mapping.md`
   - Document domain name (e.g., `hawkinsops.local`)
   - Domain admin accounts and service accounts

2. **Wazuh Integration**:
   - Install Wazuh agent on DC
   - Configure to monitor AD-specific logs
   - Create custom rules for AD attack detection

3. **Scenarios to Create**:
   - Kerberoasting detection
   - Golden Ticket attack
   - DCSync attack
   - Pass-the-Hash detection
   - Unusual LDAP queries

4. **Update Existing Scenarios**:
   - Account management events (now domain accounts, not local)
   - Authentication (Kerberos vs NTLM)
   - Group Policy changes

**Status**:
- [ ] AD deployment planned for: [Date]
- [ ] Documentation updated when AD deployed

---

## Backup & Recovery

### Backup Strategy

**Assumption**: Regular backups exist for:
- Wazuh configuration and rules
- pfSense configuration
- Endpoint data
- HawkinsOps incident archive

**Verify**:
- [ ] Wazuh configuration backed up regularly
  ```bash
  # On Wazuh server:
  sudo tar -czf /backup/wazuh-config-$(date +%Y%m%d).tar.gz /var/ossec/etc/
  ```
- [ ] pfSense configuration auto-backup enabled
  ```
  Diagnostics → Backup & Restore → AutoConfigBackup (if package installed)
  Or: Manual backup → Download configuration → Store off-device
  ```
- [ ] HawkinsOps folder synced/backed up
  - PRIMARY_OS `~/HAWKINS_OPS/` → External storage or cloud (encrypted)

**Action**: Establish and document backup procedures.

---

## User Accounts & Credentials

### Default/Example Usernames

**Scenarios reference placeholder usernames**:
- Windows: `<username>`, `Administrator`, `user`
- Linux: `<username>`, `hawkins`, `raylee`
- pfSense: `admin`
- Wazuh: `wazuh-user`, `admin`

**Action**: Replace with actual usernames in investigation commands.

### Password Management

**Assumption**: Strong passwords are used and stored securely.

**Recommendations**:
- [ ] Use password manager (KeePassXC, Bitwarden, 1Password)
- [ ] Enable MFA where possible (pfSense, Wazuh, etc.)
- [ ] Regular password rotation for admin accounts
- [ ] Document password policies

---

## Communication & Escalation

### Contacts

**Assumption**: Single SOC analyst (Raylee) for HawkinsOps.

**Future Considerations**:
- [ ] Document escalation contacts (if/when team grows)
- [ ] External contacts: ISP, vendors, legal, law enforcement
- [ ] On-call rotation schedule (if applicable)

**Current Status**:
- Primary Analyst: Raylee
- Escalation: [To be defined]

---

## Compliance & Legal

### Data Handling

**Assumption**: HawkinsOps is personal/educational lab environment.

**If Handling Regulated Data** (PII, PHI, PCI, etc.):
- [ ] Document data classification policy
- [ ] Implement data retention schedule
- [ ] Understand breach notification requirements
- [ ] Consult legal counsel for compliance obligations

**Current Status**: Educational/personal lab - no regulatory requirements assumed.

---

## MITRE ATT&CK Framework

### Technique Mapping

**Assumption**: Familiarity with MITRE ATT&CK for documenting incidents.

**Resources**:
- MITRE ATT&CK Navigator: https://mitre-attack.github.io/attack-navigator/
- Wazuh integration: https://documentation.wazuh.com/current/compliance/mitre.html

**Action**: Map incidents to ATT&CK techniques for standardized documentation and trend analysis.

---

## Update Checklist

**Before considering runbooks "production ready"**:

### Critical (Must Do):
- [ ] Update `hawk_ops_env_mapping.md` with actual IPs, hostnames
- [ ] Verify Wazuh rule IDs and update `event_id_and_log_reference.md`
- [ ] Test Wazuh agent connectivity from all endpoints
- [ ] Enable Windows command line auditing and PowerShell logging
- [ ] Configure pfSense syslog to Wazuh
- [ ] Create incident report template
- [ ] Test incident response workflow end-to-end (simulate scenario)

### Recommended (Should Do):
- [ ] Deploy Sysmon on Windows Powerhouse
- [ ] Deploy Fail2Ban on Linux endpoints
- [ ] Install forensic tools (Sysinternals, Wireshark, etc.)
- [ ] Configure Wazuh FIM on all endpoints
- [ ] Set up DHCP reservations or static IPs for all systems
- [ ] Create Wazuh custom rules specific to HawkinsOps
- [ ] Establish backup procedures for configs and data

### Optional (Nice to Have):
- [ ] Deploy Suricata IDS/IPS on pfSense
- [ ] Deploy pfBlockerNG on pfSense
- [ ] Implement network segmentation (VLANs)
- [ ] Set up Active Directory environment
- [ ] Create custom Wazuh dashboards
- [ ] Automate evidence collection scripts
- [ ] Conduct tabletop exercise using scenarios

---

## Version Control

**Recommendation**: Use Git to track changes to runbooks and this assumptions document.

```bash
cd ~/HAWKINS_OPS/runbooks/
git init
git add .
git commit -m "Initial runbooks and playbooks pack"

# After updates:
git add <modified_files>
git commit -m "Updated IPs and hostnames with actual values"
```

**Action**: Consider hosting in private Git repository (GitHub, GitLab, self-hosted Gitea).

---

## Maintenance Schedule

**Runbooks and references should be reviewed and updated**:
- After any major environment change (new system, network reconfiguration)
- After each incident (update with lessons learned)
- Quarterly review (even if no incidents)
- When Wazuh rules are added/modified
- When new attack techniques are discovered (update scenarios)

**Document Owner**: Raylee (Primary SOC Analyst)

**Next Review Date**: [Set 3 months from today]

---

## Questions & Clarifications

**If you encounter issues or have questions while using these runbooks**:

1. **Check this document first** - Is it a known assumption or placeholder?
2. **Verify environment** - Is the system configured as expected?
3. **Test in safe environment** - If unsure, test on MINT-3 before production systems
4. **Document deviations** - Update runbooks and this file with your specific findings
5. **Engage community** - Wazuh community, r/netsec, r/cybersecurity for specific questions

**Common Issues**:
- "Command not found" → Tool not installed, see Tool Availability section
- "Rule ID doesn't match" → Wazuh version difference, verify actual rule IDs
- "Can't access system" → Check IPs, firewall rules, services running
- "Logs not in Wazuh" → Check agent status, ossec.conf, firewall between agent and manager

---

**Remember**: These runbooks are living documents. As HawkinsOps evolves, keep them updated. Every real incident is an opportunity to refine and improve your procedures. Good luck, and happy hunting!

---

**End of Assumptions & Placeholders Document**


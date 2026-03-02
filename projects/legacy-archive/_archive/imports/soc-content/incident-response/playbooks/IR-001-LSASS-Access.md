# IR-001: Suspicious LSASS Process Access

**Severity:** Critical
**MITRE Techniques:** T1003.001
**Platforms:** Windows
**Detection:** Wazuh Rule 100001, Sysmon Event 10
**Author:** HawkinsOps SOC
**Version:** 1.0

---

## 1. DETECTION

**Alert Name:** Suspicious LSASS Process Access
**Trigger:** Non-standard process accessing lsass.exe memory with suspicious access rights

**Indicators:**
- Log Source: Sysmon Event ID 10
- TargetImage: C:\Windows\System32\lsass.exe
- GrantedAccess: 0x1410, 0x1010, 0x1438, 0x143a, 0x1418
- Wazuh Rule: 100001

**Initial Context:**
- [ ] SourceImage (process accessing LSASS)
- [ ] User account running SourceImage
- [ ] Parent process chain
- [ ] System hostname/IP

---

## 2. TRIAGE (5 minutes)

### Validation Steps:
- [ ] Check if SourceImage is legitimate security tool (Defender, EDR)
- [ ] Verify user is administrator/authorized
- [ ] Check for concurrent suspicious alerts on same system
- [ ] Review process creation events before LSASS access

### Key Questions:
1. Is SourceImage a known security tool? (Defender, CrowdStrike, SentinelOne)
2. Is the user account expected to run security tools?
3. Are there other credential dumping indicators?
4. Was this triggered during authorized pentest?

### Escalation Criteria:
- Unknown SourceImage → **Escalate immediately**
- Multiple systems affected → **Escalate to Incident Commander**
- Mimikatz/ProcDump detected → **Critical incident**

---

## 3. INVESTIGATION (30 minutes)

### Commands to Run:

```powershell
# Get process details
Get-Process | Where-Object {$_.ProcessName -eq "lsass"} | Select-Object *

# Check for credential dumping tools
Get-ChildItem -Path C:\ -Recurse -Include mimikatz.exe,procdump.exe,lazagne.exe -ErrorAction SilentlyContinue

# Review recent Sysmon Event 10 (Process Access)
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=10} -MaxEvents 50 |
    Where-Object {$_.Properties[4].Value -like "*lsass.exe"} | Format-List TimeCreated,Message

# Check for dump files
Get-ChildItem -Path C:\,C:\Windows\Temp,C:\Users\*\AppData\Local\Temp -Include *.dmp -Recurse -ErrorAction SilentlyContinue

# Review process creation before LSASS access
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=1} -MaxEvents 100 |
    Select-Object TimeCreated,@{N='CommandLine';E={$_.Properties[10].Value}}

# Check for network connections from suspicious process
Get-NetTCPConnection | Where-Object {$_.OwningProcess -in (Get-Process [processname]).Id}
```

### Artifacts to Collect:
- [ ] Memory dump of SourceImage process
- [ ] Sysmon logs (Event 1, 3, 7, 8, 10)
- [ ] Security Event 4688 (Process Creation)
- [ ] Any .dmp files found on system
- [ ] Network packet capture
- [ ] Full disk triage image (if confirmed compromise)

### Analysis:
1. **Initial Access:** How did attacker gain access to run credential dumper?
2. **Privileges:** What account ran the tool? Is it already admin?
3. **Lateral Movement:** Check for RDP/PSExec/WMI events before this
4. **Exfiltration:** Look for data staging or upload activity after LSASS access

---

## 4. CONTAINMENT (15 minutes)

### Immediate Actions:

```powershell
# 1. Isolate system from network
Disable-NetAdapter -Name "Ethernet*" -Confirm:$false

# 2. Kill suspicious process (if still running)
$procName = "[SourceImageName]"
Stop-Process -Name $procName -Force
Get-Process | Where-Object {$_.Path -like "*$procName*"} | Stop-Process -Force

# 3. Block at firewall (if part of campaign)
# Add malicious IP to block list

# 4. Disable compromised user account
Disable-ADAccount -Identity [username]

# 5. Force password reset for all privileged accounts
# Document all accounts that may be compromised
```

### Containment Checklist:
- [ ] System isolated from network
- [ ] Credential dumping process terminated
- [ ] All .dmp files secured as evidence
- [ ] Compromised account disabled
- [ ] Related systems checked for similar activity
- [ ] IR team notified
- [ ] Stakeholders notified (if prod system)

---

## 5. ERADICATION (30 minutes)

### Removal Steps:

```powershell
# 1. Remove credential dumping tools
Remove-Item -Path "C:\path\to\mimikatz.exe" -Force
Remove-Item -Path "C:\Windows\Temp\*.dmp" -Force

# 2. Check and remove scheduled tasks
Get-ScheduledTask | Where-Object {$_.Actions.Execute -like "*mimikatz*" -or $_.Actions.Execute -like "*procdump*"}
Unregister-ScheduledTask -TaskName [TaskName] -Confirm:$false

# 3. Remove persistence mechanisms
# Check Run keys
Get-ItemProperty -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"
Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"

# 4. Reset ALL privileged account passwords
# This includes Domain Admins, Enterprise Admins, local admins
# Reset krbtgt password TWICE (wait 10 hours between)

# 5. Clear cached credentials
rundll32.exe keymgr.dll,KRShowKeyMgr
klist purge
```

### System Hardening:
- [ ] Enable Credential Guard
- [ ] Enable LSA Protection (RunAsPPL)
- [ ] Deploy Windows Defender Credential Guard
- [ ] Implement LSASS process protection
- [ ] Review and limit local admin rights
- [ ] Deploy application whitelisting

---

## 6. RECOVERY

### Pre-Recovery:
- [ ] Confirm no malware remains
- [ ] All privileged passwords reset
- [ ] LSASS dump files removed
- [ ] Persistence mechanisms cleared
- [ ] EDR/AV updated and running

### Recovery Steps:
- [ ] Re-enable network adapter
- [ ] Monitor Sysmon Event 10 for next 48 hours
- [ ] Watch for failed authentication attempts (4625)
- [ ] Monitor for lateral movement indicators
- [ ] Check other systems for credential reuse

### Validation:
```powershell
# Run full scan
Start-MpScan -ScanType FullScan

# Verify LSASS protection
Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" -Name "RunAsPPL"

# Check for suspicious network connections
Get-NetTCPConnection | Where-Object {$_.State -eq "Established"} |
    Select-Object LocalAddress,LocalPort,RemoteAddress,RemotePort,OwningProcess
```

---

## 7. DOCUMENTATION

### Evidence:
- **File Hash:** [SHA256 of credential dumping tool]
- **IP Address:** [Source IP if remote]
- **User Account:** [Account that ran tool]
- **SourceImage:** [Full path to process]
- **Timestamp:** [UTC time of LSASS access]

### Timeline Example:
| Time (UTC) | Event | Action Taken |
|------------|-------|--------------|
| 14:25:13 | RDP logon from [REDACTED_IP] | Detected in logs |
| 14:27:45 | procdump.exe executed | Alert triggered |
| 14:27:46 | LSASS process access (0x1410) | Wazuh Rule 100001 fired |
| 14:28:00 | lsass.dmp created in C:\Temp | File created |
| 14:30:00 | SOC analyst begins triage | Investigation started |
| 14:35:00 | System isolated from network | Containment action |
| 14:40:00 | Process terminated, file secured | Evidence preserved |

---

## 8. LESSONS LEARNED

**Action Items:**
- [ ] Deploy Credential Guard to all endpoints
- [ ] Enable LSA Protection (RunAsPPL)
- [ ] Implement privileged access workstations (PAWs)
- [ ] Review administrative account usage
- [ ] Deploy application whitelisting
- [ ] Enhanced monitoring for Event 10 on critical servers
- [ ] Security awareness training on credential protection
- [ ] Implement tiered admin model

**Detection Improvements:**
- [ ] Alert on ANY Event 10 targeting LSASS from non-whitelisted processes
- [ ] Monitor for .dmp file creation in temp directories
- [ ] Correlate with Event 4688 (process creation) for context
- [ ] Add behavior analytics for abnormal admin tool usage

---

## MITRE ATT&CK MAPPING

**Tactics:**
- Credential Access

**Techniques:**
- **T1003.001:** OS Credential Dumping - LSASS Memory
  - Procedure: Attacker accessed LSASS process memory to extract credentials
  - Mitigation: Enable Credential Guard, LSA Protection, restrict debug privileges

**Related Techniques:**
- T1078: Valid Accounts (likely used credentials afterward)
- T1021: Remote Services (if credentials used for lateral movement)

---

## REFERENCE

**Related Playbooks:**
- IR-002: Mimikatz Execution
- IR-005: Pass-the-Hash Attack
- IR-015: Lateral Movement via RDP

**Tools Required:**
- Sysinternals Suite (ProcExp, ProcMon)
- Volatility (memory analysis)
- FTK Imager
- Wireshark

**External Resources:**
- https://attack.mitre.org/techniques/T1003/001/
- https://docs.microsoft.com/en-us/windows/security/identity-protection/credential-guard/
- https://www.microsoft.com/security/blog/2022/10/05/detecting-and-preventing-lsass-credential-dumping-attacks/


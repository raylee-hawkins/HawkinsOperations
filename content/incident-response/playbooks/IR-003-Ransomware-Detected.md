# IR-003: Ransomware Detected

**Severity:** Critical
**MITRE Techniques:** T1486, T1490, T1489
**Platforms:** Windows, Linux
**Detection:** Wazuh Rule 100166, 100167
**Author:** HawkinsOps SOC

---

## 1. DETECTION

**Alert Name:** Ransomware File Encryption Activity / Volume Shadow Copy Deletion
**Trigger:** Mass file extension changes, shadow copy deletion, boot config modification

**Indicators:**
- Multiple files with extensions: .encrypted, .locked, .crypto, .locky, .wncry
- Command execution: vssadmin delete shadows, bcdedit /set recoveryenabled no
- Ransom note files: README.txt, HOW_TO_DECRYPT.txt
- High CPU usage from encryption process

---

## 2. TRIAGE (5 minutes)

### CRITICAL - Execute Immediately:
- [ ] **DO NOT** shut down affected systems (preserves memory)
- [ ] **DO NOT** pay ransom (FBI guidance)
- [ ] **IMMEDIATELY** isolate affected systems from network
- [ ] Identify ransomware variant from ransom note
- [ ] Assess number of affected systems
- [ ] Check if backups are intact and offline

### Key Questions:
1. How many systems are encrypted?
2. Are domain controllers affected?
3. Are backups encrypted/accessible?
4. What is the ransomware family? (Check ID-Ransomware.com)
5. Is encryption still in progress?

### Escalation:
- **IMMEDIATE** escalation to Incident Commander
- **IMMEDIATE** notification to executive team
- **IMMEDIATE** contact to legal/PR teams

---

## 3. INVESTIGATION (30 minutes - PARALLEL with containment)

### Rapid Assessment:

```powershell
# Windows - Check for encrypted files
Get-ChildItem -Path C:\ -Recurse -Include *.encrypted,*.locked,*.crypto,*.locky -ErrorAction SilentlyContinue |
    Select-Object FullName,Length,LastWriteTime | Out-File C:\IR\encrypted_files.txt

# Check for ransom notes
Get-ChildItem -Path C:\ -Recurse -Include "*README*","*DECRYPT*","*RANSOM*" -File -ErrorAction SilentlyContinue

# Review recent process execution
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=1} -MaxEvents 200 |
    Where-Object {$_.TimeCreated -gt (Get-Date).AddHours(-2)}

# Check for shadow copy deletion
Get-WinEvent -FilterHashtable @{LogName='System'} -MaxEvents 100 |
    Where-Object {$_.Message -like "*shadow*delete*"}

# Network connections (C2 indicators)
Get-NetTCPConnection | Where-Object {$_.State -eq "Established"} |
    Select-Object LocalAddress,RemoteAddress,RemotePort,OwningProcess,@{N='Process';E={(Get-Process -Id $_.OwningProcess).ProcessName}}
```

### Identify Ransomware Variant:
- [ ] Upload ransom note to ID-Ransomware.com
- [ ] Upload encrypted file sample to ID-Ransomware.com
- [ ] Check NoMoreRansom.org for decryptors
- [ ] Identify ransomware family (REvil, Ryuk, LockBit, etc.)

### Determine Initial Access:
- [ ] Phishing email (check email logs)
- [ ] RDP brute force (Event 4625 followed by 4624)
- [ ] Exploitation (check vulnerability scanners)
- [ ] Compromised credentials (check VPN logs)

---

## 4. CONTAINMENT (15 minutes - CRITICAL PRIORITY)

### IMMEDIATE Actions (First 5 Minutes):

```powershell
# 1. ISOLATE ALL AFFECTED SYSTEMS - Network level if possible
# At switch/firewall: disable ports, VLAN isolation

# 2. If network isolation not possible - disable adapters
Disable-NetAdapter -Name "*" -Confirm:$false

# 3. Block ransomware process (if identified and still running)
Stop-Process -Name [ransomware_process] -Force

# 4. Disable scheduled tasks (ransomware often schedules encryption)
Get-ScheduledTask | Where-Object {$_.State -eq "Ready"} | Disable-ScheduledTask

# 5. Terminate suspicious services
Stop-Service -Name [suspicious_service] -Force
```

### Network Containment:
- [ ] Isolate entire subnet if multiple systems affected
- [ ] Disable inter-VLAN routing
- [ ] Block C2 IPs at firewall (from investigation)
- [ ] Disable VPN access
- [ ] Segment database servers
- [ ] Protect backup infrastructure

### Prevent Spread:
- [ ] Disable file shares
- [ ] Disable RDP
- [ ] Disable WMI
- [ ] Disable PSRemoting
- [ ] Force logout all users

### Protect Backups:
```powershell
# Make backups read-only immediately
$backupPath = "\\backup\server\path"
icacls $backupPath /deny Everyone:(DE,DC)

# Disconnect backup systems from network
# Verify offline/tape backups are safe
```

---

## 5. ERADICATION (Post-Containment)

### DO NOT ERADICATE Until:
- [ ] Forensics complete (if law enforcement involved)
- [ ] All affected systems identified
- [ ] Initial access vector identified and closed
- [ ] Backups verified as clean

### Eradication Steps:

```powershell
# 1. Boot into Safe Mode or WinPE
# 2. Remove ransomware executable
Remove-Item -Path "C:\path\to\ransomware.exe" -Force

# 3. Remove persistence mechanisms
# Check registry run keys
Get-ItemProperty -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"

# Check scheduled tasks
Get-ScheduledTask | Where-Object {$_.TaskPath -like "*ransomware*"}

# Check services
Get-Service | Where-Object {$_.Name -like "*suspicious*"}

# 4. Remove lateral movement tools
# Check for PsExec, Cobalt Strike beacons, etc.

# 5. Check for and remove web shells if RDP wasn't initial access
Get-ChildItem -Path C:\inetpub\wwwroot -Include *.aspx,*.asp,*.php -Recurse |
    Where-Object {$_.LastWriteTime -gt (Get-Date).AddDays(-7)}
```

---

## 6. RECOVERY

### Decision: Restore vs. Rebuild

**Restore from Backup:**
- Backups are verified clean
- Backups are recent (RPO acceptable)
- Faster than rebuild

**Rebuild from Scratch:**
- Backups are encrypted/unavailable
- Backups may be compromised
- High-security environment requires clean rebuild

### Recovery Steps:

```powershell
# 1. Verify backup integrity
Test-Path \\backup\server\latest_backup
Get-FileHash \\backup\server\latest_backup\critical_file.txt

# 2. Scan backups for malware BEFORE restore
# Use isolated system to scan backup

# 3. Restore in isolated environment first
# Test restore in VLAN with no production access

# 4. Validate restored data
# Check files open correctly
# Verify database integrity

# 5. Gradual production restoration
# Restore critical systems first
# Monitor closely for 48 hours
# Restore non-critical systems
```

### If No Backups Available:
- [ ] Check NoMoreRansom.org for free decryptors
- [ ] Contact ransomware family-specific resources
- [ ] Attempt shadow copy recovery (if not deleted)
- [ ] Check for file versions in cloud sync (OneDrive, etc.)
- [ ] Document decision on ransom payment (recommend: DO NOT PAY)

---

## 7. DOCUMENTATION

### Critical Information:
- **Ransomware Variant:** [Family name]
- **Ransom Amount:** [BTC amount]
- **Ransom Note File:** [Screenshot attached]
- **C2 Servers:** [IP addresses]
- **Encrypted File Count:** [Number]
- **Affected Systems:** [List]
- **Initial Access:** [Vector determined]
- **Dwell Time:** [Time between initial compromise and encryption]

### Timeline:
| Time | Event |
|------|-------|
| [Time] | Initial compromise (estimated) |
| [Time] | Lateral movement begins |
| [Time] | Encryption starts |
| [Time] | Detection/alert triggered |
| [Time] | Containment complete |

---

## 8. LESSONS LEARNED

**Immediate Action Items:**
- [ ] Implement 3-2-1 backup strategy (3 copies, 2 media types, 1 offsite)
- [ ] Enable MFA on all remote access (VPN, RDP, email)
- [ ] Disable RDP from internet
- [ ] Implement application whitelisting
- [ ] Deploy EDR to all endpoints
- [ ] Network segmentation
- [ ] Disable PowerShell v2
- [ ] Enable enhanced logging (PowerShell, Sysmon)
- [ ] Patch vulnerabilities
- [ ] Phishing awareness training

**Long-Term:**
- [ ] Implement Zero Trust architecture
- [ ] Regular backup testing/restoration drills
- [ ] Penetration testing
- [ ] Ransomware tabletop exercises
- [ ] Cyber insurance review

---

## MITRE ATT&CK MAPPING

**Techniques:**
- **T1486:** Data Encrypted for Impact
- **T1490:** Inhibit System Recovery
- **T1489:** Service Stop
- **T1070:** Indicator Removal

**Kill Chain:**
1. Initial Access (T1566 Phishing, T1078 Valid Accounts, T1190 Exploit)
2. Execution (T1059 PowerShell)
3. Persistence (T1053 Scheduled Task)
4. Privilege Escalation (T1134 Token Manipulation)
5. Defense Evasion (T1562 Disable Security Tools)
6. Credential Access (T1003 Credential Dumping)
7. Discovery (T1018 Network Discovery)
8. Lateral Movement (T1021 RDP/SMB)
9. Impact (T1486 Ransomware)

---

## REFERENCE

**Tools:**
- ID-Ransomware: https://id-ransomware.malwarehunterteam.com/
- NoMoreRansom: https://www.nomoreransom.org/
- VirusTotal
- Hybrid Analysis

**External Resources:**
- CISA Ransomware Guide: https://www.cisa.gov/stopransomware
- FBI IC3: https://www.ic3.gov/Home/Ransomware

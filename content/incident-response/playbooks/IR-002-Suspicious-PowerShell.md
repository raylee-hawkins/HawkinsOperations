# IR-002: Suspicious PowerShell Execution

**Severity:** High
**MITRE Techniques:** T1059.001, T1027
**Platforms:** Windows
**Detection:** Wazuh Rule 100101, PowerShell Event 4104
**Author:** HawkinsOps SOC

---

## 1. DETECTION

**Alert Name:** Suspicious PowerShell Command Execution
**Trigger:** PowerShell script contains suspicious keywords (DownloadString, IEX, Invoke-Expression, encoded commands)

**Indicators:**
- Log Source: Microsoft-Windows-PowerShell/Operational
- Event ID: 4104 (Script Block Logging)
- Wazuh Rule: 100101
- Keywords: DownloadString, IEX, WebClient, FromBase64String, -EncodedCommand

---

## 2. TRIAGE (5 minutes)

### Validation Steps:
- [ ] Review full PowerShell script block text
- [ ] Check if script is from legitimate automation/deployment
- [ ] Identify user and system executing PowerShell
- [ ] Look for parent process (what launched PowerShell)
- [ ] Check if encoded command - decode if base64

### Key Questions:
1. Is this from a known automation tool? (SCCM, Ansible, deployment script)
2. Does the user regularly run PowerShell scripts?
3. Is there a corresponding ServiceNow/change ticket?
4. Does decoded content show malicious intent?

### Decode Base64 Commands:
```powershell
# Extract encoded command from alert
$encodedCmd = "[Base64String]"
[System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String($encodedCmd))
```

---

## 3. INVESTIGATION (30 minutes)

### Commands:

```powershell
# Review PowerShell execution history
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-PowerShell/Operational';ID=4104} -MaxEvents 100 |
    Select-Object TimeCreated,@{N='ScriptBlock';E={$_.Properties[2].Value}} | Out-GridView

# Check PowerShell console history
Get-Content "$env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt"

# Review module loading
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-PowerShell/Operational';ID=4103} -MaxEvents 50

# Check for downloaded files
Get-ChildItem -Path C:\Users\*\Downloads,C:\Users\*\AppData\Local\Temp -Recurse -File |
    Where-Object {$_.LastWriteTime -gt (Get-Date).AddHours(-2)}

# Network connections from PowerShell
Get-NetTCPConnection | Where-Object {$_.OwningProcess -in (Get-Process powershell).Id}

# Check process tree
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=1} -MaxEvents 100 |
    Where-Object {$_.Properties[4].Value -like "*powershell*"} |
    Select-Object TimeCreated,@{N='CommandLine';E={$_.Properties[10].Value}}
```

### Artifacts to Collect:
- [ ] Full PowerShell script block text
- [ ] PowerShell console history file
- [ ] Downloaded files/payloads
- [ ] Network traffic from PowerShell process
- [ ] Parent process information
- [ ] Memory dump of PowerShell process

### Analysis:
1. **Command Purpose:** What was the script trying to do?
2. **C2 Communication:** Did it connect to external IPs?
3. **Payload:** Was additional malware downloaded/executed?
4. **Persistence:** Did it create scheduled tasks, registry run keys?
5. **Credential Access:** Did it attempt to dump credentials?

---

## 4. CONTAINMENT (15 minutes)

```powershell
# 1. Kill PowerShell processes
Get-Process powershell | Stop-Process -Force

# 2. Block C2 IP at firewall
# Document IP addresses from network connections

# 3. Isolate system
Disable-NetAdapter -Name "*" -Confirm:$false

# 4. Disable user account if compromised
Disable-ADAccount -Identity [username]

# 5. Remove downloaded payloads
Remove-Item -Path "C:\suspicious\file.exe" -Force
```

### Containment Checklist:
- [ ] All PowerShell processes terminated
- [ ] C2 IPs blocked at firewall
- [ ] System isolated
- [ ] Downloaded payloads secured/removed
- [ ] User account disabled if necessary

---

## 5. ERADICATION (30 minutes)

```powershell
# 1. Enable PowerShell Constrained Language Mode
$ExecutionContext.SessionState.LanguageMode = "ConstrainedLanguage"

# 2. Remove malicious scheduled tasks
Get-ScheduledTask | Where-Object {$_.Actions.Execute -like "*powershell*"}
Unregister-ScheduledTask -TaskName [MaliciousTask] -Confirm:$false

# 3. Clean registry run keys
Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name [MaliciousEntry]

# 4. Remove downloaded malware
# Based on investigation findings

# 5. Clear PowerShell history
Remove-Item "$env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt" -Force
```

### System Hardening:
- [ ] Deploy PowerShell v5 with enhanced logging
- [ ] Enable PowerShell Script Block Logging
- [ ] Enable PowerShell Transcription
- [ ] Deploy AppLocker/WDAC to restrict PowerShell
- [ ] Enable PowerShell Constrained Language Mode
- [ ] Remove PowerShell v2 if installed

---

## 6. RECOVERY

### Validation:
```powershell
# Verify PowerShell logging enabled
Get-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging"
Get-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\Transcription"

# Check constrained language mode
$ExecutionContext.SessionState.LanguageMode

# Verify no malicious scheduled tasks
Get-ScheduledTask | Where-Object {$_.State -eq "Ready"} | Select-Object TaskName,TaskPath,Actions
```

---

## 7. DOCUMENTATION

### Indicators of Compromise:
- **Script Hash:** [SHA256 of malicious script]
- **C2 IP:** [IP address contacted]
- **Domain:** [Malicious domain]
- **Downloaded File:** [Payload hash]
- **User Account:** [Compromised account]

---

## 8. LESSONS LEARNED

**Action Items:**
- [ ] Deploy Script Block Logging to all endpoints
- [ ] Enable PowerShell Transcription
- [ ] Implement application whitelisting
- [ ] Deploy constrained language mode via GPO
- [ ] Remove PowerShell v2
- [ ] Block PowerShell download cradles at proxy
- [ ] Monitor Event 4104 for suspicious keywords
- [ ] Security awareness training on phishing

**Detection Improvements:**
- [ ] Alert on base64 encoded PowerShell
- [ ] Alert on PowerShell network connections
- [ ] Baseline normal PowerShell usage
- [ ] Deploy behavior analytics

---

## MITRE ATT&CK MAPPING

**Techniques:**
- **T1059.001:** Command and Scripting Interpreter - PowerShell
- **T1027:** Obfuscated Files or Information
- **T1105:** Ingress Tool Transfer (if payload downloaded)

**Mitigation:**
- M1038: Execution Prevention (AppLocker)
- M1026: Privileged Account Management
- M1049: Antivirus/Antimalware

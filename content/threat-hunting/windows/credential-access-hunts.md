# Windows Credential Access Threat Hunts

## Hunt 1: LSASS Memory Dumps
**MITRE:** T1003.001
**Hypothesis:** Attackers may be dumping LSASS memory to extract credentials

**Query:**
```powershell
# Sysmon Event 10 - LSASS Access
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=10} |
    Where-Object {$_.Properties[4].Value -like '*lsass.exe'} |
    Select-Object TimeCreated,
        @{N='SourceProcess';E={$_.Properties[3].Value}},
        @{N='TargetProcess';E={$_.Properties[4].Value}},
        @{N='GrantedAccess';E={$_.Properties[8].Value}} |
    Where-Object {$_.GrantedAccess -match '0x1410|0x1010|0x1438'} |
    Sort-Object TimeCreated -Descending

# Check for .dmp files
Get-ChildItem -Path C:\Windows\Temp,C:\Users\*\AppData\Local\Temp -Include *.dmp -Recurse -ErrorAction SilentlyContinue |
    Select-Object FullName,CreationTime,Length
```

**Expected False Positives:** Legitimate security tools, Process Explorer
**Triage Steps:** Verify source process legitimacy; check for known security tools; review user context

---

## Hunt 2: SAM/SYSTEM Registry Exports
**MITRE:** T1003.002
**Hypothesis:** Attackers may export registry hives for offline credential extraction

**Query:**
```powershell
# Process creation with reg.exe save
Get-WinEvent -FilterHashtable @{LogName='Security';ID=4688} |
    Where-Object {$_.Properties[5].Value -like '*reg.exe*' -and $_.Properties[8].Value -like '*save*'} |
    Select-Object TimeCreated,
        @{N='Account';E={$_.Properties[1].Value}},
        @{N='Process';E={$_.Properties[5].Value}},
        @{N='CommandLine';E={$_.Properties[8].Value}}

# File creation in suspicious locations
Get-ChildItem -Path C:\Windows\Temp,C:\Users\*\Downloads -Include sam,system,security -Recurse -ErrorAction SilentlyContinue
```

**Expected False Positives:** System backups, authorized forensics
**Triage Steps:** Check if authorized backup; verify user is admin; review destination

---

## Hunt 3: Kerberoasting TGS Requests
**MITRE:** T1558.003
**Hypothesis:** Attackers may request multiple service tickets to crack offline

**Query:**
```powershell
# Event 4769 - Kerberos TGS requests with RC4
Get-WinEvent -FilterHashtable @{LogName='Security';ID=4769} -MaxEvents 1000 |
    Where-Object {$_.Properties[7].Value -eq '0x17'} |
    Group-Object @{E={$_.Properties[0].Value}} |
    Where-Object {$_.Count -gt 5} |
    Select-Object Name,Count |
    Sort-Object Count -Descending
```

**Expected False Positives:** Legacy applications, service accounts
**Triage Steps:** Check if account is service account; verify application compatibility; review request frequency

---

## Hunt 4: Suspicious Process Access to Credentials
**MITRE:** T1003
**Hypothesis:** Malware may access credential stores or password managers

**Query:**
```powershell
# File access to credential files
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=11} |
    Where-Object {$_.Properties[4].Value -match 'Credentials|Vault|Login Data|logins.json|key4.db'} |
    Select-Object TimeCreated,
        @{N='Process';E={$_.Properties[3].Value}},
        @{N='TargetFile';E={$_.Properties[4].Value}}
```

**Expected False Positives:** Browser operations, password managers, backup software
**Triage Steps:** Verify process is legitimate browser/password manager; check user context

---

## Hunt 5: NTDS.dit Extraction
**MITRE:** T1003.003
**Hypothesis:** Attackers may copy Active Directory database from domain controllers

**Query:**
```powershell
# Check for ntdsutil or ntds.dit access
Get-WinEvent -FilterHashtable @{LogName='Security';ID=4688} |
    Where-Object {$_.Properties[8].Value -like '*ntdsutil*' -or $_.Properties[8].Value -like '*ntds.dit*'} |
    Select-Object TimeCreated,@{N='Account';E={$_.Properties[1].Value}},@{N='CommandLine';E={$_.Properties[8].Value}}

# VSS shadow copies of NTDS
Get-WinEvent -FilterHashtable @{LogName='System'} |
    Where-Object {$_.Message -like '*shadow*' -and $_.Message -like '*NTDS*'}
```

**Expected False Positives:** AD maintenance, authorized backups
**Triage Steps:** Verify on domain controller; check if authorized backup; review account permissions

---

## Hunt 6: Credential Dumping Tools
**MITRE:** T1003
**Hypothesis:** Known credential dumping tools may be present

**Query:**
```powershell
# Search for known tool names
$tools = @('mimikatz','lazagne','pwdump','gsecdump','wce','procdump')
foreach ($tool in $tools) {
    Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=1} -MaxEvents 1000 |
        Where-Object {$_.Properties[4].Value -like "*$tool*"} |
        Select-Object TimeCreated,@{N='Image';E={$_.Properties[4].Value}},@{N='CommandLine';E={$_.Properties[10].Value}}
}

# File system search
Get-ChildItem -Path C:\ -Include mimikatz.exe,lazagne.exe,procdump*.exe -Recurse -ErrorAction SilentlyContinue
```

**Expected False Positives:** Authorized penetration testing
**Triage Steps:** Check for active pentest; verify authorization; review execution context

---

## Hunt 7: DCSync Activity
**MITRE:** T1003.006
**Hypothesis:** Non-DC systems may be performing directory replication

**Query:**
```powershell
# Event 4662 - Directory Service Replication
Get-WinEvent -FilterHashtable @{LogName='Security';ID=4662} |
    Where-Object {$_.Properties[7].Value -match '1131f6aa-9c07-11d1-f79f-00c04fc2dcd2|1131f6ad-9c07-11d1-f79f-00c04fc2dcd2'} |
    Select-Object TimeCreated,
        @{N='Account';E={$_.Properties[1].Value}},
        @{N='Object';E={$_.Properties[6].Value}},
        @{N='Properties';E={$_.Properties[7].Value}} |
    Where-Object {$_.Account -notmatch 'DC\d+\$|MSOL_'}
```

**Expected False Positives:** Azure AD Connect, legitimate DC replication
**Triage Steps:** Verify account is not Azure AD Connect; check if system is DC; review permissions

---

## Hunt 8: Cached Credential Access
**MITRE:** T1003.005
**Hypothesis:** Attackers may access cached domain credentials

**Query:**
```powershell
# Registry access to cached credentials
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=13} |
    Where-Object {$_.Properties[3].Value -like '*SECURITY\Cache*'} |
    Select-Object TimeCreated,@{N='Process';E={$_.Properties[2].Value}},@{N='TargetObject';E={$_.Properties[3].Value}}
```

**Expected False Positives:** Windows authentication services
**Triage Steps:** Verify process is system process; check user context

---

## Hunt 9: LSA Secrets Extraction
**MITRE:** T1003.004
**Hypothesis:** Attackers may extract LSA secrets for service account passwords

**Query:**
```powershell
# Registry access to LSA Secrets
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=13} |
    Where-Object {$_.Properties[3].Value -like '*SECURITY\Policy\Secrets*'} |
    Select-Object TimeCreated,@{N='Process';E={$_.Properties[2].Value}},@{N='TargetObject';E={$_.Properties[3].Value}}
```

**Expected False Positives:** System processes, security software
**Triage Steps:** Check process legitimacy; verify digital signature

---

## Hunt 10: Clipboard Credential Harvesting
**MITRE:** T1115
**Hypothesis:** Malware may monitor clipboard for passwords

**Query:**
```powershell
# PowerShell clipboard access
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-PowerShell/Operational';ID=4104} |
    Where-Object {$_.Properties[2].Value -like '*Get-Clipboard*' -or $_.Properties[2].Value -like '*Windows.Forms.Clipboard*'} |
    Select-Object TimeCreated,@{N='ScriptBlock';E={$_.Properties[2].Value}}
```

**Expected False Positives:** Legitimate clipboard utilities, user scripts
**Triage Steps:** Review full script context; check if authorized tool; verify user

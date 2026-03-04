# Windows Lateral Movement Threat Hunts

## Hunt 11: Suspicious RDP Connections
**MITRE:** T1021.001
**Hypothesis:** Attackers may use RDP for lateral movement

**Query:**
```powershell
# Event 4624 Logon Type 10 (RDP)
Get-WinEvent -FilterHashtable @{LogName='Security';ID=4624} |
    Where-Object {$_.Properties[8].Value -eq 10} |
    Group-Object @{E={$_.Properties[5].Value}} |
    Where-Object {$_.Count -gt 10} |
    Select-Object Name,Count,@{N='LastLogon';E={($_.Group | Sort-Object TimeCreated -Descending | Select-Object -First 1).TimeCreated}}

# Network connections on RDP port
Get-NetTCPConnection -State Established | Where-Object {$_.LocalPort -eq 3389 -or $_.RemotePort -eq 3389}
```

**Expected False Positives:** Help desk, legitimate admin access
**Triage Steps:** Verify source IP; check time of day; review account usage patterns

---

## Hunt 12: PsExec Usage
**MITRE:** T1021.002
**Hypothesis:** PsExec may be used for remote code execution

**Query:**
```powershell
# Service installation: PSEXESVC
Get-WinEvent -FilterHashtable @{LogName='System';ID=7045} |
    Where-Object {$_.Properties[0].Value -eq 'PSEXESVC'} |
    Select-Object TimeCreated,MachineName,@{N='Account';E={$_.Properties[4].Value}}

# Named pipe creation for PsExec
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=17} |
    Where-Object {$_.Properties[2].Value -like '*\psexec*'} |
    Select-Object TimeCreated,@{N='Image';E={$_.Properties[1].Value}},@{N='PipeName';E={$_.Properties[2].Value}}
```

**Expected False Positives:** Authorized admin tools, deployment software
**Triage Steps:** Verify admin authorization; check change management; review executed commands

---

## Hunt 13: WMI Lateral Movement
**MITRE:** T1047
**Hypothesis:** WMI may be abused for remote execution

**Query:**
```powershell
# Processes spawned by WMI
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=1} |
    Where-Object {$_.Properties[13].Value -like '*wmiprvse.exe'} |
    Select-Object TimeCreated,@{N='Image';E={$_.Properties[4].Value}},@{N='CommandLine';E={$_.Properties[10].Value}},@{N='ParentImage';E={$_.Properties[13].Value}}

# WMI event consumers (persistence)
Get-WMIObject -Namespace root\subscription -Class __EventFilter
Get-WMIObject -Namespace root\subscription -Class __EventConsumer
Get-WMIObject -Namespace root\subscription -Class __FilterToConsumerBinding
```

**Expected False Positives:** Management tools, monitoring software
**Triage Steps:** Check if from management server; verify executed command; review user context

---

## Hunt 14: SMB Admin Share Access
**MITRE:** T1021.002
**Hypothesis:** Admin shares may be accessed for file staging or execution

**Query:**
```powershell
# Event 5140 - Share access
Get-WinEvent -FilterHashtable @{LogName='Security';ID=5140} |
    Where-Object {$_.Properties[3].Value -match '\$'} |
    Group-Object @{E={$_.Properties[1].Value+$_.Properties[3].Value}} |
    Select-Object Name,Count |
    Sort-Object Count -Descending

# Files copied to admin shares
Get-WinEvent -FilterHashtable @{LogName='Security';ID=5145} |
    Where-Object {$_.Properties[2].Value -match '\$' -and $_.Properties[7].Value -match '\.exe|\.dll|\.ps1'} |
    Select-Object TimeCreated,@{N='Account';E={$_.Properties[1].Value}},@{N='Share';E={$_.Properties[2].Value}},@{N='File';E={$_.Properties[7].Value}}
```

**Expected False Positives:** Deployment tools, admin activities
**Triage Steps:** Verify admin user; check transferred files; review destination

---

## Hunt 15: Pass-the-Hash Indicators
**MITRE:** T1550.002
**Hypothesis:** Attackers may use stolen NTLM hashes for authentication

**Query:**
```powershell
# Logon Type 3 with NtLmSsp and empty workstation
Get-WinEvent -FilterHashtable @{LogName='Security';ID=4624} |
    Where-Object {
        $_.Properties[8].Value -eq 3 -and
        $_.Properties[9].Value -eq 'NtLmSsp' -and
        $_.Properties[11].Value -eq ''
    } |
    Select-Object TimeCreated,
        @{N='Account';E={$_.Properties[5].Value}},
        @{N='SourceIP';E={$_.Properties[18].Value}},
        @{N='LogonProcess';E={$_.Properties[9].Value}}
```

**Expected False Positives:** Some network authentications
**Triage Steps:** Check source IP; verify account is not service account; review logon pattern

---

## Hunt 16: DCOM Lateral Movement
**MITRE:** T1021.003
**Hypothesis:** DCOM objects may be abused for remote execution

**Query:**
```powershell
# DCOM execution indicators
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=1} |
    Where-Object {$_.Properties[10].Value -match 'MMC20.Application|ShellWindows|ShellBrowserWindow'} |
    Select-Object TimeCreated,@{N='Image';E={$_.Properties[4].Value}},@{N='CommandLine';E={$_.Properties[10].Value}}

# Svchost spawning unusual processes
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=1} |
    Where-Object {$_.Properties[13].Value -like '*svchost.exe' -and $_.Properties[14].Value -like '*-k DcomLaunch*'} |
    Select-Object TimeCreated,@{N='Image';E={$_.Properties[4].Value}},@{N='ParentCommandLine';E={$_.Properties[14].Value}}
```

**Expected False Positives:** Legitimate DCOM applications
**Triage Steps:** Verify DCOM application; check command legitimacy

---

## Hunt 17: Remote Service Creation
**MITRE:** T1543.003
**Hypothesis:** Services may be created remotely for persistence/execution

**Query:**
```powershell
# Service creation Event 7045
Get-WinEvent -FilterHashtable @{LogName='System';ID=7045} |
    Select-Object TimeCreated,
        @{N='ServiceName';E={$_.Properties[0].Value}},
        @{N='ImagePath';E={$_.Properties[1].Value}},
        @{N='ServiceType';E={$_.Properties[2].Value}},
        @{N='Account';E={$_.Properties[4].Value}} |
    Where-Object {$_.ImagePath -match 'cmd.exe|powershell.exe|\\Temp\\|\\Users\\Public\\'}
```

**Expected False Positives:** Software installations, updates
**Triage Steps:** Check service binary location; verify legitimacy; review installer

---

## Hunt 18: Windows Remote Management
**MITRE:** T1021.006
**Hypothesis:** WinRM may be used for remote command execution

**Query:**
```powershell
# WinRM activity
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-WinRM/Operational'} -MaxEvents 100 |
    Select-Object TimeCreated,Id,Message

# PowerShell remoting connections
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-PowerShell/Operational';ID=4103} |
    Where-Object {$_.Message -like '*WSMan*' -or $_.Message -like '*Remoting*'} |
    Select-Object TimeCreated,Message

# Network connections on WinRM ports
Get-NetTCPConnection | Where-Object {$_.LocalPort -eq 5985 -or $_.LocalPort -eq 5986 -or $_.RemotePort -eq 5985 -or $_.RemotePort -eq 5986}
```

**Expected False Positives:** Legitimate remote management, automation
**Triage Steps:** Verify admin activity; check executed commands; review source

---

## Hunt 19: Scheduled Task Remote Creation
**MITRE:** T1053.005
**Hypothesis:** Tasks may be created remotely for execution

**Query:**
```powershell
# Task creation with network source
Get-WinEvent -FilterHashtable @{LogName='Security';ID=4698} |
    Where-Object {$_.Properties[4].Value -notmatch 'localhost|[REDACTED_IP]'} |
    Select-Object TimeCreated,
        @{N='TaskName';E={$_.Properties[0].Value}},
        @{N='Account';E={$_.Properties[1].Value}},
        @{N='TaskContent';E={$_.Properties[2].Value}}
```

**Expected False Positives:** Deployment systems, management tools
**Triage Steps:** Check task action; verify source system; review task content

---

## Hunt 20: SSH Lateral Movement (if SSH installed)
**MITRE:** T1021.004
**Hypothesis:** SSH may be used for lateral movement in Windows environments

**Query:**
```powershell
# SSH connections (if OpenSSH installed)
Get-WinEvent -FilterHashtable @{LogName='OpenSSH/Operational'} -ErrorAction SilentlyContinue |
    Select-Object TimeCreated,Id,Message

# Network connections on SSH port
Get-NetTCPConnection | Where-Object {$_.LocalPort -eq 22 -or $_.RemotePort -eq 22}

# Process creation of ssh.exe
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=1} |
    Where-Object {$_.Properties[4].Value -like '*ssh.exe'} |
    Select-Object TimeCreated,@{N='CommandLine';E={$_.Properties[10].Value}}
```

**Expected False Positives:** Legitimate SSH usage in DevOps environments
**Triage Steps:** Verify authorized SSH usage; check destination; review user


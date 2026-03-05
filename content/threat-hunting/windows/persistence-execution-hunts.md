# Windows Persistence & Execution Threat Hunts

## Hunt 21: Suspicious PowerShell Execution
**MITRE:** T1059.001
```powershell
# Encoded PowerShell commands
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-PowerShell/Operational';ID=4104} |
    Where-Object {$_.Properties[2].Value -match '-e |-en |-enc |-encoded'} |
    Select-Object TimeCreated,@{N='ScriptBlock';E={$_.Properties[2].Value}}

# PowerShell download cradles
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-PowerShell/Operational';ID=4104} |
    Where-Object {$_.Properties[2].Value -match 'DownloadString|DownloadFile|WebClient|Invoke-Expression|IEX'} |
    Select-Object TimeCreated,@{N='ScriptBlock';E={$_.Properties[2].Value}}
```
**False Positives:** Deployment scripts, legitimate admin tools
**Triage:** Decode base64; check domain reputation; review full script context

## Hunt 22: Registry Persistence
**MITRE:** T1547.001
```powershell
# Run key modifications
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=13} |
    Where-Object {$_.Properties[3].Value -match 'CurrentVersion\\Run'} |
    Select-Object TimeCreated,@{N='Process';E={$_.Properties[2].Value}},@{N='TargetObject';E={$_.Properties[3].Value}},@{N='Details';E={$_.Properties[4].Value}}

# Unusual startup items
Get-ItemProperty -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run","HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" |
    Select-Object PSChildName,*
```
**False Positives:** Software installations
**Triage:** Check executable path and signature; verify publisher

## Hunt 23: Scheduled Task Persistence
**MITRE:** T1053.005
```powershell
# All scheduled tasks not from Microsoft
Get-ScheduledTask |
    Where-Object {$_.Author -notlike '*Microsoft*' -and $_.TaskPath -notlike '\Microsoft\*'} |
    Select-Object TaskName,TaskPath,Author,State,@{N='Action';E={$_.Actions.Execute}}

# Recently created tasks
Get-WinEvent -FilterHashtable @{LogName='Security';ID=4698} -MaxEvents 50 |
    Select-Object TimeCreated,@{N='TaskName';E={$_.Properties[0].Value}},@{N='TaskContent';E={$_.Properties[2].Value}}
```
**False Positives:** Legitimate scheduled jobs, backup software
**Triage:** Review task action; check creator account; verify timing

## Hunt 24: Service Persistence
**MITRE:** T1543.003
```powershell
# Services not from known publishers
Get-WmiObject Win32_Service |
    Where-Object {$_.PathName -notmatch 'C:\\Windows\\' -and $_.PathName -notmatch 'C:\\Program Files\\'} |
    Select-Object Name,DisplayName,PathName,StartMode,State,StartName

# Recently created services
Get-WinEvent -FilterHashtable @{LogName='System';ID=7045} -MaxEvents 50 |
    Select-Object TimeCreated,@{N='Service';E={$_.Properties[0].Value}},@{N='ImagePath';E={$_.Properties[1].Value}}
```
**False Positives:** Third-party software installations
**Triage:** Check service binary location; verify digital signature; review function

## Hunt 25: Startup Folder Persistence
**MITRE:** T1547.001
```powershell
# Files in startup folders
Get-ChildItem -Path "C:\Users\*\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup","C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup" -Recurse -File |
    Select-Object FullName,CreationTime,LastWriteTime,@{N='Hash';E={(Get-FileHash $_.FullName -Algorithm SHA256).Hash}}

# File creation in startup folders
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=11} |
    Where-Object {$_.Properties[4].Value -like '*\Startup\*'} |
    Select-Object TimeCreated,@{N='Process';E={$_.Properties[3].Value}},@{N='File';E={$_.Properties[4].Value}}
```
**False Positives:** User-added shortcuts
**Triage:** Check file type and purpose; verify user authorization

## Hunt 26: Office Macro Execution
**MITRE:** T1204.002
```powershell
# Office apps spawning suspicious processes
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=1} |
    Where-Object {$_.Properties[13].Value -match 'WINWORD.EXE|EXCEL.EXE|POWERPNT.EXE' -and $_.Properties[4].Value -match 'cmd.exe|powershell.exe|wscript.exe|cscript.exe|mshta.exe'} |
    Select-Object TimeCreated,@{N='Image';E={$_.Properties[4].Value}},@{N='ParentImage';E={$_.Properties[13].Value}},@{N='CommandLine';E={$_.Properties[10].Value}}
```
**False Positives:** Legitimate macros in trusted documents
**Triage:** Check document source; review macro code if accessible; verify user

## Hunt 27: DLL Hijacking/Side-Loading
**MITRE:** T1574.002
```powershell
# Unsigned DLL loads
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=7} |
    Where-Object {$_.Properties[5].Value -eq 'false'} |
    Select-Object TimeCreated,@{N='Image';E={$_.Properties[2].Value}},@{N='ImageLoaded';E={$_.Properties[3].Value}},@{N='Signed';E={$_.Properties[5].Value}}

# DLLs loaded from suspicious locations
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=7} |
    Where-Object {$_.Properties[3].Value -match '\\Users\\Public\\|\\Temp\\|\\AppData\\Local\\Temp\\'} |
    Select-Object TimeCreated,@{N='Image';E={$_.Properties[2].Value}},@{N='ImageLoaded';E={$_.Properties[3].Value}}
```
**False Positives:** Portable applications, development tools
**Triage:** Check DLL purpose; verify if application is legitimate; review load location

## Hunt 28: BITS Persistence
**MITRE:** T1197
```powershell
# BITS jobs
Get-BitsTransfer -AllUsers | Select-Object DisplayName,TransferType,JobState,FileList,CreationTime

# BITS activity in event logs
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Bits-Client/Operational';ID=59} -MaxEvents 50 |
    Select-Object TimeCreated,@{N='File';E={$_.Properties[0].Value}},@{N='URL';E={$_.Properties[1].Value}}
```
**False Positives:** Windows Update, legitimate downloads
**Triage:** Check download URL; verify destination file; review file reputation

## Hunt 29: WMI Event Subscription
**MITRE:** T1546.003
```powershell
# WMI event consumers
Get-WMIObject -Namespace root\subscription -Class __EventFilter | Select-Object Name,Query,__PATH
Get-WMIObject -Namespace root\subscription -Class __EventConsumer | Select-Object Name,__PATH
Get-WMIObject -Namespace root\subscription -Class __FilterToConsumerBinding | Select-Object Filter,Consumer

# Sysmon WMI events
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=19,20,21} |
    Select-Object TimeCreated,Id,@{N='EventType';E={$_.Properties[0].Value}},@{N='Operation';E={$_.Properties[1].Value}}
```
**False Positives:** Management tools, monitoring software
**Triage:** Review consumer action; check filter query; verify legitimacy

## Hunt 30: Accessibility Features Persistence
**MITRE:** T1546.008
```powershell
# Debugger set for accessibility apps
$AccessibilityApps = @('sethc.exe','utilman.exe','osk.exe','narrator.exe','magnify.exe','displayswitch.exe')
foreach ($app in $AccessibilityApps) {
    Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\$app" -ErrorAction SilentlyContinue |
        Select-Object @{N='App';E={$app}},Debugger
}

# Check if accessibility binaries have been replaced
foreach ($app in $AccessibilityApps) {
    Get-Item "C:\Windows\System32\$app" | Select-Object Name,LastWriteTime,@{N='Hash';E={(Get-FileHash $_.FullName -Algorithm SHA256).Hash}}
}
```
**False Positives:** Rare, likely malicious if found
**Triage:** Immediate investigation if detected; check file hash against known good


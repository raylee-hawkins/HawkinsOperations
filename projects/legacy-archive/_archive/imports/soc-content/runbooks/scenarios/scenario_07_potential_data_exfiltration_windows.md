# Scenario 07: Potential Data Exfiltration - Windows

## Environment Context
- **Primary Detection**: Wazuh SIEM, pfSense traffic monitoring, Windows auditing
- **Affected System**: Windows Powerhouse endpoint
- **HawkinsOps Components Involved**:
  - Windows endpoint
  - Wazuh server (FIM, event correlation)
  - pfSense (network monitoring, traffic analysis)
  - PRIMARY_OS (investigation workstation)

## Detection

### Detection Indicators

**Network-Based:**
- Large outbound data transfers (GB-scale)
- Uploads to cloud storage (Dropbox, Google Drive, personal OneDrive)
- Transfers to external IPs during off-hours
- Use of encrypted channels (SSH, VPN, Tor)
- Data transfer to USB/removable media then immediate external connection

**Host-Based:**
- Wazuh File Integrity Monitoring alerts (sensitive directories)
- Unusual file access patterns (Event ID 4663)
- Compression/archiving of sensitive files
- Staging files in unusual locations (temp folders)
- USB device usage (Event IDs 6416, 20001, 20003)

**Behavioral:**
- User accessing files outside normal scope
- Mass file copy operations
- Email with large attachments to personal accounts
- Screenshot tools usage
- Print screen or document printing spike

### Wazuh Alert Details
- **Rule ID**: 554 (File Integrity Monitoring)
- **Rule ID**: Custom rules for large file access/transfer
- **Event Source**: Windows Security Log, Wazuh FIM, Sysmon

### Windows Event IDs
- **4663**: Object access (file/folder access)
- **5140**: Network share accessed
- **4656/4658**: Handle to object requested/closed
- **4670**: Permissions on object changed
- **6416**: USB device recognized
- **4688**: Process creation (archive tools, file transfer utilities)

## Triage Steps

1. **Review Initial Alert Details**
   - Alert type: FIM, network traffic, event correlation?
   - Affected files/directories
   - User account involved
   - Timestamp and duration
   - Destination (if network transfer)

2. **Analyze File Access Patterns**
   ```powershell
   # On Windows endpoint:
   # Review object access events for sensitive files:
   Get-WinEvent -FilterHashtable @{LogName='Security';ID=4663} -MaxEvents 500 |
     Where-Object {$_.Properties[6].Value -like '*\Sensitive\*' -or
                   $_.Properties[6].Value -like '*\Documents\*'} |
     Select-Object TimeCreated,
     @{Name='User';Expression={$_.Properties[1].Value}},
     @{Name='ObjectName';Expression={$_.Properties[6].Value}},
     @{Name='AccessMask';Expression={$_.Properties[9].Value}} |
     Sort-Object TimeCreated -Descending | Format-Table

   # Check for mass file operations:
   Get-WinEvent -FilterHashtable @{LogName='Security';ID=4663} |
     Group-Object @{Expression={$_.Properties[1].Value}} |
     Where-Object {$_.Count -gt 50} |
     Select-Object Count, Name
   ```

3. **Identify Archive/Compression Activity**
   ```powershell
   # Check for 7zip, WinRAR, built-in compression:
   Get-WinEvent -FilterHashtable @{LogName='Security';ID=4688} |
     Where-Object {$_.Properties[5].Value -like '*7z.exe*' -or
                   $_.Properties[5].Value -like '*winrar.exe*' -or
                   $_.Properties[5].Value -like '*compress*' -or
                   $_.Properties[5].Value -like '*tar.exe*'} |
     Select-Object TimeCreated, @{Name='CommandLine';Expression={$_.Properties[8].Value}}

   # Check for recently created archives:
   Get-ChildItem -Path C:\ -Include *.zip,*.7z,*.rar,*.tar -Recurse -ErrorAction SilentlyContinue |
     Where-Object {$_.CreationTime -gt (Get-Date).AddDays(-1)} |
     Select-Object FullName, CreationTime, Length
   ```

4. **Check Network Share Access**
   ```powershell
   # Network shares accessed:
   Get-WinEvent -FilterHashtable @{LogName='Security';ID=5140} -MaxEvents 100 |
     Select-Object TimeCreated,
     @{Name='User';Expression={$_.Properties[1].Value}},
     @{Name='ShareName';Expression={$_.Properties[3].Value}},
     @{Name='SourceIP';Expression={$_.Properties[5].Value}}
   ```

5. **Investigate USB/Removable Media Usage**
   ```powershell
   # USB device connections (Event ID 6416):
   Get-WinEvent -FilterHashtable @{LogName='Security';ID=6416} |
     Select-Object TimeCreated, Message

   # Or check System log for USB events:
   Get-WinEvent -FilterHashtable @{LogName='System';ProviderName='Microsoft-Windows-DriverFrameworks-UserMode'} |
     Where-Object {$_.Message -like '*USB*'} |
     Select-Object TimeCreated, Message

   # Files written to removable media:
   Get-WinEvent -FilterHashtable @{LogName='Security';ID=4663} |
     Where-Object {$_.Properties[6].Value -like '*\E:\*' -or
                   $_.Properties[6].Value -like '*\F:\*'} |
     Select-Object TimeCreated, @{Name='File';Expression={$_.Properties[6].Value}}
   ```

6. **Check Cloud Storage Usage**
   ```powershell
   # Look for Dropbox, OneDrive, Google Drive processes:
   Get-Process | Where-Object {$_.ProcessName -match 'Dropbox|OneDrive|GoogleDrive'}

   # Check for cloud sync directories:
   Get-ChildItem -Path C:\Users\*\Dropbox,C:\Users\*\OneDrive,C:\Users\*\Google* -ErrorAction SilentlyContinue

   # Network connections to cloud providers:
   Get-NetTCPConnection -State Established |
     Where-Object {$_.RemoteAddress -ne '[REDACTED_IP]'} |
     Select-Object LocalPort, RemoteAddress, RemotePort, OwningProcess,
     @{Name='ProcessName';Expression={(Get-Process -Id $_.OwningProcess).Name}}

   # Check Sysmon network events for cloud IPs:
   Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=3} |
     Where-Object {$_.Properties[14].Value -match 'dropbox|onedrive|drive.google'} |
     Select-Object TimeCreated, @{Name='DestIP';Expression={$_.Properties[14].Value}}
   ```

7. **Analyze pfSense Firewall Logs**
   ```
   Status → System Logs → Firewall
   Filter by source IP (Windows endpoint)
   Look for:
   - Large outbound transfers
   - Connections to cloud storage IPs
   - FTP, SFTP, SCP connections
   - Unusual protocols (non-standard ports)
   ```

8. **Check Email Activity** (if access available)
   ```powershell
   # Check for Outlook process with large attachments:
   Get-Process outlook

   # Review sent items folder (requires mailbox access):
   # Check for emails with large attachments sent to personal addresses

   # Check Sysmon for email-related network connections:
   Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational';ID=3} |
     Where-Object {$_.Properties[16].Value -in @(25,465,587,993,995)} |
     Select-Object TimeCreated, @{Name='Process';Expression={$_.Properties[4].Value}},
     @{Name='DestIP';Expression={$_.Properties[14].Value}},
     @{Name='DestPort';Expression={$_.Properties[16].Value}}
   ```

9. **Review User Account Activity**
   ```powershell
   # Recent logons:
   Get-WinEvent -FilterHashtable @{LogName='Security';ID=4624} |
     Where-Object {$_.Properties[5].Value -eq '<username>'} |
     Select-Object TimeCreated, @{Name='LogonType';Expression={$_.Properties[8].Value}},
     @{Name='SourceIP';Expression={$_.Properties[18].Value}}

   # Verify user's typical data access patterns match current activity
   ```

## Investigation Checklist

- [ ] Data access outside user's normal job function?
- [ ] Activity during off-hours or unusual timing?
- [ ] Large volume of files accessed in short time?
- [ ] Files compressed/archived before transfer?
- [ ] Data transferred to personal cloud accounts?
- [ ] USB devices used during timeframe?
- [ ] User recently gave notice or showed signs of discontent?
- [ ] Sensitive/classified data involved?
- [ ] Email to personal accounts with attachments?
- [ ] Screenshots or document printing activity?
- [ ] Data wiped/deleted after transfer?
- [ ] Encryption tools used on files?
- [ ] User acknowledges and has authorization for activity?

## Containment Actions

### IMMEDIATE ACTIONS (If Active Exfiltration):

1. **Preserve Evidence** - Do NOT tip off user before capturing evidence
   - Take screenshots, export logs before user is alerted
   - Engage legal/HR as appropriate

2. **Network Isolation** (if exfiltration in progress)
   ```powershell
   # Disable network adapter:
   Disable-NetAdapter -Name "Ethernet" -Confirm:$false

   # Or at pfSense, block user's IP temporarily
   ```

3. **Block Cloud Storage at pfSense**
   ```
   Firewall → Aliases → Create cloud_storage alias with IPs/domains
   Firewall → Rules → Add block rule for cloud storage
   ```

4. **Kill File Transfer Processes**
   ```powershell
   # Stop suspicious transfers:
   Stop-Process -Name "Dropbox","OneDrive","FileZilla" -Force -ErrorAction SilentlyContinue
   ```

5. **Disable USB Ports** (prevent local exfil)
   ```powershell
   # Via registry (requires reboot):
   Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\USBSTOR" -Name "Start" -Value 4

   # Or via Group Policy (if domain):
   # Computer Config → Admin Templates → System → Removable Storage Access
   ```

6. **Disable User Account** (after evidence preserved)
   ```powershell
   Disable-LocalUser -Name "<username>"
   # OR if domain: Disable-ADAccount -Identity "<username>"
   ```

7. **Revoke Session/Logoff User**
   ```powershell
   query user
   logoff <session_id>
   ```

### POST-CONTAINMENT:

1. **Attempt to Contact Recipient**
   - If data sent to third party, legal may need to request deletion
   - Document all communications

2. **Assess Damage**
   - What data was exfiltrated?
   - How sensitive?
   - Regulatory implications (PII, PHI, PCI, etc.)?

3. **Engage Stakeholders**
   - Management
   - Legal
   - HR (if insider threat)
   - Compliance (if regulated data)
   - Law enforcement (if criminal)

## Evidence to Capture

### CRITICAL - Preserve Before User Alert:

1. **Memory Dump** (if system still running)
   ```powershell
   # Full memory dump or process dumps of active file transfer tools
   ```

2. **File Access Logs**
   ```powershell
   # Export full Security log:
   wevtutil epl Security C:\Forensics\Security.evtx

   # Filter object access events:
   Get-WinEvent -FilterHashtable @{LogName='Security';ID=4663} |
     Where-Object {$_.Properties[1].Value -eq '<username>'} |
     Export-Csv C:\Forensics\file_access.csv
   ```

3. **Wazuh FIM Alerts**
   - Export all FIM alerts for affected directories
   - Wazuh agent logs from endpoint

4. **Network Traffic**
   ```powershell
   # Capture from pfSense:
   # Diagnostics → Packet Capture → Capture traffic from endpoint IP

   # Save pcap to: ~/HAWKINS_OPS/incidents/YYYY-MM-DD_data_exfil/network_capture.pcap
   ```

5. **USB Device History**
   ```powershell
   # Export USB device events:
   Get-WinEvent -FilterHashtable @{LogName='Security';ID=6416} |
     Export-Csv C:\Forensics\usb_devices.csv

   # USBDeview tool for detailed USB history (if available)
   ```

6. **File Listings**
   ```powershell
   # Snapshot of key directories (what's there, what's missing):
   Get-ChildItem -Path "C:\SensitiveData" -Recurse -File |
     Select-Object FullName, Length, CreationTime, LastAccessTime, LastWriteTime |
     Export-Csv C:\Forensics\sensitive_files_snapshot.csv
   ```

7. **Archive Files**
   ```powershell
   # Preserve any archive files created:
   Get-ChildItem -Path C:\ -Include *.zip,*.7z,*.rar -Recurse -ErrorAction SilentlyContinue |
     Where-Object {$_.CreationTime -gt (Get-Date).AddDays(-2)} |
     ForEach-Object {
       Copy-Item $_.FullName -Destination C:\Forensics\Archives\
     }
   ```

8. **Cloud Storage Logs**
   ```powershell
   # Dropbox, OneDrive, etc. local logs:
   # Locations vary, commonly in %APPDATA%
   Copy-Item $env:APPDATA\Dropbox\logs C:\Forensics\CloudLogs\Dropbox -Recurse -ErrorAction SilentlyContinue
   ```

9. **Email Evidence** (if applicable)
   - PST export of sent items
   - Email headers and attachment metadata

10. **User Profile Data**
    ```powershell
    # Browser history:
    Copy-Item "$env:APPDATA\Microsoft\Edge\User Data\Default\History" C:\Forensics\
    Copy-Item "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\History" C:\Forensics\

    # Recent documents:
    Copy-Item "$env:APPDATA\Microsoft\Windows\Recent" C:\Forensics\Recent -Recurse
    ```

11. **pfSense Traffic Logs**
    - Export firewall logs for endpoint IP
    - Traffic statistics (bandwidth usage)

12. **Screenshots/Photos**
    - Wazuh dashboard
    - File access timeline
    - Network transfer graphs

13. **Transfer to HawkinsOps Evidence Archive**
    ```bash
    # All evidence to:
    # ~/HAWKINS_OPS/incidents/YYYY-MM-DD_data_exfil_<username>/
    ```

## Closure & Lessons Learned

### Ticket Closure Steps:
1. Document scope of data exfiltration
2. Legal/HR actions documented
3. User account status (terminated/suspended)
4. Data recovery attempts logged
5. Regulatory notifications completed (if required)
6. Archive all evidence with chain-of-custody
7. Update DLP policies based on findings
8. Close Wazuh alert with comprehensive notes

### Hardening Recommendations:

**Technical Controls:**
- **Implement Data Loss Prevention (DLP)** solution
- **Enable detailed object access auditing** on sensitive directories:
  ```powershell
  # Configure SACL on sensitive folders:
  # Advanced Security → Auditing → Add → Everyone → Success/Fail for ReadData, WriteData
  ```
- **Deploy endpoint DLP agent** to monitor file operations
- **Block personal cloud storage** at pfSense (pfBlockerNG)
- **Disable USB ports** via Group Policy for non-privileged users
- **Implement device control** - whitelist approved USB devices only
- **Email DLP scanning** - block large attachments to personal emails
- **Network monitoring** for large outbound transfers:
  - Wazuh custom rules for bandwidth thresholds
  - pfSense traffic shaping/alerts
- **Deploy CASB** (Cloud Access Security Broker) if cloud use permitted
- **File encryption** for sensitive data at rest
- **Watermarking** for sensitive documents
- **Print auditing and restrictions**

**Policy & Procedure:**
- **Acceptable Use Policy** - clearly define data handling
- **Offboarding procedure** - disable access before final day
- **Least privilege** - access only to data needed for job
- **Regular access reviews** - quarterly recertification
- **Insider threat program** - behavioral analytics, HR integration
- **Exit interviews** - remind of confidentiality obligations
- **Legal agreements** - NDAs, non-competes, IP assignments

**Detection & Monitoring:**
- **User behavior analytics (UBA)** - baseline normal, detect anomalies
- **Wazuh correlation rules** for exfiltration patterns:
  - Large file access + network transfer
  - USB insertion + file copy + email
  - Off-hours data access
- **Alert on staging activity** (compression, temp folder usage)
- **Monitor privileged user actions** more closely

### Portfolio Notes:
- Demonstrates understanding of insider threat detection
- Shows data-centric security approach (protecting data, not just perimeter)
- Highlights forensic evidence preservation
- Emphasizes legal/compliance considerations
- Understanding of DLP concepts and controls
- Shows ability to balance security with user productivity


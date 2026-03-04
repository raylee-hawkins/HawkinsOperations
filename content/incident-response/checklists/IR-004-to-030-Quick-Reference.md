# IR Quick Reference Playbooks (IR-004 through IR-030)

## IR-004: Mimikatz/Credential Dumping Tool
**MITRE:** T1003 | **Severity:** Critical
- **Detection:** Process name matches mimikatz.exe, lazagne.exe, procdump.exe; CommandLine contains sekurlsa::, lsadump::
- **Triage:** Verify tool is not authorized pentest; check user context; look for .dmp files
- **Investigate:** Review process execution history; check for lateral movement; identify initial access
- **Contain:** Kill process; isolate system; disable user account; collect memory dump
- **Eradicate:** Remove tool; reset all privileged passwords; remove persistence
- **Recover:** Scan for backdoors; monitor for credential reuse

## IR-005: Pass-the-Hash Attack
**MITRE:** T1550.002 | **Severity:** High
- **Detection:** Logon Type 3, NtLmSsp, empty WorkstationName; Event 4624 with suspicious source
- **Triage:** Check if legitimate admin activity; review source IP; correlate with other alerts
- **Investigate:** Identify compromised hash; check lateral movement path; review all sessions
- **Contain:** Disable affected accounts; reset passwords; block source IP; isolate systems
- **Eradicate:** Reset krbtgt password (twice); force re-authentication; clear cached credentials
- **Recover:** Implement Credential Guard; deploy tiered admin model; enable PAW

## IR-006: Kerberoasting Attack
**MITRE:** T1558.003 | **Severity:** Medium
- **Detection:** Event 4769, TicketEncryptionType 0x17 (RC4), multiple TGS requests
- **Triage:** Check if service account; verify user is legitimate; count ticket requests
- **Investigate:** Identify targeted SPNs; check account permissions; review PowerShell logs
- **Contain:** Disable suspicious account; monitor for password spraying
- **Eradicate:** Rotate service account passwords; use complex passwords (25+ chars)
- **Recover:** Implement managed service accounts (gMSA); enable AES encryption

## IR-007: DCSync Attack Detected
**MITRE:** T1003.006 | **Severity:** Critical
- **Detection:** Event 4662 with DS-Replication-Get-Changes properties
- **Triage:** Verify not legitimate DC or Azure AD Connect; check user permissions
- **Investigate:** Identify account used; check for previous privilege escalation; review domain admin changes
- **Contain:** Disable account immediately; isolate system; block replication traffic
- **Eradicate:** Reset all domain passwords; reset krbtgt twice; remove unauthorized permissions
- **Recover:** Audit replication permissions; implement privileged access management

## IR-008: Malicious Macro Execution
**MITRE:** T1204.002 | **Severity:** High
- **Detection:** Office app spawning cmd.exe, powershell.exe, wscript.exe
- **Triage:** Check if expected macro-enabled document; verify sender; check document source
- **Investigate:** Analyze macro code; check for downloaded payloads; review network connections
- **Contain:** Kill spawned processes; delete malicious document; isolate system
- **Eradicate:** Remove downloaded malware; clear temp files; scan with AV
- **Recover:** Block macros via GPO; deploy ASR rules; user training

## IR-009: MSHTA/Regsvr32 Abuse
**MITRE:** T1218.005, T1218.010 | **Severity:** High
- **Detection:** mshta.exe or regsvr32.exe with http://, javascript:, scrobj.dll in CommandLine
- **Triage:** Check if legitimate application installer; review parent process
- **Investigate:** Decode JavaScript/VBScript; identify C2 server; check for payload
- **Contain:** Kill process; block C2 IP; isolate system
- **Eradicate:** Remove malware; delete malicious files; clear run keys
- **Recover:** Deploy AppLocker rules; block mshta.exe via firewall

## IR-010: Suspicious Script Execution
**MITRE:** T1059.005 | **Severity:** Medium
- **Detection:** wscript.exe/cscript.exe executing .vbs, .js from suspicious locations
- **Triage:** Check script source; verify legitimacy; review user context
- **Investigate:** Analyze script content; check for obfuscation; identify purpose
- **Contain:** Terminate script; quarantine file; block IP if C2 present
- **Eradicate:** Remove script; check for persistence mechanisms
- **Recover:** Restrict script execution via GPO; deploy script logging

## IR-011: Unauthorized Scheduled Task
**MITRE:** T1053.005 | **Severity:** Medium
- **Detection:** Event 4698, suspicious task creation outside change window
- **Triage:** Verify task is not from legitimate software; check creator account
- **Investigate:** Review task actions; check triggered executable; identify creation method
- **Contain:** Disable task; prevent execution; isolate if malicious
- **Eradicate:** Delete task; remove associated files; check for other tasks
- **Recover:** Monitor task creation; restrict task scheduler permissions

## IR-012: Registry Run Key Modification
**MITRE:** T1547.001 | **Severity:** High
- **Detection:** Registry modification in CurrentVersion\Run, RunOnce keys
- **Triage:** Check if from software installation; verify executable path
- **Investigate:** Analyze executable; check VirusTotal; review process tree
- **Contain:** Remove registry entry; quarantine executable; isolate system
- **Eradicate:** Delete malware; scan system; check other registry persistence
- **Recover:** Monitor registry changes; deploy Sysmon; educate users

## IR-013: New Service Installation
**MITRE:** T1543.003 | **Severity:** Medium
- **Detection:** Event 7045, new service outside maintenance window
- **Triage:** Verify service is legitimate; check service executable path
- **Investigate:** Analyze service binary; check for network connections; review installation method
- **Contain:** Stop service; disable service; quarantine binary
- **Eradicate:** Delete service; remove binary; check for related artifacts
- **Recover:** Restrict service creation; monitor service changes

## IR-014: WMI Persistence
**MITRE:** T1546.003 | **Severity:** High
- **Detection:** WMI Event Consumer/Filter creation, Sysmon Event 19/20/21
- **Triage:** Verify not from monitoring tool; check consumer action
- **Investigate:** Export WMI subscription; analyze payload; identify creator
- **Contain:** Remove WMI subscription; kill payload process
- **Eradicate:** Delete malicious WMI objects; remove payloads
- **Recover:** Monitor WMI namespaces; deploy WMI auditing

## IR-015: Suspicious RDP Activity
**MITRE:** T1021.001 | **Severity:** Medium
- **Detection:** Event 4624 LogonType 10, unusual source IP or time
- **Triage:** Verify user legitimacy; check source location; review timing
- **Investigate:** Review RDP session actions; check for lateral movement; analyze commands
- **Contain:** Disconnect session; disable account if unauthorized; block source IP
- **Eradicate:** Remove any installed tools; reset password
- **Recover:** Implement MFA for RDP; use RD Gateway; restrict RDP access

## IR-016: PsExec Lateral Movement
**MITRE:** T1021.002 | **Severity:** Medium
- **Detection:** PSEXESVC service installation, Event 7045
- **Triage:** Verify authorized admin activity; check user and target system
- **Investigate:** Identify what was executed via PsExec; check for credential access
- **Contain:** Stop PSEXESVC service; isolate systems; disable accounts
- **Eradication:** Remove PsExec tools; reset credentials; check for persistence
- **Recover:** Restrict admin tool usage; deploy privileged access workstations

## IR-017: WMI Remote Execution
**MITRE:** T1047 | **Severity:** Medium
- **Detection:** Process with ParentImage wmiprvse.exe from unusual location
- **Triage:** Check if authorized management; verify target system
- **Investigate:** Identify executed command; check WMI event logs; review source
- **Contain:** Terminate malicious process; block WMI if attack continues
- **Eradicate:** Remove malware; check for persistence
- **Recover:** Restrict WMI access; monitor WMI activity; implement network segmentation

## IR-018: SMB/Admin Share Abuse
**MITRE:** T1021.002 | **Severity:** Medium
- **Detection:** Event 5140, access to C$, ADMIN$, IPC$ shares
- **Triage:** Verify authorized admin; check transferred files
- **Investigate:** Identify copied files; check source account; review timeline
- **Contain:** Disconnect share session; disable account if malicious
- **Eradicate:** Remove unauthorized files; reset passwords
- **Recover:** Restrict admin share access; deploy file integrity monitoring

## IR-019: Event Log Clearing
**MITRE:** T1070.001 | **Severity:** High
- **Detection:** Event 1102, audit log cleared
- **Triage:** Immediate escalation; document clearing time; identify account
- **Investigate:** Check for backup logs; review SIEM; identify other anti-forensics
- **Contain:** Isolate system; preserve remaining evidence
- **Eradicate:** Identify and remove attacker access
- **Recover:** Centralize logging; protect audit logs; implement log forwarding

## IR-020: Security Software Disabled
**MITRE:** T1562.001 | **Severity:** High
- **Detection:** Windows Defender disabled, registry modification, service stopped
- **Triage:** Check if authorized maintenance; verify user
- **Investigate:** Identify disabling method; check for malware execution after
- **Contain:** Re-enable security software; isolate system; full scan
- **Eradicate:** Remove malware that disabled protection
- **Recover:** Deploy tamper protection; restrict security software management

## IR-021: Process Injection Detected
**MITRE:** T1055 | **Severity:** High
- **Detection:** Sysmon Event 8, remote thread creation into unusual target
- **Triage:** Verify legitimate debugging; check source/target processes
- **Investigate:** Memory dump of target process; identify injected code; check for C2
- **Contain:** Kill both processes; isolate system
- **Eradicate:** Remove injector; scan for malware
- **Recover:** Deploy EDR; enable WDAC; monitor process hollowing

## IR-022: Suspicious Driver Load
**MITRE:** T1014 | **Severity:** Critical
- **Detection:** Sysmon Event 6, unsigned driver or unusual driver
- **Triage:** Check driver signature; verify driver source
- **Investigate:** Analyze driver; check for rootkit indicators; review kernel objects
- **Contain:** Block driver; isolate system; collect memory dump
- **Eradicate:** Remove driver; boot into Safe Mode if needed
- **Recover:** Enable driver signature enforcement; deploy application control

## IR-023: Data Destruction Activity
**MITRE:** T1485 | **Severity:** Critical
- **Detection:** Mass file deletion, del /s /q, cipher /w, format commands
- **Triage:** Immediate containment; assess scope; check backups
- **Investigate:** Identify destruction method; check for ransomware; review timeline
- **Contain:** Isolate system; stop deletion process; preserve remaining data
- **Eradicate:** Remove destruction tools; identify initial access
- **Recover:** Restore from backup; implement file screening; deploy DLP

## IR-024: Cryptocurrency Mining
**MITRE:** T1496 | **Severity:** High
- **Detection:** High CPU usage, processes with xmrig, stratum, mining pool connections
- **Triage:** Verify process legitimacy; check resource usage; identify miner type
- **Investigate:** Find installation method; check for persistence; identify C2/pool
- **Contain:** Kill mining process; block mining pool IPs
- **Eradicate:** Remove miner; delete persistence mechanisms
- **Recover:** Patch vulnerabilities; monitor CPU usage; block mining domains

## IR-025: DDoS Attack Response
**MITRE:** T1498 | **Severity:** High
- **Detection:** Massive traffic volume, SYN flood, UDP flood, application layer attack
- **Triage:** Identify attack type; assess impact; check bandwidth saturation
- **Investigate:** Analyze packet captures; identify source IPs; determine target
- **Contain:** Enable rate limiting; contact ISP; activate DDoS mitigation service
- **Eradicate:** Block source IPs/ASNs; filter malicious traffic
- **Recover:** Implement DDoS protection; use CDN; capacity planning

## IR-026: Phishing Email Response
**MITRE:** T1566 | **Severity:** High
- **Detection:** User report, malicious attachment/link identified
- **Triage:** Verify email is malicious; count recipients; check for execution
- **Investigate:** Analyze email headers; extract IOCs; check mail logs for delivery
- **Contain:** Quarantine email from all mailboxes; block sender; reset passwords if clicked
- **Eradicate:** Remove from all mailboxes; block domains/IPs
- **Recover:** User training; deploy email filtering; implement DMARC/SPF/DKIM

## IR-027: Web Application Exploit
**MITRE:** T1190 | **Severity:** High
- **Detection:** WAF alert, SQL injection, RCE attempt, unusual web traffic
- **Triage:** Verify not false positive; check if exploit successful; review logs
- **Investigate:** Analyze web logs; check for web shell; review database for injection
- **Contain:** Block source IP; take vulnerable app offline if needed
- **Eradicate:** Remove web shells; patch vulnerability; restore from clean backup
- **Recover:** Implement WAF rules; patch application; penetration testing

## IR-028: Brute Force Attack
**MITRE:** T1110 | **Severity:** Medium
- **Detection:** Multiple Event 4625 (failed logons), SSH failed attempts, VPN failures
- **Triage:** Count failed attempts; identify targeted accounts; check source IPs
- **Investigate:** Review authentication logs; check if any successful; analyze pattern
- **Contain:** Block source IPs; enable account lockout; monitor targeted accounts
- **Eradicate:** Reset passwords if compromised; remove any attacker access
- **Recover:** Implement MFA; use strong password policy; deploy fail2ban

## IR-029: Web Shell Detected
**MITRE:** T1505.003 | **Severity:** Critical
- **Detection:** Suspicious file in webroot (.aspx, .php), unusual web requests, POST to unknown files
- **Triage:** Verify file is web shell; check upload time; review web logs
- **Investigate:** Analyze web shell code; check for command execution; review access logs
- **Contain:** Delete web shell; block source IP; take site offline if needed
- **Eradication:** Remove all web shells; patch vulnerability; restore clean files
- **Recover:** Implement file integrity monitoring; deploy WAF; regular vulnerability scans

## IR-030: Data Exfiltration Detected
**MITRE:** T1041, T1048 | **Severity:** High
- **Detection:** Large outbound data transfer, connections to file sharing sites, DNS tunneling
- **Triage:** Verify legitimacy; check data volume; identify destination
- **Investigate:** Analyze transferred data; review network captures; identify exfil method
- **Contain:** Block destination IPs/domains; kill exfil process; isolate system
- **Eradication:** Remove exfil tools; check for C2 backdoors
- **Recover:** Implement DLP; monitor outbound traffic; encrypt sensitive data


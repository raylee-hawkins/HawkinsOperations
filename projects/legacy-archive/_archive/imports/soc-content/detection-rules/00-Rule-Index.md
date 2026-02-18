# HawkinsOps Detection Rule Library Index

> Archived historical import. This index is not canonical for current portfolio counts. Use `PROOF_PACK/VERIFIED_COUNTS.md`.

**Version:** 1.0
**Last Updated:** 2025-01-15
**Total Rules:** Historical snapshot (superseded)
**Author:** HawkinsOps SOC Team

---

## Table of Contents
- [Overview](#overview)
- [Rule Statistics](#rule-statistics)
- [Rule Index by MITRE Tactic](#rule-index-by-mitre-tactic)
- [Deployment Priority](#deployment-priority)
- [Platform Coverage](#platform-coverage)
- [Severity Distribution](#severity-distribution)

---

## Overview

This comprehensive detection rule library provides production-ready security detections across three formats:
- **Sigma Rules:** 104 platform-agnostic detection rules
- **Wazuh Rules:** 52 Wazuh XML custom rules
- **Splunk Queries:** 60+ SPL detection queries

All rules are mapped to the MITRE ATT&CK framework and include false positive guidance.

---

## Rule Statistics

| Format | Count | Coverage |
|--------|-------|----------|
| Sigma  | 104   | Multi-platform |
| Wazuh  | 52    | SIEM-ready |
| Splunk | 60+   | Enterprise SIEM |
| **Total** | **216+** | **All tactics** |

---

## Rule Index by MITRE Tactic

### Credential Access (T1003)
**Rules:** 10 Sigma | 7 Wazuh | 8 Splunk

| Rule Name | Platforms | Severity | MITRE Techniques | Wazuh ID | Splunk |
|-----------|-----------|----------|------------------|----------|--------|
| Suspicious LSASS Process Access | Windows | High | T1003.001 | 100001 | ✓ |
| LSASS Dump via Comsvcs.dll | Windows | Critical | T1003.001 | 100002 | ✓ |
| Credential Dumping Tools | Windows | Critical | T1003 | 100003 | ✓ |
| SAM Registry Hive Dump | Windows | High | T1003.002 | 100004 | ✓ |
| NTDS.dit Extraction | Windows | Critical | T1003.003 | 100007 | ✓ |
| Kerberoasting | Windows | Medium | T1558.003 | 100006 | ✓ |
| DCSync Attack | Windows | Critical | T1003.006 | 100005 | ✓ |
| Linux Password File Access | Linux | High | T1003.008 | - | - |
| Browser Credential Theft | Windows | High | T1555.003 | - | ✓ |
| PowerShell Credential Prompt | Windows | Medium | T1056.002 | - | - |
| SSH Private Key Access | Linux | Medium | T1552.004 | - | - |

### Persistence (T1547, T1053, T1543)
**Rules:** 11 Sigma | 6 Wazuh | 7 Splunk

| Rule Name | Platforms | Severity | MITRE Techniques | Wazuh ID | Splunk |
|-----------|-----------|----------|------------------|----------|--------|
| Scheduled Task Creation | Windows | Medium | T1053.005 | 100021 | ✓ |
| Registry Run Keys | Windows | High | T1547.001 | 100022 | ✓ |
| WMI Event Subscription | Windows | High | T1546.003 | 100024 | ✓ |
| New Service Creation | Windows | Medium | T1543.003 | 100023 | ✓ |
| Startup Folder Modification | Windows | Medium | T1547.001 | 100025 | ✓ |
| Linux Cron Persistence | Linux | Medium | T1053.003 | - | - |
| Linux Systemd Service | Linux | Medium | T1543.002 | - | - |
| Linux Shell Profile Mod | Linux | Low | T1546.004 | - | - |
| BITS Job Persistence | Windows | Medium | T1197 | - | ✓ |
| Office Add-ins | Windows | Medium | T1137 | - | ✓ |
| Screensaver Persistence | Windows | Medium | T1546.002 | - | - |

### Privilege Escalation (T1548, T1134)
**Rules:** 10 Sigma | 4 Wazuh | 6 Splunk

| Rule Name | Platforms | Severity | MITRE Techniques | Wazuh ID | Splunk |
|-----------|-----------|----------|------------------|----------|--------|
| UAC Bypass via Fodhelper | Windows | High | T1548.002 | 100041 | ✓ |
| UAC Bypass via Eventvwr | Windows | High | T1548.002 | 100042 | ✓ |
| Token Manipulation | Windows | Medium | T1134 | 100043 | ✓ |
| Sudo Abuse | Linux | Medium | T1548.003 | - | ✓ |
| SUID Binary Execution | Linux | Medium | T1548.001 | - | - |
| Named Pipe Impersonation | Windows | High | T1134.001 | - | ✓ |
| AlwaysInstallElevated | Windows | High | T1548.002 | 100044 | ✓ |
| Kernel Module Load | Linux | Medium | T1547.006 | - | - |
| Print Spooler Exploit | Windows | High | T1068 | - | - |
| RunAs Execution | Windows | Low | T1134 | - | - |

### Defense Evasion (T1070, T1562, T1055)
**Rules:** 10 Sigma | 7 Wazuh | 9 Splunk

| Rule Name | Platforms | Severity | MITRE Techniques | Wazuh ID | Splunk |
|-----------|-----------|----------|------------------|----------|--------|
| Clear Windows Event Logs | Windows | High | T1070.001 | 100061 | ✓ |
| Disable Windows Defender | Windows | High | T1562.001 | 100062 | ✓ |
| Timestomping | Windows | Medium | T1070.006 | - | ✓ |
| Linux Log Deletion | Linux | Medium | T1070.002 | - | ✓ |
| Process Injection | Windows | High | T1055 | 100063 | ✓ |
| Masquerading | Windows | Critical | T1036 | 100064 | ✓ |
| DLL Side-Loading | Windows | Medium | T1574.002 | - | ✓ |
| AMSI Bypass | Windows | Critical | T1562.001 | 100065 | ✓ |
| Disable Firewall | Windows | High | T1562.004 | 100066 | ✓ |
| Rootkit Behavior | Windows | Critical | T1014 | 100067 | - |

### Lateral Movement (T1021, T1550, T1570)
**Rules:** 10 Sigma | 5 Wazuh | 8 Splunk

| Rule Name | Platforms | Severity | MITRE Techniques | Wazuh ID | Splunk |
|-----------|-----------|----------|------------------|----------|--------|
| PsExec Execution | Windows | Medium | T1021.002 | 100081 | ✓ |
| RDP Logon | Windows | Low | T1021.001 | 100082 | ✓ |
| WMI Lateral Movement | Windows | Medium | T1047 | 100083 | ✓ |
| Windows Admin Shares | Windows | Low | T1021.002 | 100084 | ✓ |
| Pass-the-Hash | Windows | Medium | T1550.002 | 100085 | ✓ |
| DCOM Lateral Movement | Windows | Medium | T1021.003 | - | ✓ |
| SSH Lateral Movement | Linux | Low | T1021.004 | - | - |
| WinRM Execution | Windows | Low | T1021.006 | - | ✓ |
| Remote File Copy | Windows | Low | T1570 | - | ✓ |

### Execution (T1059, T1218, T1204)
**Rules:** 10 Sigma | 6 Wazuh | 8 Splunk

| Rule Name | Platforms | Severity | MITRE Techniques | Wazuh ID | Splunk |
|-----------|-----------|----------|------------------|----------|--------|
| Suspicious PowerShell | Windows | Medium | T1059.001 | 100101 | ✓ |
| Encoded PowerShell | Windows | Medium | T1027 | 100102 | ✓ |
| WScript/CScript Abuse | Windows | Medium | T1059.005 | 100103 | ✓ |
| MSHTA Execution | Windows | High | T1218.005 | 100104 | ✓ |
| CMD Suspicious Commands | Windows | High | T1059.003 | - | - |
| Regsvr32 Abuse | Windows | High | T1218.010 | 100105 | ✓ |
| Linux Bash Commands | Linux | Medium | T1059.004 | - | ✓ |
| Macro Execution | Windows | Medium | T1204.002 | 100106 | ✓ |
| Scheduled Task Execution | Windows | Low | T1053.005 | - | - |
| AT Command | Windows | Medium | T1053.002 | - | - |

### Discovery (T1018, T1033, T1082, T1087)
**Rules:** 10 Sigma | 4 Wazuh | 9 Splunk

| Rule Name | Platforms | Severity | MITRE Techniques | Wazuh ID | Splunk |
|-----------|-----------|----------|------------------|----------|--------|
| Network Reconnaissance | Windows | Low | T1018 | 100122 | ✓ |
| Whoami Execution | Windows | Low | T1033 | 100121 | ✓ |
| Process Enumeration | Windows | Low | T1057 | - | ✓ |
| System Information | Windows | Low | T1082 | 100123 | ✓ |
| Domain Trust Discovery | Windows | Medium | T1482 | - | ✓ |
| File/Directory Discovery | Windows | Low | T1083 | - | ✓ |
| Network Share Discovery | Windows | Low | T1135 | - | ✓ |
| Linux Network Discovery | Linux | Low | T1016 | - | ✓ |
| AD Enumeration | Windows | Low | T1087.002 | 100124 | ✓ |
| Cloud Service Enumeration | Windows | Low | T1580 | - | - |

### Collection (T1115, T1113, T1114, T1560)
**Rules:** 10 Sigma | 4 Wazuh | 5 Splunk

| Rule Name | Platforms | Severity | MITRE Techniques | Wazuh ID | Splunk |
|-----------|-----------|----------|------------------|----------|--------|
| Clipboard Capture | Windows | Medium | T1115 | 100136 | ✓ |
| Screen Capture | Windows | Medium | T1113 | 100137 | ✓ |
| Audio Capture | Windows | High | T1123 | - | - |
| Email Collection | Windows | Medium | T1114 | - | ✓ |
| Archive Collection | Windows | Low | T1560 | 100139 | ✓ |
| Data Staging | Windows | Low | T1074 | - | - |
| Keylogging | Windows | High | T1056.001 | 100138 | ✓ |
| Video Capture | Windows | Medium | T1125 | - | - |
| Linux History Access | Linux | Low | T1552.003 | - | - |
| Sensitive File Access | Windows | Low | T1005 | - | - |

### Exfiltration (T1567, T1048, T1041)
**Rules:** 10 Sigma | 3 Wazuh | 5 Splunk

| Rule Name | Platforms | Severity | MITRE Techniques | Wazuh ID | Splunk |
|-----------|-----------|----------|------------------|----------|--------|
| Exfil to Web Service | Windows | Low | T1567 | 100151 | ✓ |
| DNS Tunneling | Windows | Medium | T1048.003 | - | ✓ |
| FTP Exfiltration | Windows | Medium | T1048.003 | 100152 | ✓ |
| Exfil over C2 | Windows | Low | T1041 | - | - |
| Removable Media Exfil | Windows | Low | T1052.001 | - | ✓ |
| Email Exfiltration | Windows | Low | T1048.003 | 100153 | ✓ |
| SMB Exfiltration | Windows | Low | T1048.002 | - | - |
| Scheduled Transfer | Windows | Medium | T1029 | - | - |
| Linux SCP Exfil | Linux | Low | T1048.002 | - | - |
| Cloud Sync Abuse | Windows | Low | T1567.002 | - | - |

### Impact (T1486, T1490, T1485)
**Rules:** 13 Sigma | 7 Wazuh | 9 Splunk

| Rule Name | Platforms | Severity | MITRE Techniques | Wazuh ID | Splunk |
|-----------|-----------|----------|------------------|----------|--------|
| Ransomware Encryption | Windows | Critical | T1486 | 100166 | ✓ |
| Shadow Copy Deletion | Windows | High | T1490 | 100167 | ✓ |
| Service Stop | Windows | High | T1489 | 100169 | ✓ |
| Data Destruction | Windows | Medium | T1485 | 100170 | ✓ |
| Web Defacement | Windows | Medium | T1491.001 | - | - |
| Disk Wipe | Windows | High | T1561 | 100172 | ✓ |
| Boot Config Modification | Windows | High | T1490 | 100168 | ✓ |
| Network DoS | Windows | High | T1498 | - | - |
| Account Manipulation | Windows | Medium | T1531 | - | ✓ |
| Cryptocurrency Mining | Windows | High | T1496 | 100171 | ✓ |
| Linux Data Destruction | Linux | High | T1485 | - | ✓ |
| Firmware Corruption | Windows | Critical | T1495 | - | - |
| Database Destruction | Windows | Medium | T1485 | - | - |

---

## Deployment Priority

### Tier 1 - Critical (Deploy First)
- Ransomware Encryption (T1486)
- LSASS Memory Dumps (T1003.001)
- DCSync Attacks (T1003.006)
- Process Masquerading (T1036)
- AMSI Bypass (T1562.001)
- Credential Dumping Tools (T1003)
- Volume Shadow Deletion (T1490)

### Tier 2 - High Priority
- UAC Bypass Techniques (T1548.002)
- Event Log Clearing (T1070.001)
- Windows Defender Disable (T1562.001)
- Process Injection (T1055)
- Kerberoasting (T1558.003)
- MSHTA/Regsvr32 Abuse (T1218)

### Tier 3 - Medium Priority
- Persistence Mechanisms (T1547, T1053)
- Lateral Movement (T1021)
- PowerShell Abuse (T1059.001)
- Token Manipulation (T1134)

### Tier 4 - Baseline Monitoring
- Discovery Commands (T1082, T1033)
- Collection Activities (T1560)
- Low-severity enumeration

---

## Platform Coverage

| Platform | Sigma Rules | Wazuh Rules | Splunk Queries |
|----------|-------------|-------------|----------------|
| Windows  | 92          | 52          | 58             |
| Linux    | 12          | 0           | 3              |
| Multi-platform | 104  | 52          | 60+            |

---

## Severity Distribution

| Severity | Count | Percentage |
|----------|-------|------------|
| Critical | 12    | 11.5%      |
| High     | 35    | 33.7%      |
| Medium   | 38    | 36.5%      |
| Low      | 19    | 18.3%      |

---

## Using This Index

### Quick Search
1. Identify the MITRE tactic you want to detect
2. Find relevant rules in the tactic section
3. Check platform compatibility
4. Deploy according to priority tier

### Rule Deployment
- **Sigma Rules:** Convert using sigmac to your SIEM
- **Wazuh Rules:** Add to `/var/ossec/etc/rules/local_rules.xml`
- **Splunk:** Deploy via search heads or saved searches

### Maintenance
- Review false positives monthly
- Update rule logic based on environment
- Tune thresholds as needed
- Add new rules as threats evolve

---

**For detailed rule logic, see individual rule files in:**
- `/detection-rules/sigma/[tactic]/`
- `/detection-rules/wazuh/hawkinsops-custom-rules.xml`
- `/detection-rules/splunk/[category]_detections.spl`

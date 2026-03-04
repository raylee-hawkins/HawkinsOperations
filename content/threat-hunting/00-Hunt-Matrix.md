# HawkinsOps Threat Hunting Matrix

**Version:** 1.0
**Total Hunts:** 50
**Platforms:** Windows (30), Linux (20)
**Author:** Raylee Hawkins

---

## Hunt Index

### Windows Hunts

#### Credential Access (Hunts 1-10)
| Hunt # | Name | MITRE | Difficulty |
|--------|------|-------|------------|
| 1 | LSASS Memory Dumps | T1003.001 | Medium |
| 2 | SAM/SYSTEM Registry Exports | T1003.002 | Easy |
| 3 | Kerberoasting TGS Requests | T1558.003 | Medium |
| 4 | Suspicious Process Access to Credentials | T1003 | Medium |
| 5 | NTDS.dit Extraction | T1003.003 | Hard |
| 6 | Credential Dumping Tools | T1003 | Easy |
| 7 | DCSync Activity | T1003.006 | Hard |
| 8 | Cached Credential Access | T1003.005 | Medium |
| 9 | LSA Secrets Extraction | T1003.004 | Medium |
| 10 | Clipboard Credential Harvesting | T1115 | Easy |

#### Lateral Movement (Hunts 11-20)
| Hunt # | Name | MITRE | Difficulty |
|--------|------|-------|------------|
| 11 | Suspicious RDP Connections | T1021.001 | Easy |
| 12 | PsExec Usage | T1021.002 | Easy |
| 13 | WMI Lateral Movement | T1047 | Medium |
| 14 | SMB Admin Share Access | T1021.002 | Easy |
| 15 | Pass-the-Hash Indicators | T1550.002 | Hard |
| 16 | DCOM Lateral Movement | T1021.003 | Hard |
| 17 | Remote Service Creation | T1543.003 | Medium |
| 18 | Windows Remote Management | T1021.006 | Easy |
| 19 | Scheduled Task Remote Creation | T1053.005 | Medium |
| 20 | SSH Lateral Movement | T1021.004 | Easy |

#### Persistence & Execution (Hunts 21-30)
| Hunt # | Name | MITRE | Difficulty |
|--------|------|-------|------------|
| 21 | Suspicious PowerShell Execution | T1059.001 | Medium |
| 22 | Registry Persistence | T1547.001 | Easy |
| 23 | Scheduled Task Persistence | T1053.005 | Easy |
| 24 | Service Persistence | T1543.003 | Easy |
| 25 | Startup Folder Persistence | T1547.001 | Easy |
| 26 | Office Macro Execution | T1204.002 | Medium |
| 27 | DLL Hijacking/Side-Loading | T1574.002 | Hard |
| 28 | BITS Persistence | T1197 | Medium |
| 29 | WMI Event Subscription | T1546.003 | Hard |
| 30 | Accessibility Features Persistence | T1546.008 | Medium |

### Linux Hunts (Hunts 31-50)

#### Persistence & Execution
| Hunt # | Name | MITRE | Difficulty |
|--------|------|-------|------------|
| 31 | Suspicious Cron Jobs | T1053.003 | Easy |
| 32 | Unauthorized SSH Keys | T1098.004 | Easy |
| 33 | Suspicious User Accounts | T1136.001 | Easy |
| 34 | Suspicious Process Execution | T1059.004 | Medium |
| 35 | Persistence via Init Scripts | T1037.004 | Medium |
| 36 | Shell Profile Modifications | T1546.004 | Easy |
| 39 | Kernel Module Persistence | T1547.006 | Hard |
| 41 | Log Tampering | T1070.002 | Medium |
| 42 | LD_PRELOAD Hijacking | T1574.006 | Hard |
| 46 | Binary Replacement | T1036.003 | Hard |
| 47 | Command History Anomalies | T1552.003 | Easy |
| 48 | Rootkit Indicators | T1014 | Hard |

#### Detection & Discovery
| Hunt # | Name | MITRE | Difficulty |
|--------|------|-------|------------|
| 37 | Suspicious Network Connections | T1071 | Easy |
| 38 | Webshell Detection | T1505.003 | Medium |
| 40 | File Integrity Anomalies | T1036 | Medium |
| 43 | Packet Sniffing | T1040 | Medium |
| 44 | Docker/Container Escape | T1611 | Hard |
| 45 | SSH Tunneling | T1572 | Medium |
| 49 | Suspicious DNS Queries | T1071.004 | Medium |
| 50 | Data Exfiltration via HTTP/S | T1048.003 | Medium |

---

## Hunt Methodology

### 1. Hypothesis Development
- Based on threat intelligence
- Environmental context
- MITRE ATT&CK techniques
- Recent security events

### 2. Data Collection
- Identify required log sources
- Aggregate relevant data
- Ensure data quality and completeness
- Consider time windows

### 3. Query Execution
- Run hunt queries
- Document findings
- Iterate and refine
- Note false positives

### 4. Analysis
- Investigate anomalies
- Correlate across data sources
- Timeline analysis
- Attribution assessment

### 5. Reporting
- Document findings
- Provide evidence
- Recommend actions
- Update hunt queries

---

## Best Practices

### Before Hunting
- [ ] Understand normal baseline behavior
- [ ] Review recent threat intelligence
- [ ] Ensure log sources are available
- [ ] Prepare analysis tools
- [ ] Define success criteria

### During Hunting
- [ ] Document all queries executed
- [ ] Track false positives
- [ ] Maintain chain of custody
- [ ] Collaborate with team
- [ ] Take detailed notes

### After Hunting
- [ ] Document findings
- [ ] Create detection rules from findings
- [ ] Share IOCs with team
- [ ] Update runbooks
- [ ] Schedule follow-up hunts

---

## Hunt Cadence

| Hunt Type | Frequency | Priority |
|-----------|-----------|----------|
| Credential Access | Weekly | High |
| Lateral Movement | Weekly | High |
| Persistence | Bi-weekly | Medium |
| Execution | Bi-weekly | Medium |
| Linux Hunts | Bi-weekly | Medium-High |
| Ad-hoc (Intel-driven) | As needed | Variable |

---

## Tools Required

### Windows Hunting
- PowerShell
- Sysmon logs
- Windows Event Logs
- Sysinternals Suite
- SIEM access

### Linux Hunting
- Bash shell access
- Auditd logs
- System logs
- rkhunter/chkrootkit
- Network analysis tools

---

## Integration with SOC Workflow

1. **Scheduled Hunts:** Run according to cadence
2. **Intel-Driven Hunts:** Respond to new threat intel
3. **Incident-Triggered:** Hunt after confirmed incident
4. **Tool Testing:** Validate new detection rules

---

## Metrics

Track these metrics to measure hunting effectiveness:

- **Total hunts conducted**
- **Findings identified**
- **True positives vs. false positives**
- **Time to detect (TTD) improvement**
- **Detection rules created**
- **Incidents prevented**

---

## References

- MITRE ATT&CK: https://attack.mitre.org/
- ThreatHunter-Playbook: https://threathunterplaybook.com/
- Cyber Threat Hunting: https://www.threathunting.net/

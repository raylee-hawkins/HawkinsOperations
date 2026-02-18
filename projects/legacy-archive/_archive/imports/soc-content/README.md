# HawkinsOps SOC Content Library

> Archived historical import. Count claims in this document are legacy and superseded by `PROOF_PACK/VERIFIED_COUNTS.md`.

**Version:** 1.0
**Release Date:** 2025-01-15
**Author:** HawkinsOps Security Operations Center
**License:** Use for HawkinsOps and portfolio purposes

---

## Overview

Comprehensive security operations content library containing production-ready detection rules, incident response playbooks, and threat hunting queries for Security Operations Centers (SOC). This library supports Security+ and SOC L1 analyst workflows with MITRE ATT&CK alignment.

---

## Contents

### 📊 Detection Rules (historical snapshot)

#### **Sigma Rules** (104 rules)
- **Format:** Platform-agnostic YAML
- **Coverage:** All MITRE ATT&CK tactics
- **Location:** `/detection-rules/sigma/`
- **Platforms:** Windows, Linux

**Organization:**
```
sigma/
├── credential-access/    (10 rules)
├── persistence/          (11 rules)
├── privilege-escalation/ (10 rules)
├── defense-evasion/      (10 rules)
├── lateral-movement/     (10 rules)
├── execution/            (10 rules)
├── discovery/            (10 rules)
├── collection/           (10 rules)
├── exfiltration/         (10 rules)
└── impact/               (13 rules)
```

#### **Wazuh Rules** (52 rules)
- **Format:** XML
- **Rule IDs:** 100001-100200
- **Location:** `/detection-rules/wazuh/hawkinsops-custom-rules.xml`
- **Deployment:** Copy to `/var/ossec/etc/rules/local_rules.xml`

#### **Splunk SPL Queries** (60+ queries)
- **Format:** Splunk Search Processing Language
- **Location:** `/detection-rules/splunk/`
- **Files:**
  - `credential_access_detections.spl`
  - `persistence_detections.spl`
  - `privilege_escalation_detections.spl`
  - `defense_evasion_detections.spl`
  - `lateral_movement_detections.spl`
  - `execution_detections.spl`
  - `discovery_detections.spl`
  - `collection_exfiltration_impact.spl`

---

### 📖 Incident Response Playbooks (30 playbooks)

**Format:** Markdown
**Location:** `/incident-response/playbooks/`

**Featured Playbooks:**
- **IR-001:** Suspicious LSASS Process Access (Critical)
- **IR-002:** Suspicious PowerShell Execution (High)
- **IR-003:** Ransomware Detected (Critical)
- **IR-004-030:** Quick Reference (27 additional scenarios)

**Each playbook includes:**
1. Detection indicators
2. Triage procedures (5 min)
3. Investigation steps (30 min)
4. Containment actions (15 min)
5. Eradication procedures
6. Recovery steps
7. Documentation templates
8. MITRE ATT&CK mapping

**Response Time Goals:**
- Critical: Triage 5 min, Contain 15 min
- High: Triage 10 min, Contain 30 min
- Medium: Triage 15 min, Contain 1 hour

---

### 🔍 Threat Hunting Queries (50 hunts)

**Location:** `/threat-hunting/`

**Windows Hunts:** (30 queries)
- Credential Access (10 hunts)
- Lateral Movement (10 hunts)
- Persistence & Execution (10 hunts)

**Linux Hunts:** (20 queries)
- Persistence & Execution (12 hunts)
- Detection & Discovery (8 hunts)

**Hunt Cadence:**
- Credential Access: Weekly
- Lateral Movement: Weekly
- Persistence: Bi-weekly
- Linux Hunts: Bi-weekly

---

## Quick Start

### For SOC Analysts

1. **Detection:**
   - Alert fires in SIEM
   - Check `/detection-rules/00-Rule-Index.md` for context
   - Identify relevant playbook

2. **Response:**
   - Open playbook from `/incident-response/playbooks/`
   - Follow triage → investigation → containment steps
   - Document using provided templates

3. **Hunting:**
   - Review `/threat-hunting/00-Hunt-Matrix.md`
   - Select hunt based on intel or schedule
   - Execute queries, document findings

### For SIEM Engineers

1. **Sigma Rules:**
   ```bash
   # Convert to your SIEM format
   sigmac -t splunk detection-rules/sigma/credential-access/*.yml
   sigmac -t elasticsearch detection-rules/sigma/persistence/*.yml
   ```

2. **Wazuh Deployment:**
   ```bash
   # Copy rules file
   sudo cp detection-rules/wazuh/hawkinsops-custom-rules.xml /var/ossec/etc/rules/local_rules.xml

   # Restart Wazuh manager
   sudo systemctl restart wazuh-manager
   ```

3. **Splunk Deployment:**
   - Import SPL files as saved searches
   - Set appropriate alert triggers
   - Configure notification channels

---

## Directory Structure

```
hawkinsops-content/
├── README.md
├── detection-rules/
│   ├── 00-Rule-Index.md
│   ├── sigma/
│   │   ├── credential-access/
│   │   ├── persistence/
│   │   ├── privilege-escalation/
│   │   ├── defense-evasion/
│   │   ├── lateral-movement/
│   │   ├── execution/
│   │   ├── discovery/
│   │   ├── collection/
│   │   ├── exfiltration/
│   │   └── impact/
│   ├── wazuh/
│   │   └── hawkinsops-custom-rules.xml
│   └── splunk/
│       ├── credential_access_detections.spl
│       ├── persistence_detections.spl
│       ├── privilege_escalation_detections.spl
│       ├── defense_evasion_detections.spl
│       ├── lateral_movement_detections.spl
│       ├── execution_detections.spl
│       ├── discovery_detections.spl
│       └── collection_exfiltration_impact.spl
├── incident-response/
│   ├── 00-Playbook-Index.md
│   ├── IR-Template.md
│   └── playbooks/
│       ├── IR-001-LSASS-Access.md
│       ├── IR-002-Suspicious-PowerShell.md
│       ├── IR-003-Ransomware-Detected.md
│       └── IR-004-to-030-Quick-Reference.md
└── threat-hunting/
    ├── 00-Hunt-Matrix.md
    ├── windows/
    │   ├── credential-access-hunts.md
    │   ├── lateral-movement-hunts.md
    │   └── persistence-execution-hunts.md
    └── linux/
        └── linux-threat-hunts.md
```

---

## MITRE ATT&CK Coverage

| Tactic | Sigma Rules | Wazuh Rules | Splunk Queries | IR Playbooks |
|--------|-------------|-------------|----------------|--------------|
| Initial Access | 0 | 0 | 0 | 3 |
| Execution | 10 | 6 | 8 | 4 |
| Persistence | 11 | 6 | 7 | 5 |
| Privilege Escalation | 10 | 4 | 6 | 4 |
| Defense Evasion | 10 | 7 | 9 | 4 |
| Credential Access | 10 | 7 | 8 | 5 |
| Discovery | 10 | 4 | 9 | 0 |
| Lateral Movement | 10 | 5 | 8 | 4 |
| Collection | 10 | 4 | 5 | 1 |
| Exfiltration | 10 | 3 | 5 | 1 |
| Impact | 13 | 7 | 9 | 4 |

---

## Deployment Priority

### Tier 1 - Critical (Deploy First)
1. Ransomware Detection (T1486)
2. LSASS Memory Dumps (T1003.001)
3. DCSync Attacks (T1003.006)
4. Process Masquerading (T1036)
5. AMSI Bypass (T1562.001)

### Tier 2 - High Priority
1. UAC Bypass (T1548.002)
2. Event Log Clearing (T1070.001)
3. Windows Defender Disable (T1562.001)
4. Process Injection (T1055)
5. Kerberoasting (T1558.003)

### Tier 3 - Medium Priority
1. Persistence Mechanisms (T1547, T1053, T1543)
2. Lateral Movement (T1021)
3. PowerShell Abuse (T1059.001)

### Tier 4 - Baseline
1. Discovery Commands (T1082, T1033)
2. Collection Activities (T1560)

---

## Customization Guide

### Tuning False Positives

1. **Review Filters:**
   - Each rule includes false positive guidance
   - Adjust filters for your environment
   - Document customizations

2. **Baseline Normal Activity:**
   - Run threat hunts to understand normal
   - Whitelist expected behavior
   - Update filters accordingly

3. **Severity Adjustment:**
   - Modify severity based on risk
   - Consider business context
   - Document changes

### Adding New Rules

1. **Sigma Rules:**
   - Use existing rules as templates
   - Follow Sigma specification
   - Add to appropriate tactic folder
   - Update `00-Rule-Index.md`

2. **Playbooks:**
   - Use `IR-Template.md`
   - Follow 7-step structure
   - Add MITRE mapping
   - Update `00-Playbook-Index.md`

---

## Maintenance

### Regular Reviews
- **Monthly:** Review false positive rates
- **Quarterly:** Update rules based on new TTPs
- **Annually:** Comprehensive playbook testing
- **Continuous:** Incorporate lessons learned

### Version Control
- Track all changes in Git
- Document rule modifications
- Maintain changelog
- Archive deprecated rules

---

## Training & Certification Alignment

### Security+ (SY0-701)
- Incident response procedures
- Log analysis techniques
- Security monitoring
- Threat hunting basics

### SOC Analyst L1
- SIEM rule development
- Alert triage and investigation
- Incident documentation
- Threat intelligence application

---

## Support & Contributions

**Created by:** HawkinsOps SOC Team
**Purpose:** Portfolio demonstration & operational use
**Status:** Production-ready

### Recommended Tools
- **Sigma:** https://github.com/SigmaHQ/sigma
- **Wazuh:** https://wazuh.com/
- **Splunk:** https://www.splunk.com/
- **MITRE ATT&CK:** https://attack.mitre.org/

---

## Changelog

### Version 1.0 (2025-01-15)
- Initial release
- 104 Sigma rules
- 52 Wazuh rules
- 60+ Splunk queries
- 30 IR playbooks
- 50 threat hunting queries

---

## License & Usage

This content library is created for:
1. HawkinsOps SOC operations
2. Security+ certification preparation
3. Portfolio demonstration
4. Educational purposes

**Attribution:** HawkinsOps SOC Team
**Contact:** [Contact information for portfolio]

---

**Note:** This library contains production-ready security content. Customize for your specific environment before deployment. Always test in a non-production environment first.

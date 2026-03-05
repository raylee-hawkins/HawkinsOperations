# Sample Detection & Response Artifacts

This directory contains curated examples of detection rules and incident response content from the repository. These samples demonstrate technical proficiency across multiple platforms and security frameworks.

---

## Sigma Detection Rules

### `credential_dumping_tools.yml`
**Source:** `content/detection-rules/sigma/credential-access/credential_dumping_tools.yml`

**What it detects:** Credential dumping tools (Mimikatz, LaZagne, ProcDump)

**MITRE ATT&CK:** T1003.001 (OS Credential Dumping - LSASS Memory)

**Key Features:**
- Multiple detection methods (process name, command line, file hash)
- Uses Sigma's condition logic (`1 of selection_*`)
- Platform-agnostic YAML format (can convert to Splunk, Elastic, QRadar)
- Includes false positive documentation

**Why this matters:**
- Credential dumping is a critical post-exploitation technique
- Shows understanding of multi-criteria detection logic
- Demonstrates knowledge of attacker tools and their indicators

---

### `encoded_powershell.yml`
**Source:** `content/detection-rules/sigma/execution/encoded_powershell.yml`

**What it detects:** Base64-encoded PowerShell commands

**MITRE ATT&CK:** T1059.001 (PowerShell), T1027 (Obfuscated Files/Information)

**Key Features:**
- Detects all variations of PowerShell's `-EncodedCommand` parameter
- Medium severity (common technique but high false positive rate)
- Covers both execution and defense evasion tactics

**Why this matters:**
- Encoded PowerShell is used in 70%+ of modern attacks
- Shows understanding of command-line obfuscation techniques
- Balanced approach (not everything is critical severity)

---

## Splunk Detection Query

### `credential_access_detections.spl`
**Source:** `content/detection-rules/splunk/credential_access_detections.spl`

**What it detects:** Suspicious LSASS process access (Sysmon Event 10)

**MITRE ATT&CK:** T1003.001

**Key Features:**
- Filters specific GrantedAccess values used by credential dumpers
- Whitelists legitimate security tools (Defender, Task Manager)
- Aggregates by source image and counts occurrences
- Production-ready SPL syntax

**Why this matters:**
- Shows Splunk-specific optimization (regex, stats, filtering)
- Demonstrates understanding of Windows process access rights
- Includes operational considerations (whitelisting, aggregation)

**Technical Details:**
- GrantedAccess `0x1410`: PROCESS_VM_READ + PROCESS_QUERY_INFORMATION
- GrantedAccess `0x1438`: Common Mimikatz access pattern
- Event 10: Sysmon ProcessAccess event

---

## Wazuh Rule Module

### `wazuh-051-multiple-auth-failures.xml`
**Source:** `content/detection-rules/wazuh/rules/wazuh-051-multiple-auth-failures.xml`

**What it detects:** Multiple authentication failures (brute force attempts)

**MITRE ATT&CK:** T1110.001 (Brute Force - Password Guessing)

**Key Features:**
- Correlation rule (frequency=5, timeframe=300 seconds)
- Triggers on existing Wazuh rules 5503 (Windows) and 5710 (SSH)
- Level 10 (High severity)
- MITRE ATT&CK tags embedded in XML
- Extensive inline documentation

**Why this matters:**
- Shows production Wazuh deployment knowledge
- Demonstrates rule correlation and time-based detection
- Includes tuning guidance and false positive analysis
- Ready to deploy to `/var/ossec/etc/rules/`

**Technical Details:**
- `<if_matched_sid>5503,5710</if_matched_sid>`: Correlates on prior auth failures
- `frequency="5" timeframe="300"`: 5 failures in 5 minutes
- Rule ID 100051: Custom rule numbering (100000+ range)

---

## Incident Response Playbook

### `IR-001-LSASS-Access.md`
**Source:** `content/incident-response/playbooks/IR-001-LSASS-Access.md`

**Scenario:** Suspicious LSASS process access detected

**MITRE ATT&CK:** T1003.001

**What it demonstrates:**
- **Triage (5 min):** Fast decision-making with clear escalation criteria
- **Investigation (30 min):** Actionable PowerShell commands for evidence collection
- **Containment (15 min):** Immediate response actions to stop the attack

**Key Features:**
- Time-boxed phases for rapid response
- Copy-paste PowerShell commands (no theory, just action)
- Checkbox format for tracking progress
- Escalation criteria clearly defined
- Artifact collection list

**Why this matters:**
- Shows structured incident response methodology
- Demonstrates PowerShell proficiency for IR
- Provides actionable guidance (not just theory)
- Follows industry-standard 7-step framework

**Full Playbook:**
See `content/incident-response/playbooks/IR-001-LSASS-Access.md` for complete procedure including Eradication, Recovery, Documentation, and Lessons Learned phases.

---

## Interview Talking Points

**"Walk me through a detection you've written":**
> "I wrote a Sigma rule that detects credential dumping tools using multiple indicators - process names, command-line arguments, and file hashes. It's mapped to MITRE T1003.001 and can be converted to any SIEM platform. I documented false positives like authorized pentesting and Sysinternals debugging."

**"How would you respond to an LSASS access alert?":**
> "I'd follow my IR-001 playbook: 5-minute triage to validate it's not a false positive, then 30 minutes of investigation using PowerShell to check for credential dumping tools, dump files, and process trees. If confirmed malicious, I'd isolate the system within 15 minutes, kill the process, disable the compromised account, and force password resets for privileged accounts."

**"What's your experience with Splunk?":**
> "I've written SPL queries for credential access detection, like monitoring Sysmon Event 10 for LSASS access. I filter for specific GrantedAccess values that credential dumpers use, whitelist legitimate tools, and aggregate by source process to reduce false positives."

**"How do you deploy Wazuh rules?":**
> "Individual XML modules are stored in the repo at `content/detection-rules/wazuh/rules/`, then I use a build script (`build-wazuh-bundle.ps1` or `.sh`) to concatenate them into a single `local_rules.xml` file. That gets deployed to `/var/ossec/etc/rules/` on the Wazuh manager, then I restart the service and validate rule loading via the ossec.log. The actual files are in this repo - see `wazuh-051-multiple-auth-failures.xml` for an example."


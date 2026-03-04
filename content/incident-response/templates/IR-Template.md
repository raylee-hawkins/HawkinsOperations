# IR-XXX: [Scenario Name]

**Severity:** Critical/High/Medium/Low
**MITRE Techniques:** T1xxx, T1yyy
**Platforms:** Windows/Linux/Both
**Detection:** Wazuh Rule ID, Log Sources
**Author:** HawkinsOps SOC
**Version:** 1.0
**Last Updated:** 2025-01-15

---

## 1. DETECTION

**Alert Name:** [Alert name from SIEM]
**Trigger:** [What conditions triggered this alert]

**Indicators:**
- Log Source: [Event log, sysmon, auditd]
- Event ID: [Specific event IDs]
- Rule ID: [Wazuh/Splunk rule ID]

**Initial Context:**
- [ ] Affected system(s)
- [ ] User account(s) involved
- [ ] Time of detection
- [ ] Alert severity/confidence

---

## 2. TRIAGE (5 minutes)

**Objective:** Determine if this is a true positive and assess scope

### Validation Steps:
- [ ] Verify alert is not a false positive
- [ ] Check affected system online status
- [ ] Identify user account(s) involved
- [ ] Review recent activity on affected system
- [ ] Check if similar alerts exist on other systems

### Key Questions:
1. Is this expected/authorized activity?
2. Does timing correlate with business hours/user activity?
3. Are there other concurrent suspicious alerts?
4. What is the potential business impact?

### Escalation Criteria:
- Multiple systems affected → Escalate to Senior Analyst
- Confirmed malicious activity → Escalate to Incident Commander
- Production system impacted → Notify stakeholders

---

## 3. INVESTIGATION (30 minutes)

**Objective:** Gather evidence and understand attack scope

### Data Collection Commands:

**Windows:**
```powershell
# System information
systeminfo
whoami /all
net users
net localgroup administrators

# Network connections
netstat -anob
ipconfig /all

# Running processes
tasklist /v
wmic process list full

# Recent file modifications
Get-ChildItem -Path C:\ -Recurse -ErrorAction SilentlyContinue | Where-Object {$_.LastWriteTime -gt (Get-Date).AddDays(-1)}

# Event logs
Get-WinEvent -FilterHashtable @{LogName='Security';ID=4624,4625,4720,4726} -MaxEvents 100
```

**Linux:**
```bash
# System information
uname -a
whoami
id
last -aiF

# Network connections
netstat -antp
ss -antp
lsof -i

# Running processes
ps auxf
top -b -n 1

# Recent file modifications
find / -type f -mtime -1 2>/dev/null

# Authentication logs
grep -i 'failed\|accept\|session' /var/log/auth.log | tail -100
```

### Artifacts to Collect:
- [ ] Memory dump (if critical system)
- [ ] Disk image (if system is compromised)
- [ ] Event logs (Security, System, Application, Sysmon)
- [ ] Network packet capture
- [ ] Process listing snapshot
- [ ] Registry exports (Windows)
- [ ] Browser history/downloads
- [ ] Scheduled tasks/cron jobs
- [ ] Persistence mechanisms

---

## 4. CONTAINMENT (15 minutes)

**Objective:** Prevent further damage while preserving evidence

### Immediate Actions:

**Network Isolation:**
```powershell
# Windows - Disable network adapter
Disable-NetAdapter -Name "Ethernet" -Confirm:$false

# Linux - Drop all connections
iptables -A INPUT -j DROP
iptables -A OUTPUT -j DROP
```

**Account Lockout:**
```powershell
# Windows - Disable user account
Disable-ADAccount -Identity [username]
net user [username] /active:no

# Linux - Lock user account
passwd -l [username]
usermod -L [username]
```

**Process Termination:**
```powershell
# Windows
Stop-Process -Name [processname] -Force
taskkill /F /IM [processname].exe

# Linux
pkill -9 [processname]
kill -9 [PID]
```

### Containment Checklist:
- [ ] Isolate affected system(s) from network
- [ ] Disable compromised user accounts
- [ ] Block malicious IP addresses at firewall
- [ ] Terminate malicious processes
- [ ] Preserve volatile evidence before shutdown
- [ ] Document all containment actions
- [ ] Notify stakeholders of system offline status

---

## 5. ERADICATION (30 minutes)

**Objective:** Remove threat completely from environment

### Removal Steps:
- [ ] Remove malware/tools from affected systems
- [ ] Delete malicious scheduled tasks/services
- [ ] Remove persistence mechanisms
- [ ] Clear web shells/backdoors
- [ ] Reset compromised credentials
- [ ] Remove unauthorized user accounts
- [ ] Clean registry modifications (Windows)
- [ ] Remove malicious cron jobs (Linux)

---

## 6. RECOVERY

**Objective:** Restore normal operations safely

### Recovery Steps:
- [ ] Restore from clean backup (if needed)
- [ ] Re-image compromised systems (if severe)
- [ ] Reconnect system to network
- [ ] Re-enable user accounts
- [ ] Restore services gradually
- [ ] Monitor closely for 24-48 hours

---

## 7. DOCUMENTATION

### Timeline
| Time (UTC) | Event | Action Taken |
|------------|-------|--------------|
| YYYY-MM-DD HH:MM | Initial detection | |
| YYYY-MM-DD HH:MM | Triage completed | |

---

## 8. LESSONS LEARNED

**Action Items:**
- [ ] Update detection rules
- [ ] Enhance monitoring
- [ ] Implement additional controls
- [ ] Conduct security awareness training

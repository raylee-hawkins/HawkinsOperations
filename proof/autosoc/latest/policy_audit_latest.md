# AutoSOC Policy Audit

- Generated UTC: 2026-03-04T14:19:16Z
- Processed alerts reviewed: 1000
- Known FP classified: 0
- Always-escalate classified: 1
- Auto-close classified: 980
- Review-tier classified: 1
- Unclassified: 18

## Weekly Tuning Signal
Top 10 always-escalate rules:
- Rule 5715: 1

Top 10 auto-close rules:
- Rule 67027: 641
- Rule 92151: 288
- Rule 60642: 23
- Rule 5501: 10
- Rule 92153: 9
- Rule 5502: 9

Top 10 always-escalate groups:
- Group syslog: 1
- Group sshd: 1
- Group authentication_success: 1

Top 10 auto-close groups:
- Group windows: 961
- Group  wef: 641
- Group sysmon: 297
- Group sysmon_eid7_detections: 297
- Group windows_application: 23
- Group pam: 19
- Group syslog: 19
- Group authentication_success: 10

## Recommended Rule Classification Updates
- No recommendations above threshold.

## Candidate Suppressions (top 10)
- none

## Candidate Always-Escalate Adds (top 10)
- none

## Top Rules
- 67027: count=641, max_level=3 - A process was created.
- 92151: count=288, max_level=12 - Binary loaded PowerShell automation library - Possible unmanaged Powershell execution by suspicious process
- 60642: count=23, max_level=3 - Software protection service scheduled successfully.
- 5501: count=10, max_level=3 - PAM: Login session opened.
- 92153: count=9, max_level=10 - Suspicious process loaded VaultCli.dll module. Possible use to dump stored passwords.
- 5502: count=9, max_level=3 - PAM: Login session closed.
- 5402: count=8, max_level=3 - Successful sudo to ROOT executed.
- 533: count=2, max_level=7 - Listened ports status (netstat) changed (new port opened or closed).
- 19004: count=2, max_level=7 - SCA summary: CIS Distribution Independent Linux Benchmark v2.0.0.: Score less than 50% (46)
- 60602: count=1, max_level=9 - Windows application error event.
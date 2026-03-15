# AutoSOC Major Bug Fix Report

- Generated UTC: 2026-03-15T07:08:26Z
- Project: AutoSOC
- Audience: recruiter / hiring manager / external reviewer
- Report intent: summarize a major bug-fix and control-hardening cycle using recruiter-safe language and sanitized evidence only

## 1. Summary

AutoSOC completed a targeted triage-hardening pass on March 15, 2026 that reduced noisy staged backlog, corrected an over-broad false-positive condition, and tightened how the system distinguishes benign workstation churn from events that still merit escalation.

## 2. What Was Broken

- A live policy condition for two Sysmon rule families was broader than intended and treated all events in those families as false positives instead of only the known benign workstation patterns.
- Benign workstation device-enumeration churn was still consuming review bandwidth.
- A small staged backlog remained mixed together even though many items were safe operational noise while a smaller set still required incident treatment.

## 3. What Was Changed

- Narrowed the Sysmon false-positive logic so it only suppresses the confirmed benign workstation patterns for rules `92151` and `92153`.
- Added a precise override for known benign workstation external-device churn on rule `60227`.
- Moved low-risk operational noise families such as benchmark drift, expected system-time changes, and routine file-add/delete churn into the review lane where appropriate.
- Retroactively reclassified `37` safe staged cases into review and left the higher-risk remainder in escalation.
- Updated the executive and whole-system reports so the public-facing summary matches the current verified state.

## 4. Verification Outcome

- Reconciliation: PASS
- Coverage: PASS (`8/8`)
- Remaining staged pending escalations: `10`
- Remaining staged backlog is limited to higher-risk `100052` and `510` events that were intentionally not downgraded
- Verification evidence:
  - `C:\RH\OPS\30_Projects\Active\AutoSOC\Output\reconciliation_latest.json`
  - `C:\RH\OPS\30_Projects\Active\AutoSOC\Output\retroactive_review_backlog_cleanup_latest.json`
  - `C:\RH\OPS\30_Projects\Active\AutoSOC\Output\policy_audit_latest.json`
  - `C:\RH\OPS\50_System\Runs\Reports\AutoSOC_WHOLE_SYSTEM_REPORT_LATEST.md`
  - `C:\RH\OPS\50_System\Runs\Reports\AutoSOC_EXECUTIVE_SYSTEM_REPORT_LATEST.md`

## 5. Recruiter-Relevant Signal

- Demonstrated disciplined tuning of a production-style triage pipeline instead of papering over noisy metrics.
- Reduced backlog without hiding the truly higher-risk events.
- Used tests, evidence review, and reconciliation gates to prove the fix rather than relying on intuition.

## 6. Sanitization Note

This report excludes raw evidence, credentials, internal IPs, and internal-only debugging detail. Internal operational notes remain in the canonical OPS progress and change logs.

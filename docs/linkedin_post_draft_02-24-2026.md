# LinkedIn Post Draft — 2026-02-24

---

Built a live honeypot that auto-publishes sanitized Wazuh alerts to GitHub every 15 minutes.

Then shipped 6 portfolio case studies in a single session — all backed by real evidence artifacts, not fabricated demos.

Here's what went up today:

**Live proof pipeline (automated)**
Cowrie SSH honeypot → Wazuh Indexer → sanitized export script → GitHub push via deploy key → public artifact at `/honeypot-proof`. Runs on cron every 15 minutes. Latest run: 43 alerts, 16 distinct rule IDs, including a deterministic demo rule (100110) that fires on every run to prove the pipeline is working end-to-end. No internal IPs or credentials in the public output — guardrails enforced at export time.

**6 case studies published**
Each one grounded in something that actually happened: a Level 12 FIM alert triage (35 min, BENIGN verdict), a CVE detected live and patched the same session, 103 Sigma rules across 10 ATT&CK tactics, an IR playbook library with 10 structured playbooks, a Python detection harness that queries Wazuh's REST API, and the honeypot stack itself.

**Count integrity gate**
Every public number is backed by a verification script. A drift scan CI gate fails the build if any claimed count diverges from the source of truth. Fixed a Splunk count discrepancy today (7 → 8) by locating and publishing the missing SPL file — now auditable in the repo.

**Python tooling**
Added two operational SOC tools: a 461-line proof pack builder that collects high-severity alerts and outputs timestamped evidence packages, and a 185-line detection report generator that validates YAML-spec detections against live alert data.

Verification path for reviewers:
1. `proof/wazuh/honeypot/latest.meta.json` — timestamp, alert count, last rule ID
2. `proof/wazuh/honeypot/latest.md` — human-readable sanitized alert table
3. Commit history — 23 commits in 24 hours, two machines, full audit trail

If you're hiring SOC / detection engineering and want to see verifiable output over credentials, the repo is public: hawkinsops.com

---

*~1,250 characters*

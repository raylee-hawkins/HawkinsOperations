#!/usr/bin/env python3
import argparse
import csv
import datetime as dt
import json
import shutil
import subprocess
from pathlib import Path

DEFAULT_ALERTS_JSON = "/var/ossec/logs/alerts/alerts.json"
DEFAULT_ALERTS_LOG = "/var/ossec/logs/alerts/alerts.log"
DEFAULT_OSSEC_LOG = "/var/ossec/logs/ossec.log"

SEVERITY_ACTIONS = {
    "ransomware": [
        "Isolate endpoint from network immediately.",
        "Stop suspicious encryption process and preserve memory dump.",
        "Block IOCs at EDR/firewall and begin restore readiness checks.",
    ],
    "rootkit": [
        "Isolate host and block outbound traffic.",
        "Capture volatile evidence (memory, process list, connections).",
        "Prepare host rebuild and credential reset for impacted accounts.",
    ],
    "credential": [
        "Disable/rotate potentially compromised credentials.",
        "Enforce MFA or conditional access for affected account.",
        "Review authentication and lateral movement events across hosts.",
    ],
    "default": [
        "Validate alert context and confirm true/false positive.",
        "Contain impacted asset/account if compromise is suspected.",
        "Document timeline and collect host/network evidence.",
    ],
}

DEFAULT_RESPONSE_MAP = {
    "60204": {
        "title": "Repeated Windows authentication failures",
        "actions": [
            "Temporarily block or rate-limit source IP at firewall.",
            "Reset or lock impacted account after validation.",
            "Check for follow-on success logins from same source.",
        ],
    },
    "100053": {
        "title": "Rootkit detection",
        "actions": [
            "Isolate host immediately from network.",
            "Capture memory and volatile artifacts.",
            "Rebuild host and rotate credentials.",
        ],
    },
    "100055": {
        "title": "Malware detected (VirusTotal)",
        "actions": [
            "Quarantine file and isolate endpoint.",
            "Block hash/domain/IP IOCs in EDR and firewall.",
            "Run full scan and verify persistence mechanisms.",
        ],
    },
    "100062": {
        "title": "Potential ransomware activity",
        "actions": [
            "Isolate endpoint and stop encryption process.",
            "Disable affected shares and preserve forensic evidence.",
            "Start restoration process from known-good backups.",
        ],
    },
    "100075": {
        "title": "Credential dumping via comsvcs",
        "actions": [
            "Isolate host and block LSASS dump tooling.",
            "Rotate privileged credentials and invalidate tickets.",
            "Investigate lateral movement across peer systems.",
        ],
    },
}


def run_cmd(cmd: list[str]) -> str:
    try:
        cp = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        out = cp.stdout.strip()
        err = cp.stderr.strip()
        if cp.returncode == 0:
            return out or "(no output)"
        return f"[command failed rc={cp.returncode}]\n{out}\n{err}".strip()
    except Exception as exc:
        return f"[command exception] {exc}"


def collect_host_context() -> str:
    primary = run_cmd(["hostnamectl"])
    if primary.startswith("[command failed") or primary.startswith("[command exception]"):
        fallback = run_cmd(["hostname"])
        return f"{primary}\n\nFallback hostname:\n{fallback}"
    return primary


def collect_wazuh_status() -> str:
    primary = run_cmd(["systemctl", "status", "wazuh-manager", "--no-pager", "-l"])
    if primary.startswith("[command failed") or primary.startswith("[command exception]"):
        ps_fallback = run_cmd(["ps", "aux"])
        lines = [ln for ln in ps_fallback.splitlines() if "wazuh" in ln.lower()][:25]
        filtered = "\n".join(lines) if lines else "(no wazuh processes found in ps output)"
        return f"{primary}\n\nFallback process view:\n{filtered}"
    return primary


def detect_category(groups: list[str], description: str) -> str:
    text = (" ".join(groups) + " " + description).lower()
    if "ransomware" in text or "encryption" in text:
        return "ransomware"
    if "rootkit" in text:
        return "rootkit"
    if "credential" in text or "kerberoast" in text or "lsass" in text:
        return "credential"
    return "default"


def get_srcip(evt: dict) -> str:
    data = evt.get("data", {})
    srcip = data.get("srcip")
    if srcip is None and isinstance(data.get("win"), dict):
        srcip = data["win"].get("eventdata", {}).get("ipAddress")
    return srcip or ""


def load_response_map(path: Path) -> dict:
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            pass
    path.write_text(json.dumps(DEFAULT_RESPONSE_MAP, indent=2) + "\n")
    return DEFAULT_RESPONSE_MAP


def update_incident_tracker(path: Path, alerts: list[dict], response_map: dict) -> int:
    existing_ids: set[str] = set()
    if path.exists():
        with path.open("r", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                existing_ids.add(str(row.get("alert_id", "")))

    new_rows: list[list[str]] = []
    now_utc = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    for evt in alerts:
        alert_id = str(evt.get("id", ""))
        if alert_id in existing_ids:
            continue
        rule = evt.get("rule", {})
        rule_id = str(rule.get("id", ""))
        mapping = response_map.get(rule_id, {})
        new_rows.append(
            [
                now_utc,
                str(evt.get("timestamp", "")),
                alert_id,
                str(evt.get("agent", {}).get("name", "")),
                rule_id,
                str(rule.get("level", "")),
                str(rule.get("description", "")),
                get_srcip(evt),
                "OPEN",
                "UNASSIGNED",
                str(mapping.get("title", "")),
            ]
        )

    write_header = not path.exists()
    with path.open("a", newline="") as f:
        writer = csv.writer(f)
        if write_header:
            writer.writerow(
                [
                    "created_utc",
                    "first_seen",
                    "alert_id",
                    "agent",
                    "rule_id",
                    "severity",
                    "description",
                    "srcip",
                    "status",
                    "owner",
                    "response_title",
                ]
            )
        for row in new_rows:
            writer.writerow(row)
    return len(new_rows)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Collect high-severity Wazuh alerts and build a proof pack."
    )
    parser.add_argument("--alerts-json", default=DEFAULT_ALERTS_JSON)
    parser.add_argument("--alerts-log", default=DEFAULT_ALERTS_LOG)
    parser.add_argument("--ossec-log", default=DEFAULT_OSSEC_LOG)
    parser.add_argument("--severity", type=int, default=10, help="Minimum rule.level")
    parser.add_argument(
        "--lookback-lines",
        type=int,
        default=50000,
        help="Read only the last N lines from alerts.json for speed",
    )
    parser.add_argument(
        "--outdir",
        default=None,
        help="Output directory. Default: ./proof_pack_<UTC timestamp>",
    )
    parser.add_argument(
        "--state-file",
        default=str(Path.home() / ".wazuh_proof_pack_state.json"),
        help="State file to process only new alerts since last run",
    )
    parser.add_argument(
        "--high-log",
        default=str(Path.home() / "high_severity_alerts.log"),
        help="Append-only high severity log file",
    )
    parser.add_argument(
        "--tracker-file",
        default=str(Path.home() / "incident_tracker.csv"),
        help="SOC tracker CSV for high-severity incidents",
    )
    parser.add_argument(
        "--response-map",
        default=str(Path.home() / "wazuh_response_map.json"),
        help="JSON map of rule_id to response playbook actions",
    )
    return parser.parse_args()


def tail_lines(path: Path, limit: int) -> list[str]:
    if limit <= 0:
        return path.read_text(errors="replace").splitlines()

    lines: list[str] = []
    with path.open("r", errors="replace") as f:
        for line in f:
            lines.append(line.rstrip("\n"))
            if len(lines) > limit:
                lines.pop(0)
    return lines


def main() -> int:
    args = parse_args()

    alerts_json = Path(args.alerts_json)
    alerts_log = Path(args.alerts_log)
    ossec_log = Path(args.ossec_log)

    if not alerts_json.exists():
        print(f"ERROR: alerts.json not found at {alerts_json}")
        return 1

    state_file = Path(args.state_file)
    high_log = Path(args.high_log)
    tracker_file = Path(args.tracker_file)
    response_map_file = Path(args.response_map)
    response_map = load_response_map(response_map_file)

    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%d_%H%M%S_%fZ")
    outdir = Path(args.outdir) if args.outdir else Path.cwd() / f"proof_pack_{stamp}"
    outdir.mkdir(parents=True, exist_ok=True)

    (outdir / "alerts").mkdir(exist_ok=True)
    (outdir / "evidence").mkdir(exist_ok=True)

    high_alerts: list[dict] = []
    bad_lines = 0
    parsed_events: list[dict] = []

    last_seen_ts = ""
    last_seen_id = ""
    if state_file.exists():
        try:
            state = json.loads(state_file.read_text())
            last_seen_ts = str(state.get("last_seen_timestamp", "") or "")
            last_seen_id = str(state.get("last_seen_id", "") or "")
        except Exception:
            pass

    for raw in tail_lines(alerts_json, args.lookback_lines):
        raw = raw.strip()
        if not raw:
            continue
        try:
            evt = json.loads(raw)
        except json.JSONDecodeError:
            bad_lines += 1
            continue

        parsed_events.append(evt)
        evt_ts = str(evt.get("timestamp", "") or "")
        evt_id = str(evt.get("id", "") or "")
        if evt_ts < last_seen_ts:
            continue
        if evt_ts == last_seen_ts and evt_id <= last_seen_id:
            continue

        level = int(evt.get("rule", {}).get("level", 0) or 0)
        if level >= args.severity:
            high_alerts.append(evt)

    alerts_jsonl_path = outdir / "alerts" / "high_severity_alerts.jsonl"
    with alerts_jsonl_path.open("w") as f:
        for evt in high_alerts:
            f.write(json.dumps(evt, separators=(",", ":")) + "\n")

    summary_csv = outdir / "alerts" / "high_severity_summary.csv"
    with summary_csv.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "timestamp",
                "alert_id",
                "agent",
                "rule_id",
                "level",
                "description",
                "groups",
                "srcip",
                "location",
                "recommended_category",
            ]
        )
        for evt in high_alerts:
            rule = evt.get("rule", {})
            srcip = get_srcip(evt)
            groups = [g.strip() for g in rule.get("groups", []) if isinstance(g, str)]
            description = str(rule.get("description", ""))
            rule_id = str(rule.get("id", ""))
            mapped = response_map.get(rule_id, {})
            writer.writerow(
                [
                    evt.get("timestamp", ""),
                    evt.get("id", ""),
                    evt.get("agent", {}).get("name", ""),
                    rule_id,
                    rule.get("level", ""),
                    description,
                    ";".join(groups),
                    srcip or "",
                    evt.get("location", ""),
                    detect_category(groups, description),
                ]
            )

    with high_log.open("a") as f:
        for evt in high_alerts:
            rule = evt.get("rule", {})
            description = str(rule.get("description", "")).replace("\n", " ").strip()
            f.write(
                f"{evt.get('timestamp','')} "
                f"alert_id={evt.get('id','')} "
                f"level={rule.get('level','')} "
                f"rule_id={rule.get('id','')} "
                f"agent={evt.get('agent',{}).get('name','')} "
                f"description={description}\n"
            )

    incident_log = outdir / "incident_action_log.md"
    with incident_log.open("w") as f:
        f.write("# High-Severity Incident Action Log\n\n")
        f.write(f"Generated (UTC): {stamp}\n\n")
        f.write(f"Severity threshold: {args.severity}\n\n")
        f.write(f"Total high-severity alerts: {len(high_alerts)}\n\n")
        if bad_lines:
            f.write(f"Skipped malformed alert lines: {bad_lines}\n\n")

        for idx, evt in enumerate(high_alerts, start=1):
            rule = evt.get("rule", {})
            groups = [g.strip() for g in rule.get("groups", []) if isinstance(g, str)]
            description = str(rule.get("description", ""))
            category = detect_category(groups, description)
            actions = SEVERITY_ACTIONS[category]
            rule_id = str(rule.get("id", ""))
            mapped = response_map.get(rule_id, {})

            f.write(f"## Incident {idx}\n")
            f.write(f"- Timestamp: {evt.get('timestamp', '')}\n")
            f.write(f"- Alert ID: {evt.get('id', '')}\n")
            f.write(f"- Agent: {evt.get('agent', {}).get('name', '')}\n")
            f.write(f"- Rule: {rule.get('id', '')} (level {rule.get('level', '')})\n")
            f.write(f"- Description: {description}\n")
            f.write(f"- Groups: {', '.join(groups)}\n")
            f.write("- Status: OPEN\n")
            if mapped:
                f.write(f"- Response playbook: {mapped.get('title', '')}\n")
                f.write("- Playbook actions:\n")
                for action in mapped.get("actions", []):
                    f.write(f"  - [ ] {action}\n")
            f.write("- Triage actions:\n")
            for action in actions:
                f.write(f"  - [ ] {action}\n")
            f.write("\n")

    evidence_file = outdir / "evidence" / "host_context.txt"
    with evidence_file.open("w") as f:
        f.write(f"Collected UTC: {stamp}\n\n")
        f.write("## Date\n")
        f.write(run_cmd(["date", "-u", "+%Y-%m-%dT%H:%M:%SZ"]) + "\n\n")
        f.write("## Host\n")
        f.write(collect_host_context() + "\n\n")
        f.write("## Kernel\n")
        f.write(run_cmd(["uname", "-a"]) + "\n\n")
        f.write("## Wazuh Manager Status\n")
        f.write(collect_wazuh_status() + "\n\n")

    if alerts_log.exists():
        shutil.copy2(alerts_log, outdir / "alerts" / "alerts.log.snapshot")
    if ossec_log.exists():
        shutil.copy2(ossec_log, outdir / "evidence" / "ossec.log.snapshot")

    with (outdir / "README.txt").open("w") as f:
        f.write("proof_pack contents\n")
        f.write("- alerts/high_severity_alerts.jsonl: Raw high-severity alert records\n")
        f.write("- alerts/high_severity_summary.csv: Analyst-friendly summary\n")
        f.write("- incident_action_log.md: Action checklist to handle high-severity incidents\n")
        f.write("- evidence/host_context.txt: Local host and wazuh manager status\n")
        f.write("- alerts/alerts.log.snapshot and evidence/ossec.log.snapshot: Log snapshots\n")
        f.write(f"- {high_log}: Append-only high severity log file\n")
        f.write(f"- {tracker_file}: SOC incident tracker CSV\n")
        f.write(f"- {response_map_file}: Rule to response playbook mappings\n")

    new_tracker_rows = update_incident_tracker(tracker_file, high_alerts, response_map)

    if parsed_events:
        last_evt = max(
            parsed_events,
            key=lambda e: (str(e.get("timestamp", "") or ""), str(e.get("id", "") or "")),
        )
        state_file.write_text(
            json.dumps(
                {
                    "last_seen_timestamp": str(last_evt.get("timestamp", "") or ""),
                    "last_seen_id": str(last_evt.get("id", "") or ""),
                    "updated_utc": stamp,
                },
                indent=2,
            )
            + "\n"
        )

    print(f"proof_pack ready: {outdir}")
    print(f"high-severity alerts: {len(high_alerts)}")
    print(f"new tracker rows: {new_tracker_rows}")
    print(f"malformed lines skipped: {bad_lines}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

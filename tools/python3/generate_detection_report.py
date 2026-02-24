#!/usr/bin/env python3
import argparse
import datetime as dt
import json
from pathlib import Path

DEFAULT_ALERTS_JSON = "/var/ossec/logs/alerts/alerts.json"


def parse_expected_yaml(path: Path) -> list[dict]:
    items: list[dict] = []
    current: dict | None = None
    in_fields = False

    for raw in path.read_text(errors="replace").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue

        if line.startswith("- "):
            if current:
                items.append(current)
            current = {
                "test_name": "",
                "platform": "",
                "expected_rule_id": "",
                "expected_group": "",
                "expected_fields": {
                    "agent_name": "",
                    "commandline_contains": "",
                },
            }
            in_fields = False
            line = line[2:].strip()
            if line and ":" in line:
                k, v = [x.strip() for x in line.split(":", 1)]
                current[k] = v.strip('"')
            continue

        if current is None:
            continue

        if line.startswith("expected_fields:"):
            in_fields = True
            continue

        if ":" not in line:
            continue

        k, v = [x.strip() for x in line.split(":", 1)]
        v = v.strip('"')
        if in_fields:
            current["expected_fields"][k] = v
        else:
            current[k] = v

    if current:
        items.append(current)
    return items


def tail_lines(path: Path, limit: int) -> list[str]:
    lines: list[str] = []
    with path.open("r", errors="replace") as f:
        for line in f:
            lines.append(line.rstrip("\n"))
            if len(lines) > limit:
                lines.pop(0)
    return lines


def load_alerts(path: Path, lookback: int) -> list[dict]:
    alerts: list[dict] = []
    for raw in tail_lines(path, lookback):
        if not raw.strip():
            continue
        try:
            alerts.append(json.loads(raw))
        except json.JSONDecodeError:
            continue
    return alerts


def alert_commandline(evt: dict) -> str:
    data = evt.get("data", {})
    if isinstance(data.get("win"), dict):
        return str(data["win"].get("eventdata", {}).get("commandLine", ""))
    return str(evt.get("full_log", ""))


def matches(alert: dict, exp: dict) -> bool:
    rule = alert.get("rule", {})
    groups = [str(g).strip() for g in rule.get("groups", []) if isinstance(g, str)]
    fields = exp.get("expected_fields", {})

    if exp.get("expected_rule_id") and str(rule.get("id", "")) != str(exp.get("expected_rule_id")):
        return False
    if exp.get("expected_group") and exp.get("expected_group") not in groups:
        return False

    expected_agent = str(fields.get("agent_name", ""))
    if expected_agent and str(alert.get("agent", {}).get("name", "")) != expected_agent:
        return False

    needle = str(fields.get("commandline_contains", "")).lower()
    if needle:
        cmd = alert_commandline(alert).lower()
        if needle not in cmd:
            return False

    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate SOC detection validation report")
    parser.add_argument("--expected", default="/home/raylee/soc/expected_detections.yaml")
    parser.add_argument("--alerts-json", default=DEFAULT_ALERTS_JSON)
    parser.add_argument("--lookback-lines", type=int, default=80000)
    parser.add_argument("--out", default="/home/raylee/soc/report.md")
    args = parser.parse_args()

    expected_path = Path(args.expected)
    alerts_path = Path(args.alerts_json)
    out_path = Path(args.out)

    if not expected_path.exists():
        print(f"ERROR: expected file missing: {expected_path}")
        return 1
    if not alerts_path.exists():
        print(f"ERROR: alerts file missing: {alerts_path}")
        return 1

    expected = parse_expected_yaml(expected_path)
    alerts = load_alerts(alerts_path, args.lookback_lines)

    rows: list[dict] = []
    for exp in expected:
        hit = None
        for alert in reversed(alerts):
            if matches(alert, exp):
                hit = alert
                break

        status = "PASS" if hit else "MISS"
        rows.append(
            {
                "test_name": exp.get("test_name", ""),
                "status": status,
                "rule_id": exp.get("expected_rule_id", ""),
                "group": exp.get("expected_group", ""),
                "alert_id": "" if not hit else str(hit.get("id", "")),
                "timestamp": "" if not hit else str(hit.get("timestamp", "")),
                "agent": "" if not hit else str(hit.get("agent", {}).get("name", "")),
            }
        )

    now = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    pass_count = sum(1 for r in rows if r["status"] == "PASS")

    with out_path.open("w") as f:
        f.write("# Detection Validation Report\n\n")
        f.write(f"Generated (UTC): {now}\n\n")
        f.write(f"Lookback lines: {args.lookback_lines}\n\n")
        f.write(f"Results: {pass_count}/{len(rows)} PASS\n\n")
        f.write("| Test | Status | Rule | Group | Agent | Timestamp | Alert ID |\n")
        f.write("|---|---|---|---|---|---|---|\n")
        for r in rows:
            f.write(
                f"| {r['test_name']} | {r['status']} | {r['rule_id']} | {r['group']} | "
                f"{r['agent']} | {r['timestamp']} | {r['alert_id']} |\n"
            )

        f.write("\n## Capture Evidence\n")
        f.write("- Screenshot: Atomic test terminal output\n")
        f.write("- Screenshot: Wazuh alert with rule ID, agent, timestamp\n")
        f.write("- Save: expected_detections.yaml and this report.md\n")

    print(f"report ready: {out_path}")
    print(f"pass: {pass_count}/{len(rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

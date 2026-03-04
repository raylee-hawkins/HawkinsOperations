#!/usr/bin/env python3
import argparse
import glob
import json
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, Set

from common import AGENT_INVENTORY_PATH, OUTPUT_ROOT, PROCESSED_ROOT, read_json, utc_now, write_json


def norm(value: str) -> str:
    s = str(value or "").strip().lower()
    if "." in s:
        s = s.split(".", 1)[0]
    return s.replace("_", "-")


def alias_set(hostname: str) -> Set[str]:
    c = norm(hostname)
    aliases = {c}
    if c.endswith("-01"):
        aliases.add(c[:-3])
    aliases.add(c.replace("-", "_"))
    return {a for a in aliases if a}


def parse_ts(raw: str) -> datetime:
    try:
        return datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
    except Exception:
        return datetime.min.replace(tzinfo=timezone.utc)


def main() -> None:
    parser = argparse.ArgumentParser(description="Check machine coverage in recent AutoSOC processed alerts.")
    parser.add_argument("--window-hours", type=int, default=168, help="Lookback window in hours (default 168 = 7 days).")
    args = parser.parse_args()

    inv = read_json(AGENT_INVENTORY_PATH, {"vms": []})
    required: Dict[str, Set[str]] = {}
    for vm in inv.get("vms", []):
        h = str(vm.get("hostname", "")).strip()
        if h:
            required[h] = alias_set(h)

    cutoff = datetime.now(timezone.utc) - timedelta(hours=args.window_hours)
    seen = Counter()
    seen_raw = Counter()
    scanned = 0
    for p in glob.glob(str(PROCESSED_ROOT / "*.json")):
        scanned += 1
        try:
            a = json.loads(Path(p).read_text(encoding="utf-8"))
        except Exception:
            continue
        ts = parse_ts(a.get("@timestamp", ""))
        if ts < cutoff:
            continue
        candidates = [
            str(a.get("agent", {}).get("name", "")),
            str(a.get("agent", {}).get("hostname", "")),
            str(a.get("host", {}).get("hostname", "")),
            str(a.get("manager", {}).get("name", "")),
            str(a.get("location", "")),
        ]
        for raw in candidates:
            n = norm(raw)
            if n:
                seen[n] += 1
                seen_raw[raw] += 1

    missing = []
    present = []
    for host, aliases in required.items():
        hits = sum(seen.get(a, 0) for a in aliases)
        entry = {"hostname": host, "aliases": sorted(aliases), "recent_hits": hits}
        if hits > 0:
            present.append(entry)
        else:
            missing.append(entry)

    report = {
        "generated_utc": utc_now(),
        "window_hours": args.window_hours,
        "processed_files_scanned": scanned,
        "required_hosts": len(required),
        "present_hosts": len(present),
        "missing_hosts": len(missing),
        "present": sorted(present, key=lambda x: x["hostname"].lower()),
        "missing": sorted(missing, key=lambda x: x["hostname"].lower()),
        "top_seen_agent_tokens": seen.most_common(20),
    }

    json_path = OUTPUT_ROOT / "coverage_latest.json"
    md_path = OUTPUT_ROOT / "coverage_latest.md"
    write_json(json_path, report)

    lines = [
        "# AutoSOC Coverage Check",
        "",
        f"- Generated UTC: {report['generated_utc']}",
        f"- Window hours: {report['window_hours']}",
        f"- Processed files scanned: {report['processed_files_scanned']}",
        f"- Required hosts: {report['required_hosts']}",
        f"- Present hosts: {report['present_hosts']}",
        f"- Missing hosts: {report['missing_hosts']}",
        "",
        "## Missing Hosts",
    ]
    if missing:
        for m in missing:
            lines.append(f"- {m['hostname']} (aliases: {', '.join(m['aliases'])})")
    else:
        lines.append("- none")
    lines.extend(["", "## Present Hosts"])
    if present:
        for p in present:
            lines.append(f"- {p['hostname']} (recent_hits={p['recent_hits']})")
    else:
        lines.append("- none")

    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"COVERAGE_JSON={json_path}")
    print(f"COVERAGE_MD={md_path}")
    print(f"MISSING_HOSTS={report['missing_hosts']}")


if __name__ == "__main__":
    main()


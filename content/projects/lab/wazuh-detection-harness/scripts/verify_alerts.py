#!/usr/bin/env python3
import argparse
import base64
import copy
import datetime as dt
import json
import os
import re
import ssl
import sys
import urllib.error
import urllib.request
from pathlib import Path


def parse_expected_yaml(path: Path) -> list[dict]:
    """
    Minimal YAML parser for this file shape:
      tests:
        - test_name: ...
          ...
          expected:
            rule_id: ...
            rule_groups:
              - ...
            mitre_ids:
              - ...
            must_contain:
              - ...
    """
    tests: list[dict] = []
    current: dict | None = None
    in_expected = False
    list_key: str | None = None

    def ensure_current() -> dict:
        nonlocal current
        if current is None:
            current = {
                "test_name": "",
                "platform": "",
                "agent_name": "",
                "agent_id": "",
                "lookback_minutes": 15,
                "expected": {
                    "rule_id": "",
                    "rule_groups": [],
                    "mitre_ids": [],
                    "must_contain": [],
                },
            }
        return current

    for raw in path.read_text(errors="replace").splitlines():
        line = raw.rstrip()
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped == "tests:":
            continue

        if stripped.startswith("- test_name:"):
            if current:
                tests.append(current)
            current = None
            c = ensure_current()
            c["test_name"] = stripped.split(":", 1)[1].strip().strip('"')
            in_expected = False
            list_key = None
            continue

        if current is None:
            continue

        if stripped == "expected:":
            in_expected = True
            list_key = None
            continue

        if stripped.startswith("- ") and in_expected and list_key:
            val = stripped[2:].strip().strip('"')
            current["expected"][list_key].append(val)
            continue

        if ":" not in stripped:
            continue

        key, val = [x.strip() for x in stripped.split(":", 1)]
        val = val.strip().strip('"')

        if in_expected:
            if key in ("rule_groups", "mitre_ids", "must_contain"):
                list_key = key
                if val in ("", "[]"):
                    continue
                # support inline single value
                current["expected"][key].append(val)
            else:
                list_key = None
                current["expected"][key] = val
        else:
            list_key = None
            if key == "lookback_minutes":
                try:
                    current[key] = int(val)
                except ValueError:
                    current[key] = 15
            else:
                current[key] = val

    if current:
        tests.append(current)

    return tests


def env_required(name: str) -> str:
    v = os.environ.get(name, "").strip()
    if not v:
        print(f"ERROR: missing required env var: {name}", file=sys.stderr)
        sys.exit(2)
    return v


def iso_utc(minutes_ago: int) -> str:
    t = dt.datetime.now(dt.timezone.utc) - dt.timedelta(minutes=minutes_ago)
    return t.strftime("%Y-%m-%dT%H:%M:%SZ")


def make_query(test: dict) -> dict:
    lookback = int(test.get("lookback_minutes", 15) or 15)
    must = [
        {"range": {"@timestamp": {"gte": iso_utc(lookback), "lte": "now"}}},
        {"term": {"agent.name.keyword": test.get("agent_name", "")}},
    ]

    agent_id = str(test.get("agent_id", "") or "").strip()
    if agent_id:
        must.append({"term": {"agent.id.keyword": agent_id}})

    expected = test.get("expected", {})
    should = []

    rule_id = str(expected.get("rule_id", "") or "").strip()
    if rule_id:
        should.append({"term": {"rule.id": rule_id}})

    for g in expected.get("rule_groups", []) or []:
        if g:
            should.append({"term": {"rule.groups": g}})

    for mid in expected.get("mitre_ids", []) or []:
        if mid:
            should.append({"term": {"rule.mitre.id": mid}})

    for s in expected.get("must_contain", []) or []:
        if s:
            should.append(
                {
                    "multi_match": {
                        "query": s,
                        "fields": [
                            "full_log",
                            "rule.description",
                            "data.win.eventdata.commandLine",
                            "data.win.eventdata.newProcessName",
                            "data.command",
                            "data.process",
                        ],
                    }
                }
            )

    q = {
        "size": 25,
        "sort": [{"@timestamp": {"order": "desc"}}],
        "query": {
            "bool": {
                "must": must,
            }
        },
    }
    if should:
        q["query"]["bool"]["should"] = should
        q["query"]["bool"]["minimum_should_match"] = 1

    return q


def http_post_json(url: str, user: str, password: str, body: dict, tls_insecure: bool) -> dict:
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    token = base64.b64encode(f"{user}:{password}".encode("utf-8")).decode("ascii")
    req.add_header("Authorization", f"Basic {token}")

    ctx = None
    if tls_insecure:
        ctx = ssl._create_unverified_context()

    with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8", errors="replace"))


def flatten_strings(obj) -> str:
    if obj is None:
        return ""
    if isinstance(obj, str):
        return obj
    if isinstance(obj, (int, float, bool)):
        return str(obj)
    if isinstance(obj, list):
        return " ".join(flatten_strings(x) for x in obj)
    if isinstance(obj, dict):
        return " ".join(flatten_strings(v) for v in obj.values())
    return ""


def event_matches(event_src: dict, test: dict) -> bool:
    exp = test.get("expected", {})
    rule = event_src.get("rule", {})

    rule_id = str(exp.get("rule_id", "") or "").strip()
    groups = [str(x) for x in rule.get("groups", [])] if isinstance(rule.get("groups"), list) else []
    mitre_ids = []
    mitre = rule.get("mitre", {})
    if isinstance(mitre, dict):
        mids = mitre.get("id", [])
        if isinstance(mids, list):
            mitre_ids = [str(x) for x in mids]

    checks = []
    if rule_id:
        checks.append(str(rule.get("id", "")) == rule_id)

    rg = [x for x in (exp.get("rule_groups", []) or []) if x]
    if rg:
        checks.append(any(x in groups for x in rg))

    mids_exp = [x for x in (exp.get("mitre_ids", []) or []) if x]
    if mids_exp:
        checks.append(any(x in mitre_ids for x in mids_exp))

    text = flatten_strings(event_src).lower()
    contains = [x.lower() for x in (exp.get("must_contain", []) or []) if x]
    if contains:
        checks.append(all(c in text for c in contains))

    if not checks:
        return True
    return any(checks)


IP_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")


def sanitize_text(s: str) -> str:
    s = IP_RE.sub("[REDACTED_IP]", s)
    # generic host/computer redaction in log strings
    s = re.sub(r"\b(?:computer|hostname|host)\s*[:=]\s*[^\s,;]+", "host=[REDACTED_HOST]", s, flags=re.I)
    return s


def sanitize_event(src: dict, allowed_agent_name: str) -> dict:
    out = {
        "timestamp": src.get("timestamp", src.get("@timestamp", "")),
        "alert_id": src.get("id", ""),
        "agent": {
            "name": src.get("agent", {}).get("name", ""),
            "id": src.get("agent", {}).get("id", ""),
        },
        "rule": {
            "id": src.get("rule", {}).get("id", ""),
            "level": src.get("rule", {}).get("level", ""),
            "description": sanitize_text(str(src.get("rule", {}).get("description", ""))),
            "groups": src.get("rule", {}).get("groups", []),
            "mitre": src.get("rule", {}).get("mitre", {}),
        },
        "location": sanitize_text(str(src.get("location", ""))),
    }
    if out["agent"]["name"] and out["agent"]["name"] != allowed_agent_name:
        out["agent"]["name"] = "[REDACTED_HOST]"

    return out


def render_report(path: Path, rows: list[dict], run_name: str) -> None:
    now = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    passed = sum(1 for r in rows if r["status"] == "PASS")
    total = len(rows)

    with path.open("w") as f:
        f.write(f"# Wazuh Detection Harness Report\n\n")
        f.write(f"Run: `{run_name}`\n\n")
        f.write(f"Generated (UTC): {now}\n\n")
        f.write(f"Result: {passed}/{total} PASS\n\n")
        f.write("| Test | Platform | Agent | Status | Expected | Matches |\n")
        f.write("|---|---|---|---|---|---|\n")
        for r in rows:
            expected_bits = []
            if r["expected_rule_id"]:
                expected_bits.append(f"rule_id={r['expected_rule_id']}")
            if r["expected_groups"]:
                expected_bits.append("groups=" + ",".join(r["expected_groups"]))
            if r["expected_mitre_ids"]:
                expected_bits.append("mitre=" + ",".join(r["expected_mitre_ids"]))
            if r["expected_contains"]:
                expected_bits.append("contains=" + ",".join(r["expected_contains"]))
            expected_str = "; ".join(expected_bits) if expected_bits else "(none)"
            f.write(
                f"| {r['test_name']} | {r['platform']} | {r['agent_name']} | {r['status']} | "
                f"{expected_str} | {r['match_count']} |\n"
            )

        failures = [r for r in rows if r["status"] == "FAIL"]
        if failures:
            f.write("\n## Failed Tests\n")
            for r in failures:
                f.write(f"- {r['test_name']}: no matching alerts in lookback window\n")


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify expected detections from Wazuh Indexer")
    parser.add_argument("--expected", default="expected_detections.yaml")
    parser.add_argument("--run-dir", required=True)
    args = parser.parse_args()

    expected_path = Path(args.expected)
    if not expected_path.exists():
        print(f"ERROR: expected file not found: {expected_path}", file=sys.stderr)
        return 2

    run_dir = Path(args.run_dir)
    run_dir.mkdir(parents=True, exist_ok=True)

    host = env_required("WAZUH_INDEXER_HOST")
    user = env_required("WAZUH_INDEXER_USER")
    password = env_required("WAZUH_INDEXER_PASS")
    tls_insecure = os.environ.get("WAZUH_TLS_INSECURE", "false").strip().lower() == "true"

    url = f"https://{host}:9200/wazuh-alerts-4.x-*/_search"
    tests = parse_expected_yaml(expected_path)

    results = []
    query_debug = []
    matches_out = []

    for test in tests:
        query = make_query(test)
        query_debug.append({"test_name": test.get("test_name", ""), "query": query})

        hits = []
        query_error = ""
        try:
            resp = http_post_json(url, user, password, query, tls_insecure)
            hits = resp.get("hits", {}).get("hits", []) if isinstance(resp, dict) else []
        except urllib.error.HTTPError as e:
            query_error = f"HTTPError {e.code}"
        except urllib.error.URLError as e:
            query_error = f"URLError {e.reason}"
        except Exception as e:
            query_error = f"Error {type(e).__name__}"

        matched = []
        for h in hits:
            src = h.get("_source", {}) if isinstance(h, dict) else {}
            if event_matches(src, test):
                matched.append(src)

        top = matched[:3]
        sanitized = [sanitize_event(e, test.get("agent_name", "")) for e in top]
        matches_out.append({"test_name": test.get("test_name", ""), "matches": sanitized})

        exp = test.get("expected", {})
        status = "PASS" if sanitized else "FAIL"
        if query_error:
            status = "FAIL"

        results.append(
            {
                "test_name": test.get("test_name", ""),
                "platform": test.get("platform", ""),
                "agent_name": test.get("agent_name", ""),
                "status": status,
                "match_count": len(sanitized),
                "query_error": query_error,
                "expected_rule_id": exp.get("rule_id", ""),
                "expected_groups": exp.get("rule_groups", []) or [],
                "expected_mitre_ids": exp.get("mitre_ids", []) or [],
                "expected_contains": exp.get("must_contain", []) or [],
            }
        )

    (run_dir / "matches.json").write_text(json.dumps(matches_out, indent=2) + "\n")
    (run_dir / "query_debug.json").write_text(json.dumps(query_debug, indent=2) + "\n")
    render_report(run_dir / "report.md", results, run_dir.name)

    failed = [r for r in results if r["status"] != "PASS"]
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())

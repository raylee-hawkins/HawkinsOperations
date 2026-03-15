#!/usr/bin/env python3
"""Generate a MITRE technique map from repo Sigma and Wazuh rules."""

from __future__ import annotations

import argparse
import csv
import json
import re
import tempfile
import urllib.request
from pathlib import Path
from typing import Dict, Iterable, List, Sequence

try:
    import yaml  # type: ignore
except ImportError:  # pragma: no cover
    yaml = None


REPO_ROOT = Path(__file__).resolve().parents[1]
SIGMA_ROOT = REPO_ROOT / "content" / "detection-rules" / "sigma"
WAZUH_ROOT = REPO_ROOT / "content" / "detection-rules" / "wazuh" / "rules"
OUTPUT_PATH = REPO_ROOT / "PROOF_PACK" / "technique_map.csv"
ATTACK_STIX_URL = "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json"

TACTIC_TOKENS = {
    "collection",
    "command_and_control",
    "credential_access",
    "defense_evasion",
    "discovery",
    "execution",
    "exfiltration",
    "impact",
    "initial_access",
    "lateral_movement",
    "persistence",
    "privilege_escalation",
    "reconnaissance",
    "resource_development",
}
PLATFORM_TOKENS = {
    "android",
    "aws",
    "azure",
    "container",
    "gcp",
    "linux",
    "macos",
    "network",
    "office365",
    "web",
    "windows",
}
TECHNIQUE_TAG_RE = re.compile(r"^attack\.(t\d{4}(?:\.\d{3})?)$", re.IGNORECASE)
ATTACK_REF_RE = re.compile(r"/techniques/(T\d{4}(?:/\d{3})?)/?", re.IGNORECASE)
MITRE_COMMENT_RE = re.compile(
    r"MITRE ATT&CK:\s*(T\d{4}(?:\.\d{3})?)\s*-\s*([^\r\n]+)",
    re.IGNORECASE,
)


def humanize_token(token: str) -> str:
    return token.replace("_", " ").replace("-", " ").strip().title()


def normalize_technique_id(value: str) -> str:
    return value.strip().upper().replace("/", ".")


def dedupe_keep_order(values: Iterable[str]) -> List[str]:
    out: List[str] = []
    seen = set()
    for value in values:
        if not value:
            continue
        if value in seen:
            continue
        seen.add(value)
        out.append(value)
    return out


def join_values(values: Sequence[str]) -> str:
    return "; ".join(dedupe_keep_order(values))


def parse_sigma_text_fallback(text: str) -> Dict[str, object]:
    def find_scalar(key: str) -> str:
        match = re.search(rf"(?m)^{re.escape(key)}:\s*(.+?)\s*$", text)
        return match.group(1).strip() if match else ""

    tags: List[str] = []
    references: List[str] = []
    current = None
    for line in text.splitlines():
        if re.match(r"^tags:\s*$", line):
            current = "tags"
            continue
        if re.match(r"^references:\s*$", line):
            current = "references"
            continue
        if re.match(r"^[A-Za-z0-9_]+:\s*", line):
            current = None
        bullet = re.match(r"^\s*-\s*(.+?)\s*$", line)
        if bullet and current == "tags":
            tags.append(bullet.group(1).strip())
        elif bullet and current == "references":
            references.append(bullet.group(1).strip())

    product = ""
    logsource_match = re.search(r"(?ms)^logsource:\s*(.+?)(?:^\S|\Z)", text)
    if logsource_match:
        product_match = re.search(r"(?m)^\s*product:\s*(.+?)\s*$", logsource_match.group(1))
        if product_match:
            product = product_match.group(1).strip()

    return {
        "title": find_scalar("title"),
        "id": find_scalar("id"),
        "tags": tags,
        "references": references,
        "logsource": {"product": product} if product else {},
    }


def load_sigma_rule(path: Path) -> Dict[str, object]:
    text = path.read_text(encoding="utf-8")
    if yaml is not None:
        return yaml.safe_load(text) or {}
    return parse_sigma_text_fallback(text)


def sigma_rows() -> List[Dict[str, str]]:
    rows: List[Dict[str, str]] = []
    for path in sorted(SIGMA_ROOT.rglob("*.yml")) + sorted(SIGMA_ROOT.rglob("*.yaml")):
        rule = load_sigma_rule(path)
        tags = [str(tag).strip() for tag in rule.get("tags", []) or []]
        refs = [str(ref).strip() for ref in rule.get("references", []) or []]

        technique_ids = [
            normalize_technique_id(match.group(1))
            for tag in tags
            for match in [TECHNIQUE_TAG_RE.match(tag)]
            if match
        ]
        if not technique_ids:
            for ref in refs:
                technique_ids.extend(
                    normalize_technique_id(match.group(1))
                    for match in ATTACK_REF_RE.finditer(ref)
                )

        tactics = []
        for tag in tags:
            if not tag.lower().startswith("attack."):
                continue
            token = tag.split(".", 1)[1].strip().lower()
            if token in TACTIC_TOKENS:
                tactics.append(humanize_token(token))

        platform = ""
        logsource = rule.get("logsource", {}) or {}
        if isinstance(logsource, dict):
            platform = str(logsource.get("product", "")).strip()

        rows.append(
            {
                "rule_id": str(rule.get("id", "") or path.stem).strip(),
                "rule_title": str(rule.get("title", "")).strip(),
                "mitre_technique_id": join_values(technique_ids),
                "mitre_technique_name": "",
                "mitre_tactic": join_values(tactics),
                "source_file": path.relative_to(REPO_ROOT).as_posix(),
                "platform": platform,
            }
        )
    return rows


def extract_platforms_from_tokens(tokens: Iterable[str]) -> List[str]:
    found = []
    for token in tokens:
        normalized = token.strip().lower()
        if normalized in PLATFORM_TOKENS:
            found.append(normalized)
    return dedupe_keep_order(found)


def extract_tactics_from_tokens(tokens: Iterable[str]) -> List[str]:
    found = []
    for token in tokens:
        normalized = token.strip().lower()
        if normalized in TACTIC_TOKENS:
            found.append(humanize_token(normalized))
    return dedupe_keep_order(found)


def parse_wazuh_file(path: Path) -> List[Dict[str, str]]:
    text = path.read_text(encoding="utf-8")
    comment_technique_names = {
        normalize_technique_id(match.group(1)): match.group(2).strip()
        for match in MITRE_COMMENT_RE.finditer(text)
    }
    outer_group_match = re.search(r'<group\s+name="([^"]*)"', text, re.IGNORECASE)
    outer_group_tokens = extract_group_tokens(outer_group_match.group(1) if outer_group_match else "")
    rows: List[Dict[str, str]] = []
    rule_blocks = re.finditer(r"<rule\b([^>]*)>(.*?)</rule>", text, re.IGNORECASE | re.DOTALL)
    for match in rule_blocks:
        attrs = match.group(1)
        body = match.group(2)
        rule_id_match = re.search(r'\bid="([^"]+)"', attrs, re.IGNORECASE)
        description_match = re.search(r"<description>(.*?)</description>", body, re.IGNORECASE | re.DOTALL)
        group_match = re.search(r"<group>(.*?)</group>", body, re.IGNORECASE | re.DOTALL)
        mitre_matches = re.findall(r"<mitre>\s*(.*?)\s*</mitre>", body, re.IGNORECASE | re.DOTALL)

        mitre_ids: List[str] = []
        for mitre_block in mitre_matches:
            mitre_ids.extend(
                normalize_technique_id(value)
                for value in re.findall(r"<id>(.*?)</id>", mitre_block, re.IGNORECASE | re.DOTALL)
                if value.strip()
            )

        rule_tokens = extract_group_tokens(group_match.group(1) if group_match else "")
        all_tokens = outer_group_tokens + rule_tokens
        technique_names = [comment_technique_names.get(technique_id, "") for technique_id in mitre_ids]

        rows.append(
            {
                "rule_id": (rule_id_match.group(1).strip() if rule_id_match else ""),
                "rule_title": (
                    re.sub(r"\s+", " ", description_match.group(1)).strip() if description_match else ""
                ),
                "mitre_technique_id": join_values(mitre_ids),
                "mitre_technique_name": join_values(name for name in technique_names if name),
                "mitre_tactic": join_values(extract_tactics_from_tokens(all_tokens)),
                "source_file": path.relative_to(REPO_ROOT).as_posix(),
                "platform": join_values(humanize_token(p) for p in extract_platforms_from_tokens(all_tokens)),
            }
        )
    return rows


def extract_group_tokens(raw: str) -> List[str]:
    return [token.strip() for token in raw.split(",") if token.strip()]


def wazuh_rows() -> List[Dict[str, str]]:
    rows: List[Dict[str, str]] = []
    for path in sorted(WAZUH_ROOT.glob("*.xml")):
        rows.extend(parse_wazuh_file(path))
    return rows


def write_csv(rows: List[Dict[str, str]]) -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "rule_id",
        "rule_title",
        "mitre_technique_id",
        "mitre_technique_name",
        "mitre_tactic",
        "source_file",
        "platform",
    ]
    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def fetch_attack_bundle_to_temp() -> Path:
    temp_file = tempfile.NamedTemporaryFile(prefix="signalfoundry-attack-", suffix=".json", delete=False)
    temp_path = Path(temp_file.name)
    temp_file.close()
    with urllib.request.urlopen(ATTACK_STIX_URL, timeout=30) as response:
        temp_path.write_bytes(response.read())
    return temp_path


def load_attack_name_map(bundle_path: Path) -> Dict[str, str]:
    payload = json.loads(bundle_path.read_text(encoding="utf-8"))
    objects = payload.get("objects", [])
    preferred_map: Dict[str, str] = {}
    fallback_map: Dict[str, str] = {}
    for obj in objects:
        if not isinstance(obj, dict):
            continue
        if obj.get("type") != "attack-pattern":
            continue
        name = str(obj.get("name", "")).strip()
        if not name:
            continue
        is_deprecated = obj.get("x_mitre_deprecated") is True
        is_revoked = obj.get("revoked") is True
        for ref in obj.get("external_references", []) or []:
            if not isinstance(ref, dict):
                continue
            if str(ref.get("source_name", "")).strip().lower() != "mitre-attack":
                continue
            attack_id = str(ref.get("external_id", "")).strip()
            if not attack_id:
                continue
            normalized_id = normalize_technique_id(attack_id)
            if is_deprecated or is_revoked:
                fallback_map.setdefault(normalized_id, name)
                continue
            preferred_map[normalized_id] = name
    merged = dict(fallback_map)
    merged.update(preferred_map)
    return merged


def enrich_rows(rows: List[Dict[str, str]], name_map: Dict[str, str]) -> int:
    updated = 0
    for row in rows:
        if row["mitre_technique_name"].strip():
            continue
        technique_ids = [value.strip() for value in row["mitre_technique_id"].split(";") if value.strip()]
        names = [name_map.get(normalize_technique_id(technique_id), "") for technique_id in technique_ids]
        names = [name for name in names if name]
        if not names:
            continue
        row["mitre_technique_name"] = join_values(names)
        updated += 1
    return updated


def print_summary(rows: Sequence[Dict[str, str]]) -> None:
    total_rows = len(rows)
    full_mapping = sum(
        1
        for row in rows
        if row["mitre_technique_id"] and row["mitre_technique_name"] and row["mitre_tactic"]
    )
    missing_technique = sum(1 for row in rows if not row["mitre_technique_id"])
    missing_tactic = sum(1 for row in rows if not row["mitre_tactic"])
    missing_technique_name = sum(1 for row in rows if not row["mitre_technique_name"])

    print(f"OUTPUT={OUTPUT_PATH}")
    print(f"TOTAL_ROWS={total_rows}")
    print(f"ROWS_WITH_FULL_MITRE_MAPPING={full_mapping}")
    print(f"ROWS_MISSING_TECHNIQUE={missing_technique}")
    print(f"ROWS_MISSING_TACTIC={missing_tactic}")
    print(f"ROWS_MISSING_TECHNIQUE_NAME={missing_technique_name}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--enrich",
        action="store_true",
        help="Fetch the ATT&CK Enterprise STIX bundle at runtime and fill missing technique names.",
    )
    args = parser.parse_args()

    rows = sigma_rows() + wazuh_rows()
    if args.enrich:
        bundle_path = fetch_attack_bundle_to_temp()
        try:
            name_map = load_attack_name_map(bundle_path)
        finally:
            bundle_path.unlink(missing_ok=True)
        updated = enrich_rows(rows, name_map)
        print(f"ENRICHED_TECHNIQUE_NAMES={updated}")
    rows.sort(key=lambda row: (row["platform"], row["source_file"], row["rule_id"]))
    write_csv(rows)
    print_summary(rows)


if __name__ == "__main__":
    main()

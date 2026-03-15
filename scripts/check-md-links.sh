#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"

cd "${repo_root}"
python - <<'PY'
from __future__ import annotations

import re
import sys
from pathlib import Path

repo_root = Path.cwd()
pattern = re.compile(r'!\[[^\]]*\]\(([^)]+)\)|\[[^\]]+\]\(([^)]+)\)')
errors: list[str] = []

for md_path in repo_root.rglob("*.md"):
    parts = md_path.parts
    if ".git" in parts or "node_modules" in parts:
        continue
    text = md_path.read_text(encoding="utf-8", errors="ignore")
    for match in pattern.finditer(text):
        raw_target = match.group(1) or match.group(2) or ""
        target = raw_target.strip()
        if not target or target.startswith(("http://", "https://", "mailto:", "#")):
            continue
        clean_target = target.split("#", 1)[0]
        if clean_target.startswith("<") and clean_target.endswith(">"):
            clean_target = clean_target[1:-1]
        if not clean_target:
            continue
        resolved = (md_path.parent / clean_target).resolve()
        if not resolved.exists():
            errors.append(f"{md_path}: missing target {clean_target}")

if errors:
    print("markdown link check failed:", file=sys.stderr)
    for error in errors:
        print(f"- {error}", file=sys.stderr)
    sys.exit(1)

print("markdown link check passed")
PY

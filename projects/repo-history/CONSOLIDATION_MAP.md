# Repository Consolidation Map

**Date:** 2026-02-09
**Branch:** fix/single-source-truth
**PR:** https://github.com/raylee-hawkins/HawkinsOperations/pull/2

This document maps the consolidation of 4 GitHub repositories into HawkinsOperations as the single source of truth.

---

## Consolidation Strategy

**Method:** Copy-import only (NO git history merge)
**Safety:** All outputs, artifacts, logs, and secrets excluded
**Verification:** .gitignore prevents OUTPUTS/, run_*, *.log, secrets from being committed

---

## Source Repositories

### 1. hawkinsops-framework
- **URL:** https://github.com/raylee-hawkins/hawkinsops-framework
- **Language:** Shell
- **Stars:** 2
- **Purpose:** Cross-platform automation framework
- **Status after merge:** Archive recommended

### 2. hawkins_ops
- **URL:** https://github.com/raylee-hawkins/hawkins_ops
- **Language:** PowerShell
- **Stars:** 1
- **Purpose:** Windows navigation hub and operator index
- **Status after merge:** Archive recommended

### 3. hawkinsops-site
- **URL:** https://github.com/raylee-hawkins/hawkinsops-site
- **Language:** HTML
- **Stars:** 0
- **Purpose:** Public website
- **Status after merge:** Archive recommended

### 4. RH_MIGRATION_2026_V2
- **URL:** https://github.com/raylee-hawkins/RH_MIGRATION_2026_V2 (private)
- **Language:** PowerShell
- **Stars:** 0
- **Purpose:** Filesystem migration project
- **Status after merge:** Archive recommended

### 5. hawkinsops-soc-content
- **URL:** https://github.com/raylee-hawkins/hawkinsops-soc-content (already archived)
- **Status:** Already consolidated previously, no action needed

---

## Content Mapping

### hawkinsops-framework → HawkinsOperations

| Source Path | Destination Path | Type | Files |
|-------------|------------------|------|-------|
| System/Scripts/ | tools/framework-scripts/ | Bash scripts | 4 |
| System/Config/ | tools/framework-scripts/ | Config | 1 |
| README.md | imports/hawkinsops-framework/ | Documentation | 1 |

**Excluded:** Data/ (logs, archives, notes, reports - all outputs)

**Key Files Imported:**
- auto_report - Automated reporting utility
- loglab - Logging framework
- opsnote - Quick notes tool
- setup_scriptpack_2_0.sh - Cross-platform setup
- hawkins_aliases.sh - CLI aliases

---

### hawkins_ops → HawkinsOperations

| Source Path | Destination Path | Type | Files |
|-------------|------------------|------|-------|
| blueprints/rebuild_pack/ | docs/blueprints/rebuild_pack/ | Markdown docs | 8 |
| system/scripts/autosync.ps1 | tools/windows-automation/ | PowerShell | 1 |
| README.md | imports/hawkins_ops/ | Documentation | 1 |

**Excluded:**
- data/ (archives, logs, notes, reports - all outputs)
- workspace/ (active, reference, temp - all working files)
- vault/ (finances, personal, projects - sensitive data)

**Key Files Imported:**
- 00_index.md - Blueprint index
- 01_hawkinsops_high_level_architecture.md - System architecture
- 02_rebuild_master_runbook.md - Rebuild procedures
- 10_windows_powerhouse_rebuild.md - Windows setup guide
- 20_primary_os_rebuild_overview.md - OS installation
- 30_services_matrix.md - Services dependencies
- 40_sample_scripts_and_snippets.md - Code samples
- assumptions.md - Project constraints
- autosync.ps1 - Windows sync automation

---

### hawkinsops-site → HawkinsOperations

| Source Path | Destination Path | Type | Files |
|-------------|------------------|------|-------|
| hawkinsops-v2/ | content/website/hawkinsops-v2/ | HTML/Images | 5 |

**Excluded:** None (small static site with no outputs)

**Key Files Imported:**
- index.html - Landing page (~48KB)
- og.png - Social media preview
- apple-touch-icon.png - iOS icon
- favicon-16.png, favicon-32.png - Browser icons

---

### RH_MIGRATION_2026_V2 → HawkinsOperations

| Source Path | Destination Path | Type | Files |
|-------------|------------------|------|-------|
| *.md (root) | docs/migration-patterns/ | Documentation | 7 |
| project_config.json | docs/migration-patterns/ | Configuration | 1 |
| .gitignore | docs/migration-patterns/migration.gitignore | Config | 1 |
| tools/validate_config.ps1 | tools/migration-tools/ | PowerShell | 1 |

**Excluded:**
- Data/ or OUTPUTS/ directories (if present)
- run_* directories (timestamped outputs)
- Any vault/ or secrets/ directories

**Key Files Imported:**
- AGENTS_PROJECT.md - Complete project spec (11KB)
- PROJECT_SUMMARY.md - Phase definitions
- MIGRATION_GUIDE_V1_TO_V2_02-08-2026.md - Upgrade procedures
- ENTRYPOINT.md - Startup guide
- CLAUDE.md - Claude Code instructions
- CODEX.md - Reference pointer
- FILES_CREATED_02-08-2026.md - Generated inventory (dated artifact)
- project_config.json - Migration configuration
- validate_config.ps1 - Config validation utility
- migration.gitignore - Recommended exclusions

---

## Commit History

```
91b5512 feat: import hawkinsops-site assets
f5ddb70 feat: import RH_MIGRATION_2026_V2 patterns
6866d2a feat: import system rebuild blueprints
a9d08b8 feat: import hawkins_ops Windows automation
c33760c feat: import hawkinsops-framework scripts
a809368 feat: add .gitignore and imports staging area
```

**Total:** 6 clean commits, one per logical grouping

---

## Safety Verification

### .gitignore Coverage

✅ OUTPUTS/ and **/OUTPUTS/ excluded
✅ run_*/ and **/run_*/ excluded
✅ *.log and logs/ excluded
✅ node_modules/, venv/, __pycache__/ excluded
✅ .env, *.token, *.key, *.pem excluded
✅ **/secrets/ and **/vault/ excluded

### Test Results

```bash
# Test: Create OUTPUTS/ directory
mkdir -p OUTPUTS/test
echo "test" > OUTPUTS/test/file.txt

# Result: git status shows nothing (correctly ignored)
```

✅ **Verified:** OUTPUTS/ cannot be committed

---

## Post-Merge Cleanup

After merging this PR, archive the source repositories:

```bash
gh repo archive raylee-hawkins/hawkinsops-framework --yes
gh repo archive raylee-hawkins/hawkins_ops --yes
gh repo archive raylee-hawkins/hawkinsops-site --yes
gh repo archive raylee-hawkins/RH_MIGRATION_2026_V2 --yes
```

This makes them read-only while preserving URLs and history.

---

## Organizational Structure After Consolidation

```
HawkinsOperations/                     ← SINGLE SOURCE OF TRUTH
├── detection-rules/                   ← SOC detection content (existing)
├── incident-response/                 ← IR playbooks (existing)
├── threat-hunting/                    ← Threat hunts (existing)
├── runbooks/                          ← Operational runbooks (existing)
├── learning-system/                   ← Training materials (existing)
├── scripts/                           ← Build scripts (existing)
├── tools/                             ← ✨ CONSOLIDATED AUTOMATION
│   ├── framework-scripts/             ← NEW: Bash utilities
│   ├── windows-automation/            ← NEW: PowerShell tools
│   ├── migration-tools/               ← NEW: Migration utilities
│   ├── import/                        ← Existing
│   └── security-automation/           ← Existing
├── docs/                              ← ✨ CONSOLIDATED DOCUMENTATION
│   ├── blueprints/rebuild_pack/       ← NEW: System architecture
│   ├── migration-patterns/            ← NEW: Migration docs
│   ├── wazuh/                         ← Existing
│   └── VERIFY_COMMANDS_POWERSHELL.md  ← Existing
├── content/                           ← ✨ NEW: Website & branding
│   └── website/hawkinsops-v2/
├── imports/                           ← ✨ NEW: Raw staging archive
│   ├── hawkinsops-framework/
│   ├── hawkins_ops/
│   ├── hawkinsops-site/
│   └── RH_MIGRATION_2026_V2/
├── PROOF_PACK/                        ← Portfolio evidence (existing)
├── _archive/                          ← Legacy content (existing)
└── [Documentation files]              ← README, CLAUDE.md, etc.
```

---

## Benefits of Consolidation

1. **Single Source of Truth** - One canonical repository for all HawkinsOps content
2. **Simplified Maintenance** - No need to sync changes across multiple repos
3. **Better Discoverability** - All tools and docs in predictable locations
4. **Clean Git History** - No history pollution from merges
5. **Portfolio Ready** - Organized structure for showcasing work
6. **Improved Documentation** - READMEs for each major directory
7. **Safety First** - .gitignore prevents accidental commit of outputs/secrets

---

## References

- **Pull Request:** https://github.com/raylee-hawkins/HawkinsOperations/pull/2
- **Branch:** fix/single-source-truth
- **Implementation Date:** 2026-02-09
- **Method:** Copy-import (no history merge)


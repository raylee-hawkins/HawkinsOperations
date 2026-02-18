# Migration Guide for Users of Previous Repositories

**Effective Date:** 2026-02-09
**Status:** HawkinsOperations is now the single source of truth

If you were using any of the following repositories, this guide shows you where that content has moved.

---

## ⚠️ Archived Repositories

The following repositories have been consolidated into **HawkinsOperations**:

- ✅ hawkinsops-framework
- ✅ hawkins_ops
- ✅ hawkinsops-site
- ✅ RH_MIGRATION_2026_V2
- ✅ hawkinsops-soc-content (previously archived)

**Action Required:** Update your local clones and references to point to HawkinsOperations.

---

## Quick Reference: Where Did Everything Go?

### hawkinsops-framework Scripts

**Old Location:**
```bash
git clone https://github.com/raylee-hawkins/hawkinsops-framework.git
source hawkinsops-framework/System/Config/hawkins_aliases.sh
./hawkinsops-framework/System/Scripts/auto_report
```

**New Location:**
```bash
git clone https://github.com/raylee-hawkins/HawkinsOperations.git
source HawkinsOperations/tools/framework-scripts/hawkins_aliases.sh
./HawkinsOperations/tools/framework-scripts/auto_report
```

**What Moved:**
- System/Scripts/ → `tools/framework-scripts/`
- System/Config/ → `tools/framework-scripts/`

---

### hawkins_ops Content

**Old Location:**
```powershell
git clone https://github.com/raylee-hawkins/hawkins_ops.git
.\hawkins_ops\system\scripts\autosync.ps1
Get-Content .\hawkins_ops\blueprints\rebuild_pack\02_rebuild_master_runbook.md
```

**New Location:**
```powershell
git clone https://github.com/raylee-hawkins/HawkinsOperations.git
.\HawkinsOperations\tools\windows-automation\autosync.ps1
Get-Content .\HawkinsOperations\docs\blueprints\rebuild_pack\02_rebuild_master_runbook.md
```

**What Moved:**
- system/scripts/autosync.ps1 → `tools/windows-automation/autosync.ps1`
- blueprints/rebuild_pack/ → `docs/blueprints/rebuild_pack/`

---

### hawkinsops-site Website

**Old Location:**
```bash
git clone https://github.com/raylee-hawkins/hawkinsops-site.git
cd hawkinsops-site/hawkinsops-v2
python3 -m http.server
```

**New Location:**
```bash
git clone https://github.com/raylee-hawkins/HawkinsOperations.git
cd HawkinsOperations/content/website/hawkinsops-v2
python3 -m http.server
```

**What Moved:**
- hawkinsops-v2/ → `content/website/hawkinsops-v2/`

---

### RH_MIGRATION_2026_V2 Documentation

**Old Location:**
```powershell
git clone https://github.com/raylee-hawkins/RH_MIGRATION_2026_V2.git  # Private repo
Get-Content .\RH_MIGRATION_2026_V2\AGENTS_PROJECT.md
.\RH_MIGRATION_2026_V2\tools\validate_config.ps1 -ConfigPath config.json
```

**New Location:**
```powershell
git clone https://github.com/raylee-hawkins/HawkinsOperations.git
Get-Content .\HawkinsOperations\docs\migration-patterns\AGENTS_PROJECT.md
.\HawkinsOperations\tools\migration-tools\validate_config.ps1 -ConfigPath config.json
```

**What Moved:**
- *.md docs → `docs/migration-patterns/`
- project_config.json → `docs/migration-patterns/project_config.json`
- tools/validate_config.ps1 → `tools/migration-tools/validate_config.ps1`
- .gitignore → `docs/migration-patterns/migration.gitignore` (reference)

---

## Complete Path Mapping Table

| Old Repo | Old Path | New Path |
|----------|----------|----------|
| hawkinsops-framework | System/Scripts/auto_report | tools/framework-scripts/auto_report |
| hawkinsops-framework | System/Scripts/loglab | tools/framework-scripts/loglab |
| hawkinsops-framework | System/Scripts/opsnote | tools/framework-scripts/opsnote |
| hawkinsops-framework | System/Scripts/setup_scriptpack_2_0.sh | tools/framework-scripts/setup_scriptpack_2_0.sh |
| hawkinsops-framework | System/Config/hawkins_aliases.sh | tools/framework-scripts/hawkins_aliases.sh |
| hawkins_ops | system/scripts/autosync.ps1 | tools/windows-automation/autosync.ps1 |
| hawkins_ops | blueprints/rebuild_pack/* | docs/blueprints/rebuild_pack/* |
| hawkinsops-site | hawkinsops-v2/* | content/website/hawkinsops-v2/* |
| RH_MIGRATION_2026_V2 | *.md | docs/migration-patterns/*.md |
| RH_MIGRATION_2026_V2 | project_config.json | docs/migration-patterns/project_config.json |
| RH_MIGRATION_2026_V2 | tools/validate_config.ps1 | tools/migration-tools/validate_config.ps1 |

---

## For CI/CD and Automation Users

If you have CI/CD pipelines or scripts that clone the old repositories:

### Before (Multiple Repos)
```yaml
steps:
  - name: Clone framework
    run: git clone https://github.com/raylee-hawkins/hawkinsops-framework.git

  - name: Clone ops tools
    run: git clone https://github.com/raylee-hawkins/hawkins_ops.git
```

### After (Single Repo)
```yaml
steps:
  - name: Clone HawkinsOperations
    run: git clone https://github.com/raylee-hawkins/HawkinsOperations.git

  - name: Use consolidated tools
    run: |
      source HawkinsOperations/tools/framework-scripts/hawkins_aliases.sh
      pwsh HawkinsOperations/tools/windows-automation/autosync.ps1
```

---

## For Documentation Links

If you have documentation that links to the old repositories:

**Update GitHub URLs:**
```markdown
<!-- OLD -->
See [hawkinsops-framework](https://github.com/raylee-hawkins/hawkinsops-framework)

<!-- NEW -->
See [HawkinsOperations/tools](https://github.com/raylee-hawkins/HawkinsOperations/tree/main/tools)
```

**Update Clone Commands:**
```markdown
<!-- OLD -->
git clone https://github.com/raylee-hawkins/hawkins_ops.git

<!-- NEW -->
git clone https://github.com/raylee-hawkins/HawkinsOperations.git
```

---

## Accessing Raw Imports (If Needed)

If you need to see the original directory structure as it was imported:

```bash
git clone https://github.com/raylee-hawkins/HawkinsOperations.git
cd HawkinsOperations/imports/

# View original framework structure
ls -R hawkinsops-framework/

# View original ops structure
ls -R hawkins_ops/

# View original site structure
ls -R hawkinsops-site/

# View original migration structure
ls -R RH_MIGRATION_2026_V2/
```

**Note:** Raw imports are preserved for reference but should not be used directly. Use the curated versions in `tools/`, `docs/`, and `content/`.

---

## Timeline

| Date | Event |
|------|-------|
| 2026-02-09 | Consolidation PR created |
| TBD | PR merged to main |
| TBD | Old repositories archived (read-only) |

---

## Need Help?

- **Full consolidation details:** See [CONSOLIDATION_MAP.md](CONSOLIDATION_MAP.md)
- **Directory documentation:**
  - Tools: [tools/README.md](tools/README.md)
  - Docs: [docs/README.md](docs/README.md)
  - Content: [content/README.md](content/README.md)
  - Imports: [imports/README.md](imports/README.md)

- **Issues:** Report at https://github.com/raylee-hawkins/HawkinsOperations/issues

---

## Why Consolidate?

**Benefits of Single Source of Truth:**
1. ✅ Easier to maintain - one repo instead of five
2. ✅ Better organization - logical directory structure
3. ✅ Simplified discovery - everything in one place
4. ✅ Cleaner GitHub org - one canonical repo
5. ✅ Portfolio ready - professional presentation


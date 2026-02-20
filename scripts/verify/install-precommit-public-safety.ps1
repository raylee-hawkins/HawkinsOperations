Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path -LiteralPath "."
$hookDir = Join-Path -Path $repoRoot -ChildPath ".git/hooks"
$hookPath = Join-Path -Path $hookDir -ChildPath "pre-commit"

if (-not (Test-Path -LiteralPath $hookDir)) {
  throw ".git/hooks was not found. Run this from repository root."
}

$hookBody = @"
#!/usr/bin/env pwsh
pwsh -NoProfile -File "./scripts/verify/public-safety-scan.ps1"
if (`$LASTEXITCODE -ne 0) {
  Write-Host "Commit blocked by public safety scan." -ForegroundColor Red
  exit 1
}
"@

Set-Content -LiteralPath $hookPath -Value $hookBody -NoNewline -Encoding UTF8
Write-Host "Installed pre-commit hook: $hookPath"

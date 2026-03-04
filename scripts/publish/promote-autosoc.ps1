param(
  [switch]$Execute,
  [string]$PublishSubdir = "proof/autosoc/latest",
  [string]$OpsRoot = "C:\RH\OPS"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$autoSocScripts = Join-Path -Path $OpsRoot -ChildPath "50_System\Scripts\Automation\auto-soc"
$exportScript = Join-Path -Path $autoSocScripts -ChildPath "export-publish-bundle.py"
$promoteScript = Join-Path -Path $autoSocScripts -ChildPath "promote-publish-bundle.py"
$scanScript = ".\scripts\verify\autosoc-publish-contract-scan.ps1"

if (-not (Test-Path -LiteralPath $exportScript)) {
  throw "Missing export script: $exportScript"
}
if (-not (Test-Path -LiteralPath $promoteScript)) {
  throw "Missing promote script: $promoteScript"
}
if (-not (Test-Path -LiteralPath $scanScript)) {
  throw "Missing contract scan script: $scanScript"
}

$dateTag = Get-Date -Format "MM-dd-yyyy"
$logPath = Join-Path -Path $OpsRoot -ChildPath "50_System\Runs\Logs\autosoc-promote-$dateTag.log"
$logDir = Split-Path -Parent $logPath
if (-not (Test-Path -LiteralPath $logDir)) {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

Start-Transcript -Path $logPath -Append | Out-Null
try {
  Write-Host "STEP=export_publish_bundle"
  python $exportScript
  if ($LASTEXITCODE -ne 0) { throw "export-publish-bundle.py failed." }

  Write-Host "STEP=promote_publish_bundle"
  $promoteArgs = @($promoteScript, "--publish-subdir", $PublishSubdir)
  if ($Execute) { $promoteArgs += "--execute" }
  python @promoteArgs
  if ($LASTEXITCODE -ne 0) { throw "promote-publish-bundle.py failed." }

  Write-Host "STEP=publish_contract_scan"
  pwsh -NoProfile -File $scanScript
  if ($LASTEXITCODE -ne 0) { throw "autosoc-publish-contract-scan.ps1 failed." }

  if ($Execute) {
    Write-Host "PROMOTION_MODE=execute"
  } else {
    Write-Host "PROMOTION_MODE=dry-run"
  }
  Write-Host "PUBLISH_SUBDIR=$PublishSubdir"
  Write-Host "LOG=$logPath"
}
finally {
  Stop-Transcript | Out-Null
}

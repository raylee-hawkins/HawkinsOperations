param(
    [string]$OpsRoot = "C:\RH\OPS",
    [switch]$Execute
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$dateStamp = Get-Date -Format "MM-dd-yyyy"
$logPath = Join-Path $OpsRoot ("50_System\Runs\Logs\sync-metrics-from-pipeline-{0}.log" -f $dateStamp)

function Write-RunLog {
    param([string]$Message)
    $line = "{0} {1}" -f (Get-Date -AsUTC -Format "yyyy-MM-ddTHH:mm:ssZ"), $Message
    Add-Content -LiteralPath $logPath -Value $line
    Write-Host $Message
}

function Read-JsonFile {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Required JSON file not found: $Path"
    }
    try {
        return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json -Depth 100
    } catch {
        throw "Failed to parse JSON file: $Path. $($_.Exception.Message)"
    }
}

function Get-IntProperty {
    param(
        [object]$Object,
        [string]$Name,
        [int]$Default = 0
    )
    if ($null -eq $Object) { return $Default }
    $prop = $Object.PSObject.Properties[$Name]
    if ($null -eq $prop -or $null -eq $prop.Value) { return $Default }
    return [int]$prop.Value
}

function Get-StringProperty {
    param(
        [object]$Object,
        [string]$Name,
        [string]$Default = ""
    )
    if ($null -eq $Object) { return $Default }
    $prop = $Object.PSObject.Properties[$Name]
    if ($null -eq $prop -or $null -eq $prop.Value) { return $Default }
    return [string]$prop.Value
}

function Get-IsoTimestampProperty {
    param(
        [object]$Object,
        [string]$Name,
        [string]$Default = ""
    )
    if ($null -eq $Object) { return $Default }
    $prop = $Object.PSObject.Properties[$Name]
    if ($null -eq $prop -or $null -eq $prop.Value) { return $Default }
    if ($prop.Value -is [datetime]) {
        return ([datetime]$prop.Value).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
    return [string]$prop.Value
}

function ConvertTo-StableJson {
    param([object]$InputObject)
    return ($InputObject | ConvertTo-Json -Depth 100)
}

function Write-Utf8NoBom {
    param(
        [string]$Path,
        [string]$Content
    )
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Get-Sha256Line {
    param(
        [string]$FilePath,
        [string]$RepoRelativePath
    )
    $hash = (Get-FileHash -LiteralPath $FilePath -Algorithm SHA256).Hash.ToLowerInvariant()
    return "{0}  {1}" -f $hash, ($RepoRelativePath -replace "\\", "/")
}

New-Item -ItemType Directory -Path (Split-Path -Parent $logPath) -Force | Out-Null
Write-RunLog "SYNC_START repo_root=$repoRoot execute=$($Execute.IsPresent)"

$outputRoot = Join-Path $OpsRoot "30_Projects\Active\AutoSOC\Output"
$ledgerPath = Join-Path $outputRoot "ledger.json"
$heartbeatPath = Join-Path $outputRoot "heartbeat.json"
$reconciliationPath = Join-Path $outputRoot "reconciliation_latest.json"
$coveragePath = Join-Path $outputRoot "coverage_latest.json"
$verifiedCountsJsonPath = Join-Path $repoRoot "PROOF_PACK\verified_counts.json"
$metricsPath = Join-Path $repoRoot "data\metrics.json"
$metricsShaPath = Join-Path $repoRoot "data\metrics.json.sha256"

$ledger = Read-JsonFile -Path $ledgerPath
$heartbeat = Read-JsonFile -Path $heartbeatPath
$reconciliation = Read-JsonFile -Path $reconciliationPath
$coverage = Read-JsonFile -Path $coveragePath
$verifiedCounts = Read-JsonFile -Path $verifiedCountsJsonPath
$existingMetrics = Read-JsonFile -Path $metricsPath

$ledgerMetrics = $ledger.metrics
$reconCounts = $reconciliation.counts
$verified = $verifiedCounts.counts

$presentHosts = Get-IntProperty -Object $coverage -Name "present_hosts"
$requiredHosts = Get-IntProperty -Object $coverage -Name "required_hosts"
$hostCoverage = "{0}/{1}" -f $presentHosts, $requiredHosts

$escalatedPublished = Get-IntProperty -Object $reconCounts -Name "ledger_escalated_status_ids" -Default (Get-IntProperty -Object $ledgerMetrics -Name "escalated")
$stagedPending = Get-IntProperty -Object $reconCounts -Name "ledger_pending_escalate_ids_staged"
$lastUpdated = Get-IsoTimestampProperty -Object $heartbeat -Name "end_utc" -Default (Get-IsoTimestampProperty -Object $heartbeat -Name "generated_utc")
if (-not $lastUpdated) {
    $lastUpdated = Get-Date -AsUTC -Format "yyyy-MM-ddTHH:mm:ssZ"
}

$newMetrics = [ordered]@{
    running_totals = [ordered]@{
        total_cases = Get-IntProperty -Object $ledgerMetrics -Name "total_cases"
        auto_closed_benign = Get-IntProperty -Object $ledgerMetrics -Name "auto_closed_benign"
        known_fp = Get-IntProperty -Object $ledgerMetrics -Name "auto_closed_known_fp"
        escalated = $escalatedPublished
        review = Get-IntProperty -Object $ledgerMetrics -Name "review"
        staged_pending = $stagedPending
    }
    host_coverage = $hostCoverage
    reconciliation_mismatch = Get-IntProperty -Object $reconciliation -Name "mismatch_count"
    heartbeat = Get-StringProperty -Object $heartbeat -Name "status" -Default "UNKNOWN"
    last_updated = $lastUpdated
    stress_test_window = $existingMetrics.stress_test_window
    detection_inventory = [ordered]@{
        sigma = Get-IntProperty -Object $verified -Name "sigma"
        wazuh_files = Get-IntProperty -Object $verified -Name "wazuh_xml_files"
        wazuh_rule_blocks = Get-IntProperty -Object $verified -Name "wazuh"
        splunk = Get-IntProperty -Object $verified -Name "splunk"
        ir_playbooks = Get-IntProperty -Object $verified -Name "ir"
    }
}

$currentJson = ConvertTo-StableJson -InputObject $existingMetrics
$nextJson = ConvertTo-StableJson -InputObject $newMetrics
$changed = $currentJson -ne $nextJson

Write-RunLog ("SYNC_PREVIEW total_cases={0} benign={1} known_fp={2} escalated={3} review={4} staged_pending={5} coverage={6} heartbeat={7}" -f `
    $newMetrics.running_totals.total_cases,
    $newMetrics.running_totals.auto_closed_benign,
    $newMetrics.running_totals.known_fp,
    $newMetrics.running_totals.escalated,
    $newMetrics.running_totals.review,
    $newMetrics.running_totals.staged_pending,
    $newMetrics.host_coverage,
    $newMetrics.heartbeat)

if (-not $Execute) {
    Write-RunLog "DRY_RUN no files written; rerun with -Execute to apply"
    exit 0
}

$metricsContent = $nextJson + [Environment]::NewLine
Write-Utf8NoBom -Path $metricsPath -Content $metricsContent
Write-Utf8NoBom -Path $metricsShaPath -Content ((Get-Sha256Line -FilePath $metricsPath -RepoRelativePath "data/metrics.json") + [Environment]::NewLine)
Write-RunLog ("WRITE_METRICS changed={0} path={1}" -f $changed, $metricsPath)

Push-Location $repoRoot
try {
    & node ".\scripts\generate-site-data.js"
    if ($LASTEXITCODE -ne 0) { throw "generate-site-data.js failed" }

    & python ".\scripts\validate_metrics.py"
    if ($LASTEXITCODE -ne 0) { throw "validate_metrics.py failed" }
} finally {
    Pop-Location
}

Write-RunLog "SYNC_DONE generator_and_validator_passed"

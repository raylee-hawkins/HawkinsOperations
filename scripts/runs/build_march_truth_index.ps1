param(
    [int]$Year = 2026,
    [int]$Month = 3,
    [string]$RunsRoot = "C:\RH\OPS\50_System\Runs\AutoSOC",
    [string]$MonthIndexRoot = "C:\RH\OPS\50_System\Runs\indexes\months",
    [string]$ReportRoot = "C:\RH\OPS\50_System\Runs\Reports",
    [switch]$Execute
)

$ErrorActionPreference = "Stop"
$today = Get-Date -Format "MM-dd-yyyy"
$monthName = (Get-Culture).DateTimeFormat.GetMonthName($Month).ToUpperInvariant()
$reportPath = Join-Path -Path $ReportRoot -ChildPath ("{0}_TRUTH_INDEX_{1}.md" -f $monthName, $today)

$runMonthPath = Join-Path -Path $RunsRoot -ChildPath (Join-Path -Path $Year -ChildPath ("{0:d2}" -f $Month))
$monthIndexPath = Join-Path -Path $MonthIndexRoot -ChildPath (Join-Path -Path $Year -ChildPath ("{0:d2}" -f $Month))

$manifestFiles = @()
if (Test-Path -LiteralPath $runMonthPath) {
    $manifestFiles = Get-ChildItem -LiteralPath $runMonthPath -Recurse -File -Filter "run_manifest_run_*.json" -ErrorAction SilentlyContinue
}

$runs = @()
$totalFiles = [int64]0
$totalBytes = [int64]0

foreach ($mf in $manifestFiles) {
    $json = Get-Content -LiteralPath $mf.FullName -Raw | ConvertFrom-Json
    $runId = if ($json.run_id) { [string]$json.run_id } else { (Split-Path -Path $mf.DirectoryName -Leaf) }
    $runPath = if ($json.run_path) { [string]$json.run_path } else { $mf.DirectoryName }
    $files = if ($json.file_count) { [int64]$json.file_count } else { 0 }
    $bytes = if ($json.total_size_bytes) { [int64]$json.total_size_bytes } else { 0 }
    $totalFiles += $files
    $totalBytes += $bytes
    $runs += [pscustomobject]@{
        run_id = $runId
        run_path = $runPath
        file_count = $files
        total_size_bytes = $bytes
    }
}

$runs = $runs | Sort-Object run_id -Descending
$latestMonthIndex = $null
if (Test-Path -LiteralPath $monthIndexPath) {
    $latestMonthIndex = Get-ChildItem -LiteralPath $monthIndexPath -File -Filter "runs_index_*.md" -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
}

$lines = @()
$lines += ("# {0} Truth Index ({1}-{2:d2})" -f $monthName, $Year, $Month)
$lines += ""
$lines += ("> Derived view only. Immutable source-of-truth is the run stream under 50_System\\Runs\\AutoSOC\\{0}\\{1:d2}\\run_MM-DD-YYYY_HHMMSS." -f $Year, $Month)
$lines += ""
$lines += "- Generated UTC: $((Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ'))"
$lines += ("- Month run path: {0}" -f $runMonthPath)
$lines += "- Runs found: $($runs.Count)"
$lines += "- Total files (from manifests): $totalFiles"
$lines += "- Total bytes (from manifests): $totalBytes"
$lines += "- Latest month index: $(if ($latestMonthIndex) { $latestMonthIndex.FullName } else { 'not found' })"
$lines += ""
$lines += "## Latest Runs"
$lines += ""
$lines += "| run_id | file_count | total_size_bytes | run_path |"
$lines += "|---|---:|---:|---|"
foreach ($r in ($runs | Select-Object -First 20)) {
    $lines += ("| {0} | {1} | {2} | {3} |" -f $r.run_id, $r.file_count, $r.total_size_bytes, $r.run_path)
}

Write-Host ("[INFO] Runs in month: {0}" -f $runs.Count)
Write-Host ("[INFO] Report target: {0}" -f $reportPath)

if (-not $Execute) {
    Write-Host "[DRY-RUN] Truth index not written. Re-run with -Execute to write file." -ForegroundColor Yellow
    return
}

New-Item -ItemType Directory -Path $ReportRoot -Force | Out-Null
$lines | Set-Content -LiteralPath $reportPath -Encoding utf8
Write-Host ("[OK] Wrote truth index: {0}" -f $reportPath) -ForegroundColor Green

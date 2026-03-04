param(
  [int]$WarnBelow = 80
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-GitLines {
  param([string[]]$GitArgs)
  $out = & git @GitArgs
  if ($LASTEXITCODE -ne 0) {
    throw "git $($GitArgs -join ' ') failed."
  }
  if (-not $out) { return @() }
  return @($out)
}

$status = Get-GitLines -GitArgs @("status", "--porcelain")
$trackedModified = 0
$trackedAdded = 0
$trackedDeleted = 0
$untracked = 0

foreach ($line in $status) {
  if ($line.StartsWith("??")) {
    $untracked++
    continue
  }
  $x = $line.Substring(0, 1)
  $y = $line.Substring(1, 1)
  if ($x -eq "M" -or $y -eq "M") { $trackedModified++ }
  if ($x -eq "A" -or $y -eq "A") { $trackedAdded++ }
  if ($x -eq "D" -or $y -eq "D") { $trackedDeleted++ }
}

# Simple, transparent scoring model.
$score = 100
$score -= [math]::Min($trackedModified * 2, 40)
$score -= [math]::Min($untracked, 30)
$score -= [math]::Min($trackedDeleted * 2, 10)
$score = [math]::Max($score, 0)

$grade = "A"
if ($score -lt 90) { $grade = "B" }
if ($score -lt 80) { $grade = "C" }
if ($score -lt 70) { $grade = "D" }
if ($score -lt 60) { $grade = "F" }

$result = [ordered]@{
  generated_utc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  repo_root = (Resolve-Path -LiteralPath ".").Path
  score = $score
  grade = $grade
  threshold_warn_below = $WarnBelow
  summary = [ordered]@{
    tracked_modified = $trackedModified
    tracked_added = $trackedAdded
    tracked_deleted = $trackedDeleted
    untracked = $untracked
    total_lines = $status.Count
  }
}

$json = $result | ConvertTo-Json -Depth 6
Write-Host $json
Write-Host ("REPO_SCORE={0}" -f $score)
Write-Host ("REPO_GRADE={0}" -f $grade)

if ($score -lt $WarnBelow) {
  Write-Host ("WARN=REPO_STATE_BELOW_THRESHOLD ({0} < {1})" -f $score, $WarnBelow)
}

# Verify site-facing count integrity against PROOF_PACK/verified_counts.json.
param()

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$truthPath = Join-Path $repoRoot "PROOF_PACK\verified_counts.json"
$siteCountsJsPath = Join-Path $repoRoot "site\data\counts.js"
$indexPath = Join-Path $repoRoot "site\index.html"
$resumePath = Join-Path $repoRoot "site\resume.html"

if (!(Test-Path -LiteralPath $truthPath)) {
  Write-Error "Missing source-of-truth file: $truthPath"
}

if (!(Test-Path -LiteralPath $siteCountsJsPath)) {
  Write-Error "Missing generated site counts artifact: $siteCountsJsPath"
}

$truth = Get-Content -Path $truthPath -Raw | ConvertFrom-Json
$truthCounts = $truth.counts

$errors = New-Object System.Collections.Generic.List[string]

function Add-Error([string]$message) {
  $errors.Add($message) | Out-Null
}

function Parse-DataVerifiedMap([string]$html) {
  $result = @{}
  $matches = [regex]::Matches($html, 'data-verified="([a-z_]+)">\s*([^<]+?)\s*<', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  foreach ($match in $matches) {
    $key = $match.Groups[1].Value
    $valueText = $match.Groups[2].Value
    $number = 0
    if ([int]::TryParse($valueText, [ref]$number)) {
      $result[$key] = $number
    }
  }
  return $result
}

# Parse `window.HAWKINSOPS_COUNTS = { ... };`
$siteCountsJsRaw = Get-Content -Path $siteCountsJsPath -Raw
$jsMatch = [regex]::Match($siteCountsJsRaw, 'window\.HAWKINSOPS_COUNTS\s*=\s*(\{[\s\S]*\});?\s*$', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
if (!$jsMatch.Success) {
  Add-Error "Could not parse window.HAWKINSOPS_COUNTS assignment from site\data\counts.js"
  $siteCounts = $null
} else {
  try {
    $siteCounts = $jsMatch.Groups[1].Value | ConvertFrom-Json
  } catch {
    Add-Error "site\data\counts.js JSON payload is invalid: $($_.Exception.Message)"
    $siteCounts = $null
  }
}

if ($siteCounts -ne $null) {
  $checks = @(
    @{ Key = "detections"; Value = $siteCounts.counts.detections },
    @{ Key = "sigma"; Value = $siteCounts.counts.sigma },
    @{ Key = "wazuh"; Value = $siteCounts.counts.wazuh },
    @{ Key = "splunk"; Value = $siteCounts.counts.splunk },
    @{ Key = "ir"; Value = $siteCounts.counts.ir }
  )
  foreach ($check in $checks) {
    $expected = [int]$truthCounts.($check.Key)
    $actual = [int]$check.Value
    if ($expected -ne $actual) {
      Add-Error "site\data\counts.js mismatch for '$($check.Key)': expected $expected, got $actual"
    }
  }
}

$indexMap = Parse-DataVerifiedMap (Get-Content -Path $indexPath -Raw)
$resumeMap = Parse-DataVerifiedMap (Get-Content -Path $resumePath -Raw)

$indexKeys = @("detections", "sigma", "wazuh", "splunk", "ir")
foreach ($key in $indexKeys) {
  if (!$indexMap.ContainsKey($key)) {
    Add-Error "index.html missing data-verified fallback for '$key'"
    continue
  }
  $expected = [int]$truthCounts.$key
  if ($indexMap[$key] -ne $expected) {
    Add-Error "index.html fallback mismatch for '$key': expected $expected, got $($indexMap[$key])"
  }
}

$resumeKeys = @("sigma", "wazuh", "wazuh_xml_files", "splunk", "ir")
foreach ($key in $resumeKeys) {
  if (!$resumeMap.ContainsKey($key)) {
    Add-Error "resume.html missing data-verified fallback for '$key'"
    continue
  }
  $expected = [int]$truthCounts.$key
  if ($resumeMap[$key] -ne $expected) {
    Add-Error "resume.html fallback mismatch for '$key': expected $expected, got $($resumeMap[$key])"
  }
}

if ($errors.Count -gt 0) {
  Write-Host "SITE COUNT INTEGRITY: FAIL"
  foreach ($err in $errors) {
    Write-Host " - $err"
  }
  exit 1
}

Write-Host "SITE COUNT INTEGRITY: PASS"
Write-Host " - source: PROOF_PACK/verified_counts.json"
Write-Host " - generated: site/data/counts.js"
Write-Host " - homepage and resume count fallbacks match source-of-truth"
exit 0

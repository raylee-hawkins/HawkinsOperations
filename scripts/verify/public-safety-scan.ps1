Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path -LiteralPath "."

$scanRoots = @(
  "site",
  "content/projects/lab/PP_SOC_Integration",
  "README.md",
  "content/projects/README.md",
  "content/projects/lab/README.md"
)

$skipExtensions = @(
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".zip", ".csv", ".jsonl", ".woff", ".woff2"
)

$patterns = @(
  @{ Name = "Private key block"; Regex = "(?i)BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY"; Severity = "high" },
  @{ Name = "GitHub PAT"; Regex = "(?i)\b(ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b"; Severity = "high" },
  @{ Name = "AWS access key"; Regex = "\bAKIA[0-9A-Z]{16}\b"; Severity = "high" },
  @{ Name = "JWT-like token"; Regex = "\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b"; Severity = "high" },
  @{ Name = "API secret assignment"; Regex = "(?i)\b(API[_-]?KEY|SECRET|TOKEN|PASSWORD)\b\s*[:=]\s*[^\s]+"; Severity = "high" },
  @{ Name = "User path /home/raylee"; Regex = "(?i)/home/raylee\b"; Severity = "medium" },
  @{ Name = "User path C:\\Users\\Raylee"; Regex = "(?i)C:\\\\Users\\\\Raylee\b"; Severity = "medium" },
  @{ Name = "Service path /srv/moltbot"; Regex = "(?i)/srv/moltbot\b"; Severity = "medium" },
  @{ Name = "IPv4 address"; Regex = "\b(?:(?:25[0-5]|2[0-4][0-9]|1?[0-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1?[0-9]?[0-9])\b"; Severity = "low" }
)

function Get-TargetFiles {
  param([string[]]$Roots)

  $files = New-Object System.Collections.Generic.List[string]
  foreach ($rel in $Roots) {
    $path = Join-Path -Path $repoRoot -ChildPath $rel
    if (-not (Test-Path -LiteralPath $path)) { continue }

    $item = Get-Item -LiteralPath $path
    if ($item.PSIsContainer) {
      Get-ChildItem -LiteralPath $path -File -Recurse | ForEach-Object {
        if ($skipExtensions -contains $_.Extension.ToLowerInvariant()) { return }
        $files.Add($_.FullName)
      }
    } else {
      if ($skipExtensions -contains $item.Extension.ToLowerInvariant()) { continue }
      $files.Add($item.FullName)
    }
  }
  return $files
}

$targets = Get-TargetFiles -Roots $scanRoots
if ($targets.Count -eq 0) {
  Write-Host "No files matched scan roots. Nothing to scan."
  exit 0
}

$findings = New-Object System.Collections.Generic.List[object]

foreach ($file in $targets) {
  $lines = Get-Content -LiteralPath $file -Encoding UTF8
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    foreach ($p in $patterns) {
      if ($line -match $p.Regex) {
        $relPath = Resolve-Path -LiteralPath $file -Relative
        $findings.Add([pscustomobject]@{
          severity = $p.Severity
          rule = $p.Name
          file = $relPath
          line = $i + 1
          text = $line.Trim()
        })
      }
    }
  }
}

if ($findings.Count -gt 0) {
  Write-Host "Public safety scan failed with findings:" -ForegroundColor Red
  $findings | Sort-Object severity, file, line | Format-Table -AutoSize
  exit 1
}

Write-Host "Public safety scan passed. No blocked patterns found." -ForegroundColor Green
exit 0



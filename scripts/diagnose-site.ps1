param(
  [switch]$FailOnIssues
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

$argsList = @("scripts/diagnose-site.js")
if ($FailOnIssues) {
  $argsList += "--fail-on-issues"
}

node @argsList

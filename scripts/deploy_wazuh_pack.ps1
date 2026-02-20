param(
  [string]$PackRoot = "wazuh/pack"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-Stamp {
  return Get-Date -Format "MM-dd-yyyy_HHmmss"
}

function New-EvidenceDir {
  $stamp = Get-Stamp
  $runDir = Join-Path (Get-Location) "evidence/wazuh/run_$stamp"
  New-Item -ItemType Directory -Path $runDir -Force | Out-Null
  return $runDir
}

function Get-SshOptions {
  param([int]$Port, [string]$KeyPath)
  $opts = @("-p", "$Port")
  if ($KeyPath) { $opts += @("-i", $KeyPath) }
  return $opts
}

function Invoke-Ssh {
  param(
    [string]$Host,
    [string]$User,
    [int]$Port,
    [string]$KeyPath,
    [string]$Command
  )
  $opts = Get-SshOptions -Port $Port -KeyPath $KeyPath
  & ssh @opts "$User@$Host" $Command 2>&1
}

function Copy-WithScp {
  param(
    [string]$SourceGlob,
    [string]$Host,
    [string]$User,
    [int]$Port,
    [string]$KeyPath,
    [string]$DestinationDir
  )
  $opts = Get-SshOptions -Port $Port -KeyPath $KeyPath
  & scp @opts $SourceGlob "$User@$Host:$DestinationDir" 2>&1
}

$hostName = if ($env:WAZUH_HOST) { $env:WAZUH_HOST } else { "192.168.8.231" }
$sshUser = if ($env:WAZUH_SSH_USER) { $env:WAZUH_SSH_USER } else { "root" }
$sshPort = if ($env:WAZUH_SSH_PORT) { [int]$env:WAZUH_SSH_PORT } else { 22 }
$sshKey = if ($env:WAZUH_SSH_KEY) { $env:WAZUH_SSH_KEY } else { "" }

$rulesDest = "/var/ossec/etc/rules/"
$decodersDest = "/var/ossec/etc/decoders/"
$listsDest = "/var/ossec/etc/lists/"
$backupRoot = "/var/ossec/backup"
$managerService = "wazuh-manager"

$packPath = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $PackRoot))
$runDir = New-EvidenceDir
$validationOut = Join-Path $runDir "validation_output.txt"
$deployReport = Join-Path $runDir "deploy_report.md"
$remoteStamp = Get-Date -Format "MM-dd-yyyy_HHmmss"
$remoteBackupDir = "$backupRoot/wazuh_pack_$remoteStamp"

$summary = New-Object System.Collections.Generic.List[string]
$summary.Add("# Wazuh Pack Deployment Report") | Out-Null
$summary.Add("") | Out-Null
$summary.Add("- Date: $(Get-Date -Format 'MM-dd-yyyy HH:mm:ss')") | Out-Null
$summary.Add("- Host: $hostName") | Out-Null
$summary.Add("- SSH user: $sshUser") | Out-Null
$summary.Add("- Pack root: $PackRoot") | Out-Null
$summary.Add("- Remote backup dir: $remoteBackupDir") | Out-Null
$summary.Add("") | Out-Null

try {
  $validateOutput = & pwsh -NoProfile -File ".\scripts\validate_wazuh_pack.ps1" -PackRoot $PackRoot 2>&1
  $validateOutput | Out-File -LiteralPath $validationOut -Encoding UTF8
  if ($LASTEXITCODE -ne 0) { throw "validate_wazuh_pack.ps1 failed. See validation_output.txt" }

  $summary.Add("## Validation") | Out-Null
  $summary.Add("- Status: PASS") | Out-Null
  $summary.Add("") | Out-Null

  $mkdirCmd = "mkdir -p $backupRoot '$remoteBackupDir' $rulesDest $decodersDest $listsDest"
  Invoke-Ssh -Host $hostName -User $sshUser -Port $sshPort -KeyPath $sshKey -Command $mkdirCmd | Out-File -LiteralPath $validationOut -Append -Encoding UTF8

  $backupCmd = "cp -a $rulesDest '$remoteBackupDir/rules_backup' && cp -a $decodersDest '$remoteBackupDir/decoders_backup' && cp -a $listsDest '$remoteBackupDir/lists_backup'"
  Invoke-Ssh -Host $hostName -User $sshUser -Port $sshPort -KeyPath $sshKey -Command $backupCmd | Out-File -LiteralPath $validationOut -Append -Encoding UTF8

  if (Test-Path -LiteralPath (Join-Path $packPath "rules")) {
    Copy-WithScp -SourceGlob "$packPath/rules/*.xml" -Host $hostName -User $sshUser -Port $sshPort -KeyPath $sshKey -DestinationDir $rulesDest | Out-File -LiteralPath $validationOut -Append -Encoding UTF8
  }

  if (Test-Path -LiteralPath (Join-Path $packPath "decoders")) {
    Copy-WithScp -SourceGlob "$packPath/decoders/*.xml" -Host $hostName -User $sshUser -Port $sshPort -KeyPath $sshKey -DestinationDir $decodersDest | Out-File -LiteralPath $validationOut -Append -Encoding UTF8
  }

  if (Test-Path -LiteralPath (Join-Path $packPath "lists")) {
    Copy-WithScp -SourceGlob "$packPath/lists/*" -Host $hostName -User $sshUser -Port $sshPort -KeyPath $sshKey -DestinationDir $listsDest | Out-File -LiteralPath $validationOut -Append -Encoding UTF8
  }

  $xmllintCmd = "if command -v xmllint >/dev/null 2>&1; then xmllint --noout $rulesDest/*.xml; [ -d $decodersDest ] && ls $decodersDest/*.xml >/dev/null 2>&1 && xmllint --noout $decodersDest/*.xml || true; else echo 'xmllint not available; skipping'; fi"
  Invoke-Ssh -Host $hostName -User $sshUser -Port $sshPort -KeyPath $sshKey -Command $xmllintCmd | Out-File -LiteralPath $validationOut -Append -Encoding UTF8

  $sampleLocal = Join-Path $packPath "tests/log_samples/powershell_encodedcommand.json"
  if (Test-Path -LiteralPath $sampleLocal) {
    $tmpSample = "/tmp/wazuh_logtest_sample.json"
    Copy-WithScp -SourceGlob $sampleLocal -Host $hostName -User $sshUser -Port $sshPort -KeyPath $sshKey -DestinationDir $tmpSample | Out-File -LiteralPath $validationOut -Append -Encoding UTF8
    $logtestCmd = "if [ -x /var/ossec/bin/wazuh-logtest ]; then cat $tmpSample | /var/ossec/bin/wazuh-logtest; else echo 'wazuh-logtest not available; skipping'; fi"
    Invoke-Ssh -Host $hostName -User $sshUser -Port $sshPort -KeyPath $sshKey -Command $logtestCmd | Out-File -LiteralPath $validationOut -Append -Encoding UTF8
  } else {
    "No local log sample found at $sampleLocal; skipping wazuh-logtest." | Out-File -LiteralPath $validationOut -Append -Encoding UTF8
  }

  Invoke-Ssh -Host $hostName -User $sshUser -Port $sshPort -KeyPath $sshKey -Command "systemctl restart $managerService" | Out-File -LiteralPath $validationOut -Append -Encoding UTF8
  Invoke-Ssh -Host $hostName -User $sshUser -Port $sshPort -KeyPath $sshKey -Command "systemctl is-active $managerService" | Out-File -LiteralPath $validationOut -Append -Encoding UTF8
  Invoke-Ssh -Host $hostName -User $sshUser -Port $sshPort -KeyPath $sshKey -Command "tail -n 80 /var/ossec/logs/ossec.log" | Out-File -LiteralPath $validationOut -Append -Encoding UTF8

  $summary.Add("## Deployment") | Out-Null
  $summary.Add("- Status: SUCCESS") | Out-Null
  $summary.Add("- Manager service restart attempted: yes") | Out-Null
  $summary.Add("- Post-checks captured in validation_output.txt") | Out-Null
  $summary.Add("") | Out-Null
  $summary.Add("## Rollback") | Out-Null
  $summary.Add("```bash") | Out-Null
  $summary.Add("cp -a '$remoteBackupDir/rules_backup/.' $rulesDest") | Out-Null
  $summary.Add("cp -a '$remoteBackupDir/decoders_backup/.' $decodersDest") | Out-Null
  $summary.Add("cp -a '$remoteBackupDir/lists_backup/.' $listsDest") | Out-Null
  $summary.Add("systemctl restart $managerService") | Out-Null
  $summary.Add("```") | Out-Null
}
catch {
  $summary.Add("## Deployment") | Out-Null
  $summary.Add("- Status: FAILED") | Out-Null
  $summary.Add("- Error: $($_.Exception.Message)") | Out-Null
  $summary.Add("") | Out-Null
  throw
}
finally {
  $summary | Out-File -LiteralPath $deployReport -Encoding UTF8
}

param(
  [string]$BaseUrl = "https://hawkinsops.com",
  [int]$TimeoutSeconds = 20
)

$ErrorActionPreference = "Stop"

function New-HttpClient {
  param(
    [bool]$AllowRedirect = $true,
    [int]$TimeoutSec = 20
  )

  $handler = [System.Net.Http.HttpClientHandler]::new()
  $handler.AllowAutoRedirect = $AllowRedirect
  $handler.AutomaticDecompression = [System.Net.DecompressionMethods]::GZip -bor [System.Net.DecompressionMethods]::Deflate
  $client = [System.Net.Http.HttpClient]::new($handler)
  $client.Timeout = [System.TimeSpan]::FromSeconds($TimeoutSec)
  $client.DefaultRequestHeaders.UserAgent.ParseAdd("HawkinsOps-Smoke/1.0")
  return $client
}

function Invoke-HttpGet {
  param(
    [System.Net.Http.HttpClient]$Client,
    [string]$Url
  )

  try {
    $response = $Client.GetAsync($Url).GetAwaiter().GetResult()
    $body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    $locationHeader = $null
    if ($response.Headers.Location) {
      $locationHeader = $response.Headers.Location.OriginalString
    }

    return [pscustomobject]@{
      Ok       = $true
      Url      = $Url
      Status   = [int]$response.StatusCode
      Body     = [string]$body
      Location = $locationHeader
      Error    = $null
    }
  } catch {
    return [pscustomobject]@{
      Ok       = $false
      Url      = $Url
      Status   = $null
      Body     = ""
      Location = $null
      Error    = $_.Exception.Message
    }
  }
}

function Get-FirstNonWhitespaceChar {
  param([string]$Text)
  if ([string]::IsNullOrWhiteSpace($Text)) { return "" }
  $trimmed = $Text.TrimStart()
  if ([string]::IsNullOrEmpty($trimmed)) { return "" }
  return $trimmed.Substring(0, 1)
}

function Resolve-LocationUrl {
  param(
    [string]$Base,
    [string]$Location
  )

  if ([string]::IsNullOrWhiteSpace($Location)) { return $null }
  if ($Location -match "^https?://") { return $Location }
  if ($Location.StartsWith("/")) { return "$Base$Location" }
  return "$Base/$Location"
}

function Add-Result {
  param(
    [System.Collections.Generic.List[object]]$Results,
    [string]$Check,
    [string]$Url,
    [string]$Expected,
    [string]$Actual,
    [bool]$Pass,
    [string]$Detail
  )

  $Results.Add([pscustomobject]@{
      Check    = $Check
      Url      = $Url
      Expected = $Expected
      Actual   = $Actual
      Pass     = $Pass
      Detail   = $Detail
    })
}

$clientFollow = New-HttpClient -AllowRedirect $true -TimeoutSec $TimeoutSeconds
$clientNoFollow = New-HttpClient -AllowRedirect $false -TimeoutSec $TimeoutSeconds
$results = [System.Collections.Generic.List[object]]::new()

$assetUrls = @(
  "$BaseUrl/assets/styles.css",
  "$BaseUrl/assets/app.js",
  "$BaseUrl/assets/portfolio-data.js",
  "$BaseUrl/assets/data/detections.json",
  "$BaseUrl/assets/data/media.json",
  "$BaseUrl/assets/verified-counts.json"
)

$responseMap = @{}
foreach ($url in $assetUrls) {
  $resp = Invoke-HttpGet -Client $clientFollow -Url $url
  $responseMap[$url] = $resp
  $pass = $resp.Ok -and $resp.Status -eq 200
  $actual = if ($resp.Ok) { "HTTP $($resp.Status)" } else { "ERROR" }
  $detail = if ($resp.Ok) { "" } else { $resp.Error }
  Add-Result -Results $results -Check "ASSET_200" -Url $url -Expected "HTTP 200" -Actual $actual -Pass $pass -Detail $detail
}

$jsonUrls = @(
  "$BaseUrl/assets/data/detections.json",
  "$BaseUrl/assets/data/media.json",
  "$BaseUrl/assets/verified-counts.json"
)

foreach ($url in $jsonUrls) {
  $resp = $responseMap[$url]
  if (-not $resp) {
    $resp = Invoke-HttpGet -Client $clientFollow -Url $url
  }
  $first = Get-FirstNonWhitespaceChar -Text $resp.Body
  $pass = $resp.Ok -and $resp.Status -eq 200 -and ($first -eq "{" -or $first -eq "[")
  $actual = if (-not $resp.Ok) {
    "ERROR"
  } else {
    "HTTP $($resp.Status), starts '$first'"
  }
  $detail = if (-not $resp.Ok) {
    $resp.Error
  } elseif ($first -eq "<") {
    "Response begins with '<' (likely HTML error page)"
  } else {
    ""
  }
  Add-Result -Results $results -Check "JSON_SHAPE" -Url $url -Expected "Starts with { or [ (not <)" -Actual $actual -Pass $pass -Detail $detail
}

$redirectCases = @(
  @{ Name = "security"; Slash = "$BaseUrl/security/"; AllowedTargets = @("/security", "/security.html") },
  @{ Name = "projects"; Slash = "$BaseUrl/projects/"; AllowedTargets = @("/projects", "/projects.html") },
  @{ Name = "lab"; Slash = "$BaseUrl/lab/"; AllowedTargets = @("/lab", "/lab.html") },
  @{ Name = "proof"; Slash = "$BaseUrl/proof/"; AllowedTargets = @("/proof", "/proof.html") }
)

foreach ($case in $redirectCases) {
  $slashUrl = [string]$case.Slash
  $allowedTargets = @($case.AllowedTargets)

  $redirectResp = Invoke-HttpGet -Client $clientNoFollow -Url $slashUrl

  $locationHeader = if ($redirectResp.Ok) { [string]$redirectResp.Location } else { "" }
  $locationPath = ""
  if (-not [string]::IsNullOrWhiteSpace($locationHeader)) {
    if ($locationHeader -match "^https?://") {
      try {
        $locationPath = ([System.Uri]$locationHeader).AbsolutePath
      } catch {
        $locationPath = $locationHeader
      }
    } else {
      $locationPath = $locationHeader
    }
  }

  $statusPass = $redirectResp.Ok -and ($redirectResp.Status -eq 301 -or $redirectResp.Status -eq 308)
  $locationPass = $false
  foreach ($target in $allowedTargets) {
    if ($locationPath -eq $target) {
      $locationPass = $true
      break
    }
  }

  $redirectPass = $statusPass -and $locationPass
  $redirectActual = if ($redirectResp.Ok) {
    "HTTP $($redirectResp.Status), Location: $locationHeader"
  } else {
    "ERROR"
  }
  $redirectDetail = if ($redirectResp.Ok) {
    ""
  } else {
    $redirectResp.Error
  }
  Add-Result -Results $results -Check "REDIRECT_SHAPE" -Url $slashUrl -Expected "301/308 to $($allowedTargets -join ' or ')" -Actual $redirectActual -Pass $redirectPass -Detail $redirectDetail

  $finalUrl = Resolve-LocationUrl -Base $BaseUrl -Location $locationHeader
  if ([string]::IsNullOrWhiteSpace($finalUrl)) {
    $finalUrl = "$BaseUrl$($allowedTargets[0])"
  }
  $finalResp = Invoke-HttpGet -Client $clientFollow -Url $finalUrl
  $finalPass = $finalResp.Ok -and $finalResp.Status -eq 200
  $finalActual = if ($finalResp.Ok) { "HTTP $($finalResp.Status)" } else { "ERROR" }
  $finalDetail = if ($finalResp.Ok) { "" } else { $finalResp.Error }
  Add-Result -Results $results -Check "REDIRECT_FINAL_200" -Url $finalUrl -Expected "HTTP 200" -Actual $finalActual -Pass $finalPass -Detail $finalDetail
}

$table = $results |
  Sort-Object Check, Url |
  Format-Table Check, Url, Expected, Actual, Pass, Detail -AutoSize -Wrap |
  Out-String -Width 4096
Write-Host $table

$passed = ($results | Where-Object { $_.Pass }).Count
$failed = ($results | Where-Object { -not $_.Pass }).Count
$total = $results.Count

Write-Host ""
Write-Host "Smoke summary: $passed/$total passed, $failed failed."

if ($failed -gt 0) {
  exit 1
}

exit 0


[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string] $ProjectPath,

  [string] $Branch = "main",
  [string] $AppName = "proposal-maker"
)

$ErrorActionPreference = "Stop"

function Invoke-Native {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Command,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $Arguments
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code $LASTEXITCODE`: $Command $($Arguments -join ' ')"
  }
}

if (-not (Test-Path (Join-Path $ProjectPath ".git"))) {
  throw "ProjectPath is not a Git checkout: $ProjectPath"
}

Set-Location $ProjectPath

$dirtyFiles = @(git status --porcelain)
if ($dirtyFiles.Count -gt 0) {
  throw "Deployment stopped because the production checkout has uncommitted changes: $($dirtyFiles -join ', ')"
}

Invoke-Native git fetch origin $Branch
$remoteCommit = (git rev-parse "origin/$Branch").Trim()
$localCommit = (git rev-parse HEAD).Trim()

if ($localCommit -ne $remoteCommit) {
  Invoke-Native git merge --ff-only "origin/$Branch"
}

Invoke-Native npm ci
Invoke-Native npm run build

$pm2 = Get-Command pm2.cmd -ErrorAction SilentlyContinue
if ($null -eq $pm2) {
  $npmPrefix = (npm config get prefix).Trim()
  $candidate = Join-Path $npmPrefix "pm2.cmd"
  if (Test-Path $candidate) {
    $pm2 = Get-Item $candidate
  }
}

if ($null -eq $pm2) {
  throw "PM2 was not found. Install it globally and register the app before deploying."
}

& $pm2.Source describe $AppName *> $null
if ($LASTEXITCODE -ne 0) {
  throw "PM2 app '$AppName' does not exist. Register it once with: pm2 start server.js --name $AppName"
}

Invoke-Native $pm2.Source restart $AppName --update-env
Invoke-Native $pm2.Source save

Write-Host "Deployed $remoteCommit to $ProjectPath and restarted PM2 app '$AppName'."
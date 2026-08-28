$ErrorActionPreference = 'Stop'

$projectPath = 'E:\websites\proposalmaker\HT-PF'
$sourcePath = $PSScriptRoot | Split-Path -Parent
if (-not $sourcePath -or -not (Test-Path (Join-Path $sourcePath 'package.json'))) {
  $sourcePath = $env:GITHUB_WORKSPACE
}

$pm2Home = 'C:\Users\User.WIN-P4GS0JVSN3R\.pm2'
$pm2Path = 'C:\ProgramData\npm\pm2.cmd'
if (-not (Test-Path $pm2Path)) {
  $pm2Path = 'C:\Users\User.WIN-P4GS0JVSN3R\AppData\Roaming\npm\pm2.cmd'
}
$appName = 'ht-pf-production'

if (-not $sourcePath -or -not (Test-Path (Join-Path $sourcePath 'package.json'))) {
  throw "GitHub Actions checkout was not found at '$sourcePath'."
}

Write-Host "Syncing files from $sourcePath to $projectPath..."
Set-Location $projectPath

# Copy all repository items except .git and node_modules from checkout to project directory
Get-ChildItem -Path $sourcePath -Exclude '.git', 'node_modules', '.next' | ForEach-Object {
  $target = Join-Path $projectPath $_.Name
  if ($_.PSIsContainer) {
    if (-not (Test-Path $target)) {
      New-Item -ItemType Directory -Path $target -Force | Out-Null
    }
    Copy-Item -Path (Join-Path $_.FullName '*') -Destination $target -Recurse -Force
  } else {
    Copy-Item -Path $_.FullName -Destination $target -Force
  }
}

Write-Host "Installing dependencies..."
npm ci

Write-Host "Building Next.js application..."
npm run build

Write-Host "Restarting PM2 app '$appName'..."
$env:PM2_HOME = $pm2Home

& $pm2Path describe $appName *> $null
if ($LASTEXITCODE -eq 0) {
  & $pm2Path restart $appName --update-env
} else {
  & $pm2Path start (Join-Path $projectPath 'server.js') --name $appName --cwd $projectPath --time --update-env
}

& $pm2Path save

Write-Host "Deployment completed successfully for $appName!"

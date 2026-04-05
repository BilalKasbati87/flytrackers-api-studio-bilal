$ErrorActionPreference = "Stop"

$projectPath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$tempRoot = Join-Path $env:TEMP ("flytrackers-vercel-" + [guid]::NewGuid().ToString())
$stagingRoot = Join-Path $tempRoot "staging"
$tarball = Join-Path $tempRoot "project.tgz"

New-Item -ItemType Directory -Path $tempRoot | Out-Null
New-Item -ItemType Directory -Path $stagingRoot | Out-Null

try {
  $includePaths = @(
    "src",
    "prisma",
    "scripts",
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "next-env.d.ts",
    "postcss.config.mjs",
    "tsconfig.json",
    "prisma.config.ts",
    "eslint.config.mjs",
    ".gitignore"
  )

  foreach ($relativePath in $includePaths) {
    $sourcePath = Join-Path $projectPath $relativePath

    if (-not (Test-Path $sourcePath)) {
      continue
    }

    $destinationPath = Join-Path $stagingRoot $relativePath
    $destinationParent = Split-Path -Parent $destinationPath

    if ($destinationParent) {
      New-Item -ItemType Directory -Path $destinationParent -Force | Out-Null
    }

    Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Recurse -Force
  }

  tar.exe -czf $tarball -C $stagingRoot .

  if ($LASTEXITCODE -ne 0) {
    throw "Failed to create the deployment package."
  }

  $responseText = curl.exe -s -X POST "https://codex-deploy-skills.vercel.sh/api/deploy" -F ("file=@" + $tarball) -F "framework=nextjs"

  if ($LASTEXITCODE -ne 0) {
    throw "Deployment upload failed."
  }

  try {
    $response = $responseText | ConvertFrom-Json
  }
  catch {
    throw ("Unexpected deploy response: " + $responseText)
  }

  if ($null -ne $response.error) {
    throw [string] $response.error
  }

  if (-not $response.previewUrl) {
    throw "Preview URL was missing from the deployment response."
  }

  $previewUrl = [string] $response.previewUrl
  $claimUrl = [string] $response.claimUrl

  Write-Output ("PREVIEW_URL=" + $previewUrl)
  Write-Output ("CLAIM_URL=" + $claimUrl)

  for ($attempt = 0; $attempt -lt 60; $attempt++) {
    $statusText = curl.exe -s -o NUL -w "%{http_code}" $previewUrl

    if ($LASTEXITCODE -ne 0) {
      Start-Sleep -Seconds 5
      continue
    }

    $statusCode = 0
    [void] [int]::TryParse($statusText, [ref] $statusCode)

    if ($statusCode -eq 200 -or ($statusCode -ge 400 -and $statusCode -lt 500)) {
      break
    }

    Start-Sleep -Seconds 5
  }

  Write-Output $responseText
}
finally {
  if (Test-Path $tempRoot) {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force
  }
}

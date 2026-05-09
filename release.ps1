# release.ps1

Write-Host "Building the extension..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Stopping release process." -ForegroundColor Red
    exit $LASTEXITCODE
}

$zipName = "extension-release.zip"

Write-Host "Packaging dist folder into $zipName..." -ForegroundColor Cyan
Compress-Archive -Path dist\* -DestinationPath $zipName -Force

Write-Host "Successfully created $zipName!" -ForegroundColor Green
Write-Host "You can now upload this file to the Chrome Web Store." -ForegroundColor Green

$git = "C:\Program Files\Git\cmd\git.exe"
if (-not (Test-Path $git)) {
    $git = "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
}
if (-not (Test-Path $git)) {
    $git = "git"
}

Write-Host "Pushing SentinelScope to GitHub remote..." -ForegroundColor Cyan
& $git push -u origin main --force

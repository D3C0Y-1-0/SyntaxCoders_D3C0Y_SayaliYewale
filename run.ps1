$python = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
if (-not (Test-Path $python)) {
    $python = "python"
}
Write-Host "Starting SentinelScope Server on http://127.0.0.1:8000 ..." -ForegroundColor Cyan
& $python -m uvicorn api.app.main:app --host 127.0.0.1 --port 8000 --reload


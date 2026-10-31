@echo off
set "PYTHON=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
if not exist "%PYTHON%" set "PYTHON=python"
echo Starting SentinelScope Server on http://127.0.0.1:8000 ...
"%PYTHON%" -m uvicorn api.app.main:app --host 127.0.0.1 --port 8000 --reload


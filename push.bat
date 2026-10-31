@echo off
set "GIT_EXE=C:\Program Files\Git\cmd\git.exe"
if not exist "%GIT_EXE%" set "GIT_EXE=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
if not exist "%GIT_EXE%" set "GIT_EXE=git"

echo Pushing SentinelScope to GitHub remote...
"%GIT_EXE%" push -u origin main --force
pause

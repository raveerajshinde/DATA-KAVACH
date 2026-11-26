@echo off
REM Data Kavach - DPDP Compliance Platform installer launcher
REM Usage: INSTALL.bat [install.ps1 parameters], e.g. INSTALL.bat -Mode Service -HttpPort 8080
setlocal
cd /d "%~dp0"
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Requesting administrator rights...
  if "%~1"=="" (
    powershell -NoProfile -Command "Start-Process -FilePath \"%~f0\" -Verb RunAs"
  ) else (
    powershell -NoProfile -Command "Start-Process -FilePath \"%~f0\" -ArgumentList \"%*\" -Verb RunAs"
  )
  exit /b
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1" %*
set RC=%errorlevel%
echo.
if %RC% neq 0 (echo Installation reported an error. See the log under the logs folder.) else (echo Done.)
pause
exit /b %RC%

@echo off
echo Stopping NovaMart Microservices Platform via PowerShell...
powershell -ExecutionPolicy Bypass -File "%~dp0stop-all.ps1"
pause

@echo off
title LabStockEase Startup Script
echo Starting LabStockEase... Please wait.

:: Backend
start "Backend Server" cmd /k "cd /d %~dp0backend && powershell -Command \"Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process\" && yarn dev"

:: Frontend
start "Frontend App" cmd /k "cd /d %~dp0frontend && powershell -Command \"Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process\" && yarn dev"

:: AI Module
start "AI Module" cmd /k "cd /d %~dp0aimodule && powershell -Command \"Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process\" && .\\env310\\Scripts\\activate && uvicorn main:app --reload --port 9000"

echo All services are starting in separate windows.
exit

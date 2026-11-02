@echo off
title FitMon launcher
cd /d "%~dp0"

echo.
echo  FitMon - local launcher
echo  -----------------------

where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js is not installed. Download the LTS version from https://nodejs.org
  echo  and run this file again.
  pause
  exit /b 1
)

rem Create the .env files from the templates the first time
if not exist "backend\.env" (
  copy "backend\.env.example" "backend\.env" >nul
  echo  Created backend\.env - fill in your Firebase settings, then run this again.
  set NEED_ENV=1
)
if not exist "frontend\.env" (
  copy "frontend\.env.example" "frontend\.env" >nul
  echo  Created frontend\.env - fill in your Firebase web app settings, then run this again.
  set NEED_ENV=1
)
if defined NEED_ENV (
  echo.
  echo  See README.md, section "Setup", for where to find each value.
  start "" notepad "backend\.env"
  start "" notepad "frontend\.env"
  pause
  exit /b 0
)

rem Install packages the first time (npm.cmd avoids the PowerShell script block)
if not exist "backend\node_modules" (
  echo  Installing backend packages...
  pushd backend
  call npm.cmd install
  popd
)
if not exist "frontend\node_modules" (
  echo  Installing frontend packages...
  pushd frontend
  call npm.cmd install
  popd
)

echo  Starting the backend and the website in two new windows...
start "FitMon backend" cmd /k "cd /d "%~dp0backend" && npm.cmd run dev"
start "FitMon website" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

echo  Opening http://localhost:5173 in a few seconds.
echo  To stop FitMon, close the two new windows.
timeout /t 8 /nobreak >nul
start "" http://localhost:5173

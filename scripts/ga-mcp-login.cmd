@echo off
rem Sign-in helper for the Google Analytics MCP server (see docs/analytics-mcp.md).
rem Comments are in English on purpose: cmd.exe reads batch files in the console
rem code page, and Japanese text in a .cmd file is garbled or mis-parsed on some setups.
rem
rem Everything is stored under a dedicated gcloud config dir (%APPDATA%\gcloud-kuroneko-ga)
rem so the usual gcloud account, project and ADC on this machine stay untouched.
rem
rem   scripts\ga-mcp-login.cmd account   sign in to gcloud with the festival Google account
rem                                      (needed once, for setting up the GCP project)
rem   scripts\ga-mcp-login.cmd adc       create the credentials the MCP server uses
rem                                      (service-account impersonation, read-only scope)
rem   scripts\ga-mcp-login.cmd           both, in that order

setlocal
set "CLOUDSDK_CONFIG=%APPDATA%\gcloud-kuroneko-ga"
set "GA_ACCOUNT=kuronekotaiwan.matsuri@gmail.com"
set "GA_PROJECT=kuronekotaiwan-2027"
set "GA_SA=ga-mcp-reader@%GA_PROJECT%.iam.gserviceaccount.com"
set "GA_SCOPES=https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/cloud-platform"

if "%~1"=="adc" goto adc

echo == gcloud auth login (%GA_ACCOUNT%) ==
call gcloud auth login %GA_ACCOUNT%
if errorlevel 1 exit /b 1
call gcloud config set project %GA_PROJECT%
if "%~1"=="account" goto end

:adc
echo == application-default login, impersonating %GA_SA% ==
call gcloud auth application-default login --impersonate-service-account=%GA_SA% --scopes=%GA_SCOPES% --project=%GA_PROJECT%
if errorlevel 1 exit /b 1
echo.
echo Credentials for the MCP server: %CLOUDSDK_CONFIG%\application_default_credentials.json

:end
endlocal

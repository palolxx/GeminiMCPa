@echo off
setlocal

cd /d "%~dp0"

echo ===== Running Gemini MCP Server (Direct) =====
echo.

set GEMINI_API_KEY=AIzaSyCbwTkrKItvFez1vVIlfnAGPoG5oDUGmd4

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "%~dp0node_modules" (
    echo Installing dependencies...
    call npm install express cors axios
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to install dependencies.
        pause
        exit /b 1
    )
)

echo Starting server...
echo.

node server\server-direct.js

if %ERRORLEVEL% neq 0 (
    echo Server exited with code %ERRORLEVEL%
    pause
)

endlocal 
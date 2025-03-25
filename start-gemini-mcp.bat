@echo off
setlocal enabledelayedexpansion

echo.
echo ===== Gemini MCP Server =====
echo.

:: Set the Gemini API key from environment or file
set API_KEY=%GEMINI_API_KEY%
if defined API_KEY (
    echo Using API key from environment variable.
) else (
    if exist "%~dp0.env" (
        for /f "tokens=2 delims==" %%a in ('findstr /b /c:"GEMINI_API_KEY=" "%~dp0.env"') do (
            set API_KEY=%%a
            echo Found API key in .env file.
        )
    )
    
    if not defined API_KEY (
        if exist "%~dp0geminikey.txt" (
            set /p API_KEY=<"%~dp0geminikey.txt"
            echo Found API key in geminikey.txt file.
        )
    )
)

if not defined API_KEY (
    echo WARNING: No Gemini API key found! 
    echo Server will run in simulation mode.
    echo.
) else (
    echo API key found and set.
)

:: Set the API key for the server
set "GEMINI_API_KEY=%API_KEY%"

:: Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    goto :error
)

:: Check if dependencies are installed
echo Checking dependencies...
if not exist "%~dp0node_modules" (
    echo Installing dependencies...
    cd /d "%~dp0"
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to install dependencies.
        goto :error
    )
)

:: Start the server with full console output
echo Starting Gemini MCP server...
echo.
cd /d "%~dp0"
node server\simple_mcp_server.js
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Server exited with code %ERRORLEVEL%
    goto :error
)

goto :eof

:error
echo.
echo ===== ERROR: Gemini MCP Server failed to start =====
echo.
endlocal
pause
exit /b 1

@echo off
setlocal

echo Installing required dependencies...
call npm install express body-parser axios cors dotenv
if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies. Please check if Node.js is installed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Checking for Gemini API key...

:: Check if .env file exists
if exist "%~dp0.env" (
    echo Loading configuration from .env file
    for /F "tokens=*" %%A in (%~dp0.env) do (
        set %%A
    )
) else (
    echo .env file not found. You may need to run set_gemini_api_key.bat first
    echo Using simulation mode...
    set GEMINI_API_KEY=simulation
    set NODE_ENV=development
)

echo.
echo Starting Gemini Sequential Thinking MCP Server...
echo.

node server\gemini_mcp_server.js
if %ERRORLEVEL% NEQ 0 (
    echo Error running the server. Please check the console output above.
    pause
    exit /b %ERRORLEVEL%
)

pause 
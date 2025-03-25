@echo off
echo Installing required dependencies...
call npm install axios readline
if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies. Please check if Node.js is installed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Starting Gemini Sequential Thinking Client...
echo.

node client\mcp_client.js
if %ERRORLEVEL% NEQ 0 (
    echo Error running the client. Please check the console output above.
    pause
    exit /b %ERRORLEVEL%
)

pause 
@echo off
setlocal

echo =========================================
echo Gemini Sequential Thinking MCP Server
echo =========================================
echo.

:: Check config and environment
if not exist "%~dp0.env" (
    echo WARNING: No .env file found. Simulation mode will be activated.
    echo You can set up an API key later using set_gemini_api_key.bat
    echo.
)

:: Set NODE_ENV to production if not set
if not defined NODE_ENV (
    set NODE_ENV=production
)

echo Starting MCP server on port 3030...
echo.
echo Server endpoint: http://localhost:3030/mcp
echo REST API: http://localhost:3030/api
echo.
echo Press Ctrl+C to stop the server
echo.

:: Start the server
node server/gemini_mcp_server.js

:: This will only execute if the server exits
echo.
echo Server has stopped.
pause 
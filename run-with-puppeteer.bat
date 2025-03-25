@echo off
echo ========================================================
echo     GEMINI MCP SERVER WITH PUPPETEER INTEGRATION
echo ========================================================
echo.
echo This script will:
echo 1. Start Puppeteer MCP server in background
echo 2. Start Gemini MCP server
echo.
echo This enables you to use both Sequential Thinking and Puppeteer
echo browser automation tools together in Cursor.
echo.
echo ========================================================
echo.
pause

cd /d "%~dp0"

echo.
echo Step 1: Installing dependencies...
echo.
call npm install
if errorlevel 1 (
    echo Error installing dependencies!
    pause
    exit /b 1
)

echo.
echo Step 2: Starting Puppeteer MCP server in background...
echo.
start cmd /c "npx -y @modelcontextprotocol/server-puppeteer"
echo Wait 3 seconds for Puppeteer to initialize...
timeout /t 3 /nobreak > nul

echo.
echo Step 3: Configuring and starting Gemini MCP server...
echo.
node fix-mcp-server.js

echo.
echo Step 4: Starting Gemini MCP server...
echo.
node server/simple_mcp_server.js

echo.
echo Server stopped.
echo.
pause 
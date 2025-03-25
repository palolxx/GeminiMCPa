@echo off
echo ========================================================
echo             GEMINI MCP SERVER FOR CURSOR
echo ========================================================
echo.
echo Starting Gemini MCP Server...
echo.
echo This batch file will:
echo 1. Install dependencies (if needed)
echo 2. Configure the API key and MCP settings
echo 3. Start the MCP server
echo.
echo Make sure you have your Gemini API key in geminikey.txt
echo or in the .env file before proceeding.
echo.
echo ========================================================
echo.
pause

cd /d "%~dp0"

echo.
echo Step 1: Installing dependencies and configuring...
echo.
node fix-mcp-server.js

echo.
echo Step 2: Starting the MCP server...
echo.
cd /d "%~dp0"
node server/simple_mcp_server.js

echo.
echo Server stopped.
echo.
pause 
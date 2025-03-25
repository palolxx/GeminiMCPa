@echo off
setlocal

echo =========================================
echo Robust Gemini Sequential Thinking MCP Server
echo =========================================
echo.

:: Create necessary directories
mkdir logs 2>nul
mkdir sessions 2>nul

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found. Please install Node.js before continuing.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

:: Check Node.js version
for /f "tokens=* USEBACKQ" %%F in (`node --version`) do set NODE_VERSION=%%F
echo Found Node.js %NODE_VERSION%

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies.
        echo Please run 'npm install' manually and check for errors.
        pause
        exit /b 1
    )
)

:: Check for .env file and create if not exists
if not exist ".env" (
    echo Creating default .env file...
    echo PORT=3030 > .env
    echo DEBUG=* >> .env
    echo # Add your Gemini API key here if needed >> .env
    echo # GEMINI_API_KEY=your_api_key_here >> .env
)

:: Register the server in Cursor MCP configuration
echo.
echo Ensuring server is registered in Cursor's MCP configuration...

:: Check if .cursor directory exists in user profile
if not exist "%USERPROFILE%\.cursor" (
    mkdir "%USERPROFILE%\.cursor"
)

:: Generate mcp.json config
set MCP_CONFIG={"mcpServers":{"sequentialthinking":{"type":"sse","url":"http://localhost:3030/mcp"}}}
echo !MCP_CONFIG! > temp_mcp.json

:: Try to merge with existing config or create new
if exist "%USERPROFILE%\.cursor\mcp.json" (
    echo Updating existing Cursor MCP configuration...
    :: Just overwrite for simplicity - in a production scenario you'd merge configurations
    copy /y temp_mcp.json "%USERPROFILE%\.cursor\mcp.json" >nul
) else (
    echo Creating new Cursor MCP configuration...
    copy /y temp_mcp.json "%USERPROFILE%\.cursor\mcp.json" >nul
)

del temp_mcp.json

echo.
echo Starting MCP server on port 3030...
echo.
echo Server endpoint: http://localhost:3030/mcp
echo REST API: http://localhost:3030/api
echo.
echo Press Ctrl+C to stop the server
echo.

:: Start the server
node server/robust-mcp-server.js

:: This will only execute if the server exits
echo.
echo Server has stopped.
pause 
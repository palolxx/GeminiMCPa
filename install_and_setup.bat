@echo off
setlocal

echo =========================================
echo Gemini Sequential Thinking MCP Server
echo Installation and Setup
echo =========================================
echo.

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

echo.
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo Setting up Gemini Sequential Thinking MCP Server...
node setup.js
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Setup failed.
    pause
    exit /b 1
)

echo.
echo Installation and setup completed successfully!
echo.
echo To start the server: npm run start:server
echo To start the client: npm run start:client
echo.

pause 
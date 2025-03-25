@echo off
setlocal

echo =========================================
echo Gemini API Key Configuration
echo =========================================
echo.

set ENV_FILE=%~dp0.env

echo This script will set up your Gemini API key for the Sequential Thinking MCP Server.
echo.
echo You can get a Gemini API key from: https://aistudio.google.com/app/apikey
echo.
echo If you don't have an API key, you can leave this blank to use simulation mode.
echo.

set /p API_KEY="Enter your Gemini API key (leave blank for simulation mode): "

if "%API_KEY%"=="" (
    echo.
    echo Using simulation mode (no real API calls will be made)
    set API_KEY=simulation
)

echo.
echo Writing API key to environment file...

echo GEMINI_API_KEY=%API_KEY%> "%ENV_FILE%"

echo.
echo Configuration completed!
echo Your Gemini Sequential Thinking MCP Server will use the provided API key.
echo.
echo If you need to change the API key later, run this script again.
echo.

pause 
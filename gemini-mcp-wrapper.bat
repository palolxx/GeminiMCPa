@echo off
setlocal

:: Set current directory to the directory where this batch file is located
cd /d "%~dp0"

:: Set Gemini API Key from the environment
set GEMINI_API_KEY=AIzaSyCbwTkrKItvFez1vVIlfnAGPoG5oDUGmd4

:: Log startup information
echo Starting Gemini MCP Server...
echo Using API Key: %GEMINI_API_KEY:~0,8%***
echo Current directory: %CD%

:: Run the Node.js script
node run-mcp.js

:: If an error occurs, display it
if %ERRORLEVEL% neq 0 (
  echo Error starting Gemini MCP Server. Error code: %ERRORLEVEL%
  pause
)

endlocal 
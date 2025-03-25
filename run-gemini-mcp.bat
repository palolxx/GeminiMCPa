@echo off
setlocal

:: Set the Gemini API key
set GEMINI_API_KEY=AIzaSyCbwTkrKItvFez1vVIlfnAGPoG5oDUGmd4

:: Run the MCP server
node "%~dp0server\simple_mcp_server.js"

endlocal 
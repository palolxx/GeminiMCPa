@echo off
setlocal

:: Set current directory to the directory where this batch file is located
cd /d "%~dp0"

:: Set API key
set GEMINI_API_KEY=AIzaSyCbwTkrKItvFez1vVIlfnAGPoG5oDUGmd4

:: Check if uv is installed
where uv >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: UV is not installed. Installing...
    pip install uv
    if %ERRORLEVEL% neq 0 (
        echo Failed to install UV. Please install it manually with:
        echo pip install uv
        pause
        exit /b 1
    )
)

:: Run the Python script using UV
echo Starting Gemini MCP Server with UV...
uv run python "%~dp0gemini_mcp_server.py"

:: If an error occurs
if %ERRORLEVEL% neq 0 (
    echo Error running Gemini MCP Server. Error code: %ERRORLEVEL%
    pause
)

endlocal 
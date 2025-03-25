@echo off
setlocal

cd /d "%~dp0"

echo ===================================================================
echo                       GEMINI MCP SERVER                           
echo ===================================================================
echo.
echo To add this server to Cursor MCP:
echo.
echo 1. Open Cursor
echo 2. Go to Settings (gear icon)
echo 3. Search for "MCP" or navigate to Features section
echo 4. Click "Add New MCP Server"
echo 5. Enter the following information:
echo.
echo    Name: GeminiMCP
echo.
echo    Command:
echo    uv run python "%~dp0gemini_runner.py"
echo.
echo    Or with explicit API key:
echo    env GEMINI_API_KEY=AIzaSyCbwTkrKItvFez1vVIlfnAGPoG5oDUGmd4 uv run python "%~dp0gemini_runner.py"
echo.
echo ===================================================================
echo.
echo Testing the command locally...
echo.

:: Check if uv is installed
where uv >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo UV is not installed. Installing...
    pip install uv
    if %ERRORLEVEL% neq 0 (
        echo Failed to install UV. Please install it manually with:
        echo pip install uv
    )
)

echo.
echo Running test command...
echo.
uv run python "%~dp0gemini_runner.py"

echo.
echo If the test was successful, you can add the command to Cursor MCP.
echo.
echo ===================================================================

pause 
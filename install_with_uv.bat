@echo off
setlocal

echo ===== Installing Gemini MCP Server with UV =====
echo.

:: Check if uv is installed
where uv >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: UV is not installed or not in PATH.
    echo Installing UV...
    pip install uv
    if %ERRORLEVEL% neq 0 (
        echo Failed to install UV. Please install it manually with:
        echo pip install uv
        goto :error
    )
)

:: Install the package with uv in development mode
echo Installing Gemini MCP Server in development mode...
cd /d "%~dp0"
uv pip install -e .
if %ERRORLEVEL% neq 0 (
    echo Failed to install with UV.
    goto :error
)

echo.
echo Installation successful!
echo.
echo You can now add this server to Cursor using the command:
echo uv run gemini-mcp-server
echo.
echo Ensure GEMINI_API_KEY is set in your environment or .env file.
echo.

goto :eof

:error
echo.
echo Installation failed.
echo.
endlocal
pause
exit /b 1 
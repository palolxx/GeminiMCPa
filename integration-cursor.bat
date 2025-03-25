@echo off
setlocal enabledelayedexpansion

echo =========================================
echo Cursor IDE Integration Setup
echo =========================================
echo.

:: Set paths
set CURSOR_CONFIG_PATH=%USERPROFILE%\.cursor\mcp.json
set TEMP_CONFIG_PATH=%TEMP%\cursor_mcp_temp.json
set GEMINI_CONFIG_SAMPLE=%~dp0config\cursor-mcp-config.json

:: Check if MCP config exists
if not exist "!CURSOR_CONFIG_PATH!" (
    echo Creating new Cursor MCP configuration...
    
    :: Create directory if it doesn't exist
    if not exist "%USERPROFILE%\.cursor" (
        mkdir "%USERPROFILE%\.cursor"
    )
    
    :: Create new config with just our server
    echo {> "!CURSOR_CONFIG_PATH!"
    echo   "mcpServers": {>> "!CURSOR_CONFIG_PATH!"
    echo     "gemini-sequential-thinking": {>> "!CURSOR_CONFIG_PATH!"
    echo       "command": "cmd",>> "!CURSOR_CONFIG_PATH!"
    echo       "args": [>> "!CURSOR_CONFIG_PATH!"
    echo         "/c",>> "!CURSOR_CONFIG_PATH!"
    echo         "node",>> "!CURSOR_CONFIG_PATH!"
    echo         "%USERPROFILE%\GeminiMCP\server\gemini_mcp_server.js">> "!CURSOR_CONFIG_PATH!"
    echo       ],>> "!CURSOR_CONFIG_PATH!"
    echo       "env": {>> "!CURSOR_CONFIG_PATH!"
    echo         "DEBUG": "*">> "!CURSOR_CONFIG_PATH!"
    echo       }>> "!CURSOR_CONFIG_PATH!"
    echo     }>> "!CURSOR_CONFIG_PATH!"
    echo   }>> "!CURSOR_CONFIG_PATH!"
    echo }>> "!CURSOR_CONFIG_PATH!"
    
    echo Created new configuration at !CURSOR_CONFIG_PATH!
) else (
    echo Existing Cursor MCP configuration found.
    echo Checking if Gemini Sequential Thinking is already configured...
    
    findstr /C:"gemini-sequential-thinking" "!CURSOR_CONFIG_PATH!" >nul
    if !ERRORLEVEL! EQU 0 (
        echo Gemini Sequential Thinking is already configured in Cursor.
        echo.
        echo If you want to reconfigure it, please edit the file manually:
        echo !CURSOR_CONFIG_PATH!
    ) else (
        echo Adding Gemini Sequential Thinking to existing configuration...
        
        :: Create a temporary file with the updated configuration
        :: This is a simplified approach - in a real scenario, you might want to use a JSON parser
        
        :: Get the content before the last closing brace
        for /f "usebackq delims=" %%a in (`type "!CURSOR_CONFIG_PATH!" ^| findstr /n "^"`) do (
            set "line=%%a"
            set "line=!line:*:=!"
            
            echo !line! | findstr /C:"}" >nul
            if !ERRORLEVEL! EQU 0 (
                set "lastBrace=!line!"
            ) else (
                echo !line!>> "!TEMP_CONFIG_PATH!"
            )
        )
        
        :: Add a comma if needed (assuming there's at least one server already)
        echo,>> "!TEMP_CONFIG_PATH!"
        
        :: Add our server configuration
        echo     "gemini-sequential-thinking": {>> "!TEMP_CONFIG_PATH!"
        echo       "command": "cmd",>> "!TEMP_CONFIG_PATH!"
        echo       "args": [>> "!TEMP_CONFIG_PATH!"
        echo         "/c",>> "!TEMP_CONFIG_PATH!"
        echo         "node",>> "!TEMP_CONFIG_PATH!"
        echo         "%USERPROFILE%\GeminiMCP\server\gemini_mcp_server.js">> "!TEMP_CONFIG_PATH!"
        echo       ],>> "!TEMP_CONFIG_PATH!"
        echo       "env": {>> "!TEMP_CONFIG_PATH!"
        echo         "DEBUG": "*">> "!TEMP_CONFIG_PATH!"
        echo       }>> "!TEMP_CONFIG_PATH!"
        echo     }>> "!TEMP_CONFIG_PATH!"
        
        :: Add the final brace back
        echo   }>> "!TEMP_CONFIG_PATH!"
        echo }>> "!TEMP_CONFIG_PATH!"
        
        :: Replace the original file
        move /y "!TEMP_CONFIG_PATH!" "!CURSOR_CONFIG_PATH!" >nul
        
        echo Successfully added Gemini Sequential Thinking to Cursor configuration.
    )
)

echo.
echo =========================================
echo Cursor IDE Integration Complete
echo =========================================
echo.
echo To use the Gemini Sequential Thinking MCP in Cursor:
echo.
echo 1. Make sure you have the latest version of Cursor installed
echo 2. Restart Cursor if it's currently running
echo 3. You can now select "Sequential Thinking" from the MCP tools
echo    available in Cursor
echo.
echo The server will start automatically when needed by Cursor.
echo.

pause 
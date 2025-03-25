# Gemini MCP Server Setup for Cursor

If you're seeing "failed to create client" errors, follow these steps to set up the Gemini MCP server correctly.

## Option 1: Direct Node.js Method (Recommended)

1. Open Cursor
2. Go to Settings
3. Navigate to MCP Servers section
4. Click "Add New MCP Server"
5. Enter this information:
   - **Name**: `GeminiMCP-Direct`
   - **Command**: 
   ```
   D:\User\Work\webappdevelopment5\concrete-website\GeminiMCP\run-direct.bat
   ```

This uses a simplified, direct implementation of the MCP protocol that is more compatible with Cursor.

## Option 2: Use UV with Python Wrapper

If you prefer the UV approach:

1. Open Cursor
2. Go to Settings
3. Navigate to MCP Servers section
4. Click "Add New MCP Server"
5. Enter this information:
   - **Name**: `GeminiMCP-UV`
   - **Command**: 
   ```
   env GEMINI_API_KEY=AIzaSyCbwTkrKItvFez1vVIlfnAGPoG5oDUGmd4 uv run python "D:\User\Work\webappdevelopment5\concrete-website\GeminiMCP\gemini_runner.py"
   ```

## Troubleshooting

If you still see "failed to create client":

1. **Restart Cursor** after adding the MCP server
2. Try adding the server again with a different name
3. Check that port 3030 is not in use by another service
4. Verify your Gemini API key is valid - try to replace it with a new one
5. Check your Windows firewall settings - make sure it's not blocking the MCP server
6. Try adding this to your `%APPDATA%/Cursor/config.json`:
   ```json
   "experimentalMcp": true
   ```

## Test the Server First

It's recommended to test the server before adding it to Cursor:

1. Open a command prompt
2. Navigate to your GeminiMCP directory
3. Run the batch file: `run-direct.bat`
4. If it starts without errors, you can add it to Cursor 
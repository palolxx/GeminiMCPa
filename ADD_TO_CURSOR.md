# Adding Gemini MCP Server to Cursor

Follow these steps to add the Gemini MCP Server to Cursor using UV:

## Prerequisites

1. Install UV:
   ```
   pip install uv
   ```

2. Make sure your Gemini API Key is available (in .env or geminikey.txt)

## Add to Cursor

In Cursor's MCP Server settings:

1. Open Cursor Settings
2. Navigate to "MCP Servers" section
3. Click "Add New MCP Server"
4. Fill in the form:
   - **Name**: `GeminiMCP`
   - **Command**: 
   ```
   uv run --directory "D:\User\Work\webappdevelopment5\concrete-website\GeminiMCP" python "D:\User\Work\webappdevelopment5\concrete-website\GeminiMCP\gemini_mcp_server.py"
   ```
   - Leave other fields as default
5. Click "Add"

## Alternative Command Format

If the above doesn't work, try:

```
env GEMINI_API_KEY=AIzaSyCbwTkrKItvFez1vVIlfnAGPoG5oDUGmd4 uv run --directory "D:\User\Work\webappdevelopment5\concrete-website\GeminiMCP" python "D:\User\Work\webappdevelopment5\concrete-website\GeminiMCP\gemini_mcp_server.py"
```

This explicitly passes the API key in the command. 
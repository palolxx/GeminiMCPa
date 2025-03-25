# Deploying to Smithery AI

This guide will walk you through the process of deploying your Gemini MCP server to Smithery AI.

## Prerequisites

1. A Smithery AI account (sign up at https://smithery.ai if you don't have one)
2. A Google Gemini API key (from Google AI Studio)
3. Git installed on your computer (to push your code to Smithery)

## Deployment Steps

### 1. Prepare Your Repository

The repository is already set up with the necessary files for Smithery AI deployment:
- `Dockerfile` - Defines how to build your server
- `smithery.yaml` - Configures your deployment settings
- `package.json` - Defines your Node.js dependencies
- `server/server-direct.js` - The main server implementation

### 2. Create a New Deployment on Smithery AI

1. Go to https://smithery.ai/new
2. You'll need to connect your GitHub account if you haven't already
3. Choose "Deploy from GitHub" 
4. Select the repository containing your Gemini MCP server code

### 3. Configure Your Deployment

1. Set a name for your deployment (e.g., "gemini-mcp")
2. Add your environment variables:
   - `GEMINI_API_KEY`: Your Google AI Studio API key

3. Click "Deploy"

### 4. Wait for Deployment to Complete

Smithery AI will build and deploy your MCP server. This process typically takes a few minutes.

### 5. Connect to Your MCP Server

Once deployed, Smithery AI will provide you with a URL for your MCP server (e.g., `https://gemini-mcp.smithery.ai/mcp`).

To use it with Claude Desktop:

1. Open Claude Desktop
2. Go to Settings > MCP Servers
3. Add a new server with:
   - Name: Gemini MCP
   - URL: Your Smithery deployment URL (ending with /mcp)
4. Save and restart Claude

## Troubleshooting

If you encounter issues:

1. **Deployment Failures**
   - Check the build logs on Smithery AI
   - Verify your Dockerfile and smithery.yaml are correctly formatted

2. **Runtime Errors**
   - Check if your GEMINI_API_KEY is correctly set
   - Look at the logs provided by Smithery AI

3. **Connection Issues**
   - Ensure the URL in Claude Desktop includes the `/mcp` path
   - Check if the server is running by visiting the health endpoint: `https://your-deployment-url.smithery.ai/health`

## Updating Your Deployment

To update your deployment after making changes:

1. Push your changes to GitHub
2. Smithery AI will automatically rebuild and redeploy your server

## Additional Resources

- [Smithery AI Documentation](https://smithery.ai/docs)
- [Model Context Protocol (MCP) Specification](https://github.com/anthropics/anthropic-cookbook/tree/main/mcp)
- [Google Gemini API Documentation](https://ai.google.dev/docs) 
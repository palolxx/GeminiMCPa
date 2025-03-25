# Gemini MCP Server

An MCP (Model Context Protocol) server implementation that enables using Google's Gemini AI models through Claude or other MCP clients.

## Features

- Full MCP protocol support via SSE transport
- Gemini 1.5 Pro model integration
- Sequential thinking tool implementation
- Environment variable configuration

## Deployment on Smithery AI

This server is designed to be easily deployed on Smithery AI. Once deployed, you'll be able to connect to it from any MCP client like Claude.

### Configuration

The server requires the following environment variables:

- `GEMINI_API_KEY`: Your Google AI Studio API key for accessing Gemini models

## Local Development

If you want to run this server locally:

1. Clone the repository
2. Install dependencies: `npm install`
3. Set your Gemini API key: `export GEMINI_API_KEY=your_key_here`
4. Start the server: `npm start`

## How to Use

After deploying to Smithery AI, you'll get a unique URL that you can add to your MCP client:

1. Copy the deployment URL from Smithery AI
2. In Claude Desktop, go to Settings > MCP Servers
3. Add a new server with:
   - Name: Gemini MCP
   - URL: Your Smithery deployment URL
4. Save and restart Claude

## License

MIT 
const express = require('express');
const cors = require('cors');
const { McpServer } = require('@modelcontextprotocol/sdk/lib/server/mcp');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/lib/server/sse');

// Create express app
const app = express();
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send('MCP Server is running. Connect to /mcp for SSE endpoint.');
});

// Create MCP server
const server = new McpServer({
  name: 'sequentialthinking',
  version: '1.0.0'
});

// Add the sequential thinking tool
server.tool(
  'sequentialthinking',
  {
    thought: { type: 'string', description: 'Current thinking step' },
    nextThoughtNeeded: { type: 'boolean', description: 'Whether another step is needed' },
    thoughtNumber: { type: 'integer', description: 'Current thought number', minimum: 1 },
    totalThoughts: { type: 'integer', description: 'Estimated total thoughts', minimum: 1 }
  },
  async (params) => {
    console.log('Tool called with:', params);
    return {
      content: [{ type: 'text', text: `Thought ${params.thoughtNumber}: ${params.thought}` }]
    };
  }
);

// Set up SSE endpoint
app.get('/mcp', (req, res) => {
  console.log('New SSE connection received');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Handle client disconnection
  req.on('close', () => {
    console.log('Client disconnected');
  });
  
  // Create and handle SSE transport
  const transport = new SSEServerTransport(server);
  transport.handleRequest(req, res);
});

// Start server
const PORT = 3030;
app.listen(PORT, () => {
  console.log(`MCP Server running on http://localhost:${PORT}`);
});
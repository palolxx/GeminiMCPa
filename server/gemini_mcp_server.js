/**
 * Gemini MCP Server
 * 
 * Server that implements the MCP protocol and provides sequentialthinking tool
 * integration with Google's Gemini API.
 */

require('./dotenv-config');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { McpServer } = require('@modelcontextprotocol/sdk/lib/server/mcp');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/lib/server/sse');
const GeminiApi = require('./gemini-api');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3030;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create sessions directory if it doesn't exist
const sessionsDir = path.join(__dirname, '..', 'sessions');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

// Configure logging
app.use(morgan('combined', {
  stream: fs.createWriteStream(path.join(logsDir, 'server.log'), { flags: 'a' })
}));
app.use(morgan('dev'));

// Configure middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini API client
const geminiApi = new GeminiApi(process.env.GEMINI_API_KEY);

// Create MCP server
const mcpServer = new McpServer({
  name: 'geminimcp',
  version: '1.0.0'
});

// In-memory session cache
const sessions = {};

// Helper function to load a session
function loadSession(sessionId) {
  if (sessions[sessionId]) {
    return sessions[sessionId];
  }
  
  try {
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    if (fs.existsSync(sessionPath)) {
      const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
      sessions[sessionId] = sessionData;
      return sessionData;
    }
  } catch (error) {
    console.error(`Error loading session ${sessionId}:`, error);
  }
  
  return null;
}

// Helper function to save a session
function saveSession(sessionId, sessionData) {
  try {
    sessions[sessionId] = sessionData;
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving session ${sessionId}:`, error);
    return false;
  }
}

// Register sequentialthinking tool
mcpServer.tool(
  'sequentialthinking',
  {
    thought: { type: 'string', description: 'Your current thinking step' },
    nextThoughtNeeded: { type: 'boolean', description: 'Whether another thought step is needed' },
    thoughtNumber: { type: 'integer', description: 'Current thought number', minimum: 1 },
    totalThoughts: { type: 'integer', description: 'Estimated total thoughts needed', minimum: 1 },
    isRevision: { type: 'boolean', description: 'Whether this revises previous thinking' },
    revisesThought: { type: 'integer', description: 'Which thought is being reconsidered', minimum: 1 },
    branchFromThought: { type: 'integer', description: 'Branching point thought number', minimum: 1 },
    branchId: { type: 'string', description: 'Branch identifier' },
    needsMoreThoughts: { type: 'boolean', description: 'If more thoughts are needed' }
  },
  async (params) => {
    console.log('Sequential thinking tool called with params:', params);
    
    try {
      // Generate session ID if not provided
      const sessionId = params.sessionId || uuidv4();
      
      // Create or update session
      let session = loadSession(sessionId) || {
        id: sessionId,
        startedAt: new Date().toISOString(),
        thoughts: [],
        currentThoughtNumber: 0,
        totalThoughts: params.totalThoughts || 5
      };
      
      // Create the current thought object
      const currentThought = {
        thoughtNumber: params.thoughtNumber,
        thought: params.thought,
        nextThoughtNeeded: params.nextThoughtNeeded,
        timestamp: new Date().toISOString()
      };
      
      // Add optional fields if provided
      if (params.isRevision) currentThought.isRevision = true;
      if (params.revisesThought) currentThought.revisesThought = params.revisesThought;
      if (params.branchFromThought) currentThought.branchFromThought = params.branchFromThought;
      if (params.branchId) currentThought.branchId = params.branchId;
      if (params.needsMoreThoughts) currentThought.needsMoreThoughts = true;
      
      // Update session
      session.thoughts.push(currentThought);
      session.currentThoughtNumber = params.thoughtNumber;
      
      // Update total thoughts if needed
      if (params.totalThoughts !== session.totalThoughts) {
        session.totalThoughts = params.totalThoughts;
      }
      
      // If this completes the session, record it
      if (!params.nextThoughtNeeded) {
        session.completedAt = new Date().toISOString();
      }
      
      // Save session
      saveSession(sessionId, session);
      
      // Build response for the tool call
      let geminiResponse = null;
      
      // If nextThoughtNeeded is true, we need to generate the next thought using Gemini
      if (params.nextThoughtNeeded && params.thoughtNumber < params.totalThoughts) {
        // If there's a thought provided, use it; otherwise generate one with Gemini
        if (!params.thought || params.thought.trim() === '') {
          try {
            // Build context from previous thoughts
            const previousThoughts = session.thoughts
              .filter(t => t.thoughtNumber < params.thoughtNumber)
              .map(t => `Thought ${t.thoughtNumber}: ${t.thought}`)
              .join('\n\n');
              
            const prompt = `You are a step-by-step thinker analyzing a problem. 
Previous thoughts:
${previousThoughts || 'No previous thoughts.'}

Now generate thought ${params.thoughtNumber} of ${params.totalThoughts}. 
Make it a logical next step in the reasoning process.`;

            geminiResponse = await geminiApi.generateContent(prompt);
            currentThought.thought = geminiResponse;
            
            // Update session with the generated thought
            session.thoughts[session.thoughts.length - 1].thought = geminiResponse;
            saveSession(sessionId, session);
          } catch (error) {
            console.error('Error generating thought with Gemini:', error);
            geminiResponse = `Error generating thought: ${error.message}`;
          }
        }
      }

      // Return the result
      return {
        content: [
          { 
            type: 'text', 
            text: geminiResponse || params.thought || `Thought ${params.thoughtNumber}`
          }
        ],
        metadata: {
          sessionId,
          thoughtNumber: params.thoughtNumber,
          nextThoughtNeeded: params.nextThoughtNeeded,
          totalThoughts: params.totalThoughts
        }
      };
    } catch (error) {
      console.error('Error in sequential thinking tool:', error);
      return {
        content: [
          { 
            type: 'text', 
            text: `Error: ${error.message}`
          }
        ]
      };
    }
  }
);

// Set up MCP SSE endpoint
app.get('/mcp', (req, res) => {
  console.log('SSE connection established for MCP');
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Create and handle SSE transport
  const transport = new SSEServerTransport(mcpServer);
  transport.handleRequest(req, res);
  
  // Keep connection alive with a ping every 15 seconds
  const intervalId = setInterval(() => {
    res.write(':\n\n'); // Comment line for SSE ping
  }, 15000);
  
  // Cleanup on disconnect
  req.on('close', () => {
    console.log('SSE connection closed');
    clearInterval(intervalId);
  });
});

// API endpoint for tool registration
app.get('/tools', (req, res) => {
  const tools = [
    {
      name: 'sequentialthinking',
      description: 'A detailed tool for dynamic and reflective problem-solving through thoughts',
      parameters: {
        type: 'object',
        properties: {
          thought: { type: 'string', description: 'Your current thinking step' },
          nextThoughtNeeded: { type: 'boolean', description: 'Whether another thought step is needed' },
          thoughtNumber: { type: 'integer', description: 'Current thought number', minimum: 1 },
          totalThoughts: { type: 'integer', description: 'Estimated total thoughts needed', minimum: 1 }
        },
        required: ['thought', 'nextThoughtNeeded', 'thoughtNumber', 'totalThoughts']
      }
    }
  ];
  
  res.json({ tools });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '1.0.0',
    apiConnected: !!process.env.GEMINI_API_KEY
  });
});

// Info endpoint
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Gemini MCP Server</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { color: #333; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
          .endpoint { margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
          .success { color: green; }
          .error { color: red; }
        </style>
      </head>
      <body>
        <h1>Gemini MCP Server</h1>
        <p>Server is running. The following endpoints are available:</p>
        
        <div class="endpoint">
          <h3>/mcp</h3>
          <p>MCP SSE endpoint for Cursor integration</p>
        </div>
        
        <div class="endpoint">
          <h3>/health</h3>
          <p>Health check endpoint</p>
        </div>
        
        <div class="endpoint">
          <h3>/tools</h3>
          <p>API endpoint that returns available tools</p>
        </div>
        
        <h3>Status</h3>
        <p>API Key: <span class="${process.env.GEMINI_API_KEY ? 'success' : 'error'}">
          ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}</span></p>
      </body>
    </html>
  `);
});

// Start the server
app.listen(port, () => {
  console.log(`Gemini MCP Server running on http://localhost:${port}`);
  console.log(`MCP endpoint: http://localhost:${port}/mcp`);
}); 
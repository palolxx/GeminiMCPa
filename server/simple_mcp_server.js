/**
 * Simple Gemini MCP Server
 * 
 * A simplified implementation of the MCP protocol that doesn't rely on the SDK.
 * Instead, it directly implements the protocol as described in the documentation.
 */

require('./dotenv-config');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const GeminiApi = require('./gemini-api');
const { getAllTools } = require('./sequentialthinking-tools');

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
const logFile = fs.createWriteStream(path.join(logsDir, 'server.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logFile }));
app.use(morgan('dev'));

// Configure middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini API client
const geminiApi = new GeminiApi(process.env.GEMINI_API_KEY);

// Get all available tools
const tools = getAllTools();

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

// Set up SSE endpoint for MCP
app.get('/mcp', (req, res) => {
  console.log('SSE connection established');
  
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Keep connection alive with a ping every 15 seconds
  const intervalId = setInterval(() => {
    res.write(':\n\n'); // Comment line for SSE ping
  }, 15000);
  
  // Send initial connection event with server info
  res.write(`event: connection\n`);
  res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);
  
  // Send available tools
  res.write(`event: tools\n`);
  res.write(`data: ${JSON.stringify({ tools })}\n\n`);
  
  // Handle client disconnection
  req.on('close', () => {
    console.log('SSE connection closed');
    clearInterval(intervalId);
  });
});

// Handle tool invocation
app.post('/mcp/invoke', async (req, res) => {
  const { name, params } = req.body;
  console.log(`Tool '${name}' invoked with params:`, params);
  
  if (name === 'sequentialthinking' || name === 'sequentialthinking_tools') {
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
      
      // Add tools-specific fields if provided
      if (name === 'sequentialthinking_tools') {
        if (params.currentStep) currentThought.currentStep = params.currentStep;
        if (params.previousSteps) currentThought.previousSteps = params.previousSteps;
        if (params.remainingSteps) currentThought.remainingSteps = params.remainingSteps;
      }
      
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
      
      // Generate Gemini response if needed
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
      res.json({
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
      });
    } catch (error) {
      console.error('Error in sequential thinking tool:', error);
      res.status(500).json({
        content: [
          { 
            type: 'text', 
            text: `Error: ${error.message}`
          }
        ]
      });
    }
  } else {
    res.status(404).json({
      content: [
        {
          type: 'text',
          text: `Tool '${name}' not found`
        }
      ]
    });
  }
});

// API endpoint for tool registration
app.get('/tools', (req, res) => {
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
        <title>Simple Gemini MCP Server</title>
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
        <h1>Simple Gemini MCP Server</h1>
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
  console.log(`Simple Gemini MCP Server running on http://localhost:${port}`);
  console.log(`MCP endpoint: http://localhost:${port}/mcp`);
}); 
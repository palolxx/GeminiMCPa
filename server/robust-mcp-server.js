/**
 * Robust MCP Server for Gemini Sequential Thinking
 * 
 * A full-featured MCP server implementation that follows best practices
 * and provides comprehensive error handling.
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Initialize Express app
const app = express();
const port = process.env.PORT || 3030;

// Setup logging
const logDir = path.join(__dirname, '..', 'logs');
fs.existsSync(logDir) || fs.mkdirSync(logDir, { recursive: true });
const logStream = fs.createWriteStream(path.join(logDir, 'server.log'), { flags: 'a' });

// Setup sessions storage
const sessionsDir = path.join(__dirname, '..', 'sessions');
fs.existsSync(sessionsDir) || fs.mkdirSync(sessionsDir, { recursive: true });

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: logStream }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// In-memory session cache
const sessions = {};

// Tool definitions
const sequentialThinkingTool = {
  name: "sequentialthinking",
  description: "A detailed tool for dynamic and reflective problem-solving through thoughts. This tool helps analyze problems through a flexible thinking process that can adapt and evolve.",
  parameters: {
    type: "object",
    properties: {
      thought: {
        type: "string",
        description: "Your current thinking step"
      },
      nextThoughtNeeded: {
        type: "boolean",
        description: "Whether another thought step is needed"
      },
      thoughtNumber: {
        type: "integer",
        description: "Current thought number",
        minimum: 1
      },
      totalThoughts: {
        type: "integer",
        description: "Estimated total thoughts needed",
        minimum: 1
      },
      isRevision: {
        type: "boolean",
        description: "Whether this revises previous thinking"
      },
      revisesThought: {
        type: "integer",
        description: "Which thought is being reconsidered",
        minimum: 1
      },
      branchFromThought: {
        type: "integer",
        description: "Branching point thought number",
        minimum: 1
      },
      branchId: {
        type: "string",
        description: "Branch identifier"
      },
      needsMoreThoughts: {
        type: "boolean",
        description: "If more thoughts are needed"
      }
    },
    required: ["thought", "nextThoughtNeeded", "thoughtNumber", "totalThoughts"]
  }
};

// Helper function for API responses
function apiResponse(success, data, error = null) {
  if (success) {
    return { success: true, ...data };
  } else {
    return { success: false, error };
  }
}

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

// MCP Register endpoint
app.get('/register', (req, res) => {
  console.log('Tool registration request received');
  res.json({ tools: [sequentialThinkingTool] });
});

// Tool implementation endpoint
app.post('/tools/sequentialthinking', (req, res) => {
  console.log('Sequential thinking tool called:', req.body);
  
  try {
    const { 
      thought, nextThoughtNeeded, thoughtNumber, totalThoughts,
      isRevision, revisesThought, branchFromThought, branchId, needsMoreThoughts 
    } = req.body;
    
    // Generate a unique session ID if this is the first thought
    const sessionId = req.query.sessionId || uuidv4();
    
    // Load or create session
    let session = loadSession(sessionId) || {
      id: sessionId,
      startedAt: new Date().toISOString(),
      thoughts: [],
      currentThoughtNumber: 0,
      totalThoughts,
      branches: {}
    };
    
    // Add the current thought
    const currentThought = {
      thoughtNumber,
      thought,
      nextThoughtNeeded,
      timestamp: new Date().toISOString()
    };
    
    // Add optional fields if provided
    if (isRevision) currentThought.isRevision = true;
    if (revisesThought) currentThought.revisesThought = revisesThought;
    if (branchFromThought) currentThought.branchFromThought = branchFromThought;
    if (branchId) currentThought.branchId = branchId;
    if (needsMoreThoughts) currentThought.needsMoreThoughts = true;
    
    // Update session
    session.thoughts.push(currentThought);
    session.currentThoughtNumber = thoughtNumber;
    
    // If total thoughts estimation changed, update it
    if (totalThoughts !== session.totalThoughts) {
      session.totalThoughts = totalThoughts;
    }
    
    // If this completes the session, record it
    if (!nextThoughtNeeded) {
      session.completedAt = new Date().toISOString();
    }
    
    // Save session
    saveSession(sessionId, session);
    
    // Return the response
    res.json(apiResponse(true, { 
      sessionId,
      thoughtNumber,
      thought,
      nextThoughtNeeded,
      totalThoughts
    }));
    
  } catch (error) {
    console.error('Error processing sequential thinking:', error);
    res.status(500).json(apiResponse(false, {}, 'Internal server error'));
  }
});

// MCP SSE endpoint for Cursor
app.get('/mcp', (req, res) => {
  console.log('SSE connection established');
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Keep connection alive
  const intervalId = setInterval(() => {
    res.write(':\n\n');
  }, 15000);
  
  // Cleanup on connection close
  req.on('close', () => {
    console.log('SSE connection closed');
    clearInterval(intervalId);
  });
});

// API routes for manual testing and client use
app.get('/api/sessions', (req, res) => {
  try {
    const sessionFiles = fs.readdirSync(sessionsDir)
      .filter(file => file.endsWith('.json'));
    
    const sessionsList = sessionFiles.map(file => {
      const sessionData = JSON.parse(fs.readFileSync(path.join(sessionsDir, file), 'utf8'));
      return {
        id: sessionData.id,
        startedAt: sessionData.startedAt,
        completedAt: sessionData.completedAt || null,
        problem: sessionData.problem || 'Unknown problem',
        thoughtsCount: sessionData.thoughts.length,
        hasConclusion: !!sessionData.conclusion
      };
    });
    
    res.json(sessionsList);
  } catch (error) {
    console.error('Error listing sessions:', error);
    res.status(500).json(apiResponse(false, {}, 'Failed to list sessions'));
  }
});

app.get('/api/session/:sessionId', (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const session = loadSession(sessionId);
    
    if (!session) {
      return res.status(404).json(apiResponse(false, {}, 'Session not found'));
    }
    
    res.json(session);
  } catch (error) {
    console.error(`Error getting session ${req.params.sessionId}:`, error);
    res.status(500).json(apiResponse(false, {}, 'Failed to get session'));
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    name: 'Gemini Sequential Thinking MCP Server',
    version: '1.0.0'
  });
});

// Start the server
app.listen(port, () => {
  console.log(`MCP server running at http://localhost:${port}`);
  console.log(`MCP endpoint available at http://localhost:${port}/mcp`);
  console.log(`Register endpoint available at http://localhost:${port}/register`);
});

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  // Perform cleanup here if needed
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  // Perform cleanup here if needed
  process.exit(0);
});

// Global error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // Keep the process running despite the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
  // Keep the process running despite the error
}); 
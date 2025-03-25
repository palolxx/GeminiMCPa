/**
 * Gemini MCP Server - Direct Implementation
 * 
 * A simplified, direct implementation of the MCP protocol for Gemini.
 * Focused on reliability and compatibility with Cursor.
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Read API key from environment variables or file
const getApiKey = () => {
  // First, try environment variable
  let apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) return apiKey;

  // Try .env file
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (match && match[1]) return match[1].trim();
  }

  // Try geminikey.txt
  const keyPath = path.join(__dirname, '..', 'geminikey.txt');
  if (fs.existsSync(keyPath)) {
    return fs.readFileSync(keyPath, 'utf8').trim();
  }

  return null;
};

const apiKey = getApiKey();
if (!apiKey) {
  console.error('ERROR: No Gemini API key found!');
  console.error('Please set GEMINI_API_KEY environment variable or add it to .env or geminikey.txt file.');
  process.exit(1);
}

// Initialize Express app
const app = express();
const port = process.env.PORT || 3030;

// Configure middleware
app.use(cors());
app.use(express.json());

// MCP tools definition
const tools = [
  {
    name: "gemini_thinking",
    description: "A detailed tool for dynamic and reflective problem-solving through thoughts powered by Google's Gemini models.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The question or problem to analyze"
        },
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
          minimum: 1,
          description: "Current thought number"
        },
        totalThoughts: {
          type: "integer",
          minimum: 1,
          description: "Estimated total thoughts needed"
        }
      },
      required: ["query", "nextThoughtNeeded", "thoughtNumber", "totalThoughts"]
    }
  }
];

// Set up SSE endpoint for MCP - this is the core of the MCP protocol
app.get('/mcp', (req, res) => {
  console.log('MCP: SSE connection established');
  
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
    console.log('MCP: SSE connection closed');
    clearInterval(intervalId);
  });
});

// Handle tool invocation
app.post('/mcp/invoke', async (req, res) => {
  const { name, params } = req.body;
  console.log(`MCP: Tool '${name}' invoked with params:`, params);
  
  if (name === 'gemini_thinking') {
    try {
      // Call Gemini API
      const prompt = params.thought || `Analysis for query: "${params.query}"\nThought ${params.thoughtNumber} of ${params.totalThoughts}`;
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      // Extract text from response
      let generatedText = '';
      if (response.data && response.data.candidates && response.data.candidates[0] && 
          response.data.candidates[0].content && response.data.candidates[0].content.parts) {
        generatedText = response.data.candidates[0].content.parts
          .map(part => part.text || '')
          .join('');
      }
      
      // Return the result
      res.json({
        content: [{ type: 'text', text: generatedText || prompt }],
        metadata: {
          thoughtNumber: params.thoughtNumber,
          nextThoughtNeeded: params.nextThoughtNeeded,
          totalThoughts: params.totalThoughts
        }
      });
    } catch (error) {
      console.error('MCP: Error in gemini_thinking tool:', error.message);
      res.status(500).json({
        content: [{ type: 'text', text: `Error: ${error.message}` }]
      });
    }
  } else {
    res.status(404).json({
      content: [{ type: 'text', text: `Tool '${name}' not found` }]
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', apiKeySet: !!apiKey });
});

// Start the server
app.listen(port, () => {
  console.log(`\n===== Gemini MCP Server =====`);
  console.log(`Server running on port ${port}`);
  console.log(`MCP Endpoint: http://localhost:${port}/mcp`);
  console.log(`Health Check: http://localhost:${port}/health`);
  console.log(`Using API Key: ${apiKey ? apiKey.substring(0, 8) + '***' : 'Not set!'}`);
  console.log(`===================================\n`);
}); 
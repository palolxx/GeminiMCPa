#!/usr/bin/env node

/**
 * Simple script to run the Gemini MCP server
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Print a banner
console.log('\n===== Gemini MCP Server =====\n');

// Get API key from environment or file
let apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  // Check .env file
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (match && match[1]) {
      apiKey = match[1].trim();
      console.log('Using API key from .env file');
    }
  }
  
  // Check geminikey.txt file
  if (!apiKey) {
    const keyPath = path.join(__dirname, 'geminikey.txt');
    if (fs.existsSync(keyPath)) {
      apiKey = fs.readFileSync(keyPath, 'utf8').trim();
      console.log('Using API key from geminikey.txt file');
    }
  }
}

// Set environment variables
process.env.GEMINI_API_KEY = apiKey || '';

if (!apiKey) {
  console.log('WARNING: No API key found. Server will run in simulation mode.\n');
} else {
  console.log('API key found and set.\n');
}

// Start the server
console.log('Starting MCP server...\n');

const serverPath = path.join(__dirname, 'server', 'simple_mcp_server.js');

// Spawn the server process and pipe its output
const server = spawn('node', [serverPath], { 
  stdio: 'inherit',
  env: process.env
});

// Handle process exit
server.on('close', (code) => {
  if (code !== 0) {
    console.log(`\nERROR: Server exited with code ${code}\n`);
    process.exit(code);
  }
});

// Handle signals to properly shut down
process.on('SIGINT', () => {
  console.log('\nShutting down server...\n');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...\n');
  server.kill('SIGTERM');
}); 
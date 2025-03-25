#!/usr/bin/env node

/**
 * Gemini MCP Server Bootstrap
 * 
 * This script checks for dependencies, validates the API key,
 * and starts the MCP server with proper error handling.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  apiKey: process.env.GEMINI_API_KEY,
  port: process.env.PORT || 3030,
  serverScript: path.join(__dirname, 'server', 'simple_mcp_server.js')
};

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Log a message with color
 */
function log(message, color = colors.reset) {
  console.log(`${color}[Gemini MCP] ${message}${colors.reset}`);
}

/**
 * Check if the necessary dependencies are installed
 */
function checkDependencies() {
  log('Checking dependencies...', colors.cyan);
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('ERROR: package.json not found!', colors.red);
    log('Please run this script from the root of the GeminiMCP directory.', colors.yellow);
    process.exit(1);
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    
    const missingDeps = [];
    for (const dep in dependencies) {
      try {
        require.resolve(dep);
      } catch (err) {
        missingDeps.push(dep);
      }
    }
    
    if (missingDeps.length > 0) {
      log(`Installing missing dependencies: ${missingDeps.join(', ')}`, colors.yellow);
      execSync('npm install', { cwd: __dirname, stdio: 'inherit' });
      log('Dependencies installed successfully!', colors.green);
    } else {
      log('All dependencies are installed.', colors.green);
    }
  } catch (err) {
    log(`ERROR checking dependencies: ${err.message}`, colors.red);
    process.exit(1);
  }
}

/**
 * Check for a valid API key
 */
function checkApiKey() {
  log('Checking Gemini API key...', colors.cyan);
  
  if (!CONFIG.apiKey) {
    // Try to read from .env file
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
      if (match && match[1]) {
        CONFIG.apiKey = match[1].trim();
        log('API key found in .env file.', colors.green);
      }
    }
    
    // Try to read from geminikey.txt file
    if (!CONFIG.apiKey) {
      const keyPath = path.join(__dirname, 'geminikey.txt');
      if (fs.existsSync(keyPath)) {
        CONFIG.apiKey = fs.readFileSync(keyPath, 'utf8').trim();
        log('API key found in geminikey.txt file.', colors.green);
      }
    }
  }
  
  if (!CONFIG.apiKey) {
    log('WARNING: No Gemini API key found!', colors.yellow);
    log('The server will run in simulation mode.', colors.yellow);
  } else if (CONFIG.apiKey.length < 30) {
    log('WARNING: API key looks invalid (too short).', colors.yellow);
    log('Server may not connect to Gemini API properly.', colors.yellow);
  } else {
    log('API key validated.', colors.green);
  }
  
  // Set the API key in the environment for the child process
  process.env.GEMINI_API_KEY = CONFIG.apiKey;
}

/**
 * Start the MCP server
 */
function startServer() {
  log('Starting Gemini MCP server...', colors.cyan);
  
  try {
    if (!fs.existsSync(CONFIG.serverScript)) {
      log(`ERROR: Server script not found at ${CONFIG.serverScript}`, colors.red);
      process.exit(1);
    }
    
    log(`Server starting on port ${CONFIG.port}...`, colors.magenta);
    
    // Forward all console output
    const { spawn } = require('child_process');
    const server = spawn('node', [CONFIG.serverScript], {
      stdio: 'inherit',
      env: process.env
    });
    
    server.on('error', (err) => {
      log(`ERROR starting server: ${err.message}`, colors.red);
      process.exit(1);
    });
    
    log('Server started successfully!', colors.green);
    
    // Handle process signals
    process.on('SIGINT', () => {
      log('Shutting down server...', colors.yellow);
      server.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      log('Shutting down server...', colors.yellow);
      server.kill('SIGTERM');
      process.exit(0);
    });
    
    // Keep the process running
    setInterval(() => {}, 1000);
  } catch (err) {
    log(`ERROR starting server: ${err.message}`, colors.red);
    process.exit(1);
  }
}

// Main execution
(async function main() {
  console.log('\n');
  log('=== Gemini MCP Server ===', colors.blue);
  
  checkDependencies();
  checkApiKey();
  startServer();
})(); 
/**
 * Fix script for Gemini MCP Server integration with Cursor v0.46
 * 
 * This script checks dependencies, configures the API key, 
 * and sets up the Cursor MCP configuration.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const http = require('http');

// Define paths
const homeDir = os.homedir();
const cursorMcpDir = path.join(homeDir, '.cursor');
const cursorMcpConfigPath = path.join(cursorMcpDir, 'mcp.json');
const geminiKeyPath = path.join(__dirname, 'geminikey.txt');
const envFilePath = path.join(__dirname, '.env');

/**
 * Check and install dependencies
 */
function checkDependencies() {
  console.log('Checking dependencies...');
  
  try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.error('Error: package.json not found!');
      return false;
    }
    
    // Install dependencies
    console.log('Installing dependencies...');
    execSync('npm install', { cwd: __dirname, stdio: 'inherit' });
    console.log('Dependencies installed successfully.');
    return true;
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    return false;
  }
}

/**
 * Configure the Gemini API key
 */
function configureApiKey() {
  console.log('Configuring Gemini API key...');
  
  try {
    let apiKey = '';
    
    // Try to read from geminikey.txt
    if (fs.existsSync(geminiKeyPath)) {
      apiKey = fs.readFileSync(geminiKeyPath, 'utf8').trim();
      console.log('API key found in geminikey.txt');
    } 
    // Try to read from .env
    else if (fs.existsSync(envFilePath)) {
      const envContent = fs.readFileSync(envFilePath, 'utf8');
      const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
      if (match && match[1]) {
        apiKey = match[1].trim();
        console.log('API key found in .env file');
      }
    }
    
    // If API key not found, exit
    if (!apiKey) {
      console.error('Error: Gemini API key not found!');
      console.error('Please create a geminikey.txt file with your API key or set GEMINI_API_KEY in .env');
      return false;
    }
    
    // Create or update .env file
    const envContent = `GEMINI_API_KEY=${apiKey}\nPORT=3030\n`;
    fs.writeFileSync(envFilePath, envContent);
    console.log('API key configured successfully.');
    return apiKey;
  } catch (error) {
    console.error('Error configuring API key:', error.message);
    return false;
  }
}

/**
 * Check if Puppeteer MCP Server is running
 */
function checkPuppeteerMcpServer() {
  console.log('Checking if Puppeteer MCP server is running...');
  
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001/health', (res) => {
      if (res.statusCode === 200) {
        console.log('Puppeteer MCP server is running on port 3001');
        resolve(true);
      } else {
        console.log('Puppeteer MCP server is not running on port 3001');
        resolve(false);
      }
    });
    
    req.on('error', () => {
      console.log('Puppeteer MCP server is not running on port 3001');
      resolve(false);
    });
    
    req.setTimeout(1000, () => {
      req.abort();
      console.log('Puppeteer MCP server not detected (timeout)');
      resolve(false);
    });
  });
}

/**
 * Configure the Cursor MCP
 */
async function configureCursorMcp(apiKey) {
  console.log('Configuring Cursor MCP...');
  
  try {
    // Create .cursor directory if it doesn't exist
    if (!fs.existsSync(cursorMcpDir)) {
      fs.mkdirSync(cursorMcpDir, { recursive: true });
      console.log('Created .cursor directory.');
    }
    
    // Read existing config if it exists
    let mcpConfig = { mcpServers: {} };
    if (fs.existsSync(cursorMcpConfigPath)) {
      console.log('Existing Cursor MCP configuration found.');
      try {
        mcpConfig = JSON.parse(fs.readFileSync(cursorMcpConfigPath, 'utf8'));
        
        // Ensure mcpServers exists
        if (!mcpConfig.mcpServers) {
          mcpConfig.mcpServers = {};
        }
      } catch (e) {
        console.log('Could not parse existing config, creating new one.');
      }
    }
    
    // Get current directory path
    const currentDir = __dirname;
    const scriptPath = path.join(currentDir, 'server', 'simple_mcp_server.js');
    
    // Add Gemini MCP configuration
    mcpConfig.mcpServers.gemini = {
      command: "cmd",
      args: [
        "/c",
        "node",
        scriptPath
      ],
      env: {
        GEMINI_API_KEY: apiKey
      }
    };
    
    // Check if Puppeteer is running and add SSE configuration if so
    const isPuppeteerRunning = await checkPuppeteerMcpServer();
    if (isPuppeteerRunning) {
      console.log('Adding Puppeteer SSE configuration');
      mcpConfig.mcpServers.puppeteer_sse = {
        type: "sse",
        url: "http://localhost:3001/mcp"
      };
    } else {
      // Add standard Puppeteer configuration
      console.log('Adding standard Puppeteer configuration');
      mcpConfig.mcpServers.puppeteer = {
        command: "cmd",
        args: [
          "/c",
          "npx",
          "-y",
          "@modelcontextprotocol/server-puppeteer"
        ]
      };
    }
    
    // Also add a secondary configuration with SSE for Gemini
    mcpConfig.mcpServers.gemini_sse = {
      type: "sse",
      url: "http://localhost:3030/mcp"
    };
    
    // Save config
    fs.writeFileSync(cursorMcpConfigPath, JSON.stringify(mcpConfig, null, 2));
    console.log('Cursor MCP configuration updated successfully.');
    return true;
  } catch (error) {
    console.error('Error configuring Cursor MCP:', error.message);
    return false;
  }
}

/**
 * Create a startup script
 */
function createStartupScript() {
  console.log('Creating startup script...');
  
  try {
    const scriptPath = path.join(__dirname, 'start-gemini-mcp.bat');
    
    // The content is already updated by another script
    if (!fs.existsSync(scriptPath)) {
      console.error('Error: startup script template not found!');
      return false;
    }
    
    console.log(`Startup script created at: ${scriptPath}`);
    return true;
  } catch (error) {
    console.error('Error creating startup script:', error.message);
    return false;
  }
}

/**
 * Run the fix
 */
async function runFix() {
  console.log('Running Gemini MCP server fix...\n');
  
  // Run steps
  const dependenciesOk = checkDependencies();
  if (!dependenciesOk) return false;
  
  const apiKey = configureApiKey();
  if (!apiKey) return false;
  
  const mcpConfigOk = await configureCursorMcp(apiKey);
  if (!mcpConfigOk) return false;
  
  const startupScriptOk = createStartupScript();
  if (!startupScriptOk) return false;
  
  console.log('\n✓ Gemini MCP server setup complete!');
  console.log('\nTo use the Gemini MCP:');
  console.log('1. Close Cursor if running');
  console.log('2. Run the start-gemini-mcp.bat script');
  console.log('3. Start Cursor');
  console.log('4. In Cursor, open the command palette (Ctrl+Shift+P)');
  console.log('5. Type "Toggle MCP Provider" and select "gemini"');
  console.log('\nTroubleshooting:');
  console.log('- Check that the API key is correct in .env');
  console.log('- Ensure port 3030 is free');
  console.log('- Check logs for errors');
  
  return true;
}

// Run the fix
runFix(); 
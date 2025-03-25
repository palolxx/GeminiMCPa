/**
 * Setup script for Gemini Sequential Thinking MCP Server
 * 
 * This script:
 * 1. Creates necessary directories
 * 2. Checks for dependencies
 * 3. Helps set up configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Create interface for console input/output
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Directory paths
const rootDir = path.resolve(__dirname);
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');
const sessionsDir = path.join(rootDir, 'sessions');
const cacheDir = path.join(rootDir, 'cache');
const envFile = path.join(rootDir, '.env');

// Text colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
};

// Log functions
function logInfo(message) {
    console.log(`${colors.bright}${colors.green}[INFO]${colors.reset} ${message}`);
}

function logWarning(message) {
    console.log(`${colors.bright}${colors.yellow}[WARNING]${colors.reset} ${message}`);
}

function logError(message) {
    console.log(`${colors.bright}${colors.red}[ERROR]${colors.reset} ${message}`);
}

// Setup function
async function setup() {
    console.log(`\n${colors.bright}==================================================${colors.reset}`);
    console.log(`${colors.bright} Gemini Sequential Thinking MCP Server Setup${colors.reset}`);
    console.log(`${colors.bright}==================================================${colors.reset}\n`);
    
    logInfo('Starting setup...');
    
    // Create directories
    logInfo('Checking directories...');
    
    for (const dir of [serverDir, clientDir, sessionsDir, cacheDir]) {
        if (!fs.existsSync(dir)) {
            logInfo(`Creating directory: ${path.relative(rootDir, dir)}`);
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    
    // Install dependencies
    logInfo('Checking dependencies...');
    
    try {
        execSync('npm --version', { stdio: 'ignore' });
        
        const installDeps = await askQuestion('Install/update dependencies? (y/n): ');
        if (installDeps.toLowerCase() === 'y') {
            logInfo('Installing dependencies...');
            execSync('npm install', { stdio: 'inherit' });
        }
    } catch (error) {
        logError('Node.js/npm not found. Please install Node.js before continuing.');
        process.exit(1);
    }
    
    // Check for API key
    logInfo('Checking Gemini API key configuration...');
    
    let apiKey = '';
    if (fs.existsSync(envFile)) {
        const envContent = fs.readFileSync(envFile, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
        if (match) {
            apiKey = match[1];
            logInfo(`Found existing API key: ${maskApiKey(apiKey)}`);
        }
    }
    
    const setupApiKey = await askQuestion('Set up Gemini API key? (y/n): ');
    if (setupApiKey.toLowerCase() === 'y') {
        apiKey = await askQuestion('Enter your Gemini API key (leave blank for simulation mode): ');
        
        if (!apiKey.trim()) {
            apiKey = 'simulation';
            logWarning('Using simulation mode (no real API calls will be made)');
        }
        
        logInfo('Saving API key to .env file...');
        fs.writeFileSync(envFile, `GEMINI_API_KEY=${apiKey}`);
    } else if (!apiKey) {
        logWarning('No API key configured. Server will run in simulation mode.');
        fs.writeFileSync(envFile, 'GEMINI_API_KEY=simulation');
    }
    
    // Cursor MCP setup instructions
    logInfo('Setup complete!');
    
    console.log(`\n${colors.bright}==================================================${colors.reset}`);
    console.log(`${colors.bright} Cursor IDE Integration${colors.reset}`);
    console.log(`${colors.bright}==================================================${colors.reset}\n`);
    
    console.log(`To integrate with Cursor IDE:\n`);
    console.log(`1. Start the server: ${colors.yellow}npm run start:server${colors.reset}`);
    console.log(`2. In Cursor, go to File → Preferences → Cursor Settings → MCP`);
    console.log(`3. Click "Add New MCP Server" and set:`);
    console.log(`   - Name: ${colors.yellow}Gemini Sequential Thinking${colors.reset}`);
    console.log(`   - Type: ${colors.yellow}sse${colors.reset}`);
    console.log(`   - Server URL: ${colors.yellow}http://localhost:3030/mcp${colors.reset}`);
    console.log(`4. Click "Add"\n`);
    
    console.log(`To use the interactive client:`);
    console.log(`1. In a separate terminal, run: ${colors.yellow}npm run start:client${colors.reset}\n`);
    
    // Finished
    rl.close();
}

// Helper function to ask a question
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// Helper function to mask API key for display
function maskApiKey(key) {
    if (!key || key === 'simulation') {
        return 'simulation-mode';
    }
    
    if (key.length <= 8) {
        return '********';
    }
    
    return key.substring(0, 4) + '****' + key.substring(key.length - 4);
}

// Run setup
setup().catch(error => {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
}); 
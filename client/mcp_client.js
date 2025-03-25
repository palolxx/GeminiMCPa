/**
 * Interactive Client for Gemini Sequential Thinking MCP Server
 * 
 * This client allows you to interact with the Gemini Sequential Thinking MCP Server
 * directly from the terminal, without needing Cursor IDE.
 */

const readline = require('readline');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:3030/api';
const SESSIONS_DIR = path.join(__dirname, '../sessions');

// Text colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m'
};

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Current session state
let currentSession = null;

// Main menu options
const mainMenuOptions = [
    { key: '1', label: 'Start new thinking session', action: startNewSession },
    { key: '2', label: 'List available sessions', action: listSessions },
    { key: '3', label: 'Load session by ID', action: loadSession },
    { key: 'q', label: 'Quit', action: quit }
];

// Session menu options
const sessionMenuOptions = [
    { key: '1', label: 'Get next thought', action: getNextThought },
    { key: '2', label: 'Revise a thought', action: reviseThought },
    { key: '3', label: 'Get conclusion', action: getConclusion },
    { key: '4', label: 'View all thoughts', action: viewAllThoughts },
    { key: 'b', label: 'Back to main menu', action: showMainMenu },
    { key: 'q', label: 'Quit', action: quit }
];

// Start the client
async function start() {
    console.clear();
    showBanner();
    
    // Check if server is running
    try {
        await axios.get(`${API_BASE_URL}/sessions`);
        console.log(`${colors.green}✓ Connected to Gemini Sequential Thinking MCP Server${colors.reset}\n`);
    } catch (error) {
        console.log(`${colors.red}✗ Could not connect to the server at ${API_BASE_URL}${colors.reset}`);
        console.log(`  ${colors.yellow}Make sure the server is running with: npm run start:server${colors.reset}\n`);
        
        const answer = await askQuestion('Try again? (y/n): ');
        if (answer.toLowerCase() === 'y') {
            start();
            return;
        } else {
            quit();
            return;
        }
    }
    
    showMainMenu();
}

// Display the application banner
function showBanner() {
    console.log(`\n${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}║ ${colors.yellow}  Gemini Sequential Thinking MCP  ${colors.cyan}                     ║${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}║ ${colors.white}  Interactive Client  ${colors.cyan}                                  ║${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
}

// Show the main menu
function showMainMenu() {
    currentSession = null;
    
    console.log(`\n${colors.bright}${colors.white}Main Menu:${colors.reset}`);
    for (const option of mainMenuOptions) {
        console.log(`  ${colors.yellow}${option.key}${colors.reset} - ${option.label}`);
    }
    
    rl.question('\nSelect an option: ', (answer) => {
        const selectedOption = mainMenuOptions.find(option => option.key === answer.toLowerCase());
        
        if (selectedOption) {
            selectedOption.action();
        } else {
            console.log(`${colors.red}Invalid option.${colors.reset}`);
            showMainMenu();
        }
    });
}

// Show the session menu
function showSessionMenu() {
    if (!currentSession) {
        console.log(`${colors.red}No active session.${colors.reset}`);
        showMainMenu();
        return;
    }
    
    console.log(`\n${colors.bright}${colors.white}Session Menu (${colors.green}${currentSession.id}${colors.white}):${colors.reset}`);
    console.log(`  ${colors.dim}Problem: ${currentSession.problem.substring(0, 60)}...${colors.reset}`);
    console.log(`  ${colors.dim}Thoughts: ${currentSession.thoughts.length}/${currentSession.totalThoughts}${colors.reset}`);
    
    for (const option of sessionMenuOptions) {
        console.log(`  ${colors.yellow}${option.key}${colors.reset} - ${option.label}`);
    }
    
    rl.question('\nSelect an option: ', (answer) => {
        const selectedOption = sessionMenuOptions.find(option => option.key === answer.toLowerCase());
        
        if (selectedOption) {
            selectedOption.action();
        } else {
            console.log(`${colors.red}Invalid option.${colors.reset}`);
            showSessionMenu();
        }
    });
}

// Start a new thinking session
async function startNewSession() {
    const problem = await askQuestion('Enter your problem/question: ');
    
    if (!problem.trim()) {
        console.log(`${colors.red}Problem statement is required.${colors.reset}`);
        showMainMenu();
        return;
    }
    
    console.log(`\n${colors.yellow}Starting new thinking session...${colors.reset}`);
    
    try {
        const response = await axios.post(`${API_BASE_URL}/start-session`, { problem });
        
        currentSession = {
            id: response.data.sessionId,
            problem,
            thoughts: [
                {
                    thoughtNumber: response.data.thoughtNumber,
                    thought: response.data.thought,
                    needsMoreThoughts: response.data.needsMoreThoughts
                }
            ],
            totalThoughts: response.data.totalThoughts
        };
        
        console.clear();
        showBanner();
        console.log(`${colors.green}Session started with ID: ${colors.bright}${response.data.sessionId}${colors.reset}\n`);
        console.log(`${colors.bright}${colors.white}Problem:${colors.reset} ${problem}\n`);
        console.log(`${colors.bright}${colors.yellow}Thought #1:${colors.reset}`);
        console.log(formatThought(response.data.thought));
        
        showSessionMenu();
    } catch (error) {
        handleApiError(error);
        showMainMenu();
    }
}

// Get the next thought
async function getNextThought() {
    if (!currentSession) {
        console.log(`${colors.red}No active session.${colors.reset}`);
        showMainMenu();
        return;
    }
    
    console.log(`\n${colors.yellow}Generating next thought...${colors.reset}`);
    
    try {
        const response = await axios.post(`${API_BASE_URL}/next-thought`, { sessionId: currentSession.id });
        
        currentSession.thoughts.push({
            thoughtNumber: response.data.thoughtNumber,
            thought: response.data.thought,
            needsMoreThoughts: response.data.needsMoreThoughts
        });
        
        console.clear();
        showBanner();
        console.log(`${colors.bright}${colors.white}Problem:${colors.reset} ${currentSession.problem}\n`);
        console.log(`${colors.bright}${colors.yellow}Thought #${response.data.thoughtNumber}:${colors.reset}`);
        console.log(formatThought(response.data.thought));
        
        showSessionMenu();
    } catch (error) {
        handleApiError(error);
        showSessionMenu();
    }
}

// Revise a thought
async function reviseThought() {
    if (!currentSession) {
        console.log(`${colors.red}No active session.${colors.reset}`);
        showMainMenu();
        return;
    }
    
    // Show all thoughts first
    viewAllThoughts(false);
    
    const thoughtNumber = await askQuestion('Enter thought number to revise: ');
    const num = parseInt(thoughtNumber);
    
    if (isNaN(num) || num < 1 || num > currentSession.thoughts.length) {
        console.log(`${colors.red}Invalid thought number.${colors.reset}`);
        showSessionMenu();
        return;
    }
    
    console.log(`\n${colors.yellow}Revising thought #${num}...${colors.reset}`);
    
    try {
        const response = await axios.post(`${API_BASE_URL}/revise-thought`, { 
            sessionId: currentSession.id,
            thoughtNumber: num
        });
        
        currentSession.thoughts.push({
            thoughtNumber: response.data.thoughtNumber,
            thought: response.data.thought,
            isRevision: true,
            revisesThought: response.data.revisesThought,
            needsMoreThoughts: response.data.needsMoreThoughts
        });
        
        currentSession.totalThoughts = response.data.totalThoughts;
        
        console.clear();
        showBanner();
        console.log(`${colors.bright}${colors.white}Problem:${colors.reset} ${currentSession.problem}\n`);
        console.log(`${colors.bright}${colors.yellow}Revised Thought #${response.data.thoughtNumber} (revises #${response.data.revisesThought}):${colors.reset}`);
        console.log(formatThought(response.data.thought));
        
        showSessionMenu();
    } catch (error) {
        handleApiError(error);
        showSessionMenu();
    }
}

// Get conclusion
async function getConclusion() {
    if (!currentSession) {
        console.log(`${colors.red}No active session.${colors.reset}`);
        showMainMenu();
        return;
    }
    
    console.log(`\n${colors.yellow}Generating conclusion...${colors.reset}`);
    
    try {
        const response = await axios.post(`${API_BASE_URL}/conclusion`, { sessionId: currentSession.id });
        
        currentSession.conclusion = response.data.conclusion;
        currentSession.completedAt = response.data.completedAt;
        
        console.clear();
        showBanner();
        console.log(`${colors.bright}${colors.white}Problem:${colors.reset} ${currentSession.problem}\n`);
        console.log(`${colors.bright}${colors.green}Conclusion:${colors.reset}`);
        console.log(formatThought(response.data.conclusion));
        
        showSessionMenu();
    } catch (error) {
        handleApiError(error);
        showSessionMenu();
    }
}

// View all thoughts
function viewAllThoughts(showMenu = true) {
    if (!currentSession) {
        console.log(`${colors.red}No active session.${colors.reset}`);
        showMainMenu();
        return;
    }
    
    console.clear();
    showBanner();
    console.log(`${colors.bright}${colors.white}Problem:${colors.reset} ${currentSession.problem}\n`);
    
    for (const thought of currentSession.thoughts) {
        const thoughtLabel = thought.isRevision 
            ? `${colors.bright}${colors.yellow}Thought #${thought.thoughtNumber} (revises #${thought.revisesThought}):${colors.reset}`
            : `${colors.bright}${colors.yellow}Thought #${thought.thoughtNumber}:${colors.reset}`;
        
        console.log(thoughtLabel);
        console.log(formatThought(thought.thought, true));
        console.log();
    }
    
    if (currentSession.conclusion) {
        console.log(`${colors.bright}${colors.green}Conclusion:${colors.reset}`);
        console.log(formatThought(currentSession.conclusion));
        console.log();
    }
    
    if (showMenu) {
        rl.question('Press enter to continue...', () => {
            showSessionMenu();
        });
    }
}

// List available sessions
async function listSessions() {
    console.log(`\n${colors.yellow}Fetching available sessions...${colors.reset}`);
    
    try {
        const response = await axios.get(`${API_BASE_URL}/sessions`);
        const sessions = response.data;
        
        if (sessions.length === 0) {
            console.log(`${colors.yellow}No sessions available.${colors.reset}`);
            showMainMenu();
            return;
        }
        
        console.clear();
        showBanner();
        console.log(`${colors.bright}${colors.white}Available Sessions:${colors.reset}\n`);
        
        for (let i = 0; i < sessions.length; i++) {
            const session = sessions[i];
            const date = new Date(session.startedAt).toLocaleString();
            
            console.log(`  ${colors.yellow}${i + 1}${colors.reset} - ${colors.green}${session.id}${colors.reset}`);
            console.log(`      ${colors.dim}Problem: ${session.problem.substring(0, 60)}...${colors.reset}`);
            console.log(`      ${colors.dim}Started: ${date} | Thoughts: ${session.thoughtsCount}${colors.reset}`);
            console.log(`      ${colors.dim}Status: ${session.hasConclusion ? 'Completed' : 'In Progress'}${colors.reset}`);
            console.log();
        }
        
        const answer = await askQuestion('Enter session number to load (or 0 to return): ');
        const num = parseInt(answer);
        
        if (isNaN(num) || num === 0 || num > sessions.length) {
            showMainMenu();
            return;
        }
        
        loadSessionById(sessions[num - 1].id);
    } catch (error) {
        handleApiError(error);
        showMainMenu();
    }
}

// Load session by ID
async function loadSession() {
    const sessionId = await askQuestion('Enter session ID: ');
    
    if (!sessionId.trim()) {
        console.log(`${colors.red}Session ID is required.${colors.reset}`);
        showMainMenu();
        return;
    }
    
    loadSessionById(sessionId);
}

// Load session by ID helper
async function loadSessionById(sessionId) {
    console.log(`\n${colors.yellow}Loading session ${sessionId}...${colors.reset}`);
    
    try {
        const response = await axios.get(`${API_BASE_URL}/session/${sessionId}`);
        currentSession = response.data;
        
        console.clear();
        showBanner();
        console.log(`${colors.green}Loaded session: ${colors.bright}${sessionId}${colors.reset}\n`);
        
        showSessionMenu();
    } catch (error) {
        handleApiError(error);
        showMainMenu();
    }
}

// Handle API errors
function handleApiError(error) {
    if (error.response) {
        const status = error.response.status;
        const message = error.response.data.error || 'Unknown error';
        
        console.log(`${colors.red}API Error (${status}): ${message}${colors.reset}`);
    } else if (error.request) {
        console.log(`${colors.red}No response from server. Is the server running?${colors.reset}`);
    } else {
        console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    }
}

// Format thought text for display
function formatThought(thought, truncate = false) {
    if (!thought) return '';
    
    // If truncate is true, limit to 20 lines
    if (truncate) {
        const lines = thought.split('\n');
        if (lines.length > 20) {
            const truncated = lines.slice(0, 20).join('\n');
            return `${truncated}\n${colors.dim}[... truncated, ${lines.length - 20} more lines ...]${colors.reset}`;
        }
    }
    
    // Format code blocks and headings
    return thought
        .replace(/```(.+?)```/gs, (match, code) => {
            return `${colors.bgBlack}${colors.white}${code}${colors.reset}`;
        })
        .replace(/^# (.+)$/gm, `${colors.bright}${colors.green}$1${colors.reset}`)
        .replace(/^## (.+)$/gm, `${colors.bright}${colors.cyan}$1${colors.reset}`)
        .replace(/^### (.+)$/gm, `${colors.bright}${colors.blue}$1${colors.reset}`);
}

// Ask a question and get response
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// Quit the application
function quit() {
    console.log(`\n${colors.green}Thank you for using Gemini Sequential Thinking MCP!${colors.reset}`);
    rl.close();
    process.exit(0);
}

// Start the client
start(); 
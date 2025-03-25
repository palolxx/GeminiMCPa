/**
 * dotenv-config.js
 * 
 * A simple module to load environment variables from a .env file.
 */

const fs = require('fs');
const path = require('path');

// Define paths
const envFilePath = path.join(__dirname, '..', '.env');

// Check if .env file exists
if (!fs.existsSync(envFilePath)) {
  console.error('Warning: .env file not found!');
  console.error('Creating default .env file...');
  
  // Create a default .env file
  const defaultEnvContent = `GEMINI_API_KEY=
PORT=3030
`;
  
  try {
    fs.writeFileSync(envFilePath, defaultEnvContent);
    console.log('Default .env file created. Please update it with your Gemini API key.');
  } catch (error) {
    console.error('Error creating default .env file:', error.message);
  }
}

// Load environment variables from .env file
try {
  const envContent = fs.readFileSync(envFilePath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.trim() === '' || line.startsWith('#')) continue;
    
    const [key, value] = line.split('=');
    if (key && value !== undefined) {
      process.env[key.trim()] = value.trim();
    }
  }
  
  console.log('Environment variables loaded from .env file.');
} catch (error) {
  console.error('Error loading environment variables:', error.message);
}

// Export configuration values
module.exports = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  PORT: process.env.PORT || 3030,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEBUG: process.env.DEBUG
}; 
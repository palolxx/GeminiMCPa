/**
 * Gemini API Client
 * 
 * A simple client for the Google Gemini API that handles requests, caching, and response parsing.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Define cache directory
const cacheDir = path.join(__dirname, '..', 'cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

/**
 * GeminiApi class
 */
class GeminiApi {
  /**
   * Constructor
   * @param {string} apiKey - The Gemini API key
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
    this.cache = {};
    this.cacheFilePath = path.join(cacheDir, 'gemini-responses.json');
    this.loadCache();
  }

  /**
   * Generate content using Gemini API
   * @param {string} prompt - The prompt to send to Gemini
   * @returns {Promise<string>} - The generated text
   */
  async generateContent(prompt) {
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(prompt);
    if (this.cache[cacheKey]) {
      console.log('Using cached response');
      return this.cache[cacheKey];
    }

    // Validate API key
    if (!this.apiKey) {
      console.warn('No API key provided, using simulation mode');
      return this.simulateResponse(prompt);
    }

    try {
      // Make the API request
      const response = await axios.post(
        `${this.endpoint}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract text from response
      const text = this.extractTextFromResponse(response.data);
      
      // Cache the response
      this.cache[cacheKey] = text;
      this.saveCache();
      
      return text;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 429) {
          console.error('Rate limit exceeded');
          return this.simulateResponse(prompt);
        }
        
        console.error('API error:', error.response.data);
        throw new Error(`API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      
      console.error('Network error:', error.message);
      throw error;
    }
  }

  /**
   * Extract text from Gemini API response
   * @param {Object} response - The API response
   * @returns {string} - The extracted text
   */
  extractTextFromResponse(response) {
    if (!response || !response.candidates || !response.candidates[0] || 
        !response.candidates[0].content || !response.candidates[0].content.parts) {
      throw new Error('Unexpected response format');
    }

    const parts = response.candidates[0].content.parts;
    return parts.map(part => part.text).join('');
  }

  /**
   * Simulate a response for development or when API is unavailable
   * @param {string} prompt - The prompt
   * @returns {string} - A simulated response
   */
  simulateResponse(prompt) {
    // Generate some sample text based on the prompt
    const words = prompt.split(' ').filter(w => w.length > 3);
    const seed = words.length > 5 ? words.slice(0, 5).join(' ') : words.join(' ');
    
    return `Simulated response for: "${seed}..."\n\nThis is a placeholder response generated because the Gemini API key is missing or invalid. The actual API would provide a more sophisticated response based on your prompt.`;
  }

  /**
   * Generate a cache key from the prompt
   * @param {string} prompt - The prompt
   * @returns {string} - A hash key
   */
  generateCacheKey(prompt) {
    return crypto.createHash('md5').update(prompt).digest('hex');
  }

  /**
   * Load cache from disk
   */
  loadCache() {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const cacheData = fs.readFileSync(this.cacheFilePath, 'utf8');
        this.cache = JSON.parse(cacheData);
        console.log('Cache loaded successfully');
      }
    } catch (error) {
      console.error('Error loading cache:', error.message);
      this.cache = {};
    }
  }

  /**
   * Save cache to disk
   */
  saveCache() {
    try {
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('Error saving cache:', error.message);
    }
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache = {};
    try {
      fs.writeFileSync(this.cacheFilePath, '{}');
      console.log('Cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error.message);
    }
  }
}

module.exports = GeminiApi; 
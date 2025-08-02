// Example AI Proxy Server for EnhanceMD
// This is a simple Node.js server that forwards requests to OpenAI, OpenRouter, or other services
// You can customize this to use any AI provider you want

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configuration - Set these environment variables or modify directly
const CONFIG = {
  // Choose your provider: 'openai', 'openrouter', 'custom'
  provider: process.env.AI_PROVIDER || 'openrouter',
  
  // API Keys for different services
  openaiKey: process.env.OPENAI_API_KEY || '',
  openrouterKey: process.env.OPENROUTER_API_KEY || '',
  
  // Default model to use if not specified
  defaultModel: process.env.DEFAULT_MODEL || 'openai/gpt-3.5-turbo',
  
  // For OpenRouter, you can use free models without API key
  allowFreeModels: true,
};

// OpenAI-compatible chat completions endpoint
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { model, messages, temperature, max_tokens, stream } = req.body;
    
    // Get API key from request or use configured key
    const authHeader = req.headers.authorization;
    const requestApiKey = authHeader ? authHeader.replace('Bearer ', '') : '';
    
    let response;
    
    switch (CONFIG.provider) {
      case 'openai':
        response = await forwardToOpenAI(req.body, requestApiKey || CONFIG.openaiKey);
        break;
        
      case 'openrouter':
        response = await forwardToOpenRouter(req.body, requestApiKey || CONFIG.openrouterKey);
        break;
        
      case 'custom':
        // Implement your custom logic here
        response = await customAIHandler(req.body);
        break;
        
      default:
        // Fallback to a mock response for testing
        response = createMockResponse(messages);
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error processing request:', error.message);
    res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        type: 'api_error',
        code: 'internal_error'
      }
    });
  }
});

// Forward to OpenAI API
async function forwardToOpenAI(payload, apiKey) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }
  
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    payload,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}

// Forward to OpenRouter API
async function forwardToOpenRouter(payload, apiKey) {
  // OpenRouter allows some free models without API key
  const headers = {
    'Content-Type': 'application/json',
    'HTTP-Referer': 'http://localhost:3001', // Required for OpenRouter
    'X-Title': 'EnhanceMD' // Optional, shows in OpenRouter dashboard
  };
  
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  // Use free models if no API key
  if (!apiKey && CONFIG.allowFreeModels) {
    // Free models on OpenRouter (as of 2024)
    const freeModels = [
      'openai/gpt-3.5-turbo',
      'meta-llama/llama-3-8b-instruct:free',
      'google/gemma-7b-it:free',
      'mistralai/mistral-7b-instruct:free',
      'nousresearch/nous-capybara-7b:free'
    ];
    
    // Override model to use a free one if not already free
    if (!payload.model || !freeModels.includes(payload.model)) {
      payload.model = freeModels[0]; // Default to first free model
    }
  }
  
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      payload,
      { headers }
    );
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.error?.message || 'OpenRouter API error');
    }
    throw error;
  }
}

// Custom AI handler - implement your own logic
async function customAIHandler(payload) {
  const { messages } = payload;
  const lastMessage = messages[messages.length - 1];
  
  // Example: Use a local LLM, another API, or custom logic
  // This is just a placeholder that echoes back
  return {
    id: 'custom-' + Date.now(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: payload.model || 'custom',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: `[Custom AI Response] You said: "${lastMessage.content}". This is where your custom AI logic would generate a real response.`
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30
    }
  };
}

// Create a mock response for testing
function createMockResponse(messages) {
  const lastMessage = messages[messages.length - 1];
  
  // Simple mock responses based on keywords
  let responseContent = 'This is a test response from the mock AI server.';
  
  if (lastMessage.content.toLowerCase().includes('hello')) {
    responseContent = 'Hello, EnhanceMD is connected to your AI service!';
  } else if (lastMessage.content.toLowerCase().includes('improve')) {
    responseContent = 'Here is an improved version of your text with better clarity and style.';
  } else if (lastMessage.content.toLowerCase().includes('grammar')) {
    responseContent = 'Your text has been checked and corrected for grammar.';
  } else if (lastMessage.content.toLowerCase().includes('summarize')) {
    responseContent = 'This is a concise summary of the provided text.';
  }
  
  return {
    id: 'mock-' + Date.now(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'mock-model',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: responseContent
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30
    }
  };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    provider: CONFIG.provider,
    models: getAvailableModels()
  });
});

// Get available models based on provider
function getAvailableModels() {
  switch (CONFIG.provider) {
    case 'openai':
      return ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];
    case 'openrouter':
      return [
        'openai/gpt-3.5-turbo',
        'openai/gpt-4',
        'anthropic/claude-3-haiku',
        'anthropic/claude-3-sonnet',
        'meta-llama/llama-3-8b-instruct:free',
        'google/gemma-7b-it:free',
        'mistralai/mistral-7b-instruct:free'
      ];
    default:
      return ['custom-model'];
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║     EnhanceMD AI Proxy Server             ║
╠═══════════════════════════════════════════╣
║  Status: Running                          ║
║  Port: ${PORT}                               ║
║  Provider: ${CONFIG.provider.padEnd(30)} ║
║  Endpoint: http://localhost:${PORT}/v1/chat/completions
╚═══════════════════════════════════════════╝

Configure EnhanceMD to use this endpoint in the AI settings.
  `);
});
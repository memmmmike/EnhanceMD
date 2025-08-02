# EnhanceMD AI Proxy Server

A flexible proxy server that allows EnhanceMD to connect to various AI services through a unified OpenAI-compatible API.

## Features

- 🔄 **Multiple Providers**: Support for OpenAI, OpenRouter, or custom implementations
- 🆓 **Free Tier Support**: Use OpenRouter's free models without API keys
- 🔐 **Flexible Authentication**: Works with or without API keys
- 🎯 **OpenAI Compatible**: Uses standard OpenAI chat completions format
- 🛠️ **Easy to Customize**: Simple Node.js server you can modify

## Quick Start

### 1. Install Dependencies

```bash
cd ai-proxy-example
npm install
```

### 2. Configure (Optional)

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your preferred provider and API keys.

### 3. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3001`

### 4. Configure EnhanceMD

In EnhanceMD's AI Assistant settings:
- **Endpoint**: `http://localhost:3001/v1/chat/completions`
- **API Key**: Leave empty for free models or add your key
- **Model**: Choose from available models

## Providers

### OpenRouter (Recommended)

OpenRouter aggregates multiple AI providers and offers some free models:

**Free Models (no API key required):**
- `meta-llama/llama-3-8b-instruct:free`
- `google/gemma-7b-it:free`
- `mistralai/mistral-7b-instruct:free`
- `nousresearch/nous-capybara-7b:free`

**Paid Models (requires API key):**
- `openai/gpt-3.5-turbo`
- `openai/gpt-4`
- `anthropic/claude-3-haiku`
- `anthropic/claude-3-sonnet`

### OpenAI

Direct connection to OpenAI (requires API key):
- `gpt-3.5-turbo`
- `gpt-4`
- `gpt-4-turbo`

### Custom Implementation

Modify the `customAIHandler` function in `server.js` to:
- Connect to local LLMs (Ollama, llama.cpp)
- Use other AI services
- Implement your own logic

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_PROVIDER` | Provider to use: `openai`, `openrouter`, `custom` | `openrouter` |
| `PORT` | Server port | `3001` |
| `OPENAI_API_KEY` | OpenAI API key (if using OpenAI) | - |
| `OPENROUTER_API_KEY` | OpenRouter API key (optional) | - |
| `DEFAULT_MODEL` | Default model to use | `openai/gpt-3.5-turbo` |

## Testing

Test the connection:

```bash
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Or use the built-in test:

```bash
npm test
```

## Customization Examples

### Use Ollama (Local LLM)

```javascript
async function customAIHandler(payload) {
  const response = await axios.post(
    'http://localhost:11434/api/generate',
    {
      model: 'llama2',
      prompt: payload.messages[payload.messages.length - 1].content,
      stream: false
    }
  );
  
  return {
    choices: [{
      message: {
        role: 'assistant',
        content: response.data.response
      }
    }]
  };
}
```

### Use Hugging Face

```javascript
async function customAIHandler(payload) {
  const response = await axios.post(
    'https://api-inference.huggingface.co/models/gpt2',
    { inputs: payload.messages[payload.messages.length - 1].content },
    { headers: { 'Authorization': `Bearer ${HF_TOKEN}` } }
  );
  
  return {
    choices: [{
      message: {
        role: 'assistant',
        content: response.data[0].generated_text
      }
    }]
  };
}
```

## Deployment

### Local Development
```bash
npm run dev  # Uses nodemon for auto-reload
```

### Production
```bash
NODE_ENV=production npm start
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

### Deploy to Cloud

- **Vercel**: Add as serverless function
- **Railway**: Direct deployment from GitHub
- **Fly.io**: Deploy with `fly launch`
- **Heroku**: Standard Node.js deployment

## Security Notes

- Never commit `.env` files with real API keys
- Use environment variables in production
- Consider rate limiting for public deployments
- Add authentication if exposing to internet

## Troubleshooting

**Connection refused**: Make sure the server is running on the correct port

**API key errors**: Check that your API keys are valid and have credits

**Model not found**: Ensure you're using a model available for your provider

**CORS errors**: The server includes CORS headers, but check browser console for issues

## License

MIT - Modify and use as needed for your projects!
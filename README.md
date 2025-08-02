# EnhanceMD

Transform your Markdown documents into professional, beautifully formatted outputs with multiple export options. Write once in Markdown, apply stunning themes, and export to various formats.

![EnhanceMD](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-AGPL--3.0-green.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)

## Features

### Core Editor
- **Advanced Markdown Editor** - CodeMirror 6 with syntax highlighting and live preview
- **Professional Themes** - Light, Dark, and Sepia modes with 5+ document themes
- **Smart Components** - Charts, timelines, stats cards, and progress bars
- **Variables & Templating** - Dynamic content with built-in templates
- **Export Options** - HTML (working), PDF and React components (planned)
- **Focus Mode** - Distraction-free writing (Ctrl/Cmd + Shift + F)
- **Command Palette** - Quick access to all features (Cmd/Ctrl + K)
- **Auto-save** - Never lose your work with localStorage persistence
- **Export History** - Track and re-download previous exports

### AI Assistant
- **Custom AI Proxy Server** - Connect to any AI service (OpenAI, OpenRouter, local LLMs)
- **Free Models Available** - Use OpenRouter's free tier without API keys
- **Writing Tools** - Improve, expand, summarize, fix grammar, generate ideas
- **Flexible Configuration** - Bring your own API keys or use free models

## Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/EnhanceMD.git
cd EnhanceMD

# Install dependencies
cd client
pnpm install

# Start development server
pnpm dev

# The app will be available at http://localhost:5173
```

### Production Build

```bash
# Build the application
pnpm build

# Preview production build
pnpm preview
```

## AI Assistant Setup (Optional)

EnhanceMD includes an AI proxy server that connects to various AI services. You have three options:

### Option 1: Use Free Models (No API Key Required)

```bash
# Navigate to AI proxy directory
cd ai-proxy-example
npm install

# Start the server (uses OpenRouter free models by default)
npm start
```

In EnhanceMD settings:
- Endpoint: `http://localhost:3001/v1/chat/completions`
- API Key: Leave empty
- Model: Select a free model

### Option 2: Use Your Own API Keys

Create `.env` file in `ai-proxy-example/`:
```env
AI_PROVIDER=openrouter  # or 'openai'
OPENROUTER_API_KEY=your_key_here  # Get from openrouter.ai
# OR
OPENAI_API_KEY=your_key_here  # Get from platform.openai.com
```

### Option 3: Connect to Local LLMs

Modify `ai-proxy-example/server.js` to connect to:
- Ollama (`http://localhost:11434`)
- llama.cpp
- Any OpenAI-compatible endpoint

## Usage Guide

### Smart Components

#### Charts
```markdown
```chart
type: bar
title: Monthly Revenue
data: [
  { label: "Jan", value: 50000 },
  { label: "Feb", value: 65000 },
  { label: "Mar", value: 80000 }
]
```
```

#### Timeline
```markdown
```timeline
title: Project Roadmap
events: [
  { date: "2024-01", title: "Project Kickoff", description: "Initial planning" },
  { date: "2024-03", title: "Beta Release", description: "First public version" }
]
```
```

#### Stats Cards
```markdown
```stats
Revenue|$125K|+15%|money
Users|5,200|+8%|users
Growth|23%|+5%|trending
```
```

#### Progress Bars
```markdown
[progress:75:Project Completion]
[progress:90:Customer Satisfaction]
```

### Variables & Templates

Use variables in your documents:
```markdown
# {{companyName}} Proposal

Dear {{clientName}},

We're excited to present our proposal for {{projectName}}.
```

Access pre-built templates via the Variables panel for:
- Business Proposals
- Meeting Notes
- Monthly Reports

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open Command Palette |
| `Cmd/Ctrl + S` | Save Document |
| `Cmd/Ctrl + Shift + F` | Toggle Focus Mode |
| `Cmd/Ctrl + Shift + A` | Open AI Assistant |
| `Cmd/Ctrl + E` | Export Document |
| `Cmd/Ctrl + P` | Print Preview |

## AI Proxy Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_PROVIDER` | Provider to use: `openai`, `openrouter`, `custom` | `openrouter` |
| `PORT` | Server port | `3001` |
| `OPENAI_API_KEY` | OpenAI API key (if using OpenAI) | - |
| `OPENROUTER_API_KEY` | OpenRouter API key (optional for free models) | - |
| `DEFAULT_MODEL` | Default model to use | `openai/gpt-3.5-turbo` |

### Available Models

#### Free Models (OpenRouter)
- `meta-llama/llama-3-8b-instruct:free`
- `google/gemma-7b-it:free`
- `mistralai/mistral-7b-instruct:free`
- `nousresearch/nous-capybara-7b:free`

#### Paid Models
- `openai/gpt-3.5-turbo`
- `openai/gpt-4`
- `anthropic/claude-3-haiku`
- `anthropic/claude-3-sonnet`

### Custom AI Integration

Example: Connect to Ollama (Local LLM)
```javascript
// In ai-proxy-example/server.js
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

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Editor**: CodeMirror 6
- **Styling**: Tailwind CSS 3
- **Markdown**: react-markdown with remark/rehype
- **State**: Zustand
- **Icons**: Heroicons
- **Charts**: Recharts
- **Notifications**: react-hot-toast

## Project Structure

```
EnhanceMD/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── store/           # State management
│   │   ├── utils/           # Utility functions
│   │   └── App.tsx          # Main application
│   └── package.json         # Frontend dependencies
├── ai-proxy-example/         # AI proxy server
│   ├── server.js            # Express server
│   ├── package.json         # Server dependencies
│   └── .env.example         # Environment variables template
├── CLAUDE.md                # AI assistant instructions
├── LICENSE                  # AGPL-3.0 license
└── README.md               # This file
```

## Deployment

### Frontend Deployment

#### Vercel
```bash
cd client
pnpm build
# Deploy dist/ folder to Vercel
```

#### Netlify
```bash
cd client
pnpm build
# Deploy dist/ folder to Netlify
```

### AI Proxy Deployment

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY ai-proxy-example/package*.json ./
RUN npm ci --only=production
COPY ai-proxy-example/ .
EXPOSE 3001
CMD ["node", "server.js"]
```

#### Cloud Platforms
- **Railway**: Direct GitHub deployment
- **Fly.io**: `fly launch` in ai-proxy-example/
- **Heroku**: Standard Node.js deployment
- **Vercel**: Deploy as serverless function

## Development

### Running Tests
```bash
cd client
pnpm test
```

### Code Formatting
```bash
cd client
pnpm lint
pnpm format
```

### Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Change port in vite.config.ts or use
pnpm dev --port 3000
```

**AI Assistant not working**
- Ensure AI proxy server is running on port 3001
- Check endpoint configuration in AI settings
- Verify API keys if using paid models

**Export not working**
- Check browser console for errors
- Ensure pop-ups are not blocked
- Try different browser if issues persist

**Styles not applying**
- Clear browser cache
- Check theme injection in App.tsx
- Verify Tailwind configuration

## Roadmap

- [x] Core editor with live preview
- [x] Multiple theme support
- [x] Smart components
- [x] Variables & templating
- [x] AI Assistant integration
- [x] Export to HTML
- [x] Mobile responsive design
- [x] Command palette
- [x] Focus mode
- [ ] PDF export
- [ ] React component export
- [ ] Cloud sync
- [ ] Collaboration features
- [ ] Plugin system
- [ ] Desktop app (Electron)

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

### Important License Terms:
- **Open Source**: You can freely use, modify, and distribute EnhanceMD
- **Network Copyleft**: If you run EnhanceMD on a server, you MUST provide source code access to users
- **Share Improvements**: Any modifications must also be licensed under AGPL-3.0
- **Commercial Use**: Allowed, but must comply with AGPL terms
- **Why AGPL?**: We believe improvements to EnhanceMD should benefit the entire community

## Support

For issues, questions, or suggestions, please [open an issue](https://github.com/yourusername/EnhanceMD/issues) on GitHub.

## Acknowledgments

- Inspired by modern markdown editors like Obsidian and Notion
- Built with amazing open-source libraries
- Special thanks to all contributors

---

**EnhanceMD** - Beautiful documents from simple Markdown
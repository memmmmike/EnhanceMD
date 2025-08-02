# EnhanceMD

Transform your Markdown documents into professional, beautifully formatted outputs with multiple export options. Write once in Markdown, apply stunning themes, and export to various formats.

![EnhanceMD](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-AGPL--3.0-green.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)

## Features

### 📝 **Advanced Markdown Editor**
- **CodeMirror 6** powered editor with syntax highlighting
- **Live preview** with instant updates
- **Auto-save** to localStorage
- **Focus mode** for distraction-free writing (Ctrl/Cmd + Shift + F)
- **Command palette** for quick access to features (Cmd/Ctrl + K)
- **Custom keyboard shortcuts**
- **Variables & templating** system with built-in templates

### 🎨 **Professional Themes**
- **Light Mode** - Clean, minimalist design for professional documents
- **Dark Mode** - Easy on the eyes for extended writing sessions
- **Sepia Mode** - Warm, paper-like aesthetic for comfortable reading
- **5+ Document Themes** - Business, SaaS Landing, Blog, Documentation, Newsletter

### 📊 **Smart Components**
- **Charts** - Bar, line, and pie charts with `\`\`\`chart` syntax
- **Timelines** - Visual project timelines with `\`\`\`timeline` syntax
- **Stats Cards** - Beautiful metric displays with `\`\`\`stats` syntax
- **Progress Indicators** - Visual progress bars with `[progress:75:Label]` syntax

### 💾 **Export Options**
- **Web Page** - Standalone HTML with embedded styles
- **Export History** - Track and re-download previous exports
- **PDF Export** (Coming Soon)
- **React Component** (Coming Soon)

### 🤖 **Free AI Assistant** (100% FOSS)
- **Powered by Hugging Face** - Free open-source models
- **No API key required** - 1000 free requests per day
- **Multiple AI models** - Mistral, Llama 2, FLAN-T5, and more
- **Writing assistance** - Improve, expand, summarize, fix grammar
- **Content generation** - Ideas, outlines, conclusions
- **Smart features** - Translation, rephrasing, fact-checking

### 🚀 **Modern Interface**
- **Glass morphism** design with subtle animations
- **Responsive layout** - Works on desktop, tablet, and mobile
- **Collapsible panels** for maximum writing space
- **Live word count** with estimated reading time
- **Theme-aware syntax highlighting**

## Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/EnhanceMD.git
cd EnhanceMD

# Navigate to client directory
cd client

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the application
pnpm build

# Preview production build
pnpm preview
```

## Usage

### Basic Markdown
Write standard Markdown with all the features you love:
- Headers, bold, italic, links
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Tables, blockquotes, images

### Smart Components

#### Charts
```markdown
\`\`\`chart
type: bar
title: Monthly Revenue
data: [
  { label: "Jan", value: 50000 },
  { label: "Feb", value: 65000 },
  { label: "Mar", value: 80000 }
]
\`\`\`
```

#### Timeline
```markdown
\`\`\`timeline
title: Project Roadmap
events: [
  { date: "2024-01", title: "Project Kickoff", description: "Initial planning" },
  { date: "2024-03", title: "Beta Release", description: "First public version" }
]
\`\`\`
```

#### Stats Cards
```markdown
\`\`\`stats
Revenue|$125K|+15%|money
Users|5,200|+8%|users
Growth|23%|+5%|trending
\`\`\`
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

Access templates via the Variables panel (icon in toolbar) with pre-built templates for:
- Business Proposals
- Meeting Notes
- Monthly Reports

### AI Assistant (Free & Open Source)

EnhanceMD includes a powerful AI assistant powered by **free, open-source models** through Hugging Face:

**No API Key Required!** 
- Get 1000 free requests per day without any sign-up
- Optional: Add a free Hugging Face token for unlimited requests

**Available Models:**
- **Mistral 7B** - Fast and capable general-purpose model
- **Llama 2 7B** - Meta's powerful open model
- **FLAN-T5** - Google's efficient text-to-text model
- **Phi-2** - Microsoft's small but capable model

**AI Features:**
- ✏️ **Improve Writing** - Enhance clarity and style
- 🔧 **Fix Grammar** - Correct spelling and grammar errors
- 📝 **Expand Text** - Add more detail and examples
- 📋 **Summarize** - Create concise summaries
- 💡 **Generate Ideas** - Get creative suggestions
- 🌍 **Translate** - Convert to other languages
- 🔄 **Rephrase** - Change tone (formal/casual/technical)

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open Command Palette |
| `Cmd/Ctrl + S` | Save Document |
| `Cmd/Ctrl + Shift + F` | Toggle Focus Mode |
| `Cmd/Ctrl + Shift + A` | Open AI Assistant |
| `Cmd/Ctrl + E` | Export Document |
| `Cmd/Ctrl + P` | Print Preview |
| `Cmd/Ctrl + B` | Bold Text |
| `Cmd/Ctrl + I` | Italic Text |

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Editor**: CodeMirror 6
- **Styling**: Tailwind CSS 3
- **Markdown Parsing**: react-markdown with remark/rehype plugins
- **Icons**: Heroicons
- **Charts**: Recharts
- **Notifications**: react-hot-toast

## Project Structure

```
EnhanceMD/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── themes/          # Document themes
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main application
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   └── package.json         # Dependencies
├── CLAUDE.md                # AI assistant instructions
└── README.md               # This file
```

## Development

### Running Tests
```bash
pnpm test
```

### Code Style
```bash
pnpm lint
pnpm format
```

### Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [x] Core editor with live preview
- [x] Multiple theme support
- [x] Smart components (charts, timelines)
- [x] Variables & templating
- [x] Export to HTML
- [x] Mobile responsive design
- [x] Command palette
- [x] Focus mode
- [ ] PDF export
- [ ] React component export
- [ ] Cloud sync
- [ ] Collaboration features
- [ ] Plugin system
- [ ] AI-powered writing assistance

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

### Important License Terms:
- **Open Source**: You can freely use, modify, and distribute EnhanceMD
- **Network Copyleft**: If you run EnhanceMD on a server, you MUST provide source code access to users
- **Share Improvements**: Any modifications must also be licensed under AGPL-3.0
- **Commercial Use**: Allowed, but must comply with AGPL terms
- **Why AGPL?**: We believe improvements to EnhanceMD should benefit the entire community

## Acknowledgments

- Inspired by modern markdown editors like Obsidian and Notion
- Built with amazing open-source libraries
- Special thanks to all contributors

## Support

For issues, questions, or suggestions, please [open an issue](https://github.com/yourusername/EnhanceMD/issues) on GitHub.

---

**EnhanceMD** - Beautiful documents from simple Markdown
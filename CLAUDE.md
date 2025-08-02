# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the EnhanceMD project.

## Project Overview

**EnhanceMD** is a web application that transforms Markdown documents into professionally formatted documents with multiple export options. It separates content (Markdown) from presentation (themes, styles) to create beautiful documents without editing the source.

### Key Concept
- Write once in Markdown
- Apply professional themes and styles
- Export to multiple formats (PDF, HTML, React)
- Perfect for proposals, documentation, blogs, and websites

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3 + Custom CSS + Brainwave-inspired design system
- **Editor**: CodeMirror 6 (with Markdown support + One Dark theme)
- **Markdown Rendering**: react-markdown
- **State Management**: Zustand
- **UI Components**: Headless UI + Heroicons + Custom components (Button, GlassCard)
- **Notifications**: react-hot-toast
- **Utilities**: class-variance-authority (for component variants)

## Project Structure

```
EnhanceMD/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Button.tsx   # Gradient button component
│   │   │   └── GlassCard.tsx # Glass morphism card
│   │   ├── themes/          # Theme definitions
│   │   ├── store/           # Zustand stores
│   │   ├── utils/           # Helper functions
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Tailwind imports
│   ├── public/              # Static assets
│   └── package.json         # Dependencies
├── server/                   # Node.js backend (future)
├── shared/                   # Shared types (future)
└── README.md                # Project documentation
```

## Current Features

### 1. **Markdown Editor**
- Syntax highlighting
- Live preview
- Collapsible editor panel
- Default template with examples

### 2. **Theme System**
- **Modern Business**: Clean, professional, blue accents
- **SaaS Landing**: Dark theme with gradients
- **Blog Article**: Medium-style typography
- **Documentation**: Technical docs formatting
- **Newsletter**: Email-friendly design

### 3. **Export Options**
- **Web Page**: Standalone HTML with embedded styles
- **HTML + CSS**: Separate files for integration (planned)
- **PDF**: Print-ready document (planned)
- **React Component**: JSX export (planned)

### 4. **UI Enhancements**
- **Brainwave-inspired Design System**:
  - Dark theme with rich gradients (#0E0C15 background)
  - Glass morphism effects with backdrop blur
  - Vibrant accent colors (Purple #AC6AFF, Gold #FFC876, Cyan #79FFF7)
  - Conic and radial gradient animations
  - Floating background elements
  - Grid and dot patterns for depth
- **Enhanced Components**:
  - Custom Button component with gradient variants
  - GlassCard component with glow effects
  - Animated theme cards with preview gradients
  - Export dropdown with glass morphism menu
- **Modern Interactions**:
  - Smooth hover transitions
  - Glow effects on interactive elements
  - Animated gradient shifts
  - Transform animations on hover

## Development Commands

```bash
# Navigate to client directory
cd client

# Install dependencies
pnpm install

# Start development server (default port 5173)
pnpm dev

# Start on custom port (recommended: 4444)
pnpm dev --port 4444

# Run in background without terminal
nohup pnpm dev --port 4444 > /dev/null 2>&1 &
disown

# Kill background server
pkill -f "pnpm dev --port 4444"

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Important Notes on Running the Dev Server
- **Port 5173 is commonly used** by other Vite projects, so conflicts are common
- **Recommended to use port 4444** or another unused port
- **To run without keeping terminal open**, use the nohup command above
- **Check if server is running**: `ps aux | grep "pnpm dev"`

## Key Files to Know

### `src/App.tsx`
Main application component that includes:
- Markdown editor (CodeMirror)
- Theme selector
- Export menu
- Preview panel

### `src/themes/`
Theme definitions with complete styling for each element:
- Headers (h1, h2, h3)
- Paragraphs and text
- Lists and list items
- Tables
- Code blocks
- Blockquotes

### `src/components/`
Reusable UI components:
- `Button.tsx`: Advanced button component with variants (gradient, outline, ghost, glow)
- `GlassCard.tsx`: Glass morphism card with optional glow and gradient effects

### `src/index.css`
Global styles and Tailwind configuration:
- Custom CSS variables for gradients and colors
- Brainwave-inspired utility classes
- Animation keyframes for floating and gradient effects
- Glass morphism utilities

## Styling Approach

1. **Base Styles**: Tailwind CSS for utility classes + custom Brainwave design system
2. **Theme Styles**: CSS-in-JS strings injected via `<style>` tag
3. **Component Styles**: Tailwind classes with custom properties and class-variance-authority
4. **Dark Mode**: Brainwave-inspired dark theme as default (not toggleable)
5. **Design Tokens**:
   - Primary: #AC6AFF (Purple)
   - Secondary: #FFC876 (Gold)
   - Accent: #79FFF7 (Cyan)
   - Background: #0E0C15 (Deep dark)
   - Glass effects: backdrop-blur with white/5 backgrounds

## Export Implementation

### HTML Export (Working)
```javascript
function generateStandaloneHTML(markdown, theme) {
  // Converts markdown to HTML
  // Embeds theme styles
  // Creates downloadable file
}
```

### PDF Export (TODO)
- Use `react-pdf` or `puppeteer`
- Preserve theme styling
- Add page breaks
- Include headers/footers

### React Export (TODO)
- Convert Markdown to JSX
- Apply Tailwind classes
- Create component file

## Future Enhancements

### High Priority
1. **PDF Export**: Implement using react-pdf
2. **Save/Load Documents**: Local storage or file system
3. **Custom Themes**: User-created themes
4. **Template Library**: Pre-built document templates

### Medium Priority
1. **Cloud Sync**: Save documents online
2. **Collaboration**: Share documents with others
3. **Version History**: Track document changes
4. **Plugin System**: Extend functionality

### Nice to Have
1. **AI Enhancements**: Content suggestions
2. **Charts/Graphs**: From markdown tables
3. **Custom CSS**: Advanced styling options
4. **API Access**: Programmatic document generation

## Common Tasks

### Adding a New Theme
1. Add theme definition to `themes` object in App.tsx
2. Include all style properties (h1, h2, p, etc.)
3. Add preview gradient color
4. Test with sample content

### Adding Export Format
1. Add to `exportFormats` object
2. Implement action function
3. Create file generation logic
4. Add appropriate icon

### Modifying UI
1. Follow Tailwind conventions
2. Use gradient classes for accents
3. Maintain dark theme consistency
4. Test responsive behavior

## Important Notes

- **State Management**: Currently using React hooks, can migrate to Zustand if needed
- **Performance**: Editor and preview are not memoized yet
- **Accessibility**: Needs ARIA labels and keyboard navigation
- **Testing**: No tests implemented yet
- **Build**: Using Vite for fast HMR and builds
- **Port Conflicts**: Default port 5173 often conflicts with other Vite projects
- **Background Running**: Use nohup command for persistent dev server
- **Dependencies**: Requires pnpm, class-variance-authority, @codemirror/theme-one-dark

## Design Principles

1. **Separation of Concerns**: Content vs Presentation
2. **User Experience**: Simple, intuitive interface
3. **Professional Output**: Focus on quality exports
4. **Flexibility**: Multiple themes and formats
5. **Performance**: Fast editing and preview

## Troubleshooting

### Common Issues

1. **Styles Not Applying**: Check style injection in App.tsx
2. **Export Not Working**: Verify browser allows downloads
3. **Theme Not Changing**: Ensure state updates properly
4. **Preview Lag**: Consider debouncing markdown updates

### Development Tips

- Use `pnpm` for faster installs
- Keep `console.log` for debugging exports
- Test exports in different browsers
- Check responsive design on mobile

## Contact & Support

- **Project Location**: `/home/mlayug/Documents/EnhanceMD`
- **Development**: Use Windsurf IDE or VS Code
- **Package Manager**: pnpm (preferred) or npm

## Recent Updates

### Brainwave Integration (July 2025)
- Integrated Brainwave-inspired design system
- Added dark theme with vibrant gradients
- Implemented glass morphism UI components
- Enhanced animations and hover effects
- Created custom Button and GlassCard components
- Added export dropdown menu
- Improved theme selector with gradient previews

---

*This project is under active development. Update this file as features are added or changed.*
import { useState, useEffect, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { Toaster, toast } from 'react-hot-toast'
import debounce from 'lodash.debounce'
import { 
  PaintBrushIcon, 
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CodeBracketIcon,
  EyeIcon,
  DocumentIcon,
  CodeBracketSquareIcon,
  CloudArrowUpIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  FolderOpenIcon,
  FolderArrowDownIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  Bars3Icon,
  XMarkIcon,
  CommandLineIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'
import { Button } from './components/Button'
import { CommandPalette, type Command } from './components/CommandPalette'
import { WordCount } from './components/WordCount'
import { FocusMode } from './components/FocusMode'
import { AutoSaveIndicator } from './components/AutoSaveIndicator'
import { ExportHistory } from './components/ExportHistory'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { AIAssistant } from './components/AIAssistant'
import { useCommandPalette } from './hooks/useCommandPalette'
import { useAutoSave } from './hooks/useAutoSave'
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS, type KeyboardShortcut } from './hooks/useKeyboardShortcuts'
import { useSmartComponents } from './hooks/useSmartComponents'
import { EnhancedMarkdown } from './components/EnhancedMarkdown'
import { useExportHistoryStore, generateContentHash } from './store/exportHistoryStore'
import { convertImageToBase64, compressImage, processMarkdownImages, generatePathVariations, getImageMatchStatus, extractImagePaths } from './utils/imageHandler'
import { testHuggingFaceAPI } from './services/testHuggingface'

// Make test function available globally
if (typeof window !== 'undefined') {
  (window as any).testHF = testHuggingFaceAPI
}

const defaultMarkdown = `# Welcome to EnhanceMD

## Transform Your Markdown into Beautiful Documents

EnhanceMD is a powerful tool that helps you create professionally formatted documents from simple Markdown text. Write once, export to multiple formats with stunning themes.

### 🎯 Quick Start

\`\`\`tasks
[ ] Write your content in the editor
[x] Choose a theme from the sidebar
[x] Customize typography settings
[ ] Add smart components
[ ] Export to your preferred format
\`\`\`

### 📊 Smart Components

#### Progress Indicators
Track your progress with visual indicators:

[progress:75:Project Completion]

#### Charts & Visualizations

\`\`\`chart
bar
JavaScript: 85
TypeScript: 92
React: 88
Node.js: 76
Python: 65
\`\`\`

\`\`\`chart
pie
Desktop: 45
Mobile: 35
Tablet: 20
\`\`\`

#### Timeline

\`\`\`timeline
2024-01: Project kickoff and planning
2024-03: Development phase begins
2024-06: Beta testing with users
2024-09: Public launch
2024-12: Version 2.0 release
\`\`\`

#### Statistics Dashboard

\`\`\`stats
Active Users|15.2K|+12.5%|users
Revenue|$48.5K|+8.3%|trophy
Growth Rate|24%|+5.2%|fire
Satisfaction|4.8/5|+0.3|sparkles
\`\`\`

### 📝 Markdown Basics

#### Text Formatting
- **Bold text** with \`**double asterisks**\`
- *Italic text* with \`*single asterisks*\`
- ***Bold and italic*** with \`***triple asterisks***\`

:::tip
Pro tip: You can combine smart components with regular markdown for rich, interactive documents!
:::

### Available Themes

- **Modern**: Clean and minimalist design
- **Executive**: Professional business documents
- **Government**: Official formatting
- **Academic**: Scholarly papers
- **Creative**: Bold and expressive
- **Newsletter**: Engaging email format

:::info
Click **Add Images** to upload local images. EnhanceMD will convert them to base64 and auto-match filenames in your document.
:::

### Pro Tips

- Use the **Hide Editor** button to preview in full width
- Enable **Cover Page** for professional documents
- Add **Table of Contents** for longer documents
- Try different **Font Families** and **Line Spacing**
- Images are compressed automatically for performance

### Perfect For

- **Proposals** - Professional client presentations
- **Documentation** - Technical guides and manuals  
- **Blog Posts** - Beautiful article formatting
- **Reports** - Business and academic papers
- **Newsletters** - Engaging email content

---

<center>
<small>Made with ❤️ for writers who care about presentation</small>
</center>
`

// Theme configurations with actual styles
const themes = {
  modern: {
    name: 'Modern',
    description: 'Clean and minimalist',
    previewGradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    styles: `
      .markdown-content h1 { font-size: 2.5rem; font-weight: 800; color: #111827; margin-bottom: 1.5rem; line-height: 1.2; }
      .markdown-content h2 { font-size: 2rem; font-weight: 700; color: #1f2937; margin-top: 2rem; margin-bottom: 1rem; }
      .markdown-content h3 { font-size: 1.5rem; font-weight: 600; color: #374151; margin-top: 1.5rem; margin-bottom: 0.75rem; }
      .markdown-content p { color: #4b5563; line-height: 1.75; margin-bottom: 1rem; }
      .markdown-content ul { list-style: none; padding-left: 0; }
      .markdown-content li { position: relative; padding-left: 1.5rem; margin-bottom: 0.5rem; color: #4b5563; }
      .markdown-content li:before { content: "•"; position: absolute; left: 0; color: #3b82f6; font-weight: bold; }
      .markdown-content strong { color: #1f2937; font-weight: 700; }
      .markdown-content blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; color: #6b7280; font-style: italic; }
      .markdown-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; border: 1px solid #e5e7eb; }
      .markdown-content th { background: #f9fafb; padding: 0.75rem 1rem; text-align: left; font-weight: 600; border: 1px solid #e5e7eb; color: #111827; }
      .markdown-content td { padding: 0.75rem 1rem; border: 1px solid #e5e7eb; color: #4b5563; }
      .markdown-content code { background: #f3f4f6; color: #dc2626; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875rem; }
      .markdown-content pre { background: #1f2937; color: #e5e7eb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    `
  },
  executive: {
    name: 'Executive',
    description: 'Professional documents',
    previewGradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    styles: `
      .markdown-content { font-family: Georgia, serif; }
      .markdown-content h1 { font-size: 2.75rem; font-weight: 300; color: #1e3a8a; margin-bottom: 2rem; border-bottom: 2px solid #ddd6fe; padding-bottom: 1rem; }
      .markdown-content h2 { font-size: 2rem; font-weight: 400; color: #1e40af; margin-top: 2.5rem; margin-bottom: 1.25rem; }
      .markdown-content h3 { font-size: 1.25rem; font-weight: 600; color: #3730a3; margin-top: 2rem; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
      .markdown-content p { color: #1f2937; line-height: 1.8; margin-bottom: 1.25rem; text-align: justify; }
      .markdown-content ul { list-style: none; padding-left: 0; }
      .markdown-content li { position: relative; padding-left: 2rem; margin-bottom: 0.75rem; color: #374151; }
      .markdown-content li:before { content: "▸"; position: absolute; left: 0; color: #4f46e5; font-size: 1.25rem; }
      .markdown-content strong { color: #1e3a8a; font-weight: 600; }
      .markdown-content blockquote { border-left: 4px solid #4f46e5; padding-left: 1.5rem; color: #4b5563; font-style: italic; margin: 1.5rem 0; }
      .markdown-content table { width: 100%; border: 1px solid #e5e7eb; margin: 2rem 0; }
      .markdown-content th { background: #f5f3ff; padding: 1rem; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; color: #1e3a8a; }
      .markdown-content td { padding: 1rem; border-bottom: 1px solid #e5e7eb; color: #1e293b; }
      .markdown-content code { background: #ede9fe; color: #4f46e5; padding: 0.125rem 0.375rem; border-radius: 0.25rem; }
      .markdown-content pre { background: #f5f3ff; color: #1f2937; padding: 1.5rem; border: 1px solid #e5e7eb; }
    `
  },
  government: {
    name: 'Government',
    description: 'Official and formal',
    previewGradient: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
    styles: `
      .markdown-content { font-family: 'Times New Roman', serif; }
      .markdown-content h1 { font-size: 2rem; font-weight: 700; color: #000; margin-bottom: 2rem; text-align: center; text-transform: uppercase; letter-spacing: 0.1em; }
      .markdown-content h2 { font-size: 1.5rem; font-weight: 700; color: #000; margin-top: 2rem; margin-bottom: 1rem; text-transform: uppercase; }
      .markdown-content h3 { font-size: 1.25rem; font-weight: 700; color: #000; margin-top: 1.5rem; margin-bottom: 0.75rem; }
      .markdown-content p { color: #000; line-height: 2; margin-bottom: 1rem; }
      .markdown-content ul { list-style: disc; padding-left: 2rem; }
      .markdown-content li { margin-bottom: 0.5rem; color: #000; }
      .markdown-content strong { font-weight: 700; }
      .markdown-content blockquote { border-left: 4px solid #000; padding-left: 1rem; margin-left: 0; color: #000; }
      .markdown-content table { width: 100%; border: 2px solid #000; margin: 1.5rem 0; }
      .markdown-content th { background: #f0f0f0; padding: 0.75rem; text-align: left; font-weight: 700; border: 1px solid #000; color: #000; }
      .markdown-content td { padding: 0.75rem; border: 1px solid #000; color: #000; }
      .markdown-content code { font-family: 'Courier New', monospace; background: #f0f0f0; padding: 0.125rem 0.25rem; }
      .markdown-content pre { background: #f0f0f0; padding: 1rem; border: 1px solid #000; font-family: 'Courier New', monospace; }
    `
  },
  academic: {
    name: 'Academic',
    description: 'Scholarly and traditional',
    previewGradient: 'linear-gradient(135deg, #92400e 0%, #b91c1c 100%)',
    styles: `
      .markdown-content { font-family: 'Times New Roman', serif; }
      .markdown-content h1 { font-size: 1.75rem; font-weight: 700; color: #000; margin-bottom: 1.5rem; text-align: center; }
      .markdown-content h2 { font-size: 1.5rem; font-weight: 700; color: #000; margin-top: 2rem; margin-bottom: 1rem; }
      .markdown-content h3 { font-size: 1.25rem; font-weight: 700; color: #000; margin-top: 1.5rem; margin-bottom: 0.75rem; font-style: italic; }
      .markdown-content p { color: #000; line-height: 2; margin-bottom: 1rem; text-indent: 2rem; text-align: justify; }
      .markdown-content ul { list-style: decimal; padding-left: 3rem; }
      .markdown-content li { margin-bottom: 0.5rem; color: #000; }
      .markdown-content strong { font-weight: 700; }
      .markdown-content blockquote { margin-left: 2rem; margin-right: 2rem; font-style: italic; color: #000; }
      .markdown-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; border: 1px solid #000; }
      .markdown-content th { padding: 0.5rem; text-align: left; font-weight: 700; border: 1px solid #000; color: #000; }
      .markdown-content td { padding: 0.5rem; border: 1px solid #000; color: #000; }
      .markdown-content code { font-family: 'Courier New', monospace; font-size: 0.9rem; }
      .markdown-content pre { margin-left: 2rem; margin-right: 2rem; padding: 1rem; border-left: 3px solid #000; font-family: 'Courier New', monospace; }
    `
  },
  creative: {
    name: 'Creative',
    description: 'Bold and expressive',
    previewGradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    styles: `
      .markdown-content h1 { font-size: 4rem; font-weight: 900; background: linear-gradient(to right, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 2rem; }
      .markdown-content h2 { font-size: 2.5rem; font-weight: 800; color: #7c3aed; margin-top: 2.5rem; margin-bottom: 1.5rem; }
      .markdown-content h3 { font-size: 1.75rem; font-weight: 700; color: #8b5cf6; margin-top: 2rem; margin-bottom: 1rem; }
      .markdown-content p { color: #374151; line-height: 1.75; margin-bottom: 1.25rem; font-size: 1.125rem; }
      .markdown-content ul { list-style: none; padding-left: 0; }
      .markdown-content li { position: relative; padding-left: 2rem; margin-bottom: 0.75rem; color: #4b5563; }
      .markdown-content li:before { content: "✦"; position: absolute; left: 0; color: #ec4899; font-size: 1.25rem; }
      .markdown-content strong { color: #7c3aed; font-weight: 800; }
      .markdown-content blockquote { border-left: 4px solid #8b5cf6; background: #faf5ff; padding: 1rem 1.5rem; color: #6b21a8; font-style: italic; border-radius: 0 0.5rem 0.5rem 0; }
      .markdown-content table { width: 100%; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin: 2rem 0; }
      .markdown-content th { background: #7c3aed; color: white; padding: 1rem; text-align: left; font-weight: 700; }
      .markdown-content td { background: white; padding: 1rem; border-bottom: 1px solid #f3f4f6; color: #1f2937; }
      .markdown-content code { background: #faf5ff; color: #7c3aed; padding: 0.25rem 0.5rem; border-radius: 0.375rem; font-weight: 600; }
      .markdown-content pre { background: #1f2937; color: #10b981; padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
    `
  },
  newsletter: {
    name: 'Newsletter',
    description: 'Modern and engaging',
    previewGradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    styles: `
      .markdown-content h1 { font-size: 3rem; font-weight: 900; color: #0f172a; margin-bottom: 1rem; letter-spacing: -0.025em; }
      .markdown-content h2 { font-size: 2rem; font-weight: 800; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem; border-left: 4px solid #3b82f6; padding-left: 1rem; }
      .markdown-content h3 { font-size: 1.5rem; font-weight: 700; color: #334155; margin-top: 1.5rem; margin-bottom: 0.75rem; }
      .markdown-content p { color: #475569; line-height: 1.75; margin-bottom: 1.25rem; font-size: 1.125rem; }
      .markdown-content ul { list-style: none; padding-left: 0; }
      .markdown-content li { padding-left: 1.75rem; margin-bottom: 0.75rem; color: #475569; position: relative; }
      .markdown-content li:before { content: "→"; position: absolute; left: 0; color: #3b82f6; font-weight: bold; }
      .markdown-content strong { color: #0f172a; font-weight: 800; background: #fef3c7; padding: 0 0.25rem; }
      .markdown-content blockquote { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 1.5rem; color: #1e40af; font-size: 1.25rem; margin: 2rem 0; }
      .markdown-content table { width: 100%; margin: 2rem 0; }
      .markdown-content th { background: #1e293b; color: white; padding: 1rem; text-align: left; font-weight: 700; }
      .markdown-content td { background: #f8fafc; padding: 1rem; border-bottom: 2px solid white; color: #0f172a; }
      .markdown-content code { background: #dbeafe; color: #1e40af; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-weight: 600; }
      .markdown-content pre { background: #0f172a; color: #38bdf8; padding: 1.5rem; border-radius: 0.5rem; }
    `
  }
}

// Font size adjustments
const fontSizeStyles = {
  small: `
    .markdown-content { font-size: 0.875rem; }
    .markdown-content h1 { font-size: 1.875rem; }
    .markdown-content h2 { font-size: 1.5rem; }
    .markdown-content h3 { font-size: 1.25rem; }
  `,
  medium: `
    .markdown-content { font-size: 1rem; }
  `,
  large: `
    .markdown-content { font-size: 1.125rem; }
    .markdown-content h1 { font-size: 3rem; }
    .markdown-content h2 { font-size: 2.25rem; }
    .markdown-content h3 { font-size: 1.875rem; }
  `
}

// Line spacing adjustments
const spacingStyles = {
  compact: `
    .markdown-content p { line-height: 1.5; margin-bottom: 0.75rem; }
    .markdown-content li { margin-bottom: 0.25rem; }
    .markdown-content h1, .markdown-content h2, .markdown-content h3 { margin-top: 1.5rem; margin-bottom: 0.5rem; }
  `,
  normal: ``,
  relaxed: `
    .markdown-content p { line-height: 2; margin-bottom: 1.5rem; }
    .markdown-content li { margin-bottom: 1rem; }
    .markdown-content h1, .markdown-content h2, .markdown-content h3 { margin-top: 3rem; margin-bottom: 1.5rem; }
  `
}

// Font family adjustments
const fontFamilyStyles = {
  'sans-serif': `.markdown-content { font-family: system-ui, -apple-system, sans-serif; }`,
  'serif': `.markdown-content { font-family: Georgia, Cambria, 'Times New Roman', serif; }`,
  'mono': `.markdown-content { font-family: 'Courier New', Consolas, monospace; }`,
}

// Light theme for CodeMirror
const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--bg-editor)',
    color: 'var(--text-primary)'
  },
  '.cm-content': {
    caretColor: 'var(--accent-primary)'
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--accent-primary)'
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(37, 99, 235, 0.15)'
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(0, 0, 0, 0.02)'
  },
  '.cm-gutters': {
    backgroundColor: 'var(--bg-tertiary)',
    borderRight: '1px solid var(--border-subtle)',
    color: 'var(--text-muted)'
  },
  '.cm-line': {
    paddingLeft: '1rem',
    paddingRight: '1rem'
  }
}, { dark: false })

function App() {
  // Theme state - Default to dark mode
  const [appTheme, setAppTheme] = useState<'glass' | 'sepia' | 'dark'>(() => {
    const saved = localStorage.getItem('enhancemd-app-theme')
    // Handle old 'eink' value
    if (saved === 'eink') {
      localStorage.setItem('enhancemd-app-theme', 'sepia')
      return 'sepia'
    }
    return (saved as 'glass' | 'sepia' | 'dark') || 'dark'
  })
  
  const [markdownContent, setMarkdownContent] = useState(defaultMarkdown)
  const [debouncedMarkdown, setDebouncedMarkdown] = useState(defaultMarkdown)
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>('modern')
  const [fontSize, setFontSize] = useState<keyof typeof fontSizeStyles>('medium')
  const [spacing, setSpacing] = useState<keyof typeof spacingStyles>('normal')
  const [fontFamily, setFontFamily] = useState<keyof typeof fontFamilyStyles>('sans-serif')
  const [showEditor, setShowEditor] = useState(true)
  const [imageMap, setImageMap] = useState<Map<string, string>>(new Map())
  const [processedMarkdown, setProcessedMarkdown] = useState(defaultMarkdown)
  const [imageStatus, setImageStatus] = useState({ matched: 0, unmatched: 0, total: 0 })
  const [isProcessingImages, setIsProcessingImages] = useState(false)
  const [enhancements, setEnhancements] = useState({
    coverPage: false,
    tableOfContents: false,
    pageNumbers: false,
    headerFooter: false
  })
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [showExportHistory, setShowExportHistory] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // AI Assistant state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [mobileView, setMobileView] = useState<'editor' | 'preview' | 'settings'>('preview')
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  
  // Apply app theme to document
  useEffect(() => {
    if (appTheme === 'glass') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', appTheme)
    }
    localStorage.setItem('enhancemd-app-theme', appTheme)
  }, [appTheme])

  // Command Palette
  const commandPalette = useCommandPalette()
  
  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      
      // Auto-hide editor on mobile
      if (width < 768) {
        setShowEditor(false)
      }
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])
  
  // Export History
  const { addExport } = useExportHistoryStore()
  
  // Auto-save functionality
  const { manualSave } = useAutoSave({
    content: markdownContent,
    title: markdownContent.match(/^#\s+(.+)$/m)?.[1],
    onRestore: (content, title) => {
      setMarkdownContent(content)
      updateRecentDocuments(title, content)
    }
  })
  
  // Keyboard shortcuts configuration
  const [customShortcuts, setCustomShortcuts] = useState<KeyboardShortcut[]>(() => {
    // Load saved shortcuts from localStorage or use defaults
    const saved = localStorage.getItem('enhancemd-keyboard-shortcuts')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return DEFAULT_SHORTCUTS
      }
    }
    return DEFAULT_SHORTCUTS
  })
  
  // Helper to insert text at cursor position in editor
  const insertTextAtCursor = (text: string) => {
    // This would need integration with CodeMirror's API
    // For now, just append to the document
    setMarkdownContent(prev => prev + '\n' + text)
  }
  
  // Save custom shortcuts to localStorage
  const updateShortcut = (index: number, shortcut: KeyboardShortcut) => {
    const updated = [...customShortcuts]
    updated[index] = shortcut
    setCustomShortcuts(updated)
    localStorage.setItem('enhancemd-keyboard-shortcuts', JSON.stringify(updated))
  }
  
  // Reset shortcuts to defaults
  const resetShortcuts = () => {
    setCustomShortcuts(DEFAULT_SHORTCUTS)
    localStorage.removeItem('enhancemd-keyboard-shortcuts')
  }
  
  // Focus Mode handlers
  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode)
  }
  
  const exitFocusMode = () => {
    setIsFocusMode(false)
  }
  
  // Focus Mode keyboard shortcuts
  useEffect(() => {
    const handleFocusModeShortcut = (e: KeyboardEvent) => {
      // Cmd+Shift+F or Ctrl+Shift+F to toggle focus mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        toggleFocusMode()
      }
    }
    
    document.addEventListener('keydown', handleFocusModeShortcut)
    return () => document.removeEventListener('keydown', handleFocusModeShortcut)
  }, [])
  
  // Recent documents (stored in localStorage)
  const [recentDocuments, setRecentDocuments] = useState<Array<{
    title: string
    savedAt: string
    content: string
  }>>(() => {
    try {
      const stored = localStorage.getItem('enhancemd-recent-documents')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const theme = themes[currentTheme]
  
  // Calculate word count and reading time for focus mode
  const focusModeStats = useMemo(() => {
    const plainText = markdownContent
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // Replace links with text
      .replace(/^#+\s+/gm, '') // Remove headers
      .replace(/^[-*]\s+/gm, '') // Remove list markers
      .replace(/^\|.*\|$/gm, '') // Remove table rows
      .replace(/^\s*[-:]+\s*$/gm, '') // Remove table separators
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/^>\s+/gm, '') // Remove blockquote markers
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()

    const words = plainText.split(/\s+/).filter(word => word.length > 0)
    const wordCount = words.length
    const readingTimeMinutes = Math.ceil(wordCount / 225)
    const readingTime = readingTimeMinutes === 1 ? '1 min' : `${readingTimeMinutes} mins`

    return { wordCount, readingTime }
  }, [markdownContent])
  
  // Debounce markdown updates
  const debouncedUpdateMarkdown = useMemo(
    () => debounce((value: string) => {
      setDebouncedMarkdown(value);
    }, 300),
    []
  );

  // Update debounced markdown when content changes
  useEffect(() => {
    debouncedUpdateMarkdown(markdownContent);
  }, [markdownContent, debouncedUpdateMarkdown]);

  // Update processed markdown when debounced content or images change
  useEffect(() => {
    const updateProcessedMarkdown = async () => {
      const processed = await processMarkdownImages(debouncedMarkdown, imageMap);
      setProcessedMarkdown(processed);
      
      // Update image match status
      const status = getImageMatchStatus(debouncedMarkdown, imageMap);
      setImageStatus({
        matched: status.matched.length,
        unmatched: status.unmatched.length,
        total: status.total
      });
    };
    updateProcessedMarkdown();
  }, [debouncedMarkdown, imageMap]);

  // Handle image file upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Limit number of files
    if (files.length > 20) {
      toast.error('Please select 20 or fewer images at a time');
      return;
    }

    setIsProcessingImages(true);
    const startTime = Date.now();

    const newImageMap = new Map(imageMap);
    const addedImages: string[] = [];
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        try {
          // Track original size
          totalOriginalSize += file.size;
          
          // Always compress images to reduce size
          let processedFile = file;
          // Compress if larger than 100KB (much more aggressive)
          if (file.size > 100 * 1024) {
            processedFile = await compressImage(file);
            console.log(`Compressed ${file.name} from ${(file.size / 1024).toFixed(0)}KB to ${(processedFile.size / 1024).toFixed(0)}KB`);
          }
          
          // Track compressed size
          totalCompressedSize += processedFile.size;
          
          const base64 = await convertImageToBase64(processedFile);
          
          // Generate all possible path variations
          const variations = generatePathVariations(file.name);
          
          // Add all variations to the map
          variations.forEach(path => {
            newImageMap.set(path, base64);
          });
          
          addedImages.push(file.name);
        } catch (error: any) {
          toast.error(error.message || `Failed to load: ${file.name}`);
        }
      }
    }
    
    setImageMap(newImageMap);
    
    // Check for auto-matches
    const requiredPaths = extractImagePaths(markdownContent);
    const matchedPaths: string[] = [];
    
    requiredPaths.forEach(path => {
      if (newImageMap.has(path)) {
        matchedPaths.push(path);
      }
    });
    
    // Ensure minimum display time of 1.5 seconds
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 1500 - elapsedTime);
    
    setTimeout(() => {
      setIsProcessingImages(false);
      
      if (addedImages.length > 0) {
        // Calculate compression savings
        const savedBytes = totalOriginalSize - totalCompressedSize;
        const savedPercent = totalOriginalSize > 0 ? Math.round((savedBytes / totalOriginalSize) * 100) : 0;
        
        let message = `Loaded ${addedImages.length} image${addedImages.length > 1 ? 's' : ''}`;
        
        if (savedBytes > 0) {
          const savedKB = (savedBytes / 1024).toFixed(0);
          message += ` (saved ${savedKB}KB, ${savedPercent}% reduction)`;
        }
        
        if (matchedPaths.length > 0) {
          toast.success(`Auto-matched ${matchedPaths.length} image${matchedPaths.length > 1 ? 's' : ''}! ${message}`, {
            duration: 4000
          });
        } else {
          toast.success(message, {
            duration: 3000
          });
        }
      }
    }, remainingTime);
  };

  // Memoize combined styles
  const getAllStyles = useMemo(() => {
    return `
      ${theme.styles}
      ${fontSizeStyles[fontSize]}
      ${spacingStyles[spacing]}
      ${fontFamilyStyles[fontFamily]}
    `
  }, [theme.styles, fontSize, spacing, fontFamily]);

  // Helper function to create export history entry
  const createExportHistoryEntry = (format: 'html' | 'pdf' | 'markdown' | 'react', fileName: string, fileSize?: number) => {
    const title = processedMarkdown.match(/^#\s+(.+)$/m)?.[1] || 'Untitled Document'
    const contentHash = generateContentHash(processedMarkdown, {
      theme: currentTheme,
      fontSize,
      spacing,
      fontFamily,
      enhancements
    })
    
    return {
      title,
      format,
      fileName,
      fileSize,
      theme: themes[currentTheme].name,
      settings: {
        theme: currentTheme,
        fontSize,
        spacing,
        fontFamily,
        enhancements: { ...enhancements }
      },
      contentHash
    }
  }

  // Export functions
  const exportAsHTML = () => {
    console.log('Export HTML function called');
    try {
      let enhancedMarkdown = processedMarkdown;
      
      // Apply enhancements if selected
      if (enhancements.coverPage) {
        const title = enhancedMarkdown.match(/^#\s+(.+)$/m)?.[1] || 'Document';
        const coverPage = `# ${title}

<div style="text-align: center; margin-top: 50vh; transform: translateY(-50%);">

## ${title}

${new Date().toLocaleDateString()}

</div>

---

`;
        enhancedMarkdown = coverPage + enhancedMarkdown;
      }
      
      if (enhancements.tableOfContents) {
        const headings = enhancedMarkdown.match(/^#{1,3}\s+.+$/gm) || [];
        let toc = '\n\n## Table of Contents\n\n';
        headings.forEach((heading) => {
          const level = heading.match(/^#+/)?.[0].length || 1;
          const text = heading.replace(/^#+\s+/, '');
          const indent = '  '.repeat(level - 1);
          toc += `${indent}- ${text}\n`;
        });
        enhancedMarkdown = enhancedMarkdown.replace(/^#\s+.+$/m, '$&' + toc);
      }
      
      // Simple approach - use the already processed markdown with embedded images
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enhanced Document</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      ${enhancements.pageNumbers ? 'counter-reset: page;' : ''}
    }
    ${enhancements.pageNumbers ? `
    @media print {
      @page {
        margin: 2cm;
      }
      body::after {
        content: counter(page);
        position: fixed;
        bottom: 1cm;
        right: 1cm;
        counter-increment: page;
      }
    }` : ''}
    ${enhancements.headerFooter ? `
    @media print {
      @page {
        @top-center {
          content: "Enhanced Document";
          font-size: 12px;
          color: #666;
        }
        @bottom-center {
          content: "Page " counter(page);
          font-size: 12px;
          color: #666;
        }
      }
    }` : ''}
    img {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      margin: 1rem auto;
      display: block;
    }
    pre {
      background: #f4f4f4;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
    }
    code {
      background: #f4f4f4;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.9em;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 1rem;
      margin-left: 0;
      color: #666;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1rem 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 0.5rem;
      text-align: left;
    }
    th {
      background: #f4f4f4;
    }
    h1 { font-size: 2em; margin: 0.67em 0; font-weight: bold; }
    h2 { font-size: 1.5em; margin: 0.83em 0; font-weight: bold; }
    h3 { font-size: 1.17em; margin: 1em 0; font-weight: bold; }
    p { margin: 1em 0; }
    center { text-align: center; }
    small { font-size: 0.8em; }
    strong { font-weight: bold; }
    em { font-style: italic; }
    ${getAllStyles}
  </style>
</head>
<body>
  <div class="markdown-content">
    ${convertMarkdownToHTMLWithImages(enhancedMarkdown)}
  </div>
</body>
</html>`
      
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'enhanced-document.html'
      a.click()
      URL.revokeObjectURL(url)
      
      // Add to export history
      addExport(createExportHistoryEntry('html', 'enhanced-document.html', blob.size))
      
      toast.success('HTML exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error(`Failed to export HTML: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const exportAsPrintPDF = () => {
    console.log('Print PDF export started');
    
    try {
      // Apply enhancements
      let enhancedMarkdown = processedMarkdown;
      
      if (enhancements.coverPage) {
        const title = enhancedMarkdown.match(/^#\s+(.+)$/m)?.[1] || 'Document';
        const coverPage = `# ${title}\n\n<div style="page-break-after: always; text-align: center; margin-top: 40vh;">\n\n## ${title}\n\n${new Date().toLocaleDateString()}\n\n</div>\n\n---\n\n`;
        enhancedMarkdown = coverPage + enhancedMarkdown;
      }
      
      if (enhancements.tableOfContents) {
        const headings = enhancedMarkdown.match(/^#{1,3}\s+.+$/gm) || [];
        let toc = '\n\n## Table of Contents\n\n';
        headings.forEach((heading) => {
          const level = heading.match(/^#+/)?.[0].length || 1;
          const text = heading.replace(/^#+\s+/, '');
          const indent = '  '.repeat(level - 1);
          toc += `${indent}- ${text}\n`;
        });
        enhancedMarkdown = enhancedMarkdown.replace(/^#\s+.+$/m, '$&' + toc);
      }
      
      // Create print-optimized HTML
      const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${enhancedMarkdown.match(/^#\s+(.+)$/m)?.[1] || 'Document'}</title>
  <style>
    @media print {
      @page {
        margin: 1in;
        size: letter;
      }
      body {
        margin: 0;
      }
      .no-print {
        display: none !important;
      }
      h1, h2, h3 {
        page-break-after: avoid;
      }
      img {
        page-break-inside: avoid;
        max-width: 100% !important;
        height: auto !important;
      }
      pre {
        page-break-inside: avoid;
      }
      p {
        orphans: 3;
        widows: 3;
      }
    }
    
    body {
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.6;
      color: #000;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: white;
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.2;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    
    h1 { font-size: 2.5rem; color: #111; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    h2 { font-size: 2rem; color: #374151; }
    h3 { font-size: 1.5rem; color: #4b5563; }
    
    p { margin: 1rem 0; text-align: justify; }
    
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 2rem auto;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    blockquote {
      border-left: 4px solid #e5e7eb;
      padding-left: 1rem;
      margin: 1rem 0;
      color: #6b7280;
      font-style: italic;
    }
    
    pre {
      background: #f3f4f6;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
    }
    
    code {
      background: #f3f4f6;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
      font-size: 0.875em;
    }
    
    ul, ol {
      margin: 1rem 0;
      padding-left: 2rem;
    }
    
    li {
      margin: 0.5rem 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }
    
    th, td {
      border: 1px solid #e5e7eb;
      padding: 0.75rem;
      text-align: left;
    }
    
    th {
      background: #f9fafb;
      font-weight: 600;
    }
    
    .cover-page {
      page-break-after: always;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    
    .print-notice {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }
    
    .print-button {
      background: white;
      color: #3b82f6;
      border: none;
      padding: 0.5rem 1rem;
      margin-left: 1rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-weight: 600;
    }
    
    .print-button:hover {
      background: #f3f4f6;
    }
    
    ${getAllStyles}
  </style>
</head>
<body>
  <div class="print-notice no-print">
    Ready to print!
    <button class="print-button" onclick="window.print()">Print to PDF</button>
    <button class="print-button" onclick="window.close()">Close</button>
  </div>
  
  <div class="markdown-content">
    ${convertMarkdownToHTMLWithImages(enhancedMarkdown)}
  </div>
  
  <script>
    // Auto-focus for immediate printing
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>`;
      
      // Open in new window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printHtml);
        printWindow.document.close();
        
        // Add to export history
        const title = enhancedMarkdown.match(/^#\s+(.+)$/m)?.[1] || 'Document'
        addExport(createExportHistoryEntry('pdf', `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`))
        
      } else {
        toast.error('Please allow pop-ups to print the document');
      }
      
    } catch (error) {
      console.error('Print PDF error:', error);
      toast.error('Failed to create print preview');
    }
  }

  const exportAsMarkdown = () => {
    console.log('Markdown export started');
    
    try {
      // Apply enhancements
      let enhancedMarkdown = processedMarkdown;
      
      if (enhancements.coverPage) {
        const title = enhancedMarkdown.match(/^#\s+(.+)$/m)?.[1] || 'Document';
        const coverPage = `# ${title}\n\n---\n\n**Date:** ${new Date().toLocaleDateString()}\n\n---\n\n`;
        enhancedMarkdown = coverPage + enhancedMarkdown;
      }
      
      if (enhancements.tableOfContents) {
        const headings = enhancedMarkdown.match(/^#{1,3}\s+.+$/gm) || [];
        let toc = '\n\n## Table of Contents\n\n';
        headings.forEach((heading) => {
          const level = heading.match(/^#+/)?.[0].length || 1;
          const text = heading.replace(/^#+\s+/, '');
          const indent = '  '.repeat(level - 1);
          toc += `${indent}- ${text}\n`;
        });
        enhancedMarkdown = enhancedMarkdown.replace(/^#\s+.+$/m, '$&' + toc);
      }
      
      // Get title for the file
      const title = enhancedMarkdown.match(/^#\s+(.+)$/m)?.[1] || 'document';
      
      // Create download
      const blob = new Blob([enhancedMarkdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      
      // Add to export history
      addExport(createExportHistoryEntry('markdown', fileName, blob.size));
      
      toast.success('Markdown exported successfully!');
    } catch (error) {
      console.error('Markdown export error:', error);
      toast.error('Failed to export Markdown');
    }
  }
  
  const exportAsReact = () => {
    // Add placeholder entry to history for coming soon feature
    const title = processedMarkdown.match(/^#\s+(.+)$/m)?.[1] || 'Untitled Document'
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jsx`
    addExport(createExportHistoryEntry('react', fileName))
    toast.error('React component export coming soon!')
  }
  
  // Quick re-export function
  const handleQuickReExport = (exportId: string) => {
    const { exports } = useExportHistoryStore.getState()
    const exportItem = exports.find(exp => exp.id === exportId)
    
    if (!exportItem) {
      toast.error('Export not found')
      return
    }
    
    // Check if content has changed
    const currentHash = generateContentHash(processedMarkdown, {
      theme: currentTheme,
      fontSize,
      spacing,
      fontFamily,
      enhancements
    })
    
    if (currentHash !== exportItem.contentHash) {
      toast.error('Document has changed. Settings will be restored for re-export.')
    }
    
    // Restore settings from export history
    const settings = exportItem.settings
    setCurrentTheme(settings.theme as keyof typeof themes)
    setFontSize(settings.fontSize as keyof typeof fontSizeStyles)
    setSpacing(settings.spacing as keyof typeof spacingStyles)
    setFontFamily(settings.fontFamily as keyof typeof fontFamilyStyles)
    setEnhancements(settings.enhancements)
    
    // Trigger the appropriate export function after a short delay to allow state updates
    setTimeout(() => {
      switch (exportItem.format) {
        case 'html':
          exportAsHTML()
          break
        case 'pdf':
          exportAsPrintPDF()
          break
        case 'markdown':
          exportAsMarkdown()
          break
        case 'react':
          exportAsReact()
          break
        default:
          toast.error('Unknown export format')
      }
    }, 100)
    
    toast.success(`Re-exporting ${exportItem.format.toUpperCase()} with original settings...`)
  }

  // Save document to JSON file
  const saveDocument = () => {
    try {
      const documentData = {
        version: '1.0',
        title: markdownContent.match(/^#\s+(.+)$/m)?.[1] || 'Untitled',
        content: markdownContent,
        theme: themes[currentTheme].name,
        fontSize: fontSize,
        lineSpacing: spacing,
        fontFamily: fontFamily,
        enhancements: enhancements,
        imageMap: Array.from(imageMap.entries()),
        savedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(documentData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.enhancemd`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Document saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save document');
    }
  }
  
  // Update recent documents
  const updateRecentDocuments = (title: string, content: string) => {
    const newDocument = {
      title,
      savedAt: new Date().toISOString(),
      content: content.substring(0, 200) + (content.length > 200 ? '...' : '') // Store preview
    }
    
    const updatedRecents = [
      newDocument,
      ...recentDocuments.filter(doc => doc.title !== title)
    ].slice(0, 10) // Keep only 10 most recent
    
    setRecentDocuments(updatedRecents)
    localStorage.setItem('enhancemd-recent-documents', JSON.stringify(updatedRecents))
  }
  
  // Setup keyboard shortcuts with actions
  const shortcuts = useMemo<KeyboardShortcut[]>(() => 
    customShortcuts.map(shortcut => ({
      ...shortcut,
      action: () => {
        switch (shortcut.description) {
          case 'Save document':
            saveDocument()
            break
          case 'Open document':
            document.querySelector<HTMLInputElement>('input[type="file"][accept=".enhancemd"]')?.click()
            break
          case 'New document':
            if (confirm('Create new document? Unsaved changes will be lost.')) {
              setMarkdownContent(defaultMarkdown)
              toast.success('New document created')
            }
            break
          case 'Export as HTML':
            exportAsHTML()
            break
          case 'Export as PDF':
            exportAsPrintPDF()
            break
          case 'Export as Markdown':
            exportAsMarkdown()
            break
          case 'Bold text':
            // Insert bold markdown at cursor
            insertTextAtCursor('**bold**')
            break
          case 'Italic text':
            // Insert italic markdown at cursor
            insertTextAtCursor('*italic*')
            break
          case 'Insert link':
            // Insert link markdown at cursor
            insertTextAtCursor('[link text](url)')
            break
          case 'Show editor only':
            setShowEditor(true)
            setMobileView('editor')
            break
          case 'Show preview only':
            setShowEditor(false)
            setMobileView('preview')
            break
          case 'Show split view':
            setShowEditor(true)
            setMobileView('preview')
            break
          case 'Toggle editor':
            setShowEditor(!showEditor)
            break
          case 'Next theme':
            const themeKeys = Object.keys(themes) as (keyof typeof themes)[]
            const currentIndex = themeKeys.indexOf(currentTheme)
            const nextIndex = (currentIndex + 1) % themeKeys.length
            setCurrentTheme(themeKeys[nextIndex])
            toast.success(`Theme: ${themes[themeKeys[nextIndex]].name}`)
            break
          case 'Previous theme':
            const themeKeysRev = Object.keys(themes) as (keyof typeof themes)[]
            const currentIndexRev = themeKeysRev.indexOf(currentTheme)
            const prevIndex = currentIndexRev === 0 ? themeKeysRev.length - 1 : currentIndexRev - 1
            setCurrentTheme(themeKeysRev[prevIndex])
            toast.success(`Theme: ${themes[themeKeysRev[prevIndex]].name}`)
            break
          case 'Open settings':
            setShowKeyboardShortcuts(true)
            break
          case 'Export history':
            setShowExportHistory(true)
            break
        }
      }
    })),
    [customShortcuts, currentTheme, showEditor, saveDocument, exportAsHTML, exportAsPrintPDF, exportAsMarkdown, insertTextAtCursor]
  )
  
  // Use keyboard shortcuts
  useKeyboardShortcuts({ shortcuts, enabled: !isFocusMode && !commandPalette.isOpen })
  
  // Use smart components
  const { enhancedMarkdown: smartEnhancedMarkdown, componentMap, hasSmartComponents } = useSmartComponents(processedMarkdown)

  // Load document from JSON file
  const loadDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const documentData = JSON.parse(content);
        
        // Validate document format
        if (!documentData.version || !documentData.content) {
          throw new Error('Invalid document format');
        }
        
        // Restore document state
        setMarkdownContent(documentData.content);
        
        // Restore theme if it exists
        if (documentData.theme) {
          const foundThemeKey = Object.entries(themes).find(([_, t]) => t.name === documentData.theme)?.[0] as keyof typeof themes;
          if (foundThemeKey) setCurrentTheme(foundThemeKey);
        }
        
        // Restore typography settings
        if (documentData.fontSize) setFontSize(documentData.fontSize);
        if (documentData.lineSpacing) setSpacing(documentData.lineSpacing);
        if (documentData.fontFamily) setFontFamily(documentData.fontFamily);
        
        // Restore enhancements
        if (documentData.enhancements) {
          setEnhancements(documentData.enhancements);
        }
        
        // Restore images
        if (documentData.imageMap && Array.isArray(documentData.imageMap)) {
          const newImageMap = new Map<string, string>(documentData.imageMap);
          setImageMap(newImageMap);
        }
        
        // Add to recent documents
        updateRecentDocuments(documentData.title || 'Untitled', documentData.content)
        
        toast.success(`Loaded "${documentData.title}"`);
      } catch (error) {
        console.error('Load error:', error);
        toast.error('Failed to load document. Make sure it\'s a valid EnhanceMD file.');
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  }

  // Define all available commands for the command palette
  const commands: Command[] = useMemo(() => [
    // Theme Commands
    ...Object.entries(themes).map(([key, theme]) => ({
      id: `theme-${key}`,
      title: `Change to ${theme.name} Theme`,
      description: theme.description,
      icon: <PaintBrushIcon className="w-4 h-4" />,
      category: 'Themes',
      action: () => setCurrentTheme(key as keyof typeof themes)
    })),

    // Export Commands
    {
      id: 'export-html',
      title: 'Export as HTML',
      description: 'Download as standalone HTML file',
      icon: <DocumentIcon className="w-4 h-4" />,
      category: 'Export',
      shortcut: ['Ctrl', 'E', 'H'],
      action: exportAsHTML
    },
    {
      id: 'export-pdf',
      title: 'Export as PDF',
      description: 'Print-ready document with styles',
      icon: <PrinterIcon className="w-4 h-4" />,
      category: 'Export',
      shortcut: ['Ctrl', 'E', 'P'],
      action: exportAsPrintPDF
    },
    {
      id: 'export-markdown',
      title: 'Export as Markdown',
      description: 'Download enhanced markdown file',
      icon: <DocumentArrowDownIcon className="w-4 h-4" />,
      category: 'Export',
      shortcut: ['Ctrl', 'E', 'M'],
      action: exportAsMarkdown
    },
    {
      id: 'export-react',
      title: 'Export as React Component',
      description: 'Generate JSX component (coming soon)',
      icon: <CodeBracketSquareIcon className="w-4 h-4" />,
      category: 'Export',
      action: exportAsReact
    },

    // Typography Commands
    {
      id: 'font-small',
      title: 'Small Font Size',
      description: 'Set font size to small',
      icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
      category: 'Typography',
      action: () => setFontSize('small')
    },
    {
      id: 'font-medium',
      title: 'Medium Font Size',
      description: 'Set font size to medium',
      icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
      category: 'Typography',
      action: () => setFontSize('medium')
    },
    {
      id: 'font-large',
      title: 'Large Font Size',
      description: 'Set font size to large',
      icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
      category: 'Typography',
      action: () => setFontSize('large')
    },
    {
      id: 'spacing-compact',
      title: 'Compact Line Spacing',
      description: 'Reduce line height for dense text',
      icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
      category: 'Typography',
      action: () => setSpacing('compact')
    },
    {
      id: 'spacing-normal',
      title: 'Normal Line Spacing',
      description: 'Standard line height',
      icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
      category: 'Typography',
      action: () => setSpacing('normal')
    },
    {
      id: 'spacing-relaxed',
      title: 'Relaxed Line Spacing',
      description: 'Increase line height for readability',
      icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
      category: 'Typography',
      action: () => setSpacing('relaxed')
    },
    {
      id: 'font-sans',
      title: 'Sans Serif Font',
      description: 'Modern, clean typeface',
      icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
      category: 'Typography',
      action: () => setFontFamily('sans-serif')
    },
    {
      id: 'font-serif',
      title: 'Serif Font',
      description: 'Traditional, formal typeface',
      icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
      category: 'Typography',
      action: () => setFontFamily('serif')
    },
    {
      id: 'font-mono',
      title: 'Monospace Font',
      description: 'Fixed-width, code-like typeface',
      icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
      category: 'Typography',
      action: () => setFontFamily('mono')
    },

    // View Commands
    {
      id: 'toggle-editor',
      title: showEditor ? 'Hide Editor' : 'Show Editor',
      description: showEditor ? 'Hide the markdown editor panel' : 'Show the markdown editor panel',
      icon: showEditor ? <ChevronLeftIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />,
      category: 'View',
      shortcut: ['Ctrl', 'E'],
      action: () => setShowEditor(!showEditor)
    },
    {
      id: 'toggle-focus-mode',
      title: isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode',
      description: isFocusMode ? 'Exit distraction-free writing mode' : 'Enter distraction-free writing mode',
      icon: <EyeIcon className="w-4 h-4" />,
      category: 'View',
      shortcut: ['Cmd', 'Shift', 'F'],
      action: toggleFocusMode
    },
    {
      id: 'open-ai-assistant',
      title: 'Open AI Assistant',
      description: 'Get help with writing, editing, and suggestions',
      icon: <SparklesIcon className="w-4 h-4" />,
      category: 'View',
      shortcut: ['Cmd', 'Shift', 'A'],
      action: () => setIsAIAssistantOpen(true)
    },

    // Enhancement Commands
    {
      id: 'toggle-cover-page',
      title: enhancements.coverPage ? 'Remove Cover Page' : 'Add Cover Page',
      description: enhancements.coverPage ? 'Remove cover page from document' : 'Add cover page to document',
      icon: <SparklesIcon className="w-4 h-4" />,
      category: 'Enhancements',
      action: () => setEnhancements({...enhancements, coverPage: !enhancements.coverPage})
    },
    {
      id: 'toggle-toc',
      title: enhancements.tableOfContents ? 'Remove Table of Contents' : 'Add Table of Contents',
      description: enhancements.tableOfContents ? 'Remove table of contents' : 'Add table of contents',
      icon: <SparklesIcon className="w-4 h-4" />,
      category: 'Enhancements',
      action: () => setEnhancements({...enhancements, tableOfContents: !enhancements.tableOfContents})
    },
    {
      id: 'toggle-page-numbers',
      title: enhancements.pageNumbers ? 'Remove Page Numbers' : 'Add Page Numbers',
      description: enhancements.pageNumbers ? 'Remove page numbers' : 'Add page numbers for print',
      icon: <SparklesIcon className="w-4 h-4" />,
      category: 'Enhancements',
      action: () => setEnhancements({...enhancements, pageNumbers: !enhancements.pageNumbers})
    },
    {
      id: 'toggle-header-footer',
      title: enhancements.headerFooter ? 'Remove Header & Footer' : 'Add Header & Footer',
      description: enhancements.headerFooter ? 'Remove header and footer' : 'Add header and footer for print',
      icon: <SparklesIcon className="w-4 h-4" />,
      category: 'Enhancements',
      action: () => setEnhancements({...enhancements, headerFooter: !enhancements.headerFooter})
    },
    
    // Export History
    {
      id: 'export-history',
      title: 'View Export History',
      description: 'See all your previous exports and re-download files',
      icon: <ClockIcon className="w-4 h-4" />,
      category: 'Export',
      shortcut: ['Ctrl', 'H'],
      action: () => setShowExportHistory(true)
    },
    
    // Keyboard Shortcuts
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'View and customize keyboard shortcuts',
      icon: <CommandLineIcon className="w-4 h-4" />,
      category: 'Settings',
      shortcut: ['Ctrl', ','],
      action: () => setShowKeyboardShortcuts(true)
    },

    // Recent Documents
    ...recentDocuments.map((doc, index) => ({
      id: `recent-${index}`,
      title: `Open "${doc.title}"`,
      description: `Saved ${new Date(doc.savedAt).toLocaleDateString()} - ${doc.content}`,
      icon: <DocumentIcon className="w-4 h-4" />,
      category: 'Recent Documents',
      action: () => {
        // For now, just show a message since we don't have the full document data
        toast.success(`Recent document: ${doc.title}`)
      }
    })),

    // Document Commands
    {
      id: 'save-document',
      title: 'Save Document',
      description: 'Save document with all settings',
      icon: <FolderArrowDownIcon className="w-4 h-4" />,
      category: 'Document',
      shortcut: ['Ctrl', 'S'],
      action: saveDocument
    },
    {
      id: 'manual-save-draft',
      title: 'Save Draft Now',
      description: 'Manually save current content as draft',
      icon: <CloudArrowUpIcon className="w-4 h-4" />,
      category: 'Document',
      shortcut: ['Ctrl', 'Shift', 'S'],
      action: manualSave
    },
    {
      id: 'load-document',
      title: 'Load Document',
      description: 'Load saved document file',
      icon: <FolderOpenIcon className="w-4 h-4" />,
      category: 'Document',
      shortcut: ['Ctrl', 'O'],
      action: () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.enhancemd'
        input.onchange = (e) => loadDocument(e as any)
        input.click()
      }
    },
    {
      id: 'add-images',
      title: 'Add Images',
      description: 'Upload and embed images in document',
      icon: <CloudArrowUpIcon className="w-4 h-4" />,
      category: 'Document',
      shortcut: ['Ctrl', 'I'],
      action: () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = true
        input.accept = 'image/*'
        input.onchange = (e) => handleImageUpload(e as any)
        input.click()
      }
    }
  ], [currentTheme, showEditor, enhancements, fontSize, spacing, fontFamily, recentDocuments, isFocusMode, manualSave])

  // Convert markdown to HTML with proper image handling
  const convertMarkdownToHTMLWithImages = (md: string) => {
    let html = md;
    
    // Debug: log the input
    console.log('Input markdown:', md);
    
    // Process tables first - before any other replacements
    // Look for table pattern with more flexible matching
    const tablePattern = /^\|.*\|.*$/gm;
    const tableMatches = html.match(tablePattern);
    console.log('Table pattern matches:', tableMatches);
    
    // Find complete tables
    html = html.replace(/((?:^\|.*\|.*$\n?)+)/gm, (fullTable) => {
      console.log('Processing table block:', fullTable);
      const lines = fullTable.trim().split('\n');
      
      if (lines.length < 3) return fullTable; // Not a valid table
      
      // Check if second line is separator
      if (!lines[1].includes('---')) return fullTable;
      
      // Parse the table
      const headerLine = lines[0];
      const bodyLines = lines.slice(2);
      
      // Parse header cells
      const headerCells = headerLine.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
      
      // Build table HTML
      let tableHtml = '<table class="markdown-table">\n<thead>\n<tr>\n';
      headerCells.forEach(cell => {
        tableHtml += `<th>${cell}</th>\n`;
      });
      tableHtml += '</tr>\n</thead>\n<tbody>\n';
      
      // Parse body rows
      bodyLines.forEach(line => {
        if (line.trim()) {
          const cells = line.split('|')
            .map(cell => cell.trim())
            .filter(cell => cell.length > 0);
          
          if (cells.length > 0) {
            tableHtml += '<tr>\n';
            cells.forEach(cell => {
              tableHtml += `<td>${cell}</td>\n`;
            });
            tableHtml += '</tr>\n';
          }
        }
      });
      
      tableHtml += '</tbody>\n</table>';
      console.log('Generated table HTML:', tableHtml);
      return tableHtml;
    });
    
    // Process code blocks before other inline elements
    html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
      return `<pre><code>${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    });
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; display: block; margin: 1rem auto;" />');
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/^\- (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    
    // Blockquotes
    html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');
    
    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr />');
    
    // Bold and italic (do these after block elements)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Inline code (after bold/italic to avoid conflicts)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Paragraphs (do this last)
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br />');
    
    // Handle HTML tags from markdown
    html = html.replace(/<center>/g, '<div style="text-align: center;">');
    html = html.replace(/<\/center>/g, '</div>');
    html = html.replace(/<small>/g, '<span style="font-size: 0.8em;">');
    html = html.replace(/<\/small>/g, '</span>');
    
    // Wrap in paragraph tags if needed
    if (!html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }
    
    return html;
  }

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)'
        }
      }} />
      
      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
        commands={commands}
      />
      
      {/* AI Assistant */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onInsert={(text) => {
          // Insert text at current cursor position or replace selection
          if (selectedText) {
            setMarkdownContent(markdownContent.replace(selectedText, text))
          } else {
            setMarkdownContent(markdownContent + '\n\n' + text)
          }
        }}
        selectedText={selectedText}
        currentContent={markdownContent}
      />

      {/* Inject styles */}
      <style>{getAllStyles}</style>
      
      {/* Header */}
      <header className="relative z-40 bg-secondary border-b border-subtle">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg btn-ghost"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
            
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center space-x-4 lg:space-x-6">
              <h1 className="text-xl sm:text-2xl font-bold">
                <span className="accent-primary">EnhanceMD</span>
              </h1>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-4">
                <button
                  onClick={() => setShowEditor(!showEditor)}
                  className="group flex items-center gap-2 px-3 py-1.5 text-sm text-secondary hover:text-primary transition-colors"
                >
                  {showEditor ? (
                    <>
                      <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                      Hide Editor
                    </>
                  ) : (
                    <>
                      <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      Show Editor
                    </>
                  )}
                </button>
                
                <button
                  onClick={toggleFocusMode}
                  className="group flex items-center gap-2 px-3 py-1.5 text-sm text-secondary hover:text-primary transition-colors"
                  title="Focus Mode (⌘⇧F)"
                >
                  <EyeIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Focus
                </button>
                
                {/* Auto-save Indicator */}
                <AutoSaveIndicator />
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4 relative z-50">
              {/* Theme Switcher - More prominent */}
              <div className="flex items-center gap-2 p-1.5 bg-tertiary rounded-lg border border-default">
                <button
                  onClick={() => setAppTheme('glass')}
                  className={`px-3 py-1.5 rounded flex items-center gap-2 transition-all ${
                    appTheme === 'glass' 
                      ? 'bg-secondary text-primary shadow-soft border border-default' 
                      : 'text-secondary hover:text-primary hover:bg-secondary/50'
                  }`}
                  title="Light Mode"
                >
                  <ComputerDesktopIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Light</span>
                </button>
                <button
                  onClick={() => setAppTheme('sepia')}
                  className={`px-3 py-1.5 rounded flex items-center gap-2 transition-all ${
                    appTheme === 'sepia' 
                      ? 'bg-secondary text-primary shadow-soft border border-default' 
                      : 'text-secondary hover:text-primary hover:bg-secondary/50'
                  }`}
                  title="Sepia Mode"
                >
                  <SunIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Sepia</span>
                </button>
                <button
                  onClick={() => setAppTheme('dark')}
                  className={`px-3 py-1.5 rounded flex items-center gap-2 transition-all ${
                    appTheme === 'dark' 
                      ? 'bg-secondary text-primary shadow-soft border border-default' 
                      : 'text-secondary hover:text-primary hover:bg-secondary/50'
                  }`}
                  title="Dark Mode"
                >
                  <MoonIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Dark</span>
                </button>
              </div>
              
              {/* Command Palette Button */}
              <button
                onClick={commandPalette.open}
                className="group flex items-center gap-2 px-3 py-1.5 text-sm btn-secondary rounded-lg transition-all"
                title="Open Command Palette (⌘K or ⌘P)"
              >
                <MagnifyingGlassIcon className="w-4 h-4 accent-primary" />
                <span className="text-secondary group-hover:text-primary">Search</span>
                <div className="flex items-center gap-0.5 text-xs text-muted">
                  <kbd className="px-1.5 py-0.5 rounded bg-tertiary border border-default">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-tertiary border border-default">K</kbd>
                </div>
              </button>
              
              {/* AI Assistant Button */}
              <button
                onClick={() => setIsAIAssistantOpen(true)}
                className="group flex items-center gap-2 px-3 py-1.5 text-sm btn-primary rounded-lg transition-all"
                title="AI Assistant (⌘ Shift A)"
              >
                <SparklesIcon className="w-4 h-4" />
                <span className="font-medium">AI Assistant</span>
              </button>
              
              {/* Save/Load Document */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  icon={<FolderArrowDownIcon className="w-4 h-4" />}
                  iconPosition="left"
                  onClick={saveDocument}
                  className="text-xs"
                >
                  Save
                </Button>
                <label>
                  <input
                    type="file"
                    accept=".enhancemd"
                    onChange={loadDocument}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    icon={<FolderOpenIcon className="w-4 h-4" />}
                    iconPosition="left"
                    onClick={(e) => {
                      e.preventDefault();
                      const input = (e.currentTarget as HTMLButtonElement).parentElement?.querySelector('input[type="file"]');
                      if (input instanceof HTMLInputElement) {
                        input.click();
                      }
                    }}
                    className="text-xs"
                  >
                    Load
                  </Button>
                </label>
              </div>
              
              {/* Export Options */}
              <div className="relative group">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-secondary text-primary text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-subtle">
                  Download your document
                </div>
                <div className="flex items-center gap-1 bg-tertiary border-2 border-default rounded-lg px-3 py-1.5 shadow-lg">
                  <span className="text-sm text-primary font-bold flex items-center gap-1.5">
                    <ArrowDownTrayIcon className="w-5 h-5 accent-primary" />
                    Export
                  </span>
                  <div className="w-px h-5 bg-border-color mx-2" />
                  <Button
                    variant="ghost"
                    icon={<DocumentIcon className="w-4 h-4" />}
                    iconPosition="left"
                    onClick={() => exportAsHTML()}
                    className="text-xs hover:bg-tertiary"
                  >
                    HTML
                  </Button>
                  <Button
                    variant="ghost"
                    icon={<PrinterIcon className="w-4 h-4" />}
                    iconPosition="left"
                    onClick={() => exportAsPrintPDF()}
                    className="text-xs hover:bg-tertiary"
                  >
                    Print PDF
                  </Button>
                  <Button
                    variant="ghost"
                    icon={<DocumentArrowDownIcon className="w-4 h-4" />}
                    iconPosition="left"
                    onClick={() => exportAsMarkdown()}
                    className="text-xs hover:bg-tertiary"
                  >
                    Markdown
                  </Button>
                  <Button
                    variant="ghost"
                    icon={<CodeBracketSquareIcon className="w-4 h-4" />}
                    iconPosition="left"
                    onClick={() => exportAsReact()}
                    className="text-xs hover:bg-gray-700/50 opacity-50"
                    disabled
                  >
                    React
                  </Button>
                </div>
              </div>
              
              {/* Add Images */}
              <label className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  icon={<CloudArrowUpIcon className={`w-4 h-4 ${isProcessingImages ? 'animate-bounce' : ''}`} />}
                  iconPosition="left"
                  disabled={isProcessingImages}
                  onClick={(e) => {
                    e.preventDefault();
                    const input = (e.currentTarget as HTMLButtonElement).parentElement?.querySelector('input[type="file"]');
                    if (input instanceof HTMLInputElement) {
                      input.click();
                    }
                  }}
                  className={isProcessingImages ? 'opacity-50 cursor-wait' : ''}
                >
                  {isProcessingImages ? 'Processing...' : 'Add Images'}
                </Button>
              </label>
              {imageStatus.total > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-400">{imageStatus.matched} matched</span>
                  {imageStatus.unmatched > 0 && (
                    <span className="text-orange-400">{imageStatus.unmatched} missing</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center space-x-2">
              {/* Mobile Export Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg glass-effect hover:border-white/20 transition-all"
              >
                <ArrowDownTrayIcon className="w-5 h-5 text-blue-400" />
              </button>
              
              {/* Mobile Search Button */}
              <button
                onClick={commandPalette.open}
                className="p-2 rounded-lg glass-effect hover:border-white/20 transition-all"
              >
                <MagnifyingGlassIcon className="w-5 h-5 text-purple-400" />
              </button>
              
              {/* Mobile AI Button */}
              <button
                onClick={() => setIsAIAssistantOpen(true)}
                className="p-2 rounded-lg glass-effect hover:border-white/20 transition-all"
              >
                <SparklesIcon className="w-5 h-5 text-accent-primary" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-secondary border-b border-subtle p-4 space-y-4 z-50">
            <div className="space-y-2">
              <button
                onClick={() => {
                  exportAsHTML()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 btn-secondary rounded-lg transition-all"
              >
                <DocumentIcon className="w-5 h-5 accent-primary" />
                <span className="text-primary">Export as HTML</span>
              </button>
              
              <button
                onClick={() => {
                  exportAsPrintPDF()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 btn-secondary rounded-lg transition-all"
              >
                <PrinterIcon className="w-5 h-5 accent-error" />
                <span className="text-primary">Export as PDF</span>
              </button>
              
              <button
                onClick={() => {
                  exportAsMarkdown()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 btn-secondary rounded-lg transition-all"
              >
                <DocumentArrowDownIcon className="w-5 h-5 accent-success" />
                <span className="text-primary">Export as Markdown</span>
              </button>
            </div>
            
            <div className="border-t border-white/10 pt-4 space-y-2">
              <button
                onClick={() => {
                  saveDocument()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 glass-effect hover:border-white/20 rounded-lg transition-all"
              >
                <FolderArrowDownIcon className="w-5 h-5 text-purple-400" />
                <span className="text-white">Save Document</span>
              </button>
              
              <label className="w-full">
                <input
                  type="file"
                  accept=".enhancemd"
                  onChange={(e) => {
                    loadDocument(e)
                    setMobileMenuOpen(false)
                  }}
                  className="hidden"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const input = (e.currentTarget as HTMLButtonElement).parentElement?.querySelector('input[type="file"]');
                    if (input instanceof HTMLInputElement) {
                      input.click();
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 glass-effect hover:border-white/20 rounded-lg transition-all"
                >
                  <FolderOpenIcon className="w-5 h-5 text-purple-400" />
                  <span className="text-white">Load Document</span>
                </button>
              </label>
              
              <label className="w-full">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    handleImageUpload(e)
                    setMobileMenuOpen(false)
                  }}
                  className="hidden"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const input = (e.currentTarget as HTMLButtonElement).parentElement?.querySelector('input[type="file"]');
                    if (input instanceof HTMLInputElement) {
                      input.click();
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 glass-effect hover:border-white/20 rounded-lg transition-all"
                  disabled={isProcessingImages}
                >
                  <CloudArrowUpIcon className={`w-5 h-5 text-cyan-400 ${isProcessingImages ? 'animate-bounce' : ''}`} />
                  <span className="text-white">{isProcessingImages ? 'Processing Images...' : 'Add Images'}</span>
                </button>
              </label>
            </div>
            
            <div className="border-t border-white/10 pt-4">
              <button
                onClick={() => {
                  toggleFocusMode()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 glass-effect hover:border-white/20 rounded-lg transition-all"
              >
                <EyeIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Focus Mode</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Tab Navigation */}
      {(isMobile || isTablet) && (
        <div className="lg:hidden flex border-b border-subtle bg-secondary">
          <button
            onClick={() => setMobileView('editor')}
            className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all ${
              mobileView === 'editor'
                ? 'border-b-2 border-accent-primary text-primary bg-tertiary'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <CodeBracketIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Editor</span>
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all ${
              mobileView === 'preview'
                ? 'border-b-2 border-accent-primary text-primary bg-tertiary'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <EyeIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Preview</span>
          </button>
          <button
            onClick={() => setMobileView('settings')}
            className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all ${
              mobileView === 'settings'
                ? 'border-b-2 border-accent-primary text-primary bg-tertiary'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      )}

      <div className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] relative z-10">
        {/* Desktop Editor Panel / Mobile Editor View */}
        {((showEditor && !isMobile && !isTablet) || (mobileView === 'editor' && (isMobile || isTablet))) && (
          <div className={`${isMobile || isTablet ? 'w-full' : 'w-[40%]'} editor-container ${isMobile || isTablet ? 'h-[calc(100vh-8rem)]' : ''}`}>
            <div className="h-full flex flex-col">
              <div className="bg-secondary px-4 py-3 text-sm font-medium border-b border-default flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CodeBracketIcon className="w-4 h-4 accent-primary" />
                  <span className="text-primary font-semibold">Markdown Editor</span>
                </div>
                <WordCount content={markdownContent} />
              </div>
              <CodeMirror
                value={markdownContent}
                height={isMobile || isTablet ? "calc(100vh - 12rem)" : "calc(100vh - 8rem)"}
                extensions={[
                  markdown(),
                  EditorView.updateListener.of((update) => {
                    const selection = update.state.selection.main
                    if (selection.from !== selection.to) {
                      const text = update.state.doc.sliceString(selection.from, selection.to)
                      setSelectedText(text)
                    } else {
                      setSelectedText('')
                    }
                  })
                ]}
                onChange={(value) => setMarkdownContent(value)}
                theme={appTheme === 'dark' ? oneDark : lightTheme}
                className="text-sm flex-1"
              />
            </div>
          </div>
        )}

        {/* Desktop Enhancement Sidebar / Mobile Settings View */}
        {((!isMobile && !isTablet) || (mobileView === 'settings' && (isMobile || isTablet))) && (
        <div className={`${isMobile || isTablet ? 'w-full' : 'w-80'} bg-secondary ${!isMobile && !isTablet ? 'border-r border-default' : ''} overflow-y-auto ${isMobile || isTablet ? 'h-[calc(100vh-8rem)]' : ''}`}>
          <div className="p-6 space-y-8">
            {/* Theme Selection */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <PaintBrushIcon className="w-4 h-4 accent-primary" />
                Document Theme
              </h3>
              <div className="space-y-3">
                {Object.entries(themes).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => setCurrentTheme(key as keyof typeof themes)}
                    className={`group w-full text-left px-4 py-3 rounded-xl transition-all relative overflow-hidden border-2 ${
                      currentTheme === key
                        ? 'bg-tertiary border-accent-primary shadow-lg'
                        : 'bg-primary border-subtle hover:bg-tertiary hover:border-default'
                    }`}
                  >
                    <div className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30" 
                         style={{ background: theme.previewGradient }} />
                    <div className="relative">
                      <div className="font-medium text-sm text-primary">{theme.name}</div>
                      <div className="text-xs text-secondary mt-1">
                        {theme.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Controls */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-4 h-4 accent-secondary" />
                Typography
              </h3>
              
              {/* Font Family */}
              <div className="mb-4">
                <label className="text-xs font-medium text-secondary mb-2 block">
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as keyof typeof fontFamilyStyles)}
                  className="w-full px-3 py-2 text-sm input-clean"
                >
                  <option value="sans-serif">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Monospace</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="mb-4">
                <label className="text-xs font-medium text-secondary mb-2 block">
                  Font Size
                </label>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                        fontSize === size
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacing */}
              <div>
                <label className="text-xs font-medium text-secondary mb-2 block">
                  Line Spacing
                </label>
                <div className="flex gap-2">
                  {(['compact', 'normal', 'relaxed'] as const).map(space => (
                    <button
                      key={space}
                      onClick={() => setSpacing(space)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                        spacing === space
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                    >
                      {space.charAt(0).toUpperCase() + space.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhancements */}
            <div>
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-purple-400" />
                Enhancements
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm text-secondary hover:text-primary cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={enhancements.coverPage}
                    onChange={(e) => setEnhancements({...enhancements, coverPage: e.target.checked})}
                    className="w-4 h-4 rounded border-default bg-secondary text-accent-primary focus:ring-accent-primary focus:ring-offset-0" 
                  />
                  <span className="group-hover:translate-x-0.5 transition-transform">Add cover page</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-secondary hover:text-primary cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={enhancements.tableOfContents}
                    onChange={(e) => setEnhancements({...enhancements, tableOfContents: e.target.checked})}
                    className="w-4 h-4 rounded border-default bg-secondary text-accent-primary focus:ring-accent-primary focus:ring-offset-0" 
                  />
                  <span className="group-hover:translate-x-0.5 transition-transform">Table of contents</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-secondary hover:text-primary cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={enhancements.pageNumbers}
                    onChange={(e) => setEnhancements({...enhancements, pageNumbers: e.target.checked})}
                    className="w-4 h-4 rounded border-default bg-secondary text-accent-primary focus:ring-accent-primary focus:ring-offset-0" 
                  />
                  <span className="group-hover:translate-x-0.5 transition-transform">Page numbers</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-secondary hover:text-primary cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={enhancements.headerFooter}
                    onChange={(e) => setEnhancements({...enhancements, headerFooter: e.target.checked})}
                    className="w-4 h-4 rounded border-default bg-secondary text-accent-primary focus:ring-accent-primary focus:ring-offset-0" 
                  />
                  <span className="group-hover:translate-x-0.5 transition-transform">Header & footer</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Desktop Preview Panel / Mobile Preview View */}
        {((!isMobile && !isTablet) || (mobileView === 'preview' && (isMobile || isTablet))) && (
        <div className={`flex-1 overflow-auto relative ${isMobile || isTablet ? 'w-full h-[calc(100vh-8rem)]' : ''}`}>
          <div className="absolute inset-0 bg-dot-pattern opacity-5" />
          <div className="relative z-10">
            <div className="bg-secondary px-4 py-3 text-sm font-medium border-b border-default flex items-center gap-2 sticky top-0 z-20">
              <EyeIcon className="w-4 h-4 accent-primary" />
              <span className="text-primary font-semibold">Preview</span>
            </div>
            <div className={`${isMobile ? 'max-w-full p-4' : isTablet ? 'max-w-2xl mx-auto p-8' : 'max-w-4xl mx-auto p-12'}`}>
              <div className={`bg-white ${isMobile ? 'rounded-lg' : 'rounded-2xl'} shadow-2xl ${isMobile ? 'p-4' : isTablet ? 'p-8' : 'p-12'} markdown-content`}>
                {useMemo(() => 
                  hasSmartComponents ? (
                    <EnhancedMarkdown content={smartEnhancedMarkdown} componentMap={componentMap} />
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      urlTransform={(url) => url}
                      components={{
                        img: ({ node, ...props }) => {
                          return <img {...props} className="max-w-full h-auto mx-auto my-4 rounded-lg shadow-lg" />;
                        },
                        center: ({ children }) => (
                          <div className="text-center">{children}</div>
                        ),
                        small: ({ node, ...props }) => (
                          <small className="text-sm text-gray-600" {...props} />
                        )
                      }}
                    >{processedMarkdown}</ReactMarkdown>
                  ), [processedMarkdown, hasSmartComponents, smartEnhancedMarkdown, componentMap]
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
      
      {/* Focus Mode */}
      <FocusMode
        isOpen={isFocusMode}
        onClose={exitFocusMode}
        content={markdownContent}
        onChange={setMarkdownContent}
        wordCount={focusModeStats.wordCount}
        readingTime={focusModeStats.readingTime}
      />
      
      {/* Export History */}
      <ExportHistory
        isOpen={showExportHistory}
        onClose={() => setShowExportHistory(false)}
        onQuickReExport={handleQuickReExport}
      />
      
      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
        shortcuts={customShortcuts}
        onUpdateShortcut={updateShortcut}
        onResetShortcuts={resetShortcuts}
      />
    </div>
  )
}

export default App
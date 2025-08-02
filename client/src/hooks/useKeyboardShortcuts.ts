import { useEffect, useCallback, useRef } from 'react'
import { toast } from 'react-hot-toast'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  cmd?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  action: () => void
  category?: string
  customizable?: boolean
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

// Default shortcuts that can be customized
export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  // File Operations
  {
    key: 's',
    cmd: true,
    description: 'Save document',
    category: 'File',
    customizable: true,
    action: () => {}
  },
  {
    key: 'o',
    cmd: true,
    description: 'Open document',
    category: 'File',
    customizable: true,
    action: () => {}
  },
  {
    key: 'n',
    cmd: true,
    description: 'New document',
    category: 'File',
    customizable: true,
    action: () => {}
  },
  
  // Export Shortcuts
  {
    key: 'e',
    cmd: true,
    description: 'Export as HTML',
    category: 'Export',
    customizable: true,
    action: () => {}
  },
  {
    key: 'e',
    cmd: true,
    shift: true,
    description: 'Export as PDF',
    category: 'Export',
    customizable: true,
    action: () => {}
  },
  {
    key: 'e',
    cmd: true,
    alt: true,
    description: 'Export as Markdown',
    category: 'Export',
    customizable: true,
    action: () => {}
  },
  
  // Editor Shortcuts
  {
    key: 'b',
    cmd: true,
    description: 'Bold text',
    category: 'Editor',
    customizable: false,
    action: () => {}
  },
  {
    key: 'i',
    cmd: true,
    description: 'Italic text',
    category: 'Editor',
    customizable: false,
    action: () => {}
  },
  {
    key: 'k',
    cmd: true,
    shift: true,
    description: 'Insert link',
    category: 'Editor',
    customizable: true,
    action: () => {}
  },
  
  // View Shortcuts
  {
    key: '1',
    cmd: true,
    description: 'Show editor only',
    category: 'View',
    customizable: true,
    action: () => {}
  },
  {
    key: '2',
    cmd: true,
    description: 'Show preview only',
    category: 'View',
    customizable: true,
    action: () => {}
  },
  {
    key: '3',
    cmd: true,
    description: 'Show split view',
    category: 'View',
    customizable: true,
    action: () => {}
  },
  {
    key: '/',
    cmd: true,
    description: 'Toggle editor',
    category: 'View',
    customizable: true,
    action: () => {}
  },
  
  // Theme Shortcuts
  {
    key: 't',
    cmd: true,
    description: 'Next theme',
    category: 'Theme',
    customizable: true,
    action: () => {}
  },
  {
    key: 't',
    cmd: true,
    shift: true,
    description: 'Previous theme',
    category: 'Theme',
    customizable: true,
    action: () => {}
  },
  
  // Settings
  {
    key: ',',
    cmd: true,
    description: 'Open settings',
    category: 'Settings',
    customizable: false,
    action: () => {}
  },
  {
    key: 'h',
    cmd: true,
    description: 'Export history',
    category: 'Settings',
    customizable: true,
    action: () => {}
  }
]

export const useKeyboardShortcuts = ({ 
  shortcuts, 
  enabled = true 
}: UseKeyboardShortcutsOptions) => {
  const shortcutMapRef = useRef<Map<string, KeyboardShortcut>>(new Map())
  const pressedKeysRef = useRef<Set<string>>(new Set())
  
  // Build shortcut key from shortcut object
  const buildShortcutKey = useCallback((shortcut: KeyboardShortcut): string => {
    const parts: string[] = []
    if (shortcut.ctrl) parts.push('ctrl')
    if (shortcut.cmd) parts.push('cmd')
    if (shortcut.alt) parts.push('alt')
    if (shortcut.shift) parts.push('shift')
    parts.push(shortcut.key.toLowerCase())
    return parts.join('+')
  }, [])
  
  // Build key from keyboard event
  const buildEventKey = useCallback((e: KeyboardEvent): string => {
    const parts: string[] = []
    if (e.ctrlKey) parts.push('ctrl')
    if (e.metaKey) parts.push('cmd')
    if (e.altKey) parts.push('alt')
    if (e.shiftKey) parts.push('shift')
    parts.push(e.key.toLowerCase())
    return parts.join('+')
  }, [])
  
  // Update shortcut map when shortcuts change
  useEffect(() => {
    shortcutMapRef.current.clear()
    shortcuts.forEach(shortcut => {
      const key = buildShortcutKey(shortcut)
      shortcutMapRef.current.set(key, shortcut)
    })
  }, [shortcuts, buildShortcutKey])
  
  // Handle keyboard events
  useEffect(() => {
    if (!enabled) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input or textarea (unless it's a global shortcut)
      const target = e.target as HTMLElement
      const isTyping = target.tagName === 'INPUT' || 
                      target.tagName === 'TEXTAREA' ||
                      target.contentEditable === 'true'
      
      // Allow some shortcuts even when typing (like save)
      const allowedWhileTyping = ['cmd+s', 'ctrl+s']
      const eventKey = buildEventKey(e)
      
      if (isTyping && !allowedWhileTyping.includes(eventKey)) {
        return
      }
      
      // Track pressed keys for complex shortcuts
      pressedKeysRef.current.add(e.key.toLowerCase())
      
      // Check if this matches a shortcut
      const shortcut = shortcutMapRef.current.get(eventKey)
      
      if (shortcut) {
        e.preventDefault()
        e.stopPropagation()
        
        try {
          shortcut.action()
        } catch (error) {
          console.error('Error executing shortcut:', error)
          toast.error(`Failed to execute: ${shortcut.description}`)
        }
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeysRef.current.delete(e.key.toLowerCase())
    }
    
    const handleBlur = () => {
      // Clear all pressed keys when window loses focus
      pressedKeysRef.current.clear()
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [enabled, buildEventKey])
  
  // Get formatted shortcut display string
  const getShortcutDisplay = useCallback((shortcut: KeyboardShortcut): string => {
    const parts: string[] = []
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.cmd) parts.push(isMac ? '⌘' : 'Cmd')
    if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt')
    if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift')
    
    // Format the key
    let key = shortcut.key
    if (key === ' ') key = 'Space'
    if (key === 'Enter') key = isMac ? '↵' : 'Enter'
    if (key === 'Escape') key = 'Esc'
    if (key === 'ArrowUp') key = '↑'
    if (key === 'ArrowDown') key = '↓'
    if (key === 'ArrowLeft') key = '←'
    if (key === 'ArrowRight') key = '→'
    
    parts.push(key.charAt(0).toUpperCase() + key.slice(1))
    
    return parts.join(isMac ? '' : '+')
  }, [])
  
  // Register a new shortcut dynamically
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    const key = buildShortcutKey(shortcut)
    shortcutMapRef.current.set(key, shortcut)
  }, [buildShortcutKey])
  
  // Unregister a shortcut
  const unregisterShortcut = useCallback((shortcut: KeyboardShortcut) => {
    const key = buildShortcutKey(shortcut)
    shortcutMapRef.current.delete(key)
  }, [buildShortcutKey])
  
  // Get all registered shortcuts grouped by category
  const getShortcutsByCategory = useCallback((): Record<string, KeyboardShortcut[]> => {
    const grouped: Record<string, KeyboardShortcut[]> = {}
    
    shortcutMapRef.current.forEach(shortcut => {
      const category = shortcut.category || 'General'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(shortcut)
    })
    
    return grouped
  }, [])
  
  return {
    registerShortcut,
    unregisterShortcut,
    getShortcutDisplay,
    getShortcutsByCategory,
    shortcuts: Array.from(shortcutMapRef.current.values())
  }
}
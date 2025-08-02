/**
 * Focus Mode Component for EnhanceMD
 * 
 * Features:
 * - Full-screen distraction-free writing environment
 * - Keyboard shortcuts: Cmd+Shift+F to toggle, Escape to exit
 * - Click outside to exit
 * - Minimal UI with only essential controls
 * - Auto-save indicator
 * - Smooth transitions and backdrop blur
 * - Integration with Command Palette
 */

import React, { useEffect, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { 
  XMarkIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { Button } from './Button'
import { AutoSaveIndicator } from './AutoSaveIndicator'

interface FocusModeProps {
  isOpen: boolean
  onClose: () => void
  content: string
  onChange: (value: string) => void
  wordCount: number
  readingTime: string
}

export const FocusMode: React.FC<FocusModeProps> = ({
  isOpen,
  onClose,
  content,
  onChange,
  wordCount,
  readingTime
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Handle smooth open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      // Escape to exit
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }

      // Cmd+Shift+F or Ctrl+Shift+F to toggle (also handled by parent)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Handle click outside to exit
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Only close if clicking on the backdrop, not on editor or controls
        const target = event.target as HTMLElement
        if (target.classList.contains('focus-mode-backdrop')) {
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Prevent body scroll when focus mode is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-50 focus-mode-backdrop transition-all duration-300 ${
        isOpen 
          ? 'bg-black/80 backdrop-blur-md opacity-100' 
          : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
    >
      {/* Focus Mode Container */}
      <div 
        ref={containerRef}
        className={`h-full flex flex-col transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 glass-effect-dark border-b border-white/10">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Focus Mode Indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-white font-medium text-sm sm:text-base">Focus Mode</span>
            </div>

            {/* Minimal Stats - Hidden on small mobile */}
            <div className="hidden sm:flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <DocumentTextIcon className="w-4 h-4" />
                <span>{wordCount.toLocaleString()} words</span>
              </div>
              
              <div className="w-px h-4 bg-gray-600" />
              
              <div className="flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                <span>{readingTime} read</span>
              </div>

              <div className="w-px h-4 bg-gray-600" />
              
              {/* Auto-save indicator */}
              <AutoSaveIndicator className="scale-90" />
            </div>
          </div>

          {/* Exit Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              icon={<EyeSlashIcon className="w-4 h-4" />}
              iconPosition="left"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              Exit Focus
            </Button>
            
            <div className="w-px h-6 bg-gray-600" />
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              title="Exit Focus Mode (Press Escape)"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Full-Width Editor */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-pink-900/5" />
          <div className="relative h-full">
            <CodeMirror
              value={content}
              height="100%"
              extensions={[markdown()]}
              onChange={onChange}
              theme={oneDark}
              className="h-full text-base focus-mode-editor"
              basicSetup={{
                lineNumbers: false,
                foldGutter: false,
                dropCursor: false,
                allowMultipleSelections: false,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                searchKeymap: true,
                highlightSelectionMatches: false
              }}
            />
          </div>
        </div>

        {/* Subtle Footer with Shortcuts - Responsive */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 glass-effect-dark border-t border-white/10">
          <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <kbd className="px-1 sm:px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] sm:text-xs">Esc</kbd>
              <span className="hidden sm:inline">Exit</span>
            </div>
            <div className="sm:hidden flex items-center gap-1.5 text-xs text-gray-400">
              <DocumentTextIcon className="w-3 h-3" />
              <span>{wordCount} words</span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20">⇧⌘F</kbd>
              <span>Toggle Focus</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Click outside to exit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
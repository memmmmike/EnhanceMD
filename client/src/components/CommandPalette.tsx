/**
 * Command Palette Component for EnhanceMD
 * 
 * Features:
 * - Fuzzy search with intelligent scoring
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Grouped commands by category
 * - Keyboard shortcuts display
 * - Search highlighting
 * - Glassmorphism UI design
 * - Supports all app actions (themes, export, typography, etc.)
 * 
 * Usage:
 * - Open with Cmd+K (Mac) or Ctrl+K (Windows/Linux)
 * - Also supports Cmd+P / Ctrl+P
 * - Click the Search button in the header
 */

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { 
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export interface Command {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: string
  shortcut?: string[]
  action: () => void
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  commands: Command[]
}

// Enhanced fuzzy search implementation
const fuzzySearch = (query: string, text: string): number => {
  if (!query) return 1
  
  query = query.toLowerCase()
  text = text.toLowerCase()
  
  // Exact match gets highest score
  if (text === query) {
    return 100
  }
  
  // Word boundary matches get high score
  if (text.includes(query)) {
    const index = text.indexOf(query)
    // Bonus for matching at word boundaries
    const isWordStart = index === 0 || /\s/.test(text[index - 1])
    return 50 + (isWordStart ? 20 : 0) - (index * 0.1)
  }
  
  // Acronym matching (first letters of words)
  const words = text.split(/\s+/)
  const acronym = words.map(word => word[0]).join('')
  if (acronym.includes(query)) {
    return 30
  }
  
  // Character matching with position and consecutive bonuses
  let score = 0
  let queryIndex = 0
  let consecutiveMatches = 0
  let lastMatchIndex = -1
  
  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      // Bonus for consecutive matches
      if (i === lastMatchIndex + 1) {
        consecutiveMatches++
        score += 3 + consecutiveMatches
      } else {
        consecutiveMatches = 1
        score += 2
      }
      
      // Bonus for early matches
      score += Math.max(0, 3 - queryIndex)
      
      lastMatchIndex = i
      queryIndex++
    }
  }
  
  // Bonus for matching all characters
  if (queryIndex === query.length) {
    score += 10
    // Additional bonus based on how much of the query was matched
    score += (queryIndex / query.length) * 5
  }
  
  return score > 0 ? score : 0
}

// Helper function to highlight matching text
const highlightMatches = (text: string, query: string): React.ReactNode => {
  if (!query) return text
  
  const regex = new RegExp(`(${query.split('').join('|')})`, 'gi')
  const parts = text.split(regex)
  
  return parts.map((part, index) => {
    const isMatch = query.toLowerCase().includes(part.toLowerCase()) && part.length > 0
    return isMatch ? (
      <span key={index} className="bg-yellow-400/20 text-yellow-300 font-medium">
        {part}
      </span>
    ) : (
      part
    )
  })
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter and sort commands based on fuzzy search
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return commands
    }

    const scored = commands
      .map(command => ({
        command,
        score: Math.max(
          fuzzySearch(query, command.title),
          fuzzySearch(query, command.description) * 0.7,
          fuzzySearch(query, command.category) * 0.5
        )
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.command)

    return scored
  }, [commands, query])

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    filteredCommands.forEach(command => {
      if (!groups[command.category]) {
        groups[command.category] = []
      }
      groups[command.category].push(command)
    })
    return groups
  }, [filteredCommands])

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredCommands])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
            onClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onClose])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Reset query when closing
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] sm:pt-[10vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Command Palette */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-2xl glass-effect-dark border border-white/20 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
          <MagnifyingGlassIcon className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-base sm:text-lg"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
          </button>
        </div>

        {/* Commands */}
        <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400">
              <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No commands found</p>
              {query ? (
                <p className="text-sm mt-1">Try a different search term</p>
              ) : (
                <div className="text-sm mt-2 space-y-1">
                  <p>Try searching for:</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {['theme', 'export', 'font', 'save'].map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => setQuery(suggestion)}
                        className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                <div key={category}>
                  {!query && (
                    <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {category}
                    </div>
                  )}
                  {categoryCommands.map((command) => {
                    const globalIndex = filteredCommands.indexOf(command)
                    const isSelected = globalIndex === selectedIndex
                    
                    return (
                      <button
                        key={command.id}
                        onClick={() => {
                          command.action()
                          onClose()
                        }}
                        className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-l-4 border-purple-500'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div className={`p-2 rounded-lg transition-colors ${
                          isSelected 
                            ? 'bg-purple-500/20 text-purple-300' 
                            : 'bg-white/5 text-gray-400'
                        }`}>
                          {command.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium ${
                            isSelected ? 'text-white' : 'text-gray-200'
                          }`}>
                            {highlightMatches(command.title, query)}
                          </div>
                          <div className={`text-sm ${
                            isSelected ? 'text-gray-300' : 'text-gray-400'
                          }`}>
                            {highlightMatches(command.description, query)}
                          </div>
                        </div>
                        {command.shortcut && (
                          <div className="flex items-center gap-1">
                            {command.shortcut.map((key, idx) => (
                              <React.Fragment key={idx}>
                                {idx > 0 && <span className="text-gray-500 text-xs">+</span>}
                                <kbd className={`px-2 py-1 text-xs rounded border transition-colors ${
                                  isSelected
                                    ? 'bg-white/10 border-white/20 text-gray-300'
                                    : 'bg-white/5 border-white/10 text-gray-400'
                                }`}>
                                  {key}
                                </kbd>
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20">↑↓</kbd>
              <span>navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20">Enter</kbd>
              <span>select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20">Esc</kbd>
              <span>close</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  )
}
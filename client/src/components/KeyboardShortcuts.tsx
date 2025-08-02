import { useState, useEffect } from 'react'
import {
  XMarkIcon,
  Cog6ToothIcon,
  CommandLineIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { Button } from './Button'
import { useKeyboardShortcuts, type KeyboardShortcut } from '../hooks/useKeyboardShortcuts'
import { toast } from 'react-hot-toast'

interface KeyboardShortcutsProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: KeyboardShortcut[]
  onUpdateShortcut?: (index: number, shortcut: KeyboardShortcut) => void
  onResetShortcuts?: () => void
}

export function KeyboardShortcuts({ 
  isOpen, 
  onClose, 
  shortcuts,
  onUpdateShortcut,
  onResetShortcuts
}: KeyboardShortcutsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [recordingKey, setRecordingKey] = useState(false)
  const [newShortcut, setNewShortcut] = useState<Partial<KeyboardShortcut>>({})
  
  const { getShortcutDisplay } = useKeyboardShortcuts({ 
    shortcuts, 
    enabled: false // Disable shortcuts while modal is open
  })
  
  // Filter shortcuts based on search
  const filteredShortcuts = shortcuts.filter(shortcut => 
    shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shortcut.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getShortcutDisplay(shortcut).toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Group filtered shortcuts by category
  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push({ ...shortcut, originalIndex: shortcuts.indexOf(shortcut) })
    return acc
  }, {} as Record<string, (KeyboardShortcut & { originalIndex: number })[]>)
  
  // Handle recording new shortcut
  const handleKeyRecord = (e: KeyboardEvent) => {
    if (!recordingKey) return
    
    e.preventDefault()
    e.stopPropagation()
    
    // Ignore modifier keys alone
    if (['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) {
      return
    }
    
    const shortcut: Partial<KeyboardShortcut> = {
      key: e.key,
      ctrl: e.ctrlKey,
      cmd: e.metaKey,
      alt: e.altKey,
      shift: e.shiftKey
    }
    
    setNewShortcut(shortcut)
    setRecordingKey(false)
  }
  
  useEffect(() => {
    if (recordingKey) {
      document.addEventListener('keydown', handleKeyRecord)
      return () => document.removeEventListener('keydown', handleKeyRecord)
    }
  }, [recordingKey])
  
  // Handle shortcut update
  const handleUpdateShortcut = (index: number) => {
    if (!onUpdateShortcut || !newShortcut.key) return
    
    const updatedShortcut: KeyboardShortcut = {
      ...shortcuts[index],
      ...newShortcut
    }
    
    // Check for conflicts
    const conflict = shortcuts.find((s, i) => 
      i !== index &&
      s.key === updatedShortcut.key &&
      s.ctrl === updatedShortcut.ctrl &&
      s.cmd === updatedShortcut.cmd &&
      s.alt === updatedShortcut.alt &&
      s.shift === updatedShortcut.shift
    )
    
    if (conflict) {
      toast.error(`Shortcut conflicts with: ${conflict.description}`)
      return
    }
    
    onUpdateShortcut(index, updatedShortcut)
    setEditingIndex(null)
    setNewShortcut({})
    toast.success('Shortcut updated')
  }
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingIndex(null)
    setNewShortcut({})
    setRecordingKey(false)
  }
  
  // Handle reset all shortcuts
  const handleResetAll = () => {
    if (onResetShortcuts) {
      onResetShortcuts()
      toast.success('All shortcuts reset to defaults')
    }
  }
  
  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !recordingKey) {
        if (editingIndex !== null) {
          handleCancelEdit()
        } else {
          onClose()
        }
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, editingIndex, recordingKey])
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="w-full max-w-4xl transform overflow-hidden rounded-2xl glass-effect-dark border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <CommandLineIcon className="w-6 h-6 text-purple-400" />
              Keyboard Shortcuts
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({shortcuts.length} shortcuts)
              </span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search shortcuts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass-effect border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none text-sm"
              />
            </div>
            
            {/* Reset Button */}
            {onResetShortcuts && (
              <Button
                variant="outline"
                size="sm"
                icon={<ArrowPathIcon className="w-4 h-4" />}
                iconPosition="left"
                onClick={handleResetAll}
                className="text-orange-400 border-orange-400/30 hover:border-orange-400/50 hover:bg-orange-400/10"
              >
                Reset All
              </Button>
            )}
          </div>
          
          {/* Shortcuts List */}
          <div className="max-h-96 overflow-y-auto space-y-6">
            {Object.entries(groupedShortcuts).length === 0 ? (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No shortcuts found</h3>
                <p className="text-gray-500 text-sm">
                  Try adjusting your search query
                </p>
              </div>
            ) : (
              Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut) => (
                      <div
                        key={shortcut.originalIndex}
                        className="glass-effect border border-white/10 rounded-lg p-3 hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-white font-medium text-sm">
                              {shortcut.description}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {editingIndex === shortcut.originalIndex ? (
                              <>
                                {recordingKey ? (
                                  <div className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-400 text-sm animate-pulse">
                                    Press keys...
                                  </div>
                                ) : newShortcut.key ? (
                                  <div className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-mono">
                                    {getShortcutDisplay({ ...shortcut, ...newShortcut } as KeyboardShortcut)}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setRecordingKey(true)}
                                    className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-400 text-sm hover:bg-purple-500/30 transition-colors"
                                  >
                                    Record
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleUpdateShortcut(shortcut.originalIndex)}
                                  disabled={!newShortcut.key}
                                  className="p-1 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                </button>
                                
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <div className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-mono">
                                  {getShortcutDisplay(shortcut)}
                                </div>
                                
                                {shortcut.customizable && onUpdateShortcut && (
                                  <button
                                    onClick={() => {
                                      setEditingIndex(shortcut.originalIndex)
                                      setNewShortcut({})
                                    }}
                                    className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                  >
                                    <Cog6ToothIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <span className="text-gray-400">Tip:</span> Click the gear icon to customize shortcuts
            </div>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
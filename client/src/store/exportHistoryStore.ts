import { create } from 'zustand'
import { toast } from 'react-hot-toast'

export interface ExportHistoryItem {
  id: string
  title: string
  format: 'html' | 'pdf' | 'markdown' | 'react'
  timestamp: number
  theme: string
  fileName: string
  fileSize?: number
  // Store the export data for re-download (Base64 or blob data)
  exportData?: string
  // Additional metadata for re-export functionality
  settings: {
    theme: string
    fontSize: string
    spacing: string
    fontFamily: string
    enhancements: {
      coverPage: boolean
      tableOfContents: boolean
      pageNumbers: boolean
      headerFooter: boolean
    }
  }
  // Content hash to detect changes for quick re-export
  contentHash: string
}

export interface ExportHistoryState {
  // State
  exports: ExportHistoryItem[]
  isVisible: boolean
  searchQuery: string
  selectedFormat: 'all' | 'html' | 'pdf' | 'markdown' | 'react'
  
  // Actions
  addExport: (exportItem: Omit<ExportHistoryItem, 'id' | 'timestamp'>) => void
  removeExport: (exportId: string) => void
  clearHistory: () => void
  reDownloadExport: (exportId: string) => void
  toggleVisibility: () => void
  setSearchQuery: (query: string) => void
  setSelectedFormat: (format: ExportHistoryState['selectedFormat']) => void
  initializeFromStorage: () => void
  getFilteredExports: () => ExportHistoryItem[]
}

const STORAGE_KEY = 'enhancemd-export-history'
const MAX_EXPORTS = 50

// Helper functions
const generateExportId = () => `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const generateContentHash = (content: string, settings: any): string => {
  // Simple hash function for content + settings
  const combined = content + JSON.stringify(settings)
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

const saveExportsToStorage = (exports: ExportHistoryItem[]) => {
  try {
    // Store exports without the heavy exportData to avoid localStorage limits
    const exportsToStore = exports.map(item => ({
      ...item,
      exportData: undefined // Don't store the actual file data
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exportsToStore))
  } catch (error) {
    console.error('Failed to save export history to localStorage:', error)
    toast.error('Failed to save export history')
  }
}

const loadExportsFromStorage = (): ExportHistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load export history from localStorage:', error)
    return []
  }
}

const formatFileSize = (bytes: number = 0): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  
  return new Date(timestamp).toLocaleDateString()
}

export const useExportHistoryStore = create<ExportHistoryState>((set, get) => ({
  // Initial state
  exports: [],
  isVisible: false,
  searchQuery: '',
  selectedFormat: 'all',

  // Actions
  addExport: (exportItem) => {
    const state = get()
    
    const newExport: ExportHistoryItem = {
      ...exportItem,
      id: generateExportId(),
      timestamp: Date.now()
    }

    // Add to beginning of array and limit to MAX_EXPORTS
    const updatedExports = [newExport, ...state.exports].slice(0, MAX_EXPORTS)

    set({ exports: updatedExports })
    saveExportsToStorage(updatedExports)

    toast.success(`Export added to history: ${newExport.fileName}`)
  },

  removeExport: (exportId) => {
    const state = get()
    const updatedExports = state.exports.filter(exp => exp.id !== exportId)
    
    set({ exports: updatedExports })
    saveExportsToStorage(updatedExports)
    
    toast.success('Export removed from history')
  },

  clearHistory: () => {
    set({ exports: [] })
    saveExportsToStorage([])
    toast.success('Export history cleared')
  },

  reDownloadExport: (exportId) => {
    const state = get()
    const exportItem = state.exports.find(exp => exp.id === exportId)
    
    if (!exportItem) {
      toast.error('Export not found')
      return
    }

    // Since we don't store the actual file data, we'll show a message about re-export
    toast.error('File data not available. Use "Quick Re-export" to generate the file again.')
  },

  toggleVisibility: () => {
    set(state => ({ isVisible: !state.isVisible }))
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
  },

  setSelectedFormat: (format) => {
    set({ selectedFormat: format })
  },

  initializeFromStorage: () => {
    const exports = loadExportsFromStorage()
    set({ exports })
  },

  getFilteredExports: () => {
    const state = get()
    let filtered = state.exports

    // Filter by format
    if (state.selectedFormat !== 'all') {
      filtered = filtered.filter(exp => exp.format === state.selectedFormat)
    }

    // Filter by search query
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase().trim()
      filtered = filtered.filter(exp => 
        exp.title.toLowerCase().includes(query) ||
        exp.fileName.toLowerCase().includes(query) ||
        exp.format.toLowerCase().includes(query) ||
        exp.theme.toLowerCase().includes(query)
      )
    }

    return filtered
  }
}))

// Helper functions to export
export { formatFileSize, formatTimeAgo, generateContentHash }

// Auto-initialization
if (typeof window !== 'undefined') {
  useExportHistoryStore.getState().initializeFromStorage()
}
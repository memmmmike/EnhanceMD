import { create } from 'zustand'
import { toast } from 'react-hot-toast'

export interface DraftData {
  id: string
  content: string
  timestamp: number
  title: string
}

export interface AutoSaveState {
  // State
  isAutoSaveEnabled: boolean
  lastSaved: number | null
  currentDraftId: string | null
  drafts: DraftData[]
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error'
  lastAutoSaveAttempt: number | null
  
  // Actions
  setAutoSaveEnabled: (enabled: boolean) => void
  saveDraft: (content: string, title?: string) => void
  loadDraft: (draftId: string) => DraftData | null
  deleteDraft: (draftId: string) => void
  cleanupOldDrafts: () => void
  setAutoSaveStatus: (status: AutoSaveState['autoSaveStatus']) => void
  initializeFromStorage: () => void
  recoverLatestDraft: () => DraftData | null
}

const DRAFTS_STORAGE_KEY = 'enhancemd-drafts'
const SETTINGS_STORAGE_KEY = 'enhancemd-autosave-settings'
const MAX_DRAFTS = 20
const DRAFT_RETENTION_DAYS = 7

// Helper functions
const generateDraftId = () => `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const extractTitle = (content: string): string => {
  const titleMatch = content.match(/^#\s+(.+)$/m)
  return titleMatch ? titleMatch[1].trim() : 'Untitled Document'
}

const isOldDraft = (timestamp: number): boolean => {
  const daysOld = (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
  return daysOld > DRAFT_RETENTION_DAYS
}

const saveDraftsToStorage = (drafts: DraftData[]) => {
  try {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts))
  } catch (error) {
    console.error('Failed to save drafts to localStorage:', error)
  }
}

const loadDraftsFromStorage = (): DraftData[] => {
  try {
    const stored = localStorage.getItem(DRAFTS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load drafts from localStorage:', error)
    return []
  }
}

const saveSettingsToStorage = (settings: { isAutoSaveEnabled: boolean }) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save auto-save settings:', error)
  }
}

const loadSettingsFromStorage = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : { isAutoSaveEnabled: true }
  } catch (error) {
    console.error('Failed to load auto-save settings:', error)
    return { isAutoSaveEnabled: true }
  }
}

export const useAutoSaveStore = create<AutoSaveState>((set, get) => ({
  // Initial state
  isAutoSaveEnabled: true,
  lastSaved: null,
  currentDraftId: null,
  drafts: [],
  autoSaveStatus: 'idle',
  lastAutoSaveAttempt: null,

  // Actions
  setAutoSaveEnabled: (enabled: boolean) => {
    set({ isAutoSaveEnabled: enabled })
    saveSettingsToStorage({ isAutoSaveEnabled: enabled })
    
    if (enabled) {
      toast.success('Auto-save enabled')
    } else {
      toast.success('Auto-save disabled')
    }
  },

  saveDraft: (content: string, title?: string) => {
    const state = get()
    
    if (!state.isAutoSaveEnabled) {
      return
    }

    set({ autoSaveStatus: 'saving', lastAutoSaveAttempt: Date.now() })

    try {
      const now = Date.now()
      const extractedTitle = title || extractTitle(content)
      
      // Create new draft
      const newDraft: DraftData = {
        id: state.currentDraftId || generateDraftId(),
        content,
        timestamp: now,
        title: extractedTitle
      }

      // Update drafts array
      const updatedDrafts = [
        newDraft,
        ...state.drafts.filter(draft => draft.id !== newDraft.id)
      ].slice(0, MAX_DRAFTS) // Keep only the most recent drafts

      // Save to storage
      saveDraftsToStorage(updatedDrafts)

      // Update state
      set({
        drafts: updatedDrafts,
        lastSaved: now,
        currentDraftId: newDraft.id,
        autoSaveStatus: 'saved'
      })

      // Reset status after 3 seconds
      setTimeout(() => {
        const currentState = get()
        if (currentState.autoSaveStatus === 'saved') {
          set({ autoSaveStatus: 'idle' })
        }
      }, 3000)

    } catch (error) {
      console.error('Auto-save failed:', error)
      set({ autoSaveStatus: 'error' })
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        const currentState = get()
        if (currentState.autoSaveStatus === 'error') {
          set({ autoSaveStatus: 'idle' })
        }
      }, 5000)
    }
  },

  loadDraft: (draftId: string) => {
    const state = get()
    return state.drafts.find(draft => draft.id === draftId) || null
  },

  deleteDraft: (draftId: string) => {
    const state = get()
    const updatedDrafts = state.drafts.filter(draft => draft.id !== draftId)
    
    set({ 
      drafts: updatedDrafts,
      currentDraftId: state.currentDraftId === draftId ? null : state.currentDraftId
    })
    
    saveDraftsToStorage(updatedDrafts)
    toast.success('Draft deleted')
  },

  cleanupOldDrafts: () => {
    const state = get()
    const filteredDrafts = state.drafts.filter(draft => !isOldDraft(draft.timestamp))
    
    if (filteredDrafts.length !== state.drafts.length) {
      set({ drafts: filteredDrafts })
      saveDraftsToStorage(filteredDrafts)
      
      const deletedCount = state.drafts.length - filteredDrafts.length
      console.log(`Cleaned up ${deletedCount} old drafts`)
    }
  },

  setAutoSaveStatus: (status: AutoSaveState['autoSaveStatus']) => {
    set({ autoSaveStatus: status })
  },

  initializeFromStorage: () => {
    // Load settings
    const settings = loadSettingsFromStorage()
    
    // Load drafts
    const drafts = loadDraftsFromStorage()
    
    // Clean up old drafts on initialization
    const filteredDrafts = drafts.filter(draft => !isOldDraft(draft.timestamp))
    
    if (filteredDrafts.length !== drafts.length) {
      saveDraftsToStorage(filteredDrafts)
    }

    set({
      isAutoSaveEnabled: settings.isAutoSaveEnabled,
      drafts: filteredDrafts
    })
  },

  recoverLatestDraft: () => {
    const state = get()
    if (state.drafts.length === 0) {
      return null
    }

    // Return the most recent draft
    const latestDraft = state.drafts[0]
    
    // Set it as current draft
    set({ currentDraftId: latestDraft.id })
    
    return latestDraft
  }
}))

// Auto-cleanup on module load
if (typeof window !== 'undefined') {
  useAutoSaveStore.getState().cleanupOldDrafts()
}
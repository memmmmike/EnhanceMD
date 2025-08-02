import { useEffect, useRef, useCallback } from 'react'
import { useAutoSaveStore } from '../store/autoSaveStore'
import { toast } from 'react-hot-toast'

interface UseAutoSaveOptions {
  content: string
  title?: string
  interval?: number // in milliseconds, default 30 seconds
  onSave?: (content: string) => void
  onRestore?: (content: string, title: string) => void
}

export const useAutoSave = ({
  content,
  title,
  interval = 30000, // 30 seconds
  onSave,
  onRestore
}: UseAutoSaveOptions) => {
  const {
    isAutoSaveEnabled,
    saveDraft,
    initializeFromStorage,
    recoverLatestDraft,
    cleanupOldDrafts
  } = useAutoSaveStore()

  const lastContentRef = useRef<string>('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasInitialized = useRef(false)
  const hasOfferedRecovery = useRef(false)

  // Initialize store and check for draft recovery on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      initializeFromStorage()
      cleanupOldDrafts()
      hasInitialized.current = true

      // Check for draft recovery only if content is empty or default
      const isEmptyOrDefault = !content || content.trim() === '' || isDefaultContent(content)
      
      if (isEmptyOrDefault && !hasOfferedRecovery.current) {
        const latestDraft = recoverLatestDraft()
        
        if (latestDraft && latestDraft.content !== content) {
          hasOfferedRecovery.current = true
          
          // Show recovery notification with action
          toast.success(
            (t) => (
              <div className="flex flex-col gap-2">
                <div className="font-medium">Draft found!</div>
                <div className="text-sm text-gray-300">
                  Recover "{latestDraft.title}" from {new Date(latestDraft.timestamp).toLocaleString()}?
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onRestore?.(latestDraft.content, latestDraft.title)
                      toast.dismiss(t.id)
                      toast.success('Draft restored!')
                    }}
                    className="px-3 py-1 bg-purple-500 text-white rounded text-sm font-medium hover:bg-purple-600 transition-colors"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ),
            {
              duration: 15000, // 15 seconds to decide
              position: 'top-center'
            }
          )
        }
      }
    }
  }, [initializeFromStorage, cleanupOldDrafts, recoverLatestDraft, content, onRestore])

  // Check if content is likely the default content
  const isDefaultContent = (content: string): boolean => {
    return content.includes('# Welcome to EnhanceMD') || content.includes('Transform Your Markdown into Beautiful Documents')
  }

  // Save draft function
  const saveIfChanged = useCallback(() => {
    if (!isAutoSaveEnabled || !content) return

    // Only save if content has actually changed
    if (content !== lastContentRef.current) {
      lastContentRef.current = content
      saveDraft(content, title)
      onSave?.(content)
    }
  }, [content, title, isAutoSaveEnabled, saveDraft, onSave])

  // Set up auto-save interval
  useEffect(() => {
    if (!isAutoSaveEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set up new interval
    intervalRef.current = setInterval(saveIfChanged, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isAutoSaveEnabled, interval, saveIfChanged])

  // Save on content change (debounced by interval)
  useEffect(() => {
    if (content && content !== lastContentRef.current) {
      // Update the last content reference immediately to avoid duplicate saves
      lastContentRef.current = content
    }
  }, [content])

  // Page unload handler - save before leaving
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isAutoSaveEnabled && content && content !== lastContentRef.current) {
        // Save immediately before unload
        saveDraft(content, title)
        
        // Show warning if there are unsaved changes
        event.preventDefault()
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return event.returnValue
      }
    }

    const handleUnload = () => {
      // Final save attempt
      if (isAutoSaveEnabled && content) {
        saveDraft(content, title)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('unload', handleUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('unload', handleUnload)
    }
  }, [content, title, isAutoSaveEnabled, saveDraft])

  // Manual save function
  const manualSave = useCallback(() => {
    if (content) {
      saveDraft(content, title)
      onSave?.(content)
      toast.success('Draft saved manually')
    }
  }, [content, title, saveDraft, onSave])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    manualSave,
    isAutoSaveEnabled
  }
}
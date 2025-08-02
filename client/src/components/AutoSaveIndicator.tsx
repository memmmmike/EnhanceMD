import React from 'react'
import { 
  CheckIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { useAutoSaveStore } from '../store/autoSaveStore'

interface AutoSaveIndicatorProps {
  className?: string
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ className = '' }) => {
  const { 
    autoSaveStatus, 
    lastSaved, 
    isAutoSaveEnabled, 
    setAutoSaveEnabled
  } = useAutoSaveStore()

  const getStatusDisplay = () => {
    if (!isAutoSaveEnabled) {
      return {
        icon: <CogIcon className="w-4 h-4" />,
        text: 'Auto-save disabled',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20'
      }
    }

    switch (autoSaveStatus) {
      case 'saving':
        return {
          icon: <ArrowPathIcon className="w-4 h-4 animate-spin" />,
          text: 'Saving...',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20'
        }
      case 'saved':
        return {
          icon: <CheckIcon className="w-4 h-4" />,
          text: lastSaved ? `Saved ${getTimeAgo(lastSaved)}` : 'Saved',
          color: 'text-green-400',
          bgColor: 'bg-green-500/20'
        }
      case 'error':
        return {
          icon: <ExclamationTriangleIcon className="w-4 h-4" />,
          text: 'Save failed',
          color: 'text-red-400',
          bgColor: 'bg-red-500/20'
        }
      default:
        return {
          icon: <ClockIcon className="w-4 h-4" />,
          text: lastSaved ? `Last saved ${getTimeAgo(lastSaved)}` : 'Ready to save',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20'
        }
    }
  }

  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 30) {
      return 'just now'
    } else if (seconds < 60) {
      return `${seconds}s ago`
    } else if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return new Date(timestamp).toLocaleDateString()
    }
  }

  const status = getStatusDisplay()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status Indicator */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg glass-effect border border-white/10 ${status.bgColor} transition-all`}>
        <div className={status.color}>
          {status.icon}
        </div>
        <span className={`text-xs font-medium ${status.color}`}>
          {status.text}
        </span>
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setAutoSaveEnabled(!isAutoSaveEnabled)}
        className={`p-1.5 rounded-lg glass-effect border border-white/10 transition-all hover:border-white/20 ${
          isAutoSaveEnabled 
            ? 'text-green-400 hover:text-green-300' 
            : 'text-gray-400 hover:text-gray-300'
        }`}
        title={isAutoSaveEnabled ? 'Disable auto-save' : 'Enable auto-save'}
      >
        <CogIcon className="w-4 h-4" />
      </button>
    </div>
  )
}
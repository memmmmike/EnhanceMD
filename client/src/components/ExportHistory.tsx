import { useState, useMemo, useEffect } from 'react'
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  DocumentIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  CodeBracketSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  ClockIcon,
  FolderIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Button } from './Button'
import { useExportHistoryStore, formatTimeAgo, formatFileSize } from '../store/exportHistoryStore'
import { toast } from 'react-hot-toast'

interface ExportHistoryProps {
  isOpen: boolean
  onClose: () => void
  onQuickReExport?: (exportId: string) => void
}

const formatIcons = {
  html: DocumentIcon,
  pdf: PrinterIcon,
  markdown: DocumentArrowDownIcon,
  react: CodeBracketSquareIcon
}

const formatLabels = {
  html: 'HTML',
  pdf: 'PDF',
  markdown: 'Markdown',
  react: 'React'
}

const formatColors = {
  html: 'text-blue-400 bg-blue-400/10',
  pdf: 'text-red-400 bg-red-400/10',
  markdown: 'text-green-400 bg-green-400/10',
  react: 'text-purple-400 bg-purple-400/10'
}

export function ExportHistory({ isOpen, onClose, onQuickReExport }: ExportHistoryProps) {
  const {
    exports,
    searchQuery,
    selectedFormat,
    setSearchQuery,
    setSelectedFormat,
    removeExport,
    clearHistory,
    reDownloadExport,
    getFilteredExports
  } = useExportHistoryStore()

  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const filteredExports = useMemo(() => getFilteredExports(), [exports, searchQuery, selectedFormat, getFilteredExports])

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
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
  }, [isOpen, onClose])

  const handleClearHistory = () => {
    clearHistory()
    setShowClearConfirm(false)
    toast.success('Export history cleared')
  }

  const handleQuickReExport = (exportId: string) => {
    if (onQuickReExport) {
      onQuickReExport(exportId)
      onClose()
    } else {
      toast.error('Quick re-export is not available')
    }
  }

  const formatFilterOptions = [
    { value: 'all', label: 'All Formats' },
    { value: 'html', label: 'HTML' },
    { value: 'pdf', label: 'PDF' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'react', label: 'React' }
  ] as const

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
              <ClockIcon className="w-6 h-6 text-purple-400" />
              Export History
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({exports.length} export{exports.length !== 1 ? 's' : ''})
              </span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search exports by title, filename, or theme..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 glass-effect border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none text-sm"
                    />
                  </div>

                  {/* Format Filter */}
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as any)}
                    className="px-3 py-2 glass-effect border border-white/10 rounded-lg bg-white/5 text-white focus:border-purple-500/50 focus:outline-none text-sm min-w-[140px]"
                  >
                    {formatFilterOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* Clear History Button */}
                  {exports.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<TrashIcon className="w-4 h-4" />}
                      iconPosition="left"
                      onClick={() => setShowClearConfirm(true)}
                      className="text-red-400 border-red-400/30 hover:border-red-400/50 hover:bg-red-400/10"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Export List */}
                <div className="max-h-96 overflow-y-auto">
                  {filteredExports.length === 0 ? (
                    <div className="text-center py-12">
                      {exports.length === 0 ? (
                        <>
                          <FolderIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-400 mb-2">No exports yet</h3>
                          <p className="text-gray-500 text-sm">
                            Your export history will appear here after you export documents.
                          </p>
                        </>
                      ) : (
                        <>
                          <MagnifyingGlassIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-400 mb-2">No results found</h3>
                          <p className="text-gray-500 text-sm">
                            Try adjusting your search or filter criteria.
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredExports.map((exportItem) => {
                        const FormatIcon = formatIcons[exportItem.format]
                        return (
                          <div
                            key={exportItem.id}
                            className="glass-effect border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {/* Format Icon */}
                                <div className={`p-2 rounded-lg ${formatColors[exportItem.format]} shrink-0`}>
                                  <FormatIcon className="w-4 h-4" />
                                </div>

                                {/* Export Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-white font-medium truncate">
                                      {exportItem.title}
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${formatColors[exportItem.format]}`}>
                                      {formatLabels[exportItem.format]}
                                    </span>
                                  </div>
                                  
                                  <div className="text-sm text-gray-400 space-y-1">
                                    <div className="flex items-center gap-4">
                                      <span className="truncate">{exportItem.fileName}</span>
                                      {exportItem.fileSize && (
                                        <span className="text-gray-500">
                                          {formatFileSize(exportItem.fileSize)}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs">
                                      <span>{formatTimeAgo(exportItem.timestamp)}</span>
                                      <span>Theme: {exportItem.theme}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  icon={<SparklesIcon className="w-3 h-3" />}
                                  onClick={() => handleQuickReExport(exportItem.id)}
                                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
                                  title="Quick re-export with same settings"
                                >
                                  Re-export
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  icon={<ArrowDownTrayIcon className="w-3 h-3" />}
                                  onClick={() => reDownloadExport(exportItem.id)}
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                  title="Re-download file (if available)"
                                >
                                  Download
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  icon={<XMarkIcon className="w-3 h-3" />}
                                  onClick={() => removeExport(exportItem.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                  title="Remove from history"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    History limited to last {50} exports
                  </div>
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </div>

          {/* Clear Confirmation Modal */}
          {showClearConfirm && (
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <div className="w-full max-w-md transform overflow-hidden rounded-2xl glass-effect-dark border border-white/10 p-6 text-left align-middle shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                  <h3 className="text-lg font-medium text-white">
                    Clear Export History
                  </h3>
                </div>
                
                <p className="text-sm text-gray-400 mb-6">
                  Are you sure you want to clear all export history? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearHistory}
                    className="text-red-400 border-red-400/30 hover:border-red-400/50 hover:bg-red-400/10"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
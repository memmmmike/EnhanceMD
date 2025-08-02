import React, { useState } from 'react'
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  VariableIcon,
  FolderIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Button } from './Button'
import { Variable, Template } from '../hooks/useVariables'
import { toast } from 'react-hot-toast'

interface VariablesPanelProps {
  isOpen: boolean
  onClose: () => void
  variables: Variable[]
  templates: Template[]
  onAddVariable: (variable: Variable) => void
  onUpdateVariable: (name: string, value: string) => void
  onRemoveVariable: (name: string) => void
  onLoadTemplate: (templateId: string) => void
  onSaveTemplate: (template: Template) => void
  onDeleteTemplate: (templateId: string) => void
}

export const VariablesPanel: React.FC<VariablesPanelProps> = ({
  isOpen,
  onClose,
  variables,
  templates,
  onAddVariable,
  onUpdateVariable,
  onRemoveVariable,
  onLoadTemplate,
  onSaveTemplate,
  onDeleteTemplate
}) => {
  const [activeTab, setActiveTab] = useState<'variables' | 'templates'>('variables')
  const [newVariable, setNewVariable] = useState<Partial<Variable>>({
    type: 'text'
  })
  const [showNewVariable, setShowNewVariable] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Business']))
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  
  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'Custom'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(template)
    return acc
  }, {} as Record<string, Template[]>)
  
  const handleAddVariable = () => {
    if (!newVariable.name || !newVariable.value) {
      toast.error('Variable name and value are required')
      return
    }
    
    // Check for duplicate names
    if (variables.some(v => v.name === newVariable.name)) {
      toast.error('Variable name already exists')
      return
    }
    
    onAddVariable({
      name: newVariable.name,
      value: newVariable.value,
      type: newVariable.type || 'text',
      description: newVariable.description
    })
    
    setNewVariable({ type: 'text' })
    setShowNewVariable(false)
  }
  
  const handleLoadTemplate = (templateId: string) => {
    onLoadTemplate(templateId)
    setSelectedTemplate(templateId)
    toast.success('Template loaded!')
  }
  
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md transform overflow-hidden glass-effect-dark border-l border-white/10 shadow-xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <VariableIcon className="w-6 h-6 text-purple-400" />
            Variables & Templates
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('variables')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'variables'
                ? 'text-white border-b-2 border-purple-500 bg-white/5'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Variables ({variables.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'text-white border-b-2 border-purple-500 bg-white/5'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Templates ({templates.length})
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'variables' ? (
            <div className="space-y-4">
              {/* Add Variable Button */}
              {!showNewVariable && (
                <Button
                  variant="gradient"
                  icon={<PlusIcon className="w-4 h-4" />}
                  iconPosition="left"
                  onClick={() => setShowNewVariable(true)}
                  className="w-full"
                >
                  Add Variable
                </Button>
              )}
              
              {/* New Variable Form */}
              {showNewVariable && (
                <div className="glass-effect border border-white/10 rounded-lg p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Variable name (e.g., companyName)"
                    value={newVariable.name || ''}
                    onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                    className="w-full px-3 py-2 glass-effect border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none text-sm"
                  />
                  
                  <input
                    type="text"
                    placeholder="Default value"
                    value={newVariable.value || ''}
                    onChange={(e) => setNewVariable({ ...newVariable, value: e.target.value })}
                    className="w-full px-3 py-2 glass-effect border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none text-sm"
                  />
                  
                  <select
                    value={newVariable.type}
                    onChange={(e) => setNewVariable({ ...newVariable, type: e.target.value as Variable['type'] })}
                    className="w-full px-3 py-2 glass-effect border border-white/10 rounded-lg bg-white/5 text-white focus:border-purple-500/50 focus:outline-none text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="boolean">Boolean</option>
                    <option value="list">List (JSON)</option>
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newVariable.description || ''}
                    onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
                    className="w-full px-3 py-2 glass-effect border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none text-sm"
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={handleAddVariable}
                      className="flex-1"
                    >
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewVariable({ type: 'text' })
                        setShowNewVariable(false)
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Variables List */}
              <div className="space-y-2">
                {variables.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <VariableIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No variables defined</p>
                    <p className="text-xs mt-1">Add variables to use in your document</p>
                  </div>
                ) : (
                  variables.map((variable) => (
                    <div
                      key={variable.name}
                      className="glass-effect border border-white/10 rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <code className="text-purple-400 text-sm font-mono">
                              {`{{${variable.name}}}`}
                            </code>
                            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400">
                              {variable.type}
                            </span>
                          </div>
                          {variable.description && (
                            <p className="text-xs text-gray-400 mt-1">{variable.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => onRemoveVariable(variable.name)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {variable.type === 'boolean' ? (
                        <select
                          value={variable.value}
                          onChange={(e) => onUpdateVariable(variable.name, e.target.value)}
                          className="w-full px-2 py-1 glass-effect border border-white/10 rounded bg-white/5 text-white text-sm focus:border-purple-500/50 focus:outline-none"
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      ) : variable.type === 'date' ? (
                        <input
                          type="date"
                          value={variable.value}
                          onChange={(e) => onUpdateVariable(variable.name, e.target.value)}
                          className="w-full px-2 py-1 glass-effect border border-white/10 rounded bg-white/5 text-white text-sm focus:border-purple-500/50 focus:outline-none"
                        />
                      ) : variable.type === 'number' ? (
                        <input
                          type="number"
                          value={variable.value}
                          onChange={(e) => onUpdateVariable(variable.name, e.target.value)}
                          className="w-full px-2 py-1 glass-effect border border-white/10 rounded bg-white/5 text-white text-sm focus:border-purple-500/50 focus:outline-none"
                        />
                      ) : variable.type === 'list' ? (
                        <textarea
                          value={variable.value}
                          onChange={(e) => onUpdateVariable(variable.name, e.target.value)}
                          placeholder="JSON array format"
                          className="w-full px-2 py-1 glass-effect border border-white/10 rounded bg-white/5 text-white text-sm focus:border-purple-500/50 focus:outline-none font-mono"
                          rows={3}
                        />
                      ) : (
                        <input
                          type="text"
                          value={variable.value}
                          onChange={(e) => onUpdateVariable(variable.name, e.target.value)}
                          className="w-full px-2 py-1 glass-effect border border-white/10 rounded bg-white/5 text-white text-sm focus:border-purple-500/50 focus:outline-none"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Templates Tab */
            <div className="space-y-4">
              {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FolderIcon className="w-4 h-4" />
                      {category} ({categoryTemplates.length})
                    </div>
                    {expandedCategories.has(category) ? (
                      <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>
                  
                  {expandedCategories.has(category) && (
                    <div className="space-y-2 mt-2">
                      {categoryTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={`glass-effect border rounded-lg p-3 cursor-pointer transition-all ${
                            selectedTemplate === template.id
                              ? 'border-purple-500/50 bg-purple-500/10'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                          onClick={() => handleLoadTemplate(template.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <DocumentTextIcon className="w-4 h-4 text-purple-400" />
                                <h4 className="text-sm font-medium text-white">{template.name}</h4>
                                {selectedTemplate === template.id && (
                                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                                )}
                              </div>
                              {template.description && (
                                <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500">
                                  {template.variables.length} variables
                                </span>
                              </div>
                            </div>
                            {template.id.startsWith('user-') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteTemplate(template.id)
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors p-1"
                              >
                                <TrashIcon className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="text-xs text-gray-400 mb-3">
            Use <code className="text-purple-400">{`{{variableName}}`}</code> in your document to insert variable values.
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
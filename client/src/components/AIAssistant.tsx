import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  SparklesIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  CheckIcon,
  DocumentTextIcon,
  LightBulbIcon,
  LanguageIcon,
  PencilSquareIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { Button } from './Button'
import { toast } from 'react-hot-toast'
import { CustomAIService, CUSTOM_AI_MODELS } from '../services/customAIService'

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (text: string) => void
  selectedText: string
  currentContent: string
}

interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIFeature {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  prompt: (text: string) => string
  requiresSelection?: boolean
}

const AI_FEATURES: AIFeature[] = [
  {
    id: 'improve',
    name: 'Improve Writing',
    description: 'Enhance clarity and style',
    icon: <PencilSquareIcon className="w-5 h-5" />,
    prompt: (text) => `Improve the following text for clarity, style, and engagement while maintaining the original meaning:\n\n${text}`,
    requiresSelection: false // Changed to work with document content
  },
  {
    id: 'grammar',
    name: 'Fix Grammar',
    description: 'Correct grammar and spelling',
    icon: <LanguageIcon className="w-5 h-5" />,
    prompt: (text) => `Fix any grammar, spelling, or punctuation errors in the following text:\n\n${text}`,
    requiresSelection: false // Changed to work with document content
  },
  {
    id: 'expand',
    name: 'Expand',
    description: 'Add more detail',
    icon: <DocumentTextIcon className="w-5 h-5" />,
    prompt: (text) => `Expand the following text with more detail, examples, and explanation:\n\n${text}`,
    requiresSelection: false // Changed to work with document content
  },
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Create a concise summary',
    icon: <DocumentTextIcon className="w-5 h-5" />,
    prompt: (text) => `Create a concise summary of the following text:\n\n${text}`,
    requiresSelection: false // Changed to work with document content
  },
  {
    id: 'ideas',
    name: 'Generate Ideas',
    description: 'Get writing suggestions',
    icon: <LightBulbIcon className="w-5 h-5" />,
    prompt: (text) => text ? 
      `Generate 5 creative ideas or suggestions related to:\n\n${text}` :
      'Generate 5 creative writing ideas for a professional document',
    requiresSelection: false
  }
]


export const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen,
  onClose,
  onInsert,
  selectedText,
  currentContent
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // AI Settings
  const [settings, setSettings] = useState({
    endpoint: localStorage.getItem('enhancemd-ai-endpoint') || 'http://localhost:3001/v1/chat/completions',
    model: localStorage.getItem('enhancemd-ai-model') || 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 500,
    apiKey: localStorage.getItem('enhancemd-ai-key') || ''
  })
  
  // Initialize Custom AI Service
  const aiService = useRef(new CustomAIService(settings))
  
  // Update AI service when settings change
  useEffect(() => {
    aiService.current.updateConfig(settings)
    localStorage.setItem('enhancemd-ai-endpoint', settings.endpoint)
    localStorage.setItem('enhancemd-ai-model', settings.model)
    if (settings.apiKey) {
      localStorage.setItem('enhancemd-ai-key', settings.apiKey)
    }
  }, [settings])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleFeatureClick = useCallback(async (feature: AIFeature) => {
    // Use selected text if available, otherwise use current content
    let text = selectedText || currentContent || ''
    
    // For better AI responses, limit the text length
    if (text.length > 2000 && !selectedText) {
      // Use the last 2000 characters for context if no selection
      text = text.substring(text.length - 2000)
      toast('Using recent content for context (last 2000 characters)', {
        icon: 'ℹ️',
      })
    }
    
    if (!text && feature.id !== 'ideas') {
      toast.error('Please write some content in the editor first')
      return
    }
    
    setActiveFeature(feature.id)
    setIsProcessing(true)
    
    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `${feature.name}: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    
    try {
      let response: string
      
      // Use specific AI service methods based on feature
      switch (feature.id) {
        case 'improve':
          response = await aiService.current.improveWriting(text)
          break
        case 'grammar':
          response = await aiService.current.fixGrammar(text)
          break
        case 'expand':
          response = await aiService.current.expandText(text)
          break
        case 'summarize':
          response = await aiService.current.summarize(text)
          break
        case 'ideas':
          response = await aiService.current.generateIdeas(text)
          break
        default:
          response = await aiService.current.processRequest(feature.prompt(text))
      }
      
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      
      // Auto-insert for certain features
      if (['improve', 'grammar', 'expand'].includes(feature.id)) {
        toast.success('Click "Insert" to use this suggestion')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process request'
      toast.error(errorMessage)
      
      // Add error message to chat
      const errorMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${errorMessage}. Please check your API key and try again.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsProcessing(false)
      setActiveFeature(null)
    }
  }, [selectedText, currentContent])
  
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isProcessing) return
    
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)
    
    try {
      const response = await aiService.current.processRequest(input)
      
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      toast.error(errorMessage)
      
      // Add error message to chat
      const errorMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${errorMessage}. Please check your API key and try again.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsProcessing(false)
    }
  }, [input, isProcessing])
  
  const handleInsertMessage = useCallback((content: string) => {
    onInsert(content)
    toast.success('Content inserted into document')
  }, [onInsert])
  
  const saveSettings = useCallback(() => {
    localStorage.setItem('enhancemd-ai-key', settings.apiKey)
    toast.success('AI settings saved')
    setShowSettings(false)
  }, [settings])
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg transform overflow-hidden bg-secondary border-l border-default shadow-xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-default">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-accent-primary" />
            <h2 className="text-xl font-semibold text-primary">AI Assistant</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-tertiary hover:text-primary transition-colors"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-tertiary hover:text-primary transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="p-6 border-b border-default bg-tertiary/50">
            <h3 className="text-sm font-medium text-primary mb-4">AI Platform Settings</h3>
            <div className="space-y-4">
              <div className="p-3 bg-accent-primary/10 border border-accent-primary/30 rounded-lg">
                <p className="text-sm text-accent-primary font-medium">🔌 Configure Your AI Service</p>
                <p className="text-xs text-tertiary mt-1">
                  Connect to your AI platform or proxy service
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-secondary mb-1">AI Service Endpoint</label>
                <input
                  type="text"
                  value={settings.endpoint}
                  onChange={(e) => setSettings({ ...settings, endpoint: e.target.value })}
                  placeholder="http://localhost:3001/v1/chat/completions"
                  className="w-full px-3 py-2 bg-secondary border border-default rounded-lg text-primary placeholder-muted focus:border-accent-primary focus:outline-none text-sm font-mono"
                />
                <p className="text-xs text-tertiary mt-1">
                  OpenAI-compatible endpoint (OpenRouter, No Diamond, etc.)
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-secondary mb-1">API Key (Optional)</label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  placeholder="Your API key (if required)"
                  className="w-full px-3 py-2 bg-secondary border border-default rounded-lg text-primary placeholder-muted focus:border-accent-primary focus:outline-none text-sm"
                />
                <p className="text-xs text-tertiary mt-1">
                  Some services require authentication
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-secondary mb-1">AI Model</label>
                <select
                  value={settings.model}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-default rounded-lg text-primary focus:border-accent-primary focus:outline-none text-sm"
                >
                  {Object.entries(CUSTOM_AI_MODELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <p className="text-xs text-tertiary mt-1">
                  Select the model your service provides
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-secondary mb-1">
                  Creativity: {settings.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={saveSettings}
                  className="flex-1"
                >
                  Save Settings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    // Test the connection
                    const result = await aiService.current.testConnection()
                    if (result.success) {
                      toast.success(`Connected! ${result.message}`)
                    } else {
                      toast.error(`Connection failed: ${result.message}`)
                    }
                  }}
                  className="flex-1"
                >
                  Test Connection
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="p-4 border-b border-default">
          <div className="grid grid-cols-2 gap-2">
            {AI_FEATURES.map((feature) => (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature)}
                disabled={isProcessing}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                  activeFeature === feature.id
                    ? 'bg-accent-primary text-white border-accent-primary'
                    : isProcessing
                    ? 'bg-tertiary/50 text-muted border-default cursor-not-allowed'
                    : 'bg-secondary border-default text-primary hover:border-accent-primary'
                }`}
              >
                {activeFeature === feature.id && isProcessing ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  feature.icon
                )}
                <span className="flex-1 text-left">
                  <div className="font-medium">{feature.name}</div>
                  <div className="text-xs opacity-80">{feature.description}</div>
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-accent-primary opacity-50" />
              <p className="text-secondary">
                Select text and choose an AI feature, or type a message below
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-accent-primary text-white'
                      : 'bg-tertiary text-primary border border-default'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => handleInsertMessage(message.content)}
                      className="mt-2 flex items-center gap-1 text-xs opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <CheckIcon className="w-3 h-3" />
                      Insert into document
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-default">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Ask AI for help..."
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-tertiary border border-default rounded-lg text-primary placeholder-muted focus:border-accent-primary focus:outline-none"
            />
            <Button
              variant="gradient"
              onClick={handleSendMessage}
              disabled={!input.trim() || isProcessing}
              icon={
                isProcessing ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="w-5 h-5" />
                )
              }
            />
          </div>
          
          <p className="mt-2 text-xs text-accent-primary">
            Endpoint: {settings.endpoint.replace(/^https?:\/\//, '').substring(0, 30)}...
          </p>
        </div>
      </div>
    </div>
  )
}
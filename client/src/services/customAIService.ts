// Custom AI Service for connecting to your own AI platform
// This can connect to OpenRouter, No Diamond, or any OpenAI-compatible endpoint

interface CustomAIConfig {
  endpoint: string
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

interface ChatCompletionResponse {
  id?: string
  object?: string
  created?: number
  model?: string
  choices: {
    index: number
    message: ChatMessage
    finish_reason?: string
  }[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Default models that most OpenAI-compatible services support
export const CUSTOM_AI_MODELS = {
  // Your platform models - update these based on what you provide
  'gpt-3.5-turbo': 'GPT-3.5 Turbo (Fast, Balanced)',
  'gpt-4': 'GPT-4 (Advanced)',
  'claude-3-haiku': 'Claude 3 Haiku (Fast)',
  'claude-3-sonnet': 'Claude 3 Sonnet (Balanced)',
  'llama-3-8b': 'Llama 3 8B (Open Source)',
  'mixtral-8x7b': 'Mixtral 8x7B (Open Source)',
  'custom': 'Custom Model (Your Choice)',
}

export class CustomAIService {
  private config: CustomAIConfig
  
  constructor(config: Partial<CustomAIConfig> = {}) {
    // Default to localhost for development, can be changed to any endpoint
    this.config = {
      endpoint: config.endpoint || localStorage.getItem('enhancemd-ai-endpoint') || 'http://localhost:3001/v1/chat/completions',
      apiKey: config.apiKey || localStorage.getItem('enhancemd-ai-key') || '',
      model: config.model || localStorage.getItem('enhancemd-ai-model') || 'gpt-3.5-turbo',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens || 500
    }
  }
  
  private async makeRequest(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
    try {
      // Add system prompt if provided
      const allMessages: ChatMessage[] = systemPrompt 
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages
      
      const request: ChatCompletionRequest = {
        model: this.config.model || 'gpt-3.5-turbo',
        messages: allMessages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: false
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // Add API key if provided (some services require it, some don't)
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`
      }
      
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      })
      
      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.error?.message || errorData.message || errorMessage
        } catch {
          // If not JSON, try text
          try {
            errorMessage = await response.text()
          } catch {
            // Use default error message
          }
        }
        
        throw new Error(errorMessage)
      }
      
      const data: ChatCompletionResponse = await response.json()
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content
      }
      
      throw new Error('No response generated')
    } catch (error) {
      console.error('Custom AI Service Error:', error)
      
      // Check if it's a network error (service not running)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('AI service not reachable. Please ensure your AI platform is running at: ' + this.config.endpoint)
      }
      
      throw error
    }
  }
  
  async processRequest(prompt: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'user', content: prompt }
    ]
    return this.makeRequest(messages)
  }
  
  async improveWriting(text: string): Promise<string> {
    const messages: ChatMessage[] = [
      { 
        role: 'user', 
        content: `Improve the following text for clarity, style, and engagement while maintaining the original meaning:\n\n${text}\n\nProvide only the improved text without any explanation.`
      }
    ]
    return this.makeRequest(messages, 'You are a professional editor. Improve text while preserving the author\'s voice.')
  }
  
  async fixGrammar(text: string): Promise<string> {
    const messages: ChatMessage[] = [
      { 
        role: 'user', 
        content: `Fix any grammar, spelling, or punctuation errors in the following text:\n\n${text}\n\nProvide only the corrected text without any explanation.`
      }
    ]
    return this.makeRequest(messages, 'You are a grammar expert. Fix errors while maintaining the original meaning.')
  }
  
  async expandText(text: string): Promise<string> {
    const messages: ChatMessage[] = [
      { 
        role: 'user', 
        content: `Expand the following text with more detail, examples, and explanation:\n\n${text}\n\nProvide an expanded version that is 2-3 times longer.`
      }
    ]
    return this.makeRequest(messages, 'You are a content writer. Expand text with relevant details and examples.')
  }
  
  async summarize(text: string): Promise<string> {
    const messages: ChatMessage[] = [
      { 
        role: 'user', 
        content: `Summarize the following text in 2-3 concise sentences:\n\n${text}\n\nProvide only the summary without any introduction.`
      }
    ]
    return this.makeRequest(messages, 'You are an expert at creating concise summaries.')
  }
  
  async generateIdeas(topic: string): Promise<string> {
    const messages: ChatMessage[] = [
      { 
        role: 'user', 
        content: topic 
          ? `Generate 5 creative ideas about "${topic}". Format as a numbered list.`
          : 'Generate 5 creative writing ideas for a professional document. Format as a numbered list.'
      }
    ]
    return this.makeRequest(messages, 'You are a creative writing assistant. Generate unique and practical ideas.')
  }
  
  async continueWriting(text: string): Promise<string> {
    const messages: ChatMessage[] = [
      { 
        role: 'user', 
        content: `Continue writing from where this text ends. Add 2-3 paragraphs that flow naturally:\n\n${text}\n\nContinue:`
      }
    ]
    return this.makeRequest(messages, 'You are a skilled writer. Continue text in the same style and tone.')
  }
  
  async generateOutline(topic: string): Promise<string> {
    const messages: ChatMessage[] = [
      { 
        role: 'user', 
        content: `Create a detailed outline for a document about "${topic}". Use markdown formatting with proper headings and subpoints.`
      }
    ]
    return this.makeRequest(messages, 'You are an expert at structuring documents. Create comprehensive outlines.')
  }
  
  async rephrase(text: string, tone: string = 'formal'): Promise<string> {
    const messages: ChatMessage[] = [
      { 
        role: 'user', 
        content: `Rephrase the following text in a ${tone} tone:\n\n${text}\n\nProvide only the rephrased text.`
      }
    ]
    return this.makeRequest(messages, `You are a writing expert. Rephrase text to match the requested tone.`)
  }
  
  async translate(text: string, targetLang: string): Promise<string> {
    const messages: ChatMessage[] = [
      { 
        role: 'user', 
        content: `Translate the following English text to ${targetLang}:\n\n${text}\n\nProvide only the translation.`
      }
    ]
    return this.makeRequest(messages, 'You are a professional translator. Provide accurate translations.')
  }
  
  updateConfig(config: Partial<CustomAIConfig>) {
    this.config = { ...this.config, ...config }
    
    // Save to localStorage for persistence
    if (config.endpoint) {
      localStorage.setItem('enhancemd-ai-endpoint', config.endpoint)
    }
    if (config.apiKey !== undefined) {
      localStorage.setItem('enhancemd-ai-key', config.apiKey)
    }
    if (config.model) {
      localStorage.setItem('enhancemd-ai-model', config.model)
    }
  }
  
  getConfig(): CustomAIConfig {
    return { ...this.config }
  }
  
  isConfigured(): boolean {
    return !!this.config.endpoint
  }
  
  // Test connection to the AI service
  async testConnection(): Promise<{ success: boolean; message: string; model?: string }> {
    try {
      const response = await this.processRequest('Say "Hello, EnhanceMD is connected!" in exactly 5 words.')
      return {
        success: true,
        message: response,
        model: this.config.model
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      }
    }
  }
}
import { AIService } from './aiService'
import { HuggingFaceService } from './huggingfaceService'

export type AIProvider = 'openai' | 'huggingface' | 'none'

interface UnifiedAIConfig {
  provider: AIProvider
  openai?: {
    apiKey: string
    model: string
    temperature: number
    maxTokens: number
  }
  huggingface?: {
    apiKey: string
    model: string
    temperature: number
    maxTokens: number
  }
}

export class UnifiedAIService {
  private provider: AIProvider
  private openaiService: AIService | null = null
  private huggingfaceService: HuggingFaceService | null = null
  
  constructor() {
    // Load saved configuration
    const savedProvider = localStorage.getItem('enhancemd-ai-provider') as AIProvider || 'none'
    this.provider = savedProvider
    
    // Initialize services based on saved config
    if (savedProvider === 'openai') {
      const apiKey = localStorage.getItem('enhancemd-ai-key') || ''
      this.openaiService = new AIService({ apiKey })
    } else if (savedProvider === 'huggingface') {
      const apiKey = localStorage.getItem('enhancemd-hf-key') || ''
      this.huggingfaceService = new HuggingFaceService({ apiKey })
    }
  }
  
  setProvider(provider: AIProvider, config?: any) {
    this.provider = provider
    localStorage.setItem('enhancemd-ai-provider', provider)
    
    if (provider === 'openai' && config) {
      this.openaiService = new AIService(config)
      if (config.apiKey) {
        localStorage.setItem('enhancemd-ai-key', config.apiKey)
      }
    } else if (provider === 'huggingface' && config) {
      this.huggingfaceService = new HuggingFaceService(config)
      if (config.apiKey) {
        localStorage.setItem('enhancemd-hf-key', config.apiKey)
      }
    }
  }
  
  getProvider(): AIProvider {
    return this.provider
  }
  
  isConfigured(): boolean {
    if (this.provider === 'none') return false
    if (this.provider === 'openai') return !!localStorage.getItem('enhancemd-ai-key')
    if (this.provider === 'huggingface') return !!localStorage.getItem('enhancemd-hf-key')
    return false
  }
  
  private getActiveService() {
    if (this.provider === 'openai' && this.openaiService) {
      return this.openaiService
    } else if (this.provider === 'huggingface' && this.huggingfaceService) {
      return this.huggingfaceService
    }
    throw new Error('No AI provider configured. Please set up OpenAI or Hugging Face in settings.')
  }
  
  // Proxy all methods to the active service
  async processRequest(prompt: string): Promise<string> {
    return this.getActiveService().processRequest(prompt)
  }
  
  async improveWriting(text: string): Promise<string> {
    return this.getActiveService().improveWriting(text)
  }
  
  async fixGrammar(text: string): Promise<string> {
    return this.getActiveService().fixGrammar(text)
  }
  
  async expandText(text: string): Promise<string> {
    return this.getActiveService().expandText(text)
  }
  
  async summarize(text: string): Promise<string> {
    return this.getActiveService().summarize(text)
  }
  
  async generateIdeas(topic: string): Promise<string> {
    return this.getActiveService().generateIdeas(topic)
  }
  
  async generateOutline(topic: string): Promise<string> {
    return this.getActiveService().generateOutline(topic)
  }
  
  async continueWriting(text: string): Promise<string> {
    return this.getActiveService().continueWriting(text)
  }
  
  async rephrase(text: string, tone: 'formal' | 'casual' | 'technical' | 'creative' = 'formal'): Promise<string> {
    return this.getActiveService().rephrase(text, tone)
  }
  
  async translateTo(text: string, language: string): Promise<string> {
    return this.getActiveService().translateTo(text, language)
  }
  
  async generateTitle(content: string): Promise<string> {
    const service = this.getActiveService()
    if ('generateTitle' in service) {
      return service.generateTitle(content)
    }
    // Fallback for services without generateTitle
    const prompt = `Generate a compelling title for this content: ${content.substring(0, 200)}`
    return service.processRequest(prompt)
  }
  
  async generateConclusion(content: string): Promise<string> {
    const service = this.getActiveService()
    if ('generateConclusion' in service) {
      return service.generateConclusion(content)
    }
    // Fallback
    const prompt = `Write a conclusion paragraph for: ${content.substring(0, 500)}`
    return service.processRequest(prompt)
  }
  
  updateConfig(provider: AIProvider, config: any) {
    this.setProvider(provider, config)
  }
  
  getConfig() {
    if (this.provider === 'openai' && this.openaiService) {
      return {
        provider: 'openai',
        ...this.openaiService.getConfig()
      }
    } else if (this.provider === 'huggingface' && this.huggingfaceService) {
      return {
        provider: 'huggingface',
        ...this.huggingfaceService.getConfig()
      }
    }
    return { provider: 'none' }
  }
}
interface AIConfig {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
}

export class AIService {
  private config: AIConfig
  
  constructor(config: Partial<AIConfig> = {}) {
    this.config = {
      apiKey: config.apiKey || localStorage.getItem('enhancemd-ai-key') || '',
      model: config.model || 'gpt-3.5-turbo',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens || 500
    }
  }
  
  async processRequest(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Please add your OpenAI API key in settings')
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful writing assistant. Provide clear, concise, and helpful responses for improving and enhancing markdown documents.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'AI request failed')
      }
      
      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('AI Service Error:', error)
      throw error
    }
  }
  
  async improveWriting(text: string): Promise<string> {
    const prompt = `Improve the following text for clarity, style, and engagement while maintaining the original meaning:\n\n${text}`
    return this.processRequest(prompt)
  }
  
  async fixGrammar(text: string): Promise<string> {
    const prompt = `Fix any grammar, spelling, or punctuation errors in the following text. Return only the corrected text:\n\n${text}`
    return this.processRequest(prompt)
  }
  
  async expandText(text: string): Promise<string> {
    const prompt = `Expand the following text with more detail, examples, and explanation while maintaining the same tone and style:\n\n${text}`
    return this.processRequest(prompt)
  }
  
  async summarize(text: string): Promise<string> {
    const prompt = `Create a concise summary of the following text, capturing the key points:\n\n${text}`
    return this.processRequest(prompt)
  }
  
  async generateIdeas(topic: string): Promise<string> {
    const prompt = topic ? 
      `Generate 5 creative ideas or suggestions related to: ${topic}` :
      'Generate 5 creative writing ideas for a professional document'
    return this.processRequest(prompt)
  }
  
  async generateOutline(topic: string): Promise<string> {
    const prompt = `Create a detailed outline for a document about: ${topic}\n\nFormat the outline in markdown with proper heading levels.`
    return this.processRequest(prompt)
  }
  
  async continueWriting(text: string): Promise<string> {
    const prompt = `Continue writing from where this text leaves off, maintaining the same tone, style, and topic:\n\n${text}\n\nContinue:`
    return this.processRequest(prompt)
  }
  
  async rephrase(text: string, tone: 'formal' | 'casual' | 'technical' | 'creative' = 'formal'): Promise<string> {
    const toneDescriptions = {
      formal: 'professional and formal',
      casual: 'casual and conversational',
      technical: 'technical and precise',
      creative: 'creative and engaging'
    }
    
    const prompt = `Rephrase the following text in a ${toneDescriptions[tone]} tone:\n\n${text}`
    return this.processRequest(prompt)
  }
  
  async translateTo(text: string, language: string): Promise<string> {
    const prompt = `Translate the following text to ${language}:\n\n${text}`
    return this.processRequest(prompt)
  }
  
  async generateTitle(content: string): Promise<string> {
    const prompt = `Generate a compelling title for a document with the following content (provide only the title, no explanation):\n\n${content.substring(0, 500)}`
    return this.processRequest(prompt)
  }
  
  async checkFacts(text: string): Promise<string> {
    const prompt = `Review the following text for factual accuracy and suggest corrections if needed:\n\n${text}`
    return this.processRequest(prompt)
  }
  
  async generateConclusion(content: string): Promise<string> {
    const prompt = `Write a strong conclusion paragraph for a document with the following content:\n\n${content.substring(0, 1000)}`
    return this.processRequest(prompt)
  }
  
  updateConfig(config: Partial<AIConfig>) {
    this.config = { ...this.config, ...config }
    if (config.apiKey) {
      localStorage.setItem('enhancemd-ai-key', config.apiKey)
    }
  }
  
  getConfig(): AIConfig {
    return { ...this.config }
  }
}
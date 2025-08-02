interface HuggingFaceConfig {
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
  useLocalFallback?: boolean
}

// Available AI models and processing options
export const HUGGINGFACE_MODELS = {
  // Local processing (no API required)
  'local': 'Local Processing (No API, Basic)',
  // These require HF Pro subscription or credits
  'HuggingFaceTB/SmolLM3-3B': 'SmolLM3 3B (Requires HF Credits)',
  'meta-llama/Meta-Llama-3-8B-Instruct': 'Llama 3 8B (Requires HF Credits)',
}

export class HuggingFaceService {
  private config: HuggingFaceConfig
  private baseUrl = 'https://router.huggingface.co/v1/chat/completions'
  
  constructor(config: Partial<HuggingFaceConfig> = {}) {
    this.config = {
      apiKey: config.apiKey || localStorage.getItem('enhancemd-hf-key') || '',
      model: config.model || 'local',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens || 500,
      useLocalFallback: config.useLocalFallback ?? true
    }
  }
  
  private async query(prompt: string, model?: string): Promise<any> {
    const modelToUse = model || this.config.model
    
    // New API requires authentication
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`
    }
    
    // Use chat completions format
    const payload = {
      model: modelToUse,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      stream: false
    }
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      // Try to parse error response
      let errorMessage = `Request failed with status ${response.status}`
      
      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json()
          
          // Handle common errors from new API
          if (error.error?.message?.includes('not supported')) {
            throw new Error('This model is not available. Please select a different model from settings.')
          }
          
          if (error.error?.message?.includes('Invalid username or password')) {
            throw new Error('Invalid API key. Please check your Hugging Face token in settings.')
          }
          
          if (error.error?.message?.includes('rate limit')) {
            throw new Error('Rate limit reached. Please wait a moment and try again.')
          }
          
          errorMessage = error.error?.message || error.error || errorMessage
        } else {
          // If not JSON, it might be HTML error page
          const text = await response.text()
          console.error('Non-JSON response:', text.substring(0, 200))
          
          if (response.status === 404) {
            throw new Error('API endpoint not found. The service may be temporarily unavailable.')
          }
        }
      } catch (e) {
        console.error('Error parsing response:', e)
      }
      
      if (response.status === 503) {
        throw new Error('Model is starting up. This usually takes 10-20 seconds for free models.')
      }
      
      throw new Error(errorMessage)
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Non-JSON success response:', text.substring(0, 200))
      throw new Error('Invalid response format from Hugging Face API')
    }
    
    return response.json()
  }
  
  async processRequest(prompt: string): Promise<string> {
    // Use local processing if selected or as fallback
    if (this.config.model === 'local' || this.config.useLocalFallback) {
      try {
        if (this.config.model !== 'local') {
          // Try API first if not explicitly local
          const result = await this.query(prompt)
          
          // Extract text from chat completion response
          if (result.choices && result.choices.length > 0) {
            return result.choices[0].message?.content || 'No response generated'
          }
          
          // Fallback for other response formats
          if (result.generated_text) {
            return result.generated_text
          }
        }
      } catch (error) {
        console.log('API failed, using local processing fallback')
      }
      
      // Local processing fallback
      return this.localProcessing(prompt)
    }
    
    try {
      const result = await this.query(prompt)
      
      // Extract text from chat completion response
      if (result.choices && result.choices.length > 0) {
        return result.choices[0].message?.content || 'No response generated'
      }
      
      // Fallback for other response formats
      if (result.generated_text) {
        return result.generated_text
      }
      
      return 'No response generated'
    } catch (error) {
      console.error('Hugging Face Error:', error)
      throw error
    }
  }
  
  private localProcessing(prompt: string): string {
    // Basic local text processing without external AI
    // This provides fallback functionality when API is unavailable
    
    const lowercasePrompt = prompt.toLowerCase()
    
    if (lowercasePrompt.includes('improve') || lowercasePrompt.includes('enhance')) {
      return this.localImproveText(prompt)
    }
    
    if (lowercasePrompt.includes('grammar') || lowercasePrompt.includes('spelling')) {
      return this.localCheckGrammar(prompt)
    }
    
    if (lowercasePrompt.includes('summarize') || lowercasePrompt.includes('summary')) {
      return this.localSummarize(prompt)
    }
    
    if (lowercasePrompt.includes('expand') || lowercasePrompt.includes('elaborate')) {
      return this.localExpand(prompt)
    }
    
    if (lowercasePrompt.includes('idea') || lowercasePrompt.includes('suggest')) {
      return this.localGenerateIdeas(prompt)
    }
    
    if (lowercasePrompt.includes('continue') || lowercasePrompt.includes('next')) {
      return this.localContinue(prompt)
    }
    
    if (lowercasePrompt.includes('outline') || lowercasePrompt.includes('structure')) {
      return this.localOutline(prompt)
    }
    
    if (lowercasePrompt.includes('rephrase') || lowercasePrompt.includes('rewrite')) {
      return this.localRephrase(prompt)
    }
    
    return "I'm using local processing. Try commands like 'improve', 'fix grammar', 'summarize', 'expand', or 'generate ideas' for basic text assistance."
  }
  
  private localImproveText(prompt: string): string {
    const text = this.extractTextFromPrompt(prompt)
    
    // Basic text improvements
    let improved = text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/([.!?])\s*([a-z])/g, (_, p1, p2) => `${p1} ${p2.toUpperCase()}`) // Capitalize after sentences
      .replace(/^\s*([a-z])/g, (_, p1) => p1.toUpperCase()) // Capitalize first letter
      .trim()
    
    // Add some variety to sentence structure suggestions
    const suggestions = [
      '\n\nSuggestions for improvement:',
      '• Consider varying sentence length for better rhythm',
      '• Add transitional phrases between paragraphs',
      '• Use more specific and descriptive words',
      '• Check for repetitive word usage',
    ].join('\n')
    
    return `${improved}${suggestions}`
  }
  
  private localCheckGrammar(prompt: string): string {
    const text = this.extractTextFromPrompt(prompt)
    const issues: string[] = []
    
    // Basic grammar checks
    if (text.match(/\s{2,}/)) {
      issues.push('• Multiple consecutive spaces detected')
    }
    
    if (text.match(/[a-z]\s*[.!?]\s*[a-z]/)) {
      issues.push('• Missing capitalization after punctuation')
    }
    
    if (!text.trim().match(/[.!?]$/)) {
      issues.push('• Missing ending punctuation')
    }
    
    if (text.match(/\b(teh|recieve|occured|seperate|definately)\b/i)) {
      issues.push('• Common spelling errors detected')
    }
    
    // Provide corrected version
    let corrected = text
      .replace(/\s+/g, ' ')
      .replace(/\bteh\b/gi, 'the')
      .replace(/\brecieve\b/gi, 'receive')
      .replace(/\boccured\b/gi, 'occurred')
      .replace(/\bseperate\b/gi, 'separate')
      .replace(/\bdefinately\b/gi, 'definitely')
      .replace(/([.!?])\s*([a-z])/g, (_, p1, p2) => `${p1} ${p2.toUpperCase()}`)
    
    if (!corrected.match(/[.!?]$/)) {
      corrected += '.'
    }
    
    if (issues.length > 0) {
      return `Corrected text:\n${corrected}\n\nIssues found:\n${issues.join('\n')}`
    }
    
    return `Text appears grammatically correct:\n${corrected}`
  }
  
  private localSummarize(prompt: string): string {
    const text = this.extractTextFromPrompt(prompt)
    
    // Basic summarization: extract key sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || []
    
    if (sentences.length <= 2) {
      return `Summary: ${text}`
    }
    
    // Take first and last sentence, plus one from middle
    const summary = [
      sentences[0],
      sentences[Math.floor(sentences.length / 2)],
      sentences[sentences.length - 1]
    ].join(' ').trim()
    
    return `Summary:\n${summary}\n\nKey points:\n• ${sentences.length} sentences condensed\n• Main ideas preserved\n• Details removed for brevity`
  }
  
  private localExpand(prompt: string): string {
    const text = this.extractTextFromPrompt(prompt)
    
    return `${text}\n\nTo expand this content, consider adding:\n\n• **Background Context**: Provide historical or situational context\n• **Detailed Examples**: Include specific cases or scenarios\n• **Supporting Evidence**: Add statistics, quotes, or research findings\n• **Different Perspectives**: Explore various viewpoints on the topic\n• **Implications**: Discuss consequences and future considerations\n• **Visual Elements**: Consider adding diagrams or illustrations\n• **Transitions**: Connect ideas with smooth transitional phrases`
  }
  
  private localGenerateIdeas(prompt: string): string {
    const topic = this.extractTopicFromPrompt(prompt) || 'your document'
    
    return `Creative ideas for ${topic}:\n\n1. **Opening Hook**: Start with a surprising fact or compelling question\n2. **Personal Story**: Include a relevant anecdote or case study\n3. **Comparison**: Draw parallels with familiar concepts\n4. **Problem-Solution**: Present challenges and potential solutions\n5. **Future Vision**: Describe potential future scenarios\n6. **Interactive Elements**: Add questions for reader reflection\n7. **Visual Metaphors**: Use imagery to explain complex ideas\n8. **Call to Action**: End with clear next steps for readers`
  }
  
  private localContinue(prompt: string): string {
    const text = this.extractTextFromPrompt(prompt)
    const lastSentence = text.match(/[^.!?]+[.!?]+$/)?.[0] || text
    
    return `${text}\n\nTo continue from here, consider:\n\n• What follows logically from "${lastSentence.substring(0, 50)}..."?\n• What questions might readers have at this point?\n• What examples would illustrate your point?\n• What counterarguments should be addressed?\n• What transition would smoothly lead to the next section?`
  }
  
  private localOutline(prompt: string): string {
    const topic = this.extractTopicFromPrompt(prompt) || 'Your Topic'
    
    return `# Outline: ${topic}\n\n## I. Introduction\n   A. Hook/Opening\n   B. Background Context\n   C. Thesis Statement\n   D. Preview of Main Points\n\n## II. Main Body\n   A. First Main Point\n      1. Supporting evidence\n      2. Examples\n      3. Analysis\n   B. Second Main Point\n      1. Supporting evidence\n      2. Examples\n      3. Analysis\n   C. Third Main Point\n      1. Supporting evidence\n      2. Examples\n      3. Analysis\n\n## III. Counterarguments\n   A. Opposing Views\n   B. Rebuttals\n\n## IV. Conclusion\n   A. Summary of Main Points\n   B. Restate Thesis\n   C. Call to Action\n   D. Final Thought`
  }
  
  private localRephrase(prompt: string): string {
    const text = this.extractTextFromPrompt(prompt)
    const tone = prompt.match(/\b(formal|casual|technical|creative|professional)\b/i)?.[0] || 'formal'
    
    const toneGuide = {
      formal: 'Use professional language, complete sentences, and avoid contractions',
      casual: 'Use conversational tone, contractions, and simpler words',
      technical: 'Use precise terminology and detailed explanations',
      creative: 'Use vivid descriptions, metaphors, and varied sentence structure',
      professional: 'Use clear, concise language appropriate for business'
    }
    
    return `Original: ${text}\n\nFor a ${tone} tone:\n${toneGuide[tone.toLowerCase()] || toneGuide.formal}\n\nConsider rephrasing to:\n• Adjust vocabulary level\n• Modify sentence structure\n• Change voice (active/passive)\n• Alter formality level`
  }
  
  private extractTextFromPrompt(prompt: string): string {
    // Extract the actual text after common patterns
    const patterns = [
      /(?:improve|fix|expand|summarize|continue|rephrase)[^:]*:\s*([\s\S]+)/i,
      /(?:following text|this text)[^:]*:\s*([\s\S]+)/i,
      /\n\n([\s\S]+)$/,
    ]
    
    for (const pattern of patterns) {
      const match = prompt.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }
    
    // If no pattern matches, assume the whole prompt is the text
    return prompt.trim()
  }
  
  private extractTopicFromPrompt(prompt: string): string | null {
    // Extract topic from patterns like 'about "topic"' or 'for topic'
    const patterns = [
      /(?:about|for|regarding|on)\s+["']([^"']+)["']/i,
      /(?:ideas|outline|structure)\s+(?:about|for|regarding|on)\s+([\w\s]+)/i,
      /["']([^"']+)["']/,
    ]
    
    for (const pattern of patterns) {
      const match = prompt.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }
    
    return null
  }
  
  
  async improveWriting(text: string): Promise<string> {
    const prompt = `Improve the following text for clarity and style. Make it more engaging while keeping the same meaning:

${text}

Improved version:`
    return this.processRequest(prompt)
  }
  
  async fixGrammar(text: string): Promise<string> {
    const prompt = `Fix any grammar and spelling errors in this text:

${text}

Corrected text:`
    return this.processRequest(prompt)
  }
  
  async expandText(text: string): Promise<string> {
    const prompt = `Expand this text with more details and examples:

${text}

Expanded version:`
    return this.processRequest(prompt)
  }
  
  async summarize(text: string): Promise<string> {
    const prompt = `Summarize this text in a few sentences:

${text}

Summary:`
    return this.processRequest(prompt)
  }
  
  async generateIdeas(topic: string): Promise<string> {
    const prompt = topic ? 
      `Generate 5 creative ideas about "${topic}". List them as bullet points:` :
      'Generate 5 creative writing ideas for a professional document. List them as bullet points:'
    return this.processRequest(prompt)
  }
  
  async continueWriting(text: string): Promise<string> {
    const prompt = `Continue writing from where this text ends:

${text}

Continuation:`
    return this.processRequest(prompt)
  }
  
  async generateOutline(topic: string): Promise<string> {
    const prompt = `Create a detailed outline for a document about "${topic}". Use markdown formatting with proper headings:`
    return this.processRequest(prompt)
  }
  
  async rephrase(text: string, tone: string = 'formal'): Promise<string> {
    const toneDescriptions = {
      formal: 'professional and formal',
      casual: 'casual and friendly',
      technical: 'technical and precise',
      creative: 'creative and engaging'
    }
    
    const prompt = `Rephrase this text in a ${toneDescriptions[tone] || tone} tone:

${text}

Rephrased:`
    return this.processRequest(prompt)
  }
  
  async translate(text: string, targetLang: string): Promise<string> {
    const prompt = `Translate this English text to ${targetLang}:

${text}

Translation:`
    return this.processRequest(prompt)
  }
  
  updateConfig(config: Partial<HuggingFaceConfig>) {
    this.config = { ...this.config, ...config }
    if (config.apiKey) {
      localStorage.setItem('enhancemd-hf-key', config.apiKey)
    }
  }
  
  getConfig(): HuggingFaceConfig {
    return { ...this.config }
  }
  
  isConfigured(): boolean {
    return !!this.config.apiKey
  }
}
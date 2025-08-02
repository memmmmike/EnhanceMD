// Test Hugging Face API with new endpoint
export async function testHuggingFaceAPI() {
  // Get token from environment or localStorage
  const token = localStorage.getItem('enhancemd-hf-key') || ''
  
  if (!token) {
    console.error('No Hugging Face token found. Set one in AI Assistant settings.')
    return
  }
  
  // Test different models
  const modelsToTest = [
    'HuggingFaceTB/SmolLM3-3B',
    'meta-llama/Llama-3.2-1B-Instruct',
    'meta-llama/Llama-3.2-3B-Instruct',
    'meta-llama/Meta-Llama-3-8B-Instruct',
    'google/gemma-2-2b-it',
  ]
  
  console.log('Testing Hugging Face API...')
  
  for (const model of modelsToTest) {
    console.log(`\nTesting model: ${model}`)
    
    try {
      const response = await fetch(
        'https://router.huggingface.co/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: 'Hello, how are you?'
              }
            ],
            max_tokens: 50,
            temperature: 0.7,
            stream: false
          })
        }
      )
      
      console.log(`Response status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ SUCCESS:', data)
        return { model, success: true, data }
      } else {
        const text = await response.text()
        console.log('❌ FAILED:', text)
      }
    } catch (error) {
      console.log('❌ ERROR:', error)
    }
  }
  
  console.log('\n\nAll models failed. This might be a token issue or API limitation.')
}

// Add to window for easy testing
if (typeof window !== 'undefined') {
  (window as any).testHF = testHuggingFaceAPI
}
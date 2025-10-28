/**
 * Unified AI Client - Works in development and production
 * Automatically routes to best available provider
 */

interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIParams {
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}

/**
 * Together.ai client (recommended for production)
 */
async function callTogether(params: AIParams): Promise<string> {
  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      messages: params.messages,
      temperature: params.temperature || 0.7,
      max_tokens: params.maxTokens || 2000
    })
  })

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Ollama client (local development)
 */
async function callOllama(params: AIParams): Promise<string> {
  const { createOllamaCompletion } = await import('./ollama-client')
  return createOllamaCompletion(params)
}

/**
 * OpenAI client (fallback)
 */
async function callOpenAI(params: AIParams): Promise<string> {
  const { createChatCompletion } = await import('./openai')
  return createChatCompletion(params)
}

/**
 * Main AI completion function - automatically selects best provider
 */
export async function createAICompletion(params: AIParams): Promise<string> {
  const provider = process.env.AI_PROVIDER || 'auto'

  try {
    switch (provider) {
      case 'together':
        return await callTogether(params)
      
      case 'ollama':
        return await callOllama(params)
      
      case 'openai':
        return await callOpenAI(params)
      
      case 'auto':
      default:
        // Auto-detect best provider
        if (process.env.TOGETHER_API_KEY) {
          return await callTogether(params)
        }
        if (process.env.USE_OLLAMA === 'true') {
          try {
            return await callOllama(params)
          } catch {
            console.warn('Ollama unavailable, falling back to OpenAI')
          }
        }
        return await callOpenAI(params)
    }
  } catch (error) {
    console.error(`AI provider ${provider} failed:`, error)
    
    // Fallback chain
    if (provider !== 'openai') {
      console.log('Falling back to OpenAI')
      return await callOpenAI(params)
    }
    
    throw error
  }
}

/**
 * Check which provider will be used
 */
export function getActiveProvider(): string {
  if (process.env.AI_PROVIDER) {
    return process.env.AI_PROVIDER
  }
  if (process.env.TOGETHER_API_KEY) {
    return 'together'
  }
  if (process.env.USE_OLLAMA === 'true') {
    return 'ollama'
  }
  return 'openai'
}
/**
 * Ollama Client - Local AI model integration
 * Use fine-tuned Porter models running locally
 */

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OllamaResponse {
  model: string
  created_at: string
  message: {
    role: string
    content: string
  }
  done: boolean
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'porter-strategist'

/**
 * Call Ollama API for chat completion
 */
export async function createOllamaCompletion(params: {
  messages: OllamaMessage[]
  temperature?: number
  maxTokens?: number
}): Promise<string> {
  const { messages, temperature = 0.7, maxTokens = 2000 } = params

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: {
          temperature,
          num_predict: maxTokens
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data: OllamaResponse = await response.json()
    return data.message.content
  } catch (error) {
    console.error('Ollama error:', error)
    throw error
  }
}

/**
 * Unified AI completion - uses Ollama if available, falls back to OpenAI
 */
export async function createUnifiedCompletion(params: {
  messages: Array<{ role: string; content: string }>
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}): Promise<string> {
  const useOllama = process.env.USE_OLLAMA === 'true'

  if (useOllama) {
    try {
      return await createOllamaCompletion(params as any)
    } catch (error) {
      console.warn('Ollama failed, falling back to OpenAI:', error)
    }
  }

  // Fallback to OpenAI
  const { createChatCompletion } = await import('./openai')
  return createChatCompletion(params)
}

/**
 * Check if Ollama is available
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get available Ollama models
 */
export async function getOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`)
    const data = await response.json()
    return data.models?.map((m: any) => m.name) || []
  } catch {
    return []
  }
}
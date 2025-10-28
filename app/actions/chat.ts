'use server'

import { z } from 'zod'
import { VectorRepository } from '@/lib/repositories/vector-repository'

const chatSchema = z.object({
  demoId: z.string(),
  message: z.string(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  }))
})

export async function sendChatMessage(formData: FormData) {
  const data = chatSchema.parse({
    demoId: formData.get('demoId'),
    message: formData.get('message'),
    conversationHistory: JSON.parse(formData.get('history') as string || '[]')
  })
  
  const vectorRepo = new VectorRepository(process.env.VECTOR_PROVIDER as 'supabase' | 'pinecone')
  
  // Search relevant context
  const context = await vectorRepo.searchCompetitor({
    demoId: data.demoId,
    query: data.message
  })
  
  // Generate AI response with context
  const { generateAIResponse } = await import('@/lib/openai')
  const reply = await generateAIResponse({
    message: data.message,
    context: context.map(r => r.content).join('\n'),
    history: data.conversationHistory
  })
  
  return { success: true, reply }
}

export async function streamChatResponse(demoId: string, message: string) {
  const { OpenAI } = await import('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
  
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: message }],
    stream: true
  })
  
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(chunk.choices[0]?.delta?.content || '')
      }
      controller.close()
    }
  })
}
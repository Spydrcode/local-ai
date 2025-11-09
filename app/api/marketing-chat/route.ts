/**
 * Marketing Chat Agent API Route
 * Interactive AI assistant for marketing questions and guidance
 */

import { NextRequest, NextResponse } from 'next/server'
import { AgentRegistry } from '@/lib/agents/unified-agent-system'

// Import agents to trigger auto-registration
import '@/lib/agents/marketing-agents'
import '@/lib/agents/hbs-marketing-frameworks'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      message,
      conversationHistory = [],
      businessContext = null
    } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    // Get the marketing chat agent
    const chatAgent = AgentRegistry.get('marketing-chat')

    if (!chatAgent) {
      return NextResponse.json(
        { error: 'Marketing chat agent not available' },
        { status: 503 }
      )
    }

    // Build context from conversation history and business data
    let fullContext = ''

    if (businessContext) {
      fullContext += `\n# Business Context\n`
      fullContext += `Website: ${businessContext.website || 'N/A'}\n`
      fullContext += `Business: ${businessContext.businessName || 'N/A'}\n`
      fullContext += `Industry: ${businessContext.industry || 'N/A'}\n`

      if (businessContext.previousAnalysis) {
        fullContext += `\nPrevious Analysis Available: Yes\n`
        fullContext += `Brand Voice: ${businessContext.previousAnalysis.brandVoice || 'N/A'}\n`
        fullContext += `Top Recommendations: ${JSON.stringify(businessContext.previousAnalysis.recommendations || [])}\n`
      }
    }

    if (conversationHistory.length > 0) {
      fullContext += `\n# Conversation History\n`
      conversationHistory.forEach((msg: { role: string; content: string }) => {
        fullContext += `${msg.role}: ${msg.content}\n`
      })
    }

    fullContext += `\n# Current User Message\n${message}`

    // Execute the chat agent with the message and full context
    const response = await chatAgent.execute(message, {
      context: fullContext,
      businessContext
    })

    // Extract the response text from the AgentResponse
    const responseText = response.content

    return NextResponse.json({
      response: responseText,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Marketing chat error:', error)

    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Marketing Chat Agent API',
    description: 'Interactive AI assistant for marketing questions and guidance',
    usage: {
      method: 'POST',
      body: {
        message: 'Your question or request (required)',
        conversationHistory: [
          {
            role: 'user | assistant',
            content: 'Previous message content'
          }
        ],
        businessContext: {
          website: 'https://example.com',
          businessName: 'Business Name',
          industry: 'Industry',
          previousAnalysis: {
            brandVoice: 'Brand voice tone',
            recommendations: ['Recommendation 1', 'Recommendation 2']
          }
        }
      }
    },
    examples: [
      'How do I improve my SEO?',
      'What content should I post on Instagram?',
      'Help me write better headlines',
      'Which AI tools should I use first?',
      'How do I grow my email list?'
    ]
  })
}

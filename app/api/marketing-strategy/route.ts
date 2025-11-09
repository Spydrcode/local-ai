/**
 * Marketing Strategy API Route
 * Replaces grow-analysis with marketing-focused intelligence
 */

import { NextRequest, NextResponse } from 'next/server'
import { MarketingOrchestrator } from '@/lib/agents/marketing-orchestrator'
import type { MarketingWorkflow, MarketingContext } from '@/lib/agents/marketing-orchestrator'
import { BusinessContextManager } from '@/lib/context/business-context-manager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      website,
      businessName,
      industry,
      workflow = 'full-marketing-strategy',
      goals,
      targetAudience,
      currentChallenges
    } = body

    if (!website) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      )
    }

    // Validate workflow type
    const validWorkflows: MarketingWorkflow[] = [
      // Core Marketing Workflows
      'full-marketing-strategy',
      'seo-strategy',
      'content-strategy',
      'social-media-strategy',
      'brand-analysis',
      'competitor-analysis',
      'quick-analysis',
      // HBS Framework Workflows
      'jobs-to-be-done-analysis',
      'customer-journey-mapping',
      'positioning-strategy',
      'innovation-strategy',
      'comprehensive-hbs-analysis',
      'ml-optimization-strategy'
    ]

    if (!validWorkflows.includes(workflow)) {
      return NextResponse.json(
        { error: `Invalid workflow. Must be one of: ${validWorkflows.join(', ')}` },
        { status: 400 }
      )
    }

    const context: MarketingContext = {
      website,
      businessName,
      industry,
      goals,
      targetAudience,
      currentChallenges
    }

    const orchestrator = MarketingOrchestrator.getInstance()
    const result = await orchestrator.execute(workflow as MarketingWorkflow, context)

    // Store business context for future use
    const contextManager = BusinessContextManager.getInstance()
    contextManager.setContext(website, {
      businessName: businessName || result.intelligence?.brandAnalysis?.businessName || website,
      industry,
      targetAudience,
      goals,
      currentChallenges,
      marketingIntelligence: result.intelligence,
      brandVoice: result.brandAnalysis?.content || result.intelligence?.brandAnalysis?.tone,
      brandTone: result.intelligence?.brandAnalysis?.tone,
      keyMessages: result.intelligence?.brandAnalysis?.keyMessages,
      lastAnalysis: {
        workflow,
        timestamp: result.executedAt,
        recommendations: result.recommendations
      }
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Marketing strategy error:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate marketing strategy',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Marketing Strategy API - 17 AI Agents + Harvard Frameworks',
    workflowCategories: {
      core: [
        {
          name: 'full-marketing-strategy',
          description: 'Comprehensive marketing analysis and strategy',
          agents: ['marketing-intelligence', 'brand-voice', 'competitor-analysis']
        },
        {
          name: 'seo-strategy',
          description: 'SEO analysis and 90-day action plan',
          agents: ['seo-strategy']
        },
        {
          name: 'content-strategy',
          description: '30-day content calendar across channels',
          agents: ['brand-voice', 'content-calendar']
        },
        {
          name: 'social-media-strategy',
          description: 'Platform-specific social media strategies',
          agents: ['social-media-strategy']
        },
        {
          name: 'brand-analysis',
          description: 'Brand voice and messaging framework',
          agents: ['brand-voice']
        },
        {
          name: 'competitor-analysis',
          description: 'Competitive marketing intelligence',
          agents: ['competitor-analysis']
        },
        {
          name: 'quick-analysis',
          description: 'Fast marketing audit with quick wins',
          agents: []
        }
      ],
      hbs: [
        {
          name: 'jobs-to-be-done-analysis',
          description: 'Clayton Christensen Jobs-to-be-Done framework',
          agents: ['jobs-to-be-done']
        },
        {
          name: 'customer-journey-mapping',
          description: 'John Deighton Consumer Decision Journey',
          agents: ['consumer-journey']
        },
        {
          name: 'positioning-strategy',
          description: 'Porter Competitive Positioning + Youngme Moon Differentiation',
          agents: ['competitive-positioning', 'different-marketing']
        },
        {
          name: 'innovation-strategy',
          description: 'Christensen Disruptive Innovation + McGrath Discovery-Driven',
          agents: ['disruptive-marketing', 'discovery-driven-marketing']
        },
        {
          name: 'comprehensive-hbs-analysis',
          description: 'All HBS frameworks combined (JTBD, Myopia, Positioning, Journey, Differentiation, Disruption)',
          agents: ['jobs-to-be-done', 'marketing-myopia', 'competitive-positioning', 'consumer-journey', 'different-marketing', 'disruptive-marketing']
        },
        {
          name: 'ml-optimization-strategy',
          description: 'AI Personalization + Marketing Mix Modeling',
          agents: ['ai-personalization', 'marketing-mix-modeling']
        }
      ]
    },
    usage: {
      method: 'POST',
      body: {
        website: 'https://example.com (required)',
        businessName: 'Business Name (optional)',
        industry: 'Industry (optional)',
        workflow: 'full-marketing-strategy (optional, defaults to full)',
        goals: ['goal1', 'goal2 (optional)'],
        targetAudience: 'Target audience description (optional)',
        currentChallenges: ['challenge1', 'challenge2 (optional)']
      }
    }
  })
}

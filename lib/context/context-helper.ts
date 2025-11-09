/**
 * Context Helper
 * Utilities to auto-fill business context in AI tools
 */

import { BusinessContextManager, BusinessContext } from './business-context-manager'

export interface ToolRequestWithContext {
  // User-provided fields
  website?: string
  businessName?: string
  industry?: string

  // Other tool-specific fields
  [key: string]: any
}

export interface EnrichedToolRequest {
  website: string
  businessName: string
  industry?: string
  targetAudience?: string
  brandVoice?: string
  brandTone?: string
  keyMessages?: string[]

  // Business context summary for AI
  businessContext?: string

  // Original fields
  [key: string]: any
}

/**
 * Enrich a tool request with stored business context
 * Falls back to user-provided values if context not found
 */
export function enrichWithContext(request: ToolRequestWithContext): EnrichedToolRequest {
  const contextManager = BusinessContextManager.getInstance()

  let context: BusinessContext | null = null

  // Try to get context by website
  if (request.website) {
    context = contextManager.getContext(request.website)
  }

  // Fallback to most recent context if website not provided
  if (!context) {
    context = contextManager.getCurrentContext()
  }

  // If still no context, return request as-is with minimal defaults
  if (!context) {
    return {
      ...request,
      website: request.website || '',
      businessName: request.businessName || request.website || 'Business',
      industry: request.industry
    } as EnrichedToolRequest
  }

  // Enrich request with context data
  const enriched: EnrichedToolRequest = {
    ...request,
    website: request.website || context.website,
    businessName: request.businessName || context.businessName,
    industry: request.industry || context.industry,
    targetAudience: context.targetAudience,
    brandVoice: context.brandVoice,
    brandTone: context.brandTone,
    keyMessages: context.keyMessages,
    businessContext: contextManager.getContextSummary(context.website) || undefined
  }

  return enriched
}

/**
 * Get business context summary for AI prompts
 */
export function getContextForPrompt(website?: string): string {
  const contextManager = BusinessContextManager.getInstance()

  let context: BusinessContext | null = null

  if (website) {
    context = contextManager.getContext(website)
  } else {
    context = contextManager.getCurrentContext()
  }

  if (!context) {
    return ''
  }

  return contextManager.getContextSummary(context.website) || ''
}

/**
 * Check if business context exists
 */
export function hasBusinessContext(website?: string): boolean {
  const contextManager = BusinessContextManager.getInstance()

  if (website) {
    return contextManager.getContext(website) !== null
  }

  return contextManager.getCurrentContext() !== null
}

/**
 * Get business context or throw error if missing
 */
export function requireBusinessContext(website?: string): BusinessContext {
  const contextManager = BusinessContextManager.getInstance()

  let context: BusinessContext | null = null

  if (website) {
    context = contextManager.getContext(website)
  } else {
    context = contextManager.getCurrentContext()
  }

  if (!context) {
    throw new Error('No business context available. Please run a marketing analysis first.')
  }

  return context
}

/**
 * Extract business info from request or context
 */
export function getBusinessInfo(request: ToolRequestWithContext): {
  website: string
  businessName: string
  industry: string
} {
  const enriched = enrichWithContext(request)

  return {
    website: enriched.website,
    businessName: enriched.businessName,
    industry: enriched.industry || 'general'
  }
}

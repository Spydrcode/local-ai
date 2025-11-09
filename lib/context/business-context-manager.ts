/**
 * Business Context Manager
 * Stores and retrieves business data across sessions for AI tools
 */

export interface BusinessContext {
  website: string
  businessName: string
  industry?: string
  targetAudience?: string
  goals?: string[]
  currentChallenges?: string[]

  // Marketing intelligence data
  marketingIntelligence?: any
  brandVoice?: string
  brandTone?: string
  keyMessages?: string[]

  // Analysis results
  lastAnalysis?: {
    workflow: string
    timestamp: string
    recommendations?: string[]
  }

  // Metadata
  createdAt: string
  updatedAt: string
}

export class BusinessContextManager {
  private static instance: BusinessContextManager
  private contexts: Map<string, BusinessContext>
  private sessionKey: string = 'current-business-context'

  private constructor() {
    this.contexts = new Map()

    // Load from session storage if available (browser only)
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      this.loadFromSessionStorage()
    }
  }

  static getInstance(): BusinessContextManager {
    if (!BusinessContextManager.instance) {
      BusinessContextManager.instance = new BusinessContextManager()
    }
    return BusinessContextManager.instance
  }

  /**
   * Store business context
   */
  setContext(website: string, context: Partial<BusinessContext>): BusinessContext {
    const existing = this.contexts.get(website)

    const fullContext: BusinessContext = {
      website,
      businessName: context.businessName || existing?.businessName || website,
      industry: context.industry || existing?.industry,
      targetAudience: context.targetAudience || existing?.targetAudience,
      goals: context.goals || existing?.goals,
      currentChallenges: context.currentChallenges || existing?.currentChallenges,
      marketingIntelligence: context.marketingIntelligence || existing?.marketingIntelligence,
      brandVoice: context.brandVoice || existing?.brandVoice,
      brandTone: context.brandTone || existing?.brandTone,
      keyMessages: context.keyMessages || existing?.keyMessages,
      lastAnalysis: context.lastAnalysis || existing?.lastAnalysis,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.contexts.set(website, fullContext)

    // Save to session storage
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      this.saveToSessionStorage()
    }

    return fullContext
  }

  /**
   * Get business context by website
   */
  getContext(website: string): BusinessContext | null {
    return this.contexts.get(website) || null
  }

  /**
   * Get the most recent context
   */
  getCurrentContext(): BusinessContext | null {
    if (this.contexts.size === 0) return null

    // Sort by updatedAt and return most recent
    const sorted = Array.from(this.contexts.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    return sorted[0] || null
  }

  /**
   * Update context with new data (merge)
   */
  updateContext(website: string, updates: Partial<BusinessContext>): BusinessContext | null {
    const existing = this.contexts.get(website)
    if (!existing) return null

    return this.setContext(website, { ...existing, ...updates })
  }

  /**
   * Clear context for a website
   */
  clearContext(website: string): void {
    this.contexts.delete(website)
    this.saveToSessionStorage()
  }

  /**
   * Clear all contexts
   */
  clearAll(): void {
    this.contexts.clear()
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.sessionKey)
    }
  }

  /**
   * Get all stored contexts
   */
  getAllContexts(): BusinessContext[] {
    return Array.from(this.contexts.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  /**
   * Save to session storage (browser only)
   */
  private saveToSessionStorage(): void {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return

    try {
      const data = Array.from(this.contexts.entries())
      sessionStorage.setItem(this.sessionKey, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save context to session storage:', error)
    }
  }

  /**
   * Load from session storage (browser only)
   */
  private loadFromSessionStorage(): void {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return

    try {
      const stored = sessionStorage.getItem(this.sessionKey)
      if (stored) {
        const data = JSON.parse(stored) as [string, BusinessContext][]
        this.contexts = new Map(data)
      }
    } catch (error) {
      console.error('Failed to load context from session storage:', error)
    }
  }

  /**
   * Get context summary for AI tools
   */
  getContextSummary(website: string): string | null {
    const context = this.getContext(website)
    if (!context) return null

    let summary = `Business: ${context.businessName}\n`
    summary += `Website: ${context.website}\n`

    if (context.industry) {
      summary += `Industry: ${context.industry}\n`
    }

    if (context.targetAudience) {
      summary += `Target Audience: ${context.targetAudience}\n`
    }

    if (context.brandVoice) {
      summary += `Brand Voice: ${context.brandVoice}\n`
    }

    if (context.brandTone) {
      summary += `Brand Tone: ${context.brandTone}\n`
    }

    if (context.keyMessages && context.keyMessages.length > 0) {
      summary += `Key Messages: ${context.keyMessages.join(', ')}\n`
    }

    if (context.goals && context.goals.length > 0) {
      summary += `Goals: ${context.goals.join(', ')}\n`
    }

    return summary
  }
}

// Export singleton instance
export const businessContextManager = BusinessContextManager.getInstance()

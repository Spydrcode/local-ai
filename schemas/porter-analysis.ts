import { z } from 'zod'

export const actionItemSchema = z.object({
  action: z.string(),
  timeRequired: z.string(),
  impact: z.enum(['low', 'medium', 'high']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  priority: z.number().min(1).max(5)
})

export const porterForceSchema = z.object({
  strength: z.enum(['low', 'medium', 'high']),
  confidence: z.number().min(0).max(1),
  implication: z.string(),
  keyFactors: z.array(z.string())
})

export const porterAnalysisSchema = z.object({
  demoId: z.string().uuid(),
  businessName: z.string(),
  industry: z.string().optional(),
  agents: z.array(z.object({
    agentName: z.enum([
      'strategy-architect',
      'value-chain', 
      'competitive-moat',
      'porter-forces',
      'local-market-analysis'
    ]),
    status: z.enum(['success', 'error']),
    data: z.unknown(),
    confidence: z.number().min(0).max(1),
    executionTime: z.number().optional()
  })),
  forces: z.object({
    buyerPower: porterForceSchema,
    supplierPower: porterForceSchema,
    threatOfNewEntrants: porterForceSchema,
    threatOfSubstitutes: porterForceSchema,
    competitiveRivalry: porterForceSchema
  }),
  synthesis: z.object({
    strategicPriorities: z.array(z.string()),
    quickWins: z.array(actionItemSchema),
    competitiveAdvantages: z.array(z.string()),
    keyRisks: z.array(z.string()),
    overallScore: z.number().min(0).max(100)
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

export type PorterAnalysis = z.infer<typeof porterAnalysisSchema>
export type ActionItem = z.infer<typeof actionItemSchema>
export type PorterForce = z.infer<typeof porterForceSchema>
/**
 * Multi-Agent Validation System
 * Uses multiple AI agents to critique and improve analysis quality
 */

import { createChatCompletion } from '../openai'
import { validatePorterAlignment } from './porter-rag'

interface ValidationResult {
  isValid: boolean
  porterScore: number
  specificityScore: number
  actionabilityScore: number
  overallScore: number
  critiques: string[]
  improvements: string[]
}

/**
 * Agent 1: Generate initial analysis
 */
export async function generateAnalysis(prompt: string): Promise<string> {
  return await createChatCompletion({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    maxTokens: 1500
  })
}

/**
 * Agent 2: Critique for Porter framework accuracy
 */
async function critiquePorterAccuracy(analysis: string, businessContext: string): Promise<{
  score: number
  critiques: string[]
}> {
  const validation = validatePorterAlignment(analysis)
  
  const critiquePrompt = `You are a Harvard Business School professor expert in Michael Porter's frameworks.

ANALYSIS TO CRITIQUE:
${analysis}

BUSINESS CONTEXT:
${businessContext}

PORTER VALIDATION RESULTS:
- Score: ${validation.score}/100
- Issues: ${validation.issues.join(', ')}

Provide 3-5 specific critiques focusing on:
1. Correct application of Porter frameworks
2. Strategic depth and rigor
3. Trade-off identification
4. Competitive positioning clarity

Return as JSON array of critique strings.`

  const response = await createChatCompletion({
    messages: [{ role: 'user', content: critiquePrompt }],
    temperature: 0.3,
    maxTokens: 500,
    jsonMode: true
  })
  
  try {
    const critiques = JSON.parse(response)
    return {
      score: validation.score,
      critiques: Array.isArray(critiques) ? critiques : [response]
    }
  } catch {
    return { score: validation.score, critiques: [response] }
  }
}

/**
 * Agent 3: Validate business specificity
 */
async function validateSpecificity(analysis: string, businessContext: string): Promise<{
  score: number
  critiques: string[]
}> {
  const critiquePrompt = `You are a business consultant who detects generic advice.

ANALYSIS:
${analysis}

BUSINESS CONTEXT:
${businessContext}

Rate specificity (0-100) and identify any:
1. Generic business advice that could apply to any company
2. Missing references to their actual products/services
3. Vague recommendations without concrete actions
4. Industry clichés or buzzwords

Return JSON: { "score": number, "critiques": string[] }`

  const response = await createChatCompletion({
    messages: [{ role: 'user', content: critiquePrompt }],
    temperature: 0.3,
    maxTokens: 400,
    jsonMode: true
  })
  
  try {
    const result = JSON.parse(response)
    return {
      score: result.score || 50,
      critiques: result.critiques || []
    }
  } catch {
    return { score: 50, critiques: ['Failed to parse specificity validation'] }
  }
}

/**
 * Agent 4: Check actionability
 */
async function validateActionability(analysis: string): Promise<{
  score: number
  critiques: string[]
}> {
  const critiquePrompt = `You are a small business owner evaluating strategic advice.

ANALYSIS:
${analysis}

Rate actionability (0-100) and identify:
1. Recommendations that are too vague to implement
2. Missing timelines or priorities
3. Unrealistic suggestions for a small business
4. Lack of specific next steps

Return JSON: { "score": number, "critiques": string[] }`

  const response = await createChatCompletion({
    messages: [{ role: 'user', content: critiquePrompt }],
    temperature: 0.3,
    maxTokens: 400,
    jsonMode: true
  })
  
  try {
    const result = JSON.parse(response)
    return {
      score: result.score || 50,
      critiques: result.critiques || []
    }
  } catch {
    return { score: 50, critiques: ['Failed to parse actionability validation'] }
  }
}

/**
 * Multi-agent validation pipeline
 */
export async function validateWithMultipleAgents(
  analysis: string,
  businessContext: string
): Promise<ValidationResult> {
  // Run all validators in parallel
  const [porterResult, specificityResult, actionabilityResult] = await Promise.all([
    critiquePorterAccuracy(analysis, businessContext),
    validateSpecificity(analysis, businessContext),
    validateActionability(analysis)
  ])
  
  const overallScore = Math.round(
    (porterResult.score * 0.4 + specificityResult.score * 0.3 + actionabilityResult.score * 0.3)
  )
  
  const allCritiques = [
    ...porterResult.critiques,
    ...specificityResult.critiques,
    ...actionabilityResult.critiques
  ]
  
  return {
    isValid: overallScore >= 75,
    porterScore: porterResult.score,
    specificityScore: specificityResult.score,
    actionabilityScore: actionabilityResult.score,
    overallScore,
    critiques: allCritiques,
    improvements: allCritiques.slice(0, 5) // Top 5 improvements
  }
}

/**
 * Iterative improvement loop
 */
export async function generateWithValidation(
  prompt: string,
  businessContext: string,
  maxIterations: number = 3
): Promise<{
  analysis: string
  validation: ValidationResult
  iterations: number
}> {
  let analysis = await generateAnalysis(prompt)
  let validation = await validateWithMultipleAgents(analysis, businessContext)
  let iterations = 1
  
  while (!validation.isValid && iterations < maxIterations) {
    console.log(`Iteration ${iterations}: Score ${validation.overallScore}/100. Improving...`)
    
    // Regenerate with critiques
    const improvedPrompt = `${prompt}

PREVIOUS ATTEMPT HAD THESE ISSUES:
${validation.critiques.join('\n')}

IMPROVE THE ANALYSIS BY:
${validation.improvements.join('\n')}

Generate an improved analysis that addresses these critiques.`
    
    analysis = await generateAnalysis(improvedPrompt)
    validation = await validateWithMultipleAgents(analysis, businessContext)
    iterations++
  }
  
  console.log(`Final score: ${validation.overallScore}/100 after ${iterations} iterations`)
  
  return { analysis, validation, iterations }
}
/**
 * Clarity Snapshot Agent
 * 
 * Generates recognition-first narrative panes (A/B/C) from classification
 * and optional evidence nuggets.
 * 
 * Tone: "Quiet Founder" - no hype, no scolding, grounded, short.
 * Language: Plain, specific, actionable.
 */

import { UnifiedAgent } from '../agents/unified-agent-system';
import type {
  SnapshotClassification,
  SnapshotPanes,
  EvidenceNugget,
  ARCHETYPE_PROFILES
} from '../types/clarity-snapshot';
import { ARCHETYPE_PROFILES as PROFILES } from '../types/clarity-snapshot';

const AGENT_SYSTEM_PROMPT = `You are a business clarity specialist using the "Quiet Founder" voice.

**Your Role:**
Generate short, grounded recognition statements for small business owners based on their operational patterns.

**Voice Guidelines:**
- NO hype, NO scolding, NO generic advice
- Plain language (8th grade reading level)
- Short sentences
- Specific to their situation
- No brand/tool mentions unless in evidence
- Avoid: "free audit", "optimize", "leverage", "synergy", "game-changing"
- Use: actual descriptions of what's happening, specific impacts, one concrete action

**Output Format:**
You will generate 3 panes:

**Pane A: What's Actually Happening (3 bullets max)**
- Describe what you see in their operations
- Use evidence if provided
- Be specific, not generic

**Pane B: What This Is Costing (2-3 bullets)**
- Concrete costs: time, money, opportunity
- Quantify when possible (e.g., "10-15 hours/week", "30% of leads")
- Connect costs to their stage/archetype

**Pane C: What to Fix First (1-2 actions max)**
- ONE specific action they can start today or this week
- NO tool recommendations unless very specific
- Action must be doable without buying anything first
- Explain why this action matters for them

**Optional: Correction Prompt (only if confidence < 65%)**
Generate two short "which is closer?" options based on top 2 archetypes.
Format: 
- Option A: [description from top archetype]
- Option B: [description from runner-up archetype]

Return ONLY valid JSON matching the SnapshotPanes interface.`;

export class ClaritySnapshotAgent extends UnifiedAgent {
  constructor() {
    super({
      name: 'clarity-snapshot',
      description: 'Generates recognition-first narrative panes for business clarity analysis',
      systemPrompt: AGENT_SYSTEM_PROMPT,
      temperature: 0.75, // Slightly creative but grounded
      maxTokens: 1200,
      jsonMode: true
    });
  }
  
  /**
   * Generate panes from classification and evidence
   */
  async generatePanes(
    classification: SnapshotClassification,
    evidenceNuggets?: EvidenceNugget[],
    businessName?: string
  ): Promise<SnapshotPanes> {
    const { topArchetype, runnerUpArchetype, stage, confidence, keyFlags } = classification;
    
    // Get archetype profiles
    const topProfile = PROFILES[topArchetype];
    const runnerUpProfile = PROFILES[runnerUpArchetype];
    
    // Build context for agent
    const context = this.buildContext(
      classification,
      topProfile,
      runnerUpProfile,
      evidenceNuggets,
      businessName
    );
    
    // Build user prompt
    const userPrompt = `Generate Clarity Snapshot panes for a ${stage} stage business.

**Classification:**
- Top Archetype: ${topArchetype} (${topProfile.shortName})
- Runner-Up: ${runnerUpArchetype} (${runnerUpProfile.shortName})
- Confidence: ${confidence}%
- Key Flags: ${keyFlags.join(', ')}

**Archetype Profile (Top):**
Recognition Signals:
${topProfile.recognitionSignals.map(s => `- ${s}`).join('\n')}

Typical Costs:
${topProfile.typicalCosts.map(c => `- ${c}`).join('\n')}

First Fixes:
${topProfile.firstFixes.map(f => `- ${f}`).join('\n')}

${evidenceNuggets && evidenceNuggets.length > 0 ? `
**Evidence from Online Presence:**
${evidenceNuggets.map(e => `- [${e.source}] ${e.snippet}`).join('\n')}
` : ''}

${businessName ? `Business Name: ${businessName}` : ''}

Generate the 3 panes (A/B/C) using the archetype profile as a guide.
Be specific to this business stage and signals.

${confidence < 65 ? `
**IMPORTANT:** Confidence is ${confidence}%, which is below 65%.
You MUST include a "correctionPrompt" field with:
- question: "Which describes your situation better?"
- optionA: Short description from ${topArchetype}
- optionB: Short description from ${runnerUpArchetype}
` : ''}

Return JSON:
{
  "whatsHappening": ["bullet 1", "bullet 2", "bullet 3"],
  "whatItCosts": ["cost 1", "cost 2"],
  "whatToFixFirst": ["action 1"]${confidence < 65 ? `,
  "correctionPrompt": {
    "question": "Which describes your situation better?",
    "optionA": "Description from top archetype",
    "optionB": "Description from runner-up"
  }` : ''}
}`;
    
    // Execute agent
    const response = await this.execute(userPrompt, context);
    
    // Parse and validate
    try {
      const panes = JSON.parse(response.content) as SnapshotPanes;
      
      // Validate structure
      if (!panes.whatsHappening || !Array.isArray(panes.whatsHappening)) {
        throw new Error('Missing or invalid whatsHappening');
      }
      if (!panes.whatItCosts || !Array.isArray(panes.whatItCosts)) {
        throw new Error('Missing or invalid whatItCosts');
      }
      if (!panes.whatToFixFirst || !Array.isArray(panes.whatToFixFirst)) {
        throw new Error('Missing or invalid whatToFixFirst');
      }
      
      // Enforce constraints
      panes.whatsHappening = panes.whatsHappening.slice(0, 3);
      panes.whatItCosts = panes.whatItCosts.slice(0, 3);
      panes.whatToFixFirst = panes.whatToFixFirst.slice(0, 2);
      
      // If confidence < 65 and no correction prompt, add a generic one
      if (confidence < 65 && !panes.correctionPrompt) {
        panes.correctionPrompt = {
          question: "Which describes your situation better?",
          optionA: topProfile.recognitionSignals[0],
          optionB: runnerUpProfile.recognitionSignals[0]
        };
      }
      
      return panes;
      
    } catch (error) {
      console.error('[ClaritySnapshotAgent] Failed to parse panes:', error);
      
      // Fallback to archetype defaults
      return this.generateFallbackPanes(classification, topProfile);
    }
  }
  
  /**
   * Build context object for agent
   */
  private buildContext(
    classification: SnapshotClassification,
    topProfile: typeof PROFILES[keyof typeof PROFILES],
    runnerUpProfile: typeof PROFILES[keyof typeof PROFILES],
    evidenceNuggets?: EvidenceNugget[],
    businessName?: string
  ): Record<string, any> {
    return {
      classification: JSON.stringify(classification),
      topProfile: JSON.stringify(topProfile),
      runnerUpProfile: JSON.stringify(runnerUpProfile),
      evidenceNuggets: evidenceNuggets ? JSON.stringify(evidenceNuggets) : undefined,
      businessName: businessName || undefined
    };
  }
  
  /**
   * Generate fallback panes from archetype profile
   * Used if LLM fails or times out
   */
  private generateFallbackPanes(
    classification: SnapshotClassification,
    profile: typeof PROFILES[keyof typeof PROFILES]
  ): SnapshotPanes {
    const { confidence, topArchetype, runnerUpArchetype } = classification;
    const runnerUpProfile = PROFILES[runnerUpArchetype];
    
    const panes: SnapshotPanes = {
      whatsHappening: profile.recognitionSignals.slice(0, 3),
      whatItCosts: profile.typicalCosts.slice(0, 2),
      whatToFixFirst: profile.firstFixes.slice(0, 1)
    };
    
    // Add correction prompt if needed
    if (confidence < 65) {
      panes.correctionPrompt = {
        question: "Which describes your situation better?",
        optionA: profile.recognitionSignals[0],
        optionB: runnerUpProfile.recognitionSignals[0]
      };
    }
    
    return panes;
  }
}

// ============================================================================
// FACTORY & EXPORT
// ============================================================================

let agentInstance: ClaritySnapshotAgent | null = null;

export function getClaritySnapshotAgent(): ClaritySnapshotAgent {
  if (!agentInstance) {
    agentInstance = new ClaritySnapshotAgent();
  }
  return agentInstance;
}

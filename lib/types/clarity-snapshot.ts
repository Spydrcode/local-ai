/**
 * Clarity Snapshot Types
 * 
 * Frictionless recognition-first analysis for businesses without websites
 * or with incomplete online presence. Selection-based intake, deterministic
 * classification, fast response times.
 */

// ============================================================================
// ENUMS & SELECTION OPTIONS
// ============================================================================

export type PresenceChannel = 
  | 'website' 
  | 'google_reviews' 
  | 'social' 
  | 'word_of_mouth' 
  | 'messy_unsure';

export type TeamShape = 
  | 'solo_or_one_helper'
  | 'small_crew_2_5'
  | 'growing_6_15'
  | 'office_plus_field'
  | 'fluctuates';

export type SchedulingMethod = 
  | 'head_notebook'
  | 'texts_calls'
  | 'calendar_app'
  | 'job_software'
  | 'someone_else';

export type InvoicingMethod = 
  | 'paper_verbal'
  | 'quickbooks_invoicing_app'
  | 'job_software'
  | 'inconsistent';

export type CallHandling = 
  | 'personal_phone'
  | 'business_phone'
  | 'missed_calls_often'
  | 'someone_screens';

export type BusinessFeeling = 
  | 'busy_no_progress'
  | 'stuck_in_day_to_day'
  | 'dont_trust_numbers'
  | 'reactive_all_the_time'
  | 'something_off_cant_name';

export type BusinessStage = 
  | 'operator' 
  | 'transitional' 
  | 'managed';

export type Archetype = 
  | 'reactive_solo_operator'
  | 'growing_without_systems'
  | 'tool_heavy_insight_light'
  | 'delegation_without_visibility'
  | 'marketing_led_chaos'
  | 'busy_professionalized_but_blind'
  | 'inconsistent_process_inconsistent_cash'
  | 'stable_but_stagnant';

// ============================================================================
// REQUEST / RESPONSE MODELS
// ============================================================================

export interface SnapshotSelections {
  // Step 1: Where customers find them (multi-select)
  presenceChannels: PresenceChannel[];
  
  // Step 2: Team structure
  teamShape: TeamShape;
  
  // Step 3: Operational tools
  scheduling: SchedulingMethod;
  invoicing: InvoicingMethod;
  callHandling: CallHandling;
  
  // Step 4: Current feeling
  businessFeeling: BusinessFeeling;
}

export interface SnapshotClassification {
  // Primary stage
  stage: BusinessStage;
  
  // Archetype probabilities
  topArchetype: Archetype;
  runnerUpArchetype: Archetype;
  archetypeProbabilities: Record<Archetype, number>; // All 8 archetypes with probabilities
  
  // Confidence (0-100)
  confidence: number;
  
  // Key behavioral flags
  keyFlags: string[]; // e.g., ["overload_high", "visibility_low", "lead_handling_risk"]
  
  // Evidence strength (0-1) from available sources
  evidenceStrength: number;
}

export interface SnapshotPanes {
  // Pane A: Recognition - what's actually happening (3 bullets max)
  whatsHappening: string[];
  
  // Pane B: Cost - what this is costing (2-3 bullets)
  whatItCosts: string[];
  
  // Pane C: Fix - what to fix first (1-2 actions, no tool jargon)
  whatToFixFirst: string[];
  
  // Only shown if confidence < 65
  correctionPrompt?: {
    question: string;
    optionA: string; // From top archetype
    optionB: string; // From runner-up
  };
}

export interface EvidenceNugget {
  source: 'website' | 'google_business' | 'social';
  snippet: string; // Max 150 chars
  relevance: 'high' | 'medium' | 'low';
}

export interface ClaritySnapshotRequest {
  // Selection-based answers (required)
  selections: SnapshotSelections;
  
  // Optional identifiers for enrichment
  businessName?: string;
  websiteUrl?: string;
  googleBusinessUrl?: string;
  socialUrl?: string;
  
  // Optional business identifier for caching
  businessId?: string;
}

export interface ClaritySnapshotResponse {
  // Core output
  panes: SnapshotPanes;
  classification: SnapshotClassification;
  
  // Optional evidence (only if sources provided)
  evidenceNuggets?: EvidenceNugget[];
  
  // Metadata
  metadata: {
    executionTimeMs: number;
    scoringTimeMs: number;
    enrichmentTimeMs?: number;
    cacheHit: boolean;
    version: string; // Snapshot version for A/B testing
  };
}

// ============================================================================
// INTERNAL SCORING TYPES
// ============================================================================

export interface ScoreWeights {
  // Stage scores (-1 to +1 for each stage)
  operator: number;
  transitional: number;
  managed: number;
  
  // Archetype weights (additive, can be negative)
  archetypes: Partial<Record<Archetype, number>>;
  
  // Behavioral flags
  flags: string[];
}

export interface ScoringInput {
  selections: SnapshotSelections;
  evidenceStrength?: number; // 0-1 from enrichment
}

export interface ScoringOutput {
  // Raw scores
  stageScores: Record<BusinessStage, number>;
  archetypeScores: Record<Archetype, number>;
  
  // Normalized probabilities
  stageProbabilities: Record<BusinessStage, number>;
  archetypeProbabilities: Record<Archetype, number>;
  
  // Top picks
  topStage: BusinessStage;
  topArchetype: Archetype;
  runnerUpArchetype: Archetype;
  
  // Confidence calculation
  confidence: number;
  
  // Flags
  flags: string[];
}

// ============================================================================
// ARCHETYPE DESCRIPTIONS (for agent context)
// ============================================================================

export const ARCHETYPE_PROFILES: Record<Archetype, {
  shortName: string;
  recognitionSignals: string[];
  typicalCosts: string[];
  firstFixes: string[];
}> = {
  reactive_solo_operator: {
    shortName: "Solo & Reactive",
    recognitionSignals: [
      "All decisions and calls go through you",
      "Working harder but revenue stays flat",
      "Can't take time off without business stopping"
    ],
    typicalCosts: [
      "Revenue ceiling around what one person can do",
      "No time for growth activities (marketing, sales calls)",
      "Personal health/relationships suffer from overload"
    ],
    firstFixes: [
      "Start tracking where your time actually goes for one week",
      "Pick ONE repeating task and document it (not automate yet, just write down the steps)"
    ]
  },
  
  growing_without_systems: {
    shortName: "Growing but Chaotic",
    recognitionSignals: [
      "More work coming in but execution is inconsistent",
      "Relying on memory or scattered notes",
      "Same questions keep coming up from team/customers"
    ],
    typicalCosts: [
      "Rework and mistakes eating 10-15% of job time",
      "Customer complaints about inconsistency",
      "Can't scale because every job is different"
    ],
    firstFixes: [
      "Document your top 3 most common jobs start-to-finish",
      "Create one simple checklist your team can follow"
    ]
  },
  
  tool_heavy_insight_light: {
    shortName: "Lots of Tools, No Clarity",
    recognitionSignals: [
      "Using software but not looking at reports",
      "Data exists but you don't trust it or use it",
      "Buying tools that don't talk to each other"
    ],
    typicalCosts: [
      "Paying for software nobody uses fully",
      "Making decisions based on gut feel, not data",
      "Missing patterns in what's working/not working"
    ],
    firstFixes: [
      "Pick ONE number to track weekly (not 10, just one)",
      "Set up a 5-minute weekly review of that one number"
    ]
  },
  
  delegation_without_visibility: {
    shortName: "Delegated but Blind",
    recognitionSignals: [
      "Someone else handles key tasks but you don't see the data",
      "Finding out about problems too late",
      "Can't answer basic questions about the business without asking"
    ],
    typicalCosts: [
      "Losing money without knowing where or why",
      "Customer issues escalating before you hear about them",
      "Can't make strategic decisions without digging for info"
    ],
    firstFixes: [
      "Set up a simple daily/weekly dashboard for the top 3 numbers",
      "Schedule a 15-minute weekly check-in with whoever runs the operations"
    ]
  },
  
  marketing_led_chaos: {
    shortName: "Marketing Works, Ops Don't",
    recognitionSignals: [
      "Leads are coming in but you can't handle them all",
      "Missing calls, slow follow-up, inconsistent close rate",
      "Marketing spend going up but profit not following"
    ],
    typicalCosts: [
      "Wasting 30-50% of leads due to response time",
      "Negative reviews from customers you couldn't service well",
      "High marketing cost per acquisition with low lifetime value"
    ],
    firstFixes: [
      "Set up lead response tracking (how fast are you getting back?)",
      "Pause one marketing channel and focus on converting what you have"
    ]
  },
  
  busy_professionalized_but_blind: {
    shortName: "Professional but No Insight",
    recognitionSignals: [
      "Team in place, systems running, but no clear picture of health",
      "Don't know which services or customers are profitable",
      "Reacting to cash flow issues instead of planning ahead"
    ],
    typicalCosts: [
      "Unprofitable services subsidizing profitable ones (hidden)",
      "Missing early warning signs of cash flow problems",
      "Can't confidently invest in growth because numbers are murky"
    ],
    firstFixes: [
      "Run a simple profitability analysis by service/customer type",
      "Set up cash flow projection for next 90 days"
    ]
  },
  
  inconsistent_process_inconsistent_cash: {
    shortName: "Feast or Famine",
    recognitionSignals: [
      "Some months are great, some are scary",
      "No predictable pipeline or sales process",
      "Constantly hustling for next job instead of building systems"
    ],
    typicalCosts: [
      "Can't plan hiring or investments due to cash swings",
      "Personal stress from financial unpredictability",
      "Lower prices or desperation deals during slow months"
    ],
    firstFixes: [
      "Track where every job comes from for 30 days",
      "Build a simple pipeline view of opportunities in progress"
    ]
  },
  
  stable_but_stagnant: {
    shortName: "Flat but Comfortable",
    recognitionSignals: [
      "Revenue has been the same for 2+ years",
      "Comfortable but not excited about the business",
      "Not sure what the next move is"
    ],
    typicalCosts: [
      "Opportunity cost of staying in neutral",
      "Inflation eating into real profit margins",
      "Business value not growing (if you wanted to sell or exit)"
    ],
    firstFixes: [
      "List 3 things you could do differently if you had clarity",
      "Interview 3-5 recent customers about what else they'd buy from you"
    ]
  }
};

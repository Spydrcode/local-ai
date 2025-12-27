/**
 * Clarity Snapshot Signal Scorer
 * 
 * Deterministic classifier that maps selection-based answers to:
 * - Business stage (operator / transitional / managed)
 * - Archetype probabilities (8 archetypes)
 * - Confidence score (0-100)
 * - Behavioral flags
 * 
 * MUST run in < 50ms. No LLM calls, pure logic.
 */

import type {
  Archetype,
  BusinessStage,
  ScoreWeights,
  ScoringInput,
  ScoringOutput,
  SnapshotSelections,
  PresenceChannel,
  TeamShape,
  SchedulingMethod,
  InvoicingMethod,
  CallHandling,
  BusinessFeeling
} from '../types/clarity-snapshot';

// ============================================================================
// WEIGHT TABLES - Core Scoring Logic
// ============================================================================

/**
 * Presence channel weights
 * Multi-select: scores accumulate
 */
const PRESENCE_WEIGHTS: Record<PresenceChannel, ScoreWeights> = {
  website: {
    operator: -0.2,
    transitional: 0.3,
    managed: 0.4,
    archetypes: {
      stable_but_stagnant: 0.1,
      tool_heavy_insight_light: 0.1
    },
    flags: ['online_presence']
  },
  
  google_reviews: {
    operator: -0.1,
    transitional: 0.2,
    managed: 0.3,
    archetypes: {
      busy_professionalized_but_blind: 0.15
    },
    flags: ['reputation_visible']
  },
  
  social: {
    operator: 0.0,
    transitional: 0.1,
    managed: 0.1,
    archetypes: {
      marketing_led_chaos: 0.2
    },
    flags: ['social_active']
  },
  
  word_of_mouth: {
    operator: 0.4,
    transitional: 0.1,
    managed: -0.2,
    archetypes: {
      reactive_solo_operator: 0.3,
      growing_without_systems: 0.2
    },
    flags: ['referral_dependent']
  },
  
  messy_unsure: {
    operator: 0.3,
    transitional: 0.0,
    managed: -0.3,
    archetypes: {
      growing_without_systems: 0.3,
      inconsistent_process_inconsistent_cash: 0.2
    },
    flags: ['visibility_low', 'positioning_unclear']
  }
};

/**
 * Team shape weights
 */
const TEAM_WEIGHTS: Record<TeamShape, ScoreWeights> = {
  solo_or_one_helper: {
    operator: 1.0,
    transitional: -0.3,
    managed: -0.8,
    archetypes: {
      reactive_solo_operator: 0.5,
      inconsistent_process_inconsistent_cash: 0.2
    },
    flags: ['solo_operator', 'scale_ceiling']
  },
  
  small_crew_2_5: {
    operator: 0.2,
    transitional: 0.6,
    managed: -0.2,
    archetypes: {
      growing_without_systems: 0.4,
      delegation_without_visibility: 0.2
    },
    flags: ['small_team', 'delegation_starting']
  },
  
  growing_6_15: {
    operator: -0.5,
    transitional: 0.7,
    managed: 0.3,
    archetypes: {
      busy_professionalized_but_blind: 0.3,
      delegation_without_visibility: 0.3
    },
    flags: ['growing_team', 'systems_needed']
  },
  
  office_plus_field: {
    operator: -0.7,
    transitional: 0.3,
    managed: 0.8,
    archetypes: {
      busy_professionalized_but_blind: 0.4,
      tool_heavy_insight_light: 0.2
    },
    flags: ['structured_org', 'office_operations']
  },
  
  fluctuates: {
    operator: 0.1,
    transitional: 0.4,
    managed: -0.3,
    archetypes: {
      inconsistent_process_inconsistent_cash: 0.5,
      marketing_led_chaos: 0.2
    },
    flags: ['staffing_unpredictable', 'demand_volatility']
  }
};

/**
 * Scheduling method weights
 */
const SCHEDULING_WEIGHTS: Record<SchedulingMethod, ScoreWeights> = {
  head_notebook: {
    operator: 0.8,
    transitional: -0.2,
    managed: -0.6,
    archetypes: {
      reactive_solo_operator: 0.4,
      growing_without_systems: 0.3
    },
    flags: ['manual_scheduling', 'no_system']
  },
  
  texts_calls: {
    operator: 0.5,
    transitional: 0.1,
    managed: -0.4,
    archetypes: {
      reactive_solo_operator: 0.3,
      growing_without_systems: 0.2
    },
    flags: ['ad_hoc_scheduling', 'communication_chaos']
  },
  
  calendar_app: {
    operator: -0.1,
    transitional: 0.3,
    managed: 0.2,
    archetypes: {
      tool_heavy_insight_light: 0.2
    },
    flags: ['basic_digital_tools']
  },
  
  job_software: {
    operator: -0.4,
    transitional: 0.2,
    managed: 0.6,
    archetypes: {
      tool_heavy_insight_light: 0.3,
      busy_professionalized_but_blind: 0.2
    },
    flags: ['job_management_system', 'structured_ops']
  },
  
  someone_else: {
    operator: -0.6,
    transitional: 0.3,
    managed: 0.7,
    archetypes: {
      delegation_without_visibility: 0.4,
      busy_professionalized_but_blind: 0.2
    },
    flags: ['delegated_scheduling', 'potential_blind_spots']
  }
};

/**
 * Invoicing method weights
 */
const INVOICING_WEIGHTS: Record<InvoicingMethod, ScoreWeights> = {
  paper_verbal: {
    operator: 0.8,
    transitional: -0.1,
    managed: -0.7,
    archetypes: {
      reactive_solo_operator: 0.4,
      inconsistent_process_inconsistent_cash: 0.3
    },
    flags: ['manual_invoicing', 'cash_flow_risk', 'no_tracking']
  },
  
  quickbooks_invoicing_app: {
    operator: 0.0,
    transitional: 0.4,
    managed: 0.3,
    archetypes: {
      tool_heavy_insight_light: 0.2,
      stable_but_stagnant: 0.1
    },
    flags: ['basic_accounting', 'financial_tracking']
  },
  
  job_software: {
    operator: -0.3,
    transitional: 0.3,
    managed: 0.5,
    archetypes: {
      tool_heavy_insight_light: 0.3,
      busy_professionalized_but_blind: 0.2
    },
    flags: ['integrated_invoicing', 'operational_system']
  },
  
  inconsistent: {
    operator: 0.4,
    transitional: 0.2,
    managed: -0.5,
    archetypes: {
      inconsistent_process_inconsistent_cash: 0.5,
      growing_without_systems: 0.3
    },
    flags: ['process_inconsistency', 'cash_flow_unpredictable']
  }
};

/**
 * Call handling weights
 */
const CALL_WEIGHTS: Record<CallHandling, ScoreWeights> = {
  personal_phone: {
    operator: 0.7,
    transitional: 0.0,
    managed: -0.6,
    archetypes: {
      reactive_solo_operator: 0.4,
      inconsistent_process_inconsistent_cash: 0.2
    },
    flags: ['owner_bottleneck', 'no_separation']
  },
  
  business_phone: {
    operator: 0.1,
    transitional: 0.3,
    managed: 0.1,
    archetypes: {
      stable_but_stagnant: 0.1
    },
    flags: ['basic_business_setup']
  },
  
  missed_calls_often: {
    operator: 0.3,
    transitional: 0.3,
    managed: -0.3,
    archetypes: {
      marketing_led_chaos: 0.5,
      reactive_solo_operator: 0.3,
      inconsistent_process_inconsistent_cash: 0.2
    },
    flags: ['lead_handling_risk', 'capacity_issue', 'revenue_leak']
  },
  
  someone_screens: {
    operator: -0.5,
    transitional: 0.4,
    managed: 0.5,
    archetypes: {
      delegation_without_visibility: 0.3,
      busy_professionalized_but_blind: 0.2
    },
    flags: ['delegated_intake', 'call_screening']
  }
};

/**
 * Business feeling weights (strongest signal)
 */
const FEELING_WEIGHTS: Record<BusinessFeeling, ScoreWeights> = {
  busy_no_progress: {
    operator: 0.5,
    transitional: 0.3,
    managed: -0.3,
    archetypes: {
      reactive_solo_operator: 0.5,
      stable_but_stagnant: 0.3
    },
    flags: ['treadmill_syndrome', 'no_growth', 'overload_high']
  },
  
  stuck_in_day_to_day: {
    operator: 0.4,
    transitional: 0.4,
    managed: -0.2,
    archetypes: {
      reactive_solo_operator: 0.4,
      growing_without_systems: 0.3,
      busy_professionalized_but_blind: 0.2
    },
    flags: ['tactical_trap', 'no_strategic_time']
  },
  
  dont_trust_numbers: {
    operator: 0.2,
    transitional: 0.3,
    managed: 0.1,
    archetypes: {
      tool_heavy_insight_light: 0.6,
      delegation_without_visibility: 0.3,
      busy_professionalized_but_blind: 0.3
    },
    flags: ['data_quality_issue', 'insight_gap', 'decision_paralysis']
  },
  
  reactive_all_the_time: {
    operator: 0.6,
    transitional: 0.2,
    managed: -0.4,
    archetypes: {
      reactive_solo_operator: 0.5,
      marketing_led_chaos: 0.4,
      inconsistent_process_inconsistent_cash: 0.3
    },
    flags: ['reactive_mode', 'no_planning', 'firefighting']
  },
  
  something_off_cant_name: {
    operator: 0.1,
    transitional: 0.3,
    managed: 0.2,
    archetypes: {
      tool_heavy_insight_light: 0.3,
      delegation_without_visibility: 0.4,
      busy_professionalized_but_blind: 0.3,
      stable_but_stagnant: 0.2
    },
    flags: ['intuition_warning', 'visibility_low', 'metrics_needed']
  }
};

// ============================================================================
// SCORING ENGINE
// ============================================================================

export class SignalScorer {
  /**
   * Score selections and return classification
   * MUST complete in < 50ms
   */
  score(input: ScoringInput): ScoringOutput {
    const startTime = performance.now();
    
    // Initialize scores
    const stageScores: Record<BusinessStage, number> = {
      operator: 0,
      transitional: 0,
      managed: 0
    };
    
    const archetypeScores: Record<Archetype, number> = {
      reactive_solo_operator: 0,
      growing_without_systems: 0,
      tool_heavy_insight_light: 0,
      delegation_without_visibility: 0,
      marketing_led_chaos: 0,
      busy_professionalized_but_blind: 0,
      inconsistent_process_inconsistent_cash: 0,
      stable_but_stagnant: 0
    };
    
    const flags = new Set<string>();
    
    // Apply weights from selections
    const { selections } = input;
    
    // 1. Presence channels (multi-select, accumulate)
    selections.presenceChannels.forEach(channel => {
      const weights = PRESENCE_WEIGHTS[channel];
      this.applyWeights(stageScores, archetypeScores, flags, weights);
    });
    
    // 2. Team shape
    const teamWeights = TEAM_WEIGHTS[selections.teamShape];
    this.applyWeights(stageScores, archetypeScores, flags, teamWeights);
    
    // 3. Scheduling
    const schedulingWeights = SCHEDULING_WEIGHTS[selections.scheduling];
    this.applyWeights(stageScores, archetypeScores, flags, schedulingWeights);
    
    // 4. Invoicing
    const invoicingWeights = INVOICING_WEIGHTS[selections.invoicing];
    this.applyWeights(stageScores, archetypeScores, flags, invoicingWeights);
    
    // 5. Call handling
    const callWeights = CALL_WEIGHTS[selections.callHandling];
    this.applyWeights(stageScores, archetypeScores, flags, callWeights);
    
    // 6. Business feeling (double weight - strongest signal)
    const feelingWeights = FEELING_WEIGHTS[selections.businessFeeling];
    this.applyWeights(stageScores, archetypeScores, flags, feelingWeights, 2.0);
    
    // Normalize to probabilities
    const stageProbabilities = this.softmax(stageScores);
    const archetypeProbabilities = this.softmax(archetypeScores);
    
    // Pick top stage and archetypes
    const topStage = this.getTopKey(stageProbabilities) as BusinessStage;
    const archetypeRanking = this.rankByValue(archetypeProbabilities);
    const topArchetype = archetypeRanking[0] as Archetype;
    const runnerUpArchetype = archetypeRanking[1] as Archetype;
    
    // Calculate confidence
    const topProb = archetypeProbabilities[topArchetype];
    const runnerUpProb = archetypeProbabilities[runnerUpArchetype];
    const separation = topProb - runnerUpProb;
    
    // Confidence formula: 
    // - Base: gap between top and runner-up (0.0-0.5 → 0-50)
    // - Boost: evidence strength adds up to +30
    // - Floor: 15, Ceiling: 95
    let confidence = Math.min(95, Math.max(15, (separation * 100) + (input.evidenceStrength || 0) * 30));
    
    const elapsedMs = performance.now() - startTime;
    if (elapsedMs > 50) {
      console.warn(`[SignalScorer] Scoring took ${elapsedMs.toFixed(2)}ms (target: <50ms)`);
    }
    
    return {
      stageScores,
      archetypeScores,
      stageProbabilities,
      archetypeProbabilities,
      topStage,
      topArchetype,
      runnerUpArchetype,
      confidence: Math.round(confidence),
      flags: Array.from(flags)
    };
  }
  
  /**
   * Apply weights to scores and flags
   */
  private applyWeights(
    stageScores: Record<BusinessStage, number>,
    archetypeScores: Record<Archetype, number>,
    flags: Set<string>,
    weights: ScoreWeights,
    multiplier: number = 1.0
  ): void {
    // Stage scores
    stageScores.operator += weights.operator * multiplier;
    stageScores.transitional += weights.transitional * multiplier;
    stageScores.managed += weights.managed * multiplier;
    
    // Archetype scores
    Object.entries(weights.archetypes).forEach(([archetype, weight]) => {
      archetypeScores[archetype as Archetype] += weight * multiplier;
    });
    
    // Flags
    weights.flags.forEach(flag => flags.add(flag));
  }
  
  /**
   * Softmax normalization to probabilities
   */
  private softmax<T extends string>(scores: Record<T, number>): Record<T, number> {
    const keys = Object.keys(scores) as T[];
    const expScores = keys.map(k => Math.exp(scores[k]));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    
    const probabilities = {} as Record<T, number>;
    keys.forEach((k, i) => {
      probabilities[k] = expScores[i] / sumExp;
    });
    
    return probabilities;
  }
  
  /**
   * Get key with highest value
   */
  private getTopKey<T extends string>(obj: Record<T, number>): T {
    return Object.entries(obj).reduce((a, b) => 
      (b[1] as number) > (a[1] as number) ? b : a
    )[0] as T;
  }
  
  /**
   * Rank keys by value descending
   */
  private rankByValue<T extends string>(obj: Record<T, number>): T[] {
    return (Object.entries(obj) as [T, number][])
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k);
  }
}

// ============================================================================
// FACTORY & EXPORT
// ============================================================================

let scorerInstance: SignalScorer | null = null;

export function getScorer(): SignalScorer {
  if (!scorerInstance) {
    scorerInstance = new SignalScorer();
  }
  return scorerInstance;
}

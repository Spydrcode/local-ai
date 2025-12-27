/**
 * Clarity Snapshot Tests
 * 
 * Test suite for scoring, classification, and agent output
 */

import { describe, test, expect } from 'vitest';
import { getScorer } from '../lib/clarity-snapshot/signal-scorer';
import type { SnapshotSelections } from '../lib/types/clarity-snapshot';

describe('Clarity Snapshot - Signal Scorer', () => {
  const scorer = getScorer();
  
  test('should identify reactive_solo_operator archetype', () => {
    const selections: SnapshotSelections = {
      presenceChannels: ['word_of_mouth'],
      teamShape: 'solo_or_one_helper',
      scheduling: 'head_notebook',
      invoicing: 'paper_verbal',
      callHandling: 'personal_phone',
      businessFeeling: 'reactive_all_the_time'
    };
    
    const result = scorer.score({ selections });
    
    expect(result.topArchetype).toBe('reactive_solo_operator');
    expect(result.topStage).toBe('operator');
    expect(result.confidence).toBeGreaterThan(50);
    expect(result.flags).toContain('solo_operator');
    expect(result.flags).toContain('no_system');
  });
  
  test('should identify growing_without_systems archetype', () => {
    const selections: SnapshotSelections = {
      presenceChannels: ['website', 'word_of_mouth'],
      teamShape: 'small_crew_2_5',
      scheduling: 'texts_calls',
      invoicing: 'inconsistent',
      callHandling: 'business_phone',
      businessFeeling: 'stuck_in_day_to_day'
    };
    
    const result = scorer.score({ selections });
    
    expect(result.topArchetype).toBe('growing_without_systems');
    expect(result.topStage).toBe('transitional');
    expect(result.flags).toContain('small_team');
  });
  
  test('should identify tool_heavy_insight_light archetype', () => {
    const selections: SnapshotSelections = {
      presenceChannels: ['website', 'google_reviews'],
      teamShape: 'growing_6_15',
      scheduling: 'job_software',
      invoicing: 'job_software',
      callHandling: 'someone_screens',
      businessFeeling: 'dont_trust_numbers'
    };
    
    const result = scorer.score({ selections });
    
    expect(result.topArchetype).toBe('tool_heavy_insight_light');
    expect(result.flags).toContain('data_quality_issue');
  });
  
  test('should identify marketing_led_chaos archetype', () => {
    const selections: SnapshotSelections = {
      presenceChannels: ['website', 'social', 'google_reviews'],
      teamShape: 'small_crew_2_5',
      scheduling: 'calendar_app',
      invoicing: 'quickbooks_invoicing_app',
      callHandling: 'missed_calls_often',
      businessFeeling: 'reactive_all_the_time'
    };
    
    const result = scorer.score({ selections });
    
    expect(result.topArchetype).toBe('marketing_led_chaos');
    expect(result.flags).toContain('lead_handling_risk');
    expect(result.flags).toContain('capacity_issue');
  });
  
  test('should identify delegation_without_visibility archetype', () => {
    const selections: SnapshotSelections = {
      presenceChannels: ['website'],
      teamShape: 'growing_6_15',
      scheduling: 'someone_else',
      invoicing: 'job_software',
      callHandling: 'someone_screens',
      businessFeeling: 'something_off_cant_name'
    };
    
    const result = scorer.score({ selections });
    
    expect(result.topArchetype).toBe('delegation_without_visibility');
    expect(result.flags).toContain('delegated_scheduling');
    expect(result.flags).toContain('potential_blind_spots');
  });
  
  test('should boost confidence with evidence strength', () => {
    const selections: SnapshotSelections = {
      presenceChannels: ['word_of_mouth'],
      teamShape: 'solo_or_one_helper',
      scheduling: 'head_notebook',
      invoicing: 'paper_verbal',
      callHandling: 'personal_phone',
      businessFeeling: 'busy_no_progress'
    };
    
    const resultNoEvidence = scorer.score({ selections, evidenceStrength: 0 });
    const resultWithEvidence = scorer.score({ selections, evidenceStrength: 0.8 });
    
    expect(resultWithEvidence.confidence).toBeGreaterThan(resultNoEvidence.confidence);
  });
  
  test('should complete scoring in < 50ms', () => {
    const selections: SnapshotSelections = {
      presenceChannels: ['website', 'social'],
      teamShape: 'small_crew_2_5',
      scheduling: 'calendar_app',
      invoicing: 'quickbooks_invoicing_app',
      callHandling: 'business_phone',
      businessFeeling: 'stuck_in_day_to_day'
    };
    
    const startTime = performance.now();
    scorer.score({ selections });
    const duration = performance.now() - startTime;
    
    expect(duration).toBeLessThan(50);
  });
  
  test('should return runner-up archetype', () => {
    const selections: SnapshotSelections = {
      presenceChannels: ['messy_unsure'],
      teamShape: 'fluctuates',
      scheduling: 'texts_calls',
      invoicing: 'inconsistent',
      callHandling: 'missed_calls_often',
      businessFeeling: 'reactive_all_the_time'
    };
    
    const result = scorer.score({ selections });
    
    expect(result.topArchetype).toBeDefined();
    expect(result.runnerUpArchetype).toBeDefined();
    expect(result.topArchetype).not.toBe(result.runnerUpArchetype);
    expect(result.archetypeProbabilities[result.topArchetype]).toBeGreaterThan(
      result.archetypeProbabilities[result.runnerUpArchetype]
    );
  });
  
  test('should have all archetype probabilities sum to ~1.0', () => {
    const selections: SnapshotSelections = {
      presenceChannels: ['website'],
      teamShape: 'small_crew_2_5',
      scheduling: 'calendar_app',
      invoicing: 'quickbooks_invoicing_app',
      callHandling: 'business_phone',
      businessFeeling: 'stuck_in_day_to_day'
    };
    
    const result = scorer.score({ selections });
    
    const sum = Object.values(result.archetypeProbabilities).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 2); // Within 0.01 of 1.0
  });
  
  test('should handle multi-select presence channels', () => {
    const selections: SnapshotSelections = {
      presenceChannels: ['website', 'google_reviews', 'social'],
      teamShape: 'office_plus_field',
      scheduling: 'job_software',
      invoicing: 'job_software',
      callHandling: 'someone_screens',
      businessFeeling: 'dont_trust_numbers'
    };
    
    const result = scorer.score({ selections });
    
    // Should accumulate flags from multiple presence channels
    expect(result.flags.length).toBeGreaterThan(2);
  });
});

describe('Clarity Snapshot - Edge Cases', () => {
  const scorer = getScorer();
  
  test('should handle minimal selections', () => {
    const selections: SnapshotSelections = {
      presenceChannels: ['word_of_mouth'],
      teamShape: 'solo_or_one_helper',
      scheduling: 'head_notebook',
      invoicing: 'paper_verbal',
      callHandling: 'personal_phone',
      businessFeeling: 'busy_no_progress'
    };
    
    const result = scorer.score({ selections });
    
    expect(result.topArchetype).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(15);
    expect(result.confidence).toBeLessThanOrEqual(95);
  });
  
  test('should handle all presence channels selected', () => {
    const selections: SnapshotSelections = {
      presenceChannels: ['website', 'google_reviews', 'social', 'word_of_mouth', 'messy_unsure'],
      teamShape: 'growing_6_15',
      scheduling: 'job_software',
      invoicing: 'quickbooks_invoicing_app',
      callHandling: 'someone_screens',
      businessFeeling: 'something_off_cant_name'
    };
    
    const result = scorer.score({ selections });
    
    expect(result.topArchetype).toBeDefined();
    expect(result.flags.length).toBeGreaterThan(0);
  });
  
  test('should maintain confidence bounds', () => {
    const selections: SnapshotSelections = {
      presenceChannels: ['website'],
      teamShape: 'small_crew_2_5',
      scheduling: 'calendar_app',
      invoicing: 'quickbooks_invoicing_app',
      callHandling: 'business_phone',
      businessFeeling: 'stuck_in_day_to_day'
    };
    
    // Test with extreme evidence strength
    const resultMax = scorer.score({ selections, evidenceStrength: 1.0 });
    const resultMin = scorer.score({ selections, evidenceStrength: 0.0 });
    
    expect(resultMax.confidence).toBeLessThanOrEqual(95);
    expect(resultMin.confidence).toBeGreaterThanOrEqual(15);
  });
});

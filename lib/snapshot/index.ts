/**
 * Snapshot Extractors
 * 
 * Modular signal extraction for Clarity Snapshot analysis.
 * Each extractor analyzes specific aspects of scraped business data.
 */

// Priority generation
export {
  generatePriorities,
  generateBasicPriorities,
  type Priority
} from './extractors/priority-generator';

// Signal extractors
export {
  extractOperationsSignals,
  generateBasicOperationsSignals,
  type OperationsSignal
} from './extractors/operations-signals';

export {
  extractMarketingSignals,
  generateBasicMarketingSignals,
  type MarketingSignal
} from './extractors/marketing-signals';

export {
  extractCompetitiveSignals,
  generateBasicCompetitiveSignals,
  type CompetitiveSignal
} from './extractors/competitive-signals';

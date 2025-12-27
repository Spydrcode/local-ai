/**
 * Example: Using the Clarity Snapshot API
 * 
 * This script demonstrates how to call the Clarity Snapshot endpoint
 * with different business scenarios.
 */

const API_BASE = 'http://localhost:3000';

// ============================================================================
// EXAMPLE 1: Solo Operator, Reactive Mode
// ============================================================================

async function exampleSoloOperator() {
  console.log('\n📊 Example 1: Solo Operator, Reactive Mode\n');
  
  const response = await fetch(`${API_BASE}/api/clarity-snapshot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      selections: {
        presenceChannels: ['word_of_mouth'],
        teamShape: 'solo_or_one_helper',
        scheduling: 'head_notebook',
        invoicing: 'paper_verbal',
        callHandling: 'personal_phone',
        businessFeeling: 'reactive_all_the_time'
      },
      businessName: 'Joe\'s Plumbing'
    })
  });
  
  const data = await response.json();
  
  console.log('Classification:');
  console.log(`  Stage: ${data.classification.stage}`);
  console.log(`  Archetype: ${data.classification.topArchetype}`);
  console.log(`  Confidence: ${data.classification.confidence}%`);
  console.log(`  Flags: ${data.classification.keyFlags.join(', ')}`);
  
  console.log('\nWhat\'s Happening:');
  data.panes.whatsHappening.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
  
  console.log('\nWhat It Costs:');
  data.panes.whatItCosts.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
  
  console.log('\nWhat to Fix First:');
  data.panes.whatToFixFirst.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
  
  console.log(`\nExecution Time: ${data.metadata.executionTimeMs}ms`);
}

// ============================================================================
// EXAMPLE 2: Growing Without Systems
// ============================================================================

async function exampleGrowingWithoutSystems() {
  console.log('\n📊 Example 2: Growing Without Systems\n');
  
  const response = await fetch(`${API_BASE}/api/clarity-snapshot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      selections: {
        presenceChannels: ['website', 'word_of_mouth'],
        teamShape: 'small_crew_2_5',
        scheduling: 'texts_calls',
        invoicing: 'inconsistent',
        callHandling: 'business_phone',
        businessFeeling: 'stuck_in_day_to_day'
      },
      businessName: 'ABC Construction',
      websiteUrl: 'https://example.com'
    })
  });
  
  const data = await response.json();
  
  console.log('Classification:');
  console.log(`  Stage: ${data.classification.stage}`);
  console.log(`  Archetype: ${data.classification.topArchetype}`);
  console.log(`  Confidence: ${data.classification.confidence}%`);
  
  console.log('\nWhat\'s Happening:');
  data.panes.whatsHappening.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
  
  if (data.evidenceNuggets && data.evidenceNuggets.length > 0) {
    console.log('\nEvidence from Online Presence:');
    data.evidenceNuggets.forEach(nugget => {
      console.log(`  [${nugget.source}] ${nugget.snippet}`);
    });
  }
  
  console.log(`\nExecution Time: ${data.metadata.executionTimeMs}ms`);
  if (data.metadata.enrichmentTimeMs) {
    console.log(`Enrichment Time: ${data.metadata.enrichmentTimeMs}ms`);
  }
}

// ============================================================================
// EXAMPLE 3: Marketing Led Chaos
// ============================================================================

async function exampleMarketingChaos() {
  console.log('\n📊 Example 3: Marketing Led Chaos\n');
  
  const response = await fetch(`${API_BASE}/api/clarity-snapshot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      selections: {
        presenceChannels: ['website', 'social', 'google_reviews'],
        teamShape: 'small_crew_2_5',
        scheduling: 'calendar_app',
        invoicing: 'quickbooks_invoicing_app',
        callHandling: 'missed_calls_often',
        businessFeeling: 'reactive_all_the_time'
      },
      businessName: 'Digital Marketing Agency'
    })
  });
  
  const data = await response.json();
  
  console.log('Classification:');
  console.log(`  Stage: ${data.classification.stage}`);
  console.log(`  Archetype: ${data.classification.topArchetype}`);
  console.log(`  Confidence: ${data.classification.confidence}%`);
  console.log(`  Key Flags: ${data.classification.keyFlags.join(', ')}`);
  
  console.log('\nWhat\'s Happening:');
  data.panes.whatsHappening.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
  
  console.log('\nWhat It Costs:');
  data.panes.whatItCosts.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
  
  console.log('\nWhat to Fix First:');
  data.panes.whatToFixFirst.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
  
  if (data.panes.correctionPrompt) {
    console.log('\n⚠️  Correction Prompt (low confidence):');
    console.log(`  ${data.panes.correctionPrompt.question}`);
    console.log(`  A) ${data.panes.correctionPrompt.optionA}`);
    console.log(`  B) ${data.panes.correctionPrompt.optionB}`);
  }
  
  console.log(`\nExecution Time: ${data.metadata.executionTimeMs}ms`);
}

// ============================================================================
// RUN EXAMPLES
// ============================================================================

async function main() {
  console.log('🚀 Clarity Snapshot API Examples\n');
  console.log('Make sure the dev server is running on http://localhost:3000\n');
  
  try {
    await exampleSoloOperator();
    await exampleGrowingWithoutSystems();
    await exampleMarketingChaos();
    
    console.log('\n✅ All examples completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.log('\nMake sure the dev server is running: npm run dev\n');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { exampleSoloOperator, exampleGrowingWithoutSystems, exampleMarketingChaos };

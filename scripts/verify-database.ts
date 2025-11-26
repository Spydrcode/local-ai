/**
 * Verify Supabase database schema
 *
 * Usage: npx tsx scripts/verify-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EXPECTED_TABLES = [
  'contractor_leads',
  'contractor_lead_predictions',
  'contractor_market_signals',
  'contractor_job_postings',
  'contractor_applicants',
  'contractor_onboarding_checklists',
  'contractor_jobs',
  'contractor_job_photos',
  'contractor_qc_checklists',
  'contractor_qc_analyses',
  'contractor_alert_configs',
  'contractor_alerts',
  'contractor_monitoring_snapshots',
  'contractor_alert_templates',
  'contractor_integrations',
  'contractor_sync_logs',
  'contractor_data_mappings',
  'contractor_integration_templates',
];

async function main() {
  console.log('🔍 Verifying Supabase database schema...\n');

  // Check connection
  console.log('📡 Testing connection...');
  const { data: testData, error: testError } = await supabase.from('demos').select('id').limit(1);

  if (testError) {
    console.error('❌ Connection failed:', testError.message);
    process.exit(1);
  }

  console.log('✅ Connection successful\n');

  // Check demos table columns
  console.log('📋 Checking demos table...');
  const { data: demoData, error: demoError } = await supabase
    .from('demos')
    .select('contractor_profile, contractor_mode')
    .limit(1);

  if (demoError) {
    console.log('⚠️  demos table missing contractor columns');
    console.log('   Run: ALTER TABLE demos ADD COLUMN contractor_profile JSONB;');
    console.log('   Run: ALTER TABLE demos ADD COLUMN contractor_mode BOOLEAN DEFAULT false;\n');
  } else {
    console.log('✅ demos table has contractor columns\n');
  }

  // Check contractor tables
  console.log('📊 Checking contractor tables...');
  const existing: string[] = [];
  const missing: string[] = [];

  for (const table of EXPECTED_TABLES) {
    const { error } = await supabase.from(table).select('*').limit(0);

    if (error) {
      missing.push(table);
      console.log(`❌ ${table}`);
    } else {
      existing.push(table);
      console.log(`✅ ${table}`);
    }
  }

  console.log(`\n📈 Summary: ${existing.length}/${EXPECTED_TABLES.length} tables exist\n`);

  if (missing.length > 0) {
    console.log('⚠️  Missing tables:');
    missing.forEach((t) => console.log(`   - ${t}`));
    console.log('\n💡 To fix: Run supabase/APPLY_ALL_CONTRACTOR_MIGRATIONS.sql in Supabase SQL Editor');
    console.log('   https://supabase.com/dashboard/project/dtegqjoqywlxzsfkurzh/sql/new\n');
  }

  // Check templates
  console.log('🎨 Checking pre-configured templates...');

  const { data: alertTemplates, error: alertError } = await supabase
    .from('contractor_alert_templates')
    .select('alert_type');

  if (alertError) {
    console.log('❌ Alert templates table missing');
  } else {
    console.log(`✅ Alert templates: ${alertTemplates?.length || 0} types`);
    alertTemplates?.forEach((t: any) => console.log(`   - ${t.alert_type}`));
  }

  const { data: integrationTemplates, error: integrationError } = await supabase
    .from('contractor_integration_templates')
    .select('integration_type');

  if (integrationError) {
    console.log('❌ Integration templates table missing');
  } else {
    console.log(`\n✅ Integration templates: ${integrationTemplates?.length || 0} types`);
    integrationTemplates?.forEach((t: any) => console.log(`   - ${t.integration_type}`));
  }

  const { data: onboardingTemplates, error: onboardingError } = await supabase
    .from('contractor_onboarding_checklists')
    .select('checklist_name')
    .eq('is_system_template', true);

  if (onboardingError) {
    console.log('❌ Onboarding templates table missing');
  } else {
    console.log(`\n✅ Onboarding templates: ${onboardingTemplates?.length || 0}`);
    onboardingTemplates?.forEach((t: any) => console.log(`   - ${t.checklist_name}`));
  }

  console.log('\n✨ Verification complete!');

  if (missing.length === 0) {
    console.log('🎉 All contractor tables are ready!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Test onboarding: http://localhost:3000/contractor/onboard?demo_id=YOUR_DEMO_ID');
    console.log('   2. Configure integrations in .env.local');
    console.log('   3. Set up Redis for BullMQ workers');
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

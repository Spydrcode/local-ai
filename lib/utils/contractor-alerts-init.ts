/**
 * Initialize default alert configurations for new contractor profiles
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function initializeAlertConfigs(demo_id: string) {
  console.log('[ContractorAlertsInit] Initializing alert configs for demo:', demo_id);

  // Fetch alert templates
  const { data: templates, error: templatesError } = await supabase
    .from('contractor_alert_templates')
    .select('*');

  if (templatesError) {
    console.error('[ContractorAlertsInit] Error fetching templates:', templatesError);
    throw templatesError;
  }

  if (!templates || templates.length === 0) {
    console.warn('[ContractorAlertsInit] No alert templates found');
    return;
  }

  // Create alert configs from templates
  const configs = templates.map((template) => ({
    demo_id,
    alert_type: template.alert_type,
    is_enabled: template.default_enabled,
    check_frequency: template.default_frequency,
    threshold_config: template.default_threshold_config,
    notification_channels: ['in_app'], // Default to in-app only
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { error: insertError } = await supabase
    .from('contractor_alert_configs')
    .insert(configs);

  if (insertError) {
    console.error('[ContractorAlertsInit] Error inserting configs:', insertError);
    throw insertError;
  }

  console.log(`[ContractorAlertsInit] Created ${configs.length} alert configs for demo ${demo_id}`);
}

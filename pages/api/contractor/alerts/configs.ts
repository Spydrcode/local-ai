/**
 * API: /api/contractor/alerts/configs
 *
 * GET: List alert configs for a demo
 * POST: Create/update alert config
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * GET: List alert configs
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { demoId } = req.query;

  if (!demoId) {
    return res.status(400).json({ error: 'demoId required' });
  }

  const { data, error } = await supabase
    .from('contractor_alert_configs')
    .select('*')
    .eq('demo_id', demoId)
    .order('alert_type');

  if (error) {
    console.error('[API /contractor/alerts/configs] Error fetching configs:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ configs: data });
}

/**
 * POST: Create or update alert config
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { id, demoId, alert_type, is_enabled, check_frequency, threshold_config, notification_channels } = req.body;

  if (!demoId || !alert_type) {
    return res.status(400).json({ error: 'demoId and alert_type required' });
  }

  const config_data = {
    demo_id: demoId,
    alert_type,
    is_enabled: is_enabled ?? true,
    check_frequency: check_frequency || 'daily',
    threshold_config: threshold_config || {},
    notification_channels: notification_channels || ['in_app'],
    updated_at: new Date().toISOString(),
  };

  let result;

  if (id) {
    // Update existing
    const { data, error } = await supabase
      .from('contractor_alert_configs')
      .update(config_data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[API /contractor/alerts/configs] Error updating config:', error);
      return res.status(500).json({ error: error.message });
    }

    result = data;
  } else {
    // Create new
    const { data, error } = await supabase
      .from('contractor_alert_configs')
      .insert({ ...config_data, created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      console.error('[API /contractor/alerts/configs] Error creating config:', error);
      return res.status(500).json({ error: error.message });
    }

    result = data;
  }

  return res.status(200).json({ config: result });
}

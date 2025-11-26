/**
 * API: /api/contractor/alerts
 *
 * GET: List all alerts for a demo
 * POST: Acknowledge/resolve an alert
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
 * GET: List alerts
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { demoId, status, severity } = req.query;

  if (!demoId) {
    return res.status(400).json({ error: 'demoId required' });
  }

  let query = supabase
    .from('contractor_alerts')
    .select('*')
    .eq('demo_id', demoId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (severity) {
    query = query.eq('severity', severity);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[API /contractor/alerts] Error fetching alerts:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ alerts: data });
}

/**
 * POST: Update alert status
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { alertId, action } = req.body;

  if (!alertId || !action) {
    return res.status(400).json({ error: 'alertId and action required' });
  }

  const updates: any = { updated_at: new Date().toISOString() };

  if (action === 'acknowledge') {
    updates.status = 'acknowledged';
    updates.acknowledged_at = new Date().toISOString();
  } else if (action === 'resolve') {
    updates.status = 'resolved';
    updates.resolved_at = new Date().toISOString();
  } else if (action === 'dismiss') {
    updates.status = 'dismissed';
  } else {
    return res.status(400).json({ error: 'Invalid action' });
  }

  const { data, error } = await supabase
    .from('contractor_alerts')
    .update(updates)
    .eq('id', alertId)
    .select()
    .single();

  if (error) {
    console.error('[API /contractor/alerts] Error updating alert:', error);
    return res.status(500).json({ error: error.message });
  }

  // Refresh materialized view
  await supabase.rpc('refresh_contractor_alert_summary');

  return res.status(200).json({ alert: data });
}

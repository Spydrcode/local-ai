/**
 * API: /api/contractor/integrations
 *
 * GET: List integrations for a demo
 * POST: Create integration
 * DELETE: Disconnect integration
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
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * GET: List integrations
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { demoId } = req.query;

  if (!demoId) {
    return res.status(400).json({ error: 'demoId required' });
  }

  const { data, error } = await supabase
    .from('contractor_integrations')
    .select('*')
    .eq('demo_id', demoId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[API /contractor/integrations] Error fetching integrations:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ integrations: data });
}

/**
 * POST: Create integration
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { demoId, integration_type, credentials, config, sync_frequency } = req.body;

  if (!demoId || !integration_type || !credentials) {
    return res.status(400).json({ error: 'demoId, integration_type, and credentials required' });
  }

  const { data, error } = await supabase
    .from('contractor_integrations')
    .insert({
      demo_id: demoId,
      integration_type,
      credentials,
      config: config || {},
      sync_frequency: sync_frequency || 'hourly',
      auto_sync: true,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[API /contractor/integrations] Error creating integration:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ integration: data });
}

/**
 * DELETE: Disconnect integration
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { integrationId } = req.body;

  if (!integrationId) {
    return res.status(400).json({ error: 'integrationId required' });
  }

  const { error } = await supabase
    .from('contractor_integrations')
    .update({
      status: 'disconnected',
      credentials: {},
      updated_at: new Date().toISOString(),
    })
    .eq('id', integrationId);

  if (error) {
    console.error('[API /contractor/integrations] Error disconnecting:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}

/**
 * API: /api/contractor/integrations/templates
 *
 * GET: List available integration templates
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data, error } = await supabase
    .from('contractor_integration_templates')
    .select('*')
    .eq('is_active', true)
    .order('integration_type');

  if (error) {
    console.error('[API /contractor/integrations/templates] Error fetching templates:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ templates: data });
}

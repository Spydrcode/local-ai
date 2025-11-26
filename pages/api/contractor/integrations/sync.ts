/**
 * API: /api/contractor/integrations/sync
 *
 * POST: Trigger manual sync for an integration
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { triggerManualSync } from '@/lib/jobs/integration-sync-scheduler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { demoId, integrationId } = req.body;

  if (!demoId || !integrationId) {
    return res.status(400).json({ error: 'demoId and integrationId required' });
  }

  try {
    await triggerManualSync(demoId, integrationId);
    return res.status(200).json({
      success: true,
      message: 'Sync job queued. This may take a few minutes.',
    });
  } catch (error: any) {
    console.error('[API /contractor/integrations/sync] Error triggering sync:', error);
    return res.status(500).json({ error: error.message });
  }
}

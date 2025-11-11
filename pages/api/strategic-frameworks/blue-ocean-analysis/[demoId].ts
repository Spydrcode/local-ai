import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/server/supabaseAdmin';
import { AgencyService } from '@/lib/services/agency-service';
import { blueOceanAgent } from '@/lib/agents/strategic-frameworks/BlueOceanAgent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { demoId } = req.query;
    if (!demoId || typeof demoId !== 'string') {
      return res.status(400).json({ error: 'Invalid demo ID' });
    }

    const { data: demo, error: demoError } = await supabaseAdmin!
      .from('demos')
      .select('*')
      .eq('id', demoId)
      .single();

    if (demoError || !demo) {
      return res.status(404).json({ error: 'Demo not found' });
    }

    if (demo.agency_id) {
      const canCreate = await AgencyService.canCreateReport(demo.agency_id);
      if (!canCreate) {
        return res.status(429).json({ error: 'Monthly report limit reached' });
      }
    }

    const result = await blueOceanAgent.analyze({
      businessName: demo.business_name,
      websiteUrl: demo.website_url,
      industry: demo.industry || 'general',
      siteSummary: demo.site_summary,
    });

    if (demo.agency_id && demo.created_by_email) {
      await AgencyService.logActivity(demo.agency_id, demo.created_by_email, 'analyzed_blue_ocean', demoId);
      await AgencyService.incrementReportUsage(demo.agency_id);
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Blue Ocean error:', error);
    return res.status(500).json({ error: 'Failed to generate Blue Ocean analysis', details: error instanceof Error ? error.message : 'Unknown error' });
  }
}

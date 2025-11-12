import { NextApiRequest, NextApiResponse } from 'next';
import { StripeService } from '@/lib/services/stripe-service';
import { supabaseAdmin } from '@/server/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { agencyId } = req.body;

    if (!agencyId) {
      return res.status(400).json({ error: 'Missing agencyId' });
    }

    // Get agency's Stripe customer ID
    const { data: agency, error: agencyError } = await supabaseAdmin!
      .from('agencies')
      .select('stripe_customer_id')
      .eq('id', agencyId)
      .single();

    if (agencyError || !agency || !agency.stripe_customer_id) {
      return res.status(404).json({ error: 'Agency not found or no Stripe customer' });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await StripeService.createPortalSession(
      agency.stripe_customer_id,
      `${baseUrl}/agency/settings`
    );

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Portal creation error:', error);
    return res.status(500).json({
      error: 'Failed to create portal session',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

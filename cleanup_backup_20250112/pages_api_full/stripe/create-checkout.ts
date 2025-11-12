import { NextApiRequest, NextApiResponse } from 'next';
import { StripeService } from '@/lib/services/stripe-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, billingPeriod, agencyEmail, agencyName } = req.body;

    if (!planId || !billingPeriod || !agencyEmail || !agencyName) {
      return res.status(400).json({
        error: 'Missing required fields: planId, billingPeriod, agencyEmail, agencyName',
      });
    }

    if (!['monthly', 'annual'].includes(billingPeriod)) {
      return res.status(400).json({
        error: 'billingPeriod must be "monthly" or "annual"',
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await StripeService.createCheckoutSession({
      planId,
      billingPeriod,
      agencyEmail,
      agencyName,
      successUrl: `${baseUrl}/agency/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing`,
    });

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout creation error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

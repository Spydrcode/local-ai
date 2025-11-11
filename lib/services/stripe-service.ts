import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number | null; // in cents
  annualPrice: number | null;
  reportLimit: number; // -1 for unlimited
  teamMemberLimit: number;
}

const pricingPlans: PricingPlan[] = [
  { id: 'solo', name: 'Solo Consultant', monthlyPrice: 9900, annualPrice: 99000, reportLimit: 10, teamMemberLimit: 1 },
  { id: 'starter', name: 'Agency Starter', monthlyPrice: 29900, annualPrice: 299000, reportLimit: 50, teamMemberLimit: 3 },
  { id: 'pro', name: 'Agency Pro', monthlyPrice: 69900, annualPrice: 699000, reportLimit: -1, teamMemberLimit: 10 },
  { id: 'enterprise', name: 'Enterprise', monthlyPrice: null, annualPrice: null, reportLimit: -1, teamMemberLimit: -1 },
];

export class StripeService {
  /**
   * Create a Stripe checkout session for a subscription
   */
  static async createCheckoutSession(params: {
    planId: string;
    billingPeriod: 'monthly' | 'annual';
    agencyEmail: string;
    agencyName: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    const plan = pricingPlans.find(p => p.id === params.planId);
    if (!plan) throw new Error('Invalid plan ID');

    const priceId = this.getPriceId(params.planId, params.billingPeriod);
    if (!priceId) throw new Error('Price not available for this plan');

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: params.agencyEmail,
      client_reference_id: params.agencyName,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        plan_id: params.planId,
        billing_period: params.billingPeriod,
      },
    });

    return session;
  }

  /**
   * Create a Stripe customer portal session for managing subscriptions
   */
  static async createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  }

  /**
   * Get Stripe Price ID for a plan (you need to create these in Stripe Dashboard)
   */
  private static getPriceId(planId: string, billingPeriod: 'monthly' | 'annual'): string | null {
    // TODO: Replace with actual Stripe Price IDs from your Stripe Dashboard
    const priceIds: Record<string, { monthly: string; annual: string }> = {
      solo: {
        monthly: process.env.STRIPE_PRICE_SOLO_MONTHLY || 'price_solo_monthly',
        annual: process.env.STRIPE_PRICE_SOLO_ANNUAL || 'price_solo_annual',
      },
      starter: {
        monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
        annual: process.env.STRIPE_PRICE_STARTER_ANNUAL || 'price_starter_annual',
      },
      pro: {
        monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
        annual: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual',
      },
    };

    return priceIds[planId]?.[billingPeriod] || null;
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private static async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const { supabaseAdmin } = await import('@/server/supabaseAdmin');

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const planId = session.metadata?.plan_id || 'solo';
    const agencyName = session.client_reference_id || 'Unnamed Agency';
    const customerEmail = session.customer_email;

    // Create or update agency
    const { data: existingAgency } = await supabaseAdmin!
      .from('agencies')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (existingAgency) {
      // Update existing agency
      await supabaseAdmin!
        .from('agencies')
        .update({
          stripe_subscription_id: subscriptionId,
          plan: planId,
          billing_cycle_start: new Date().toISOString().split('T')[0],
        })
        .eq('id', existingAgency.id);
    } else {
      // Create new agency
      const { data: newAgency } = await supabaseAdmin!
        .from('agencies')
        .insert({
          name: agencyName,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan: planId,
          billing_cycle_start: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      // Add the customer as the owner
      if (newAgency && customerEmail) {
        await supabaseAdmin!
          .from('team_members')
          .insert({
            agency_id: newAgency.id,
            email: customerEmail,
            role: 'owner',
            accepted_at: new Date().toISOString(),
            can_export: true,
            can_invite: true,
          });
      }
    }
  }

  private static async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const { supabaseAdmin } = await import('@/server/supabaseAdmin');

    const customerId = subscription.customer as string;
    const status = subscription.status;

    await supabaseAdmin!
      .from('agencies')
      .update({
        stripe_subscription_id: subscription.id,
        // Update plan based on subscription items
      })
      .eq('stripe_customer_id', customerId);

    console.log(`Subscription ${subscription.id} updated to status: ${status}`);
  }

  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const { supabaseAdmin } = await import('@/server/supabaseAdmin');

    const customerId = subscription.customer as string;

    // Downgrade to free tier or mark as inactive
    await supabaseAdmin!
      .from('agencies')
      .update({
        plan: 'solo',
        stripe_subscription_id: null,
      })
      .eq('stripe_customer_id', customerId);
  }

  private static async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    console.log(`Payment succeeded for invoice: ${invoice.id}`);
    // Reset monthly report usage on successful payment
    const { supabaseAdmin } = await import('@/server/supabaseAdmin');

    const customerId = invoice.customer as string;

    await supabaseAdmin!
      .from('agencies')
      .update({
        reports_used_this_month: 0,
        billing_cycle_start: new Date().toISOString().split('T')[0],
      })
      .eq('stripe_customer_id', customerId);
  }

  private static async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.error(`Payment failed for invoice: ${invoice.id}`);
    // Send notification to agency owner
    // Potentially downgrade access or show warning
  }
}

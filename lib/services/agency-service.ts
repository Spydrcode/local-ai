import { supabaseAdmin } from '@/server/supabaseAdmin';
import { Agency, AgencyBranding } from '@/types/agency';

export class AgencyService {
  /**
   * Ensure supabaseAdmin is available
   */
  private static ensureSupabase() {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not initialized. Check environment variables.');
    }
    return supabaseAdmin;
  }

  /**
   * Get agency by ID
   */
  static async getAgency(agencyId: string): Promise<Agency | null> {
    const supabase = this.ensureSupabase();

    const { data, error } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', agencyId)
      .single();

    if (error || !data) {
      console.error('Error fetching agency:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      logoUrl: data.logo_url,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      footerText: data.footer_text,
      websiteUrl: data.website_url,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      plan: data.plan,
      monthlyReportLimit: data.monthly_report_limit,
      reportsUsedThisMonth: data.reports_used_this_month,
      billingCycleStart: data.billing_cycle_start,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Get agency branding by ID
   */
  static async getBranding(agencyId: string): Promise<AgencyBranding | null> {
    const { data, error } = await this.ensureSupabase()
      .from('agencies')
      .select('id, name, logo_url, primary_color, secondary_color, footer_text, website_url')
      .eq('id', agencyId)
      .single();

    if (error || !data) {
      console.error('Error fetching agency branding:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      logoUrl: data.logo_url,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      footerText: data.footer_text,
      websiteUrl: data.website_url,
    };
  }

  /**
   * Get branding for a demo (via agency_id)
   */
  static async getBrandingForDemo(demoId: string): Promise<AgencyBranding | null> {
    const { data, error } = await this.ensureSupabase()
      .from('demos')
      .select('agency_id')
      .eq('id', demoId)
      .single();

    if (error || !data || !data.agency_id) {
      // Return default branding if no agency
      return {
        id: 'default',
        name: 'Business Intelligence Platform',
        primaryColor: '#10b981',
        secondaryColor: '#6366f1',
        footerText: 'Strategic Analysis Report',
      };
    }

    return this.getBranding(data.agency_id);
  }

  /**
   * Create new agency
   */
  static async createAgency(
    name: string,
    ownerEmail: string,
    plan: 'solo' | 'starter' | 'pro' | 'enterprise' = 'solo'
  ): Promise<string | null> {
    const { data, error } = await this.ensureSupabase()
      .from('agencies')
      .insert({
        name,
        plan,
        monthly_report_limit: plan === 'solo' ? 10 : plan === 'starter' ? 50 : -1,
        billing_cycle_start: new Date().toISOString().split('T')[0],
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('Error creating agency:', error);
      return null;
    }

    // Add owner as team member
    const { error: teamError } = await this.ensureSupabase()
      .from('team_members')
      .insert({
        agency_id: data.id,
        email: ownerEmail.toLowerCase(),
        role: 'owner',
        accepted_at: new Date().toISOString(),
        can_export: true,
        can_invite: true,
      });

    if (teamError) {
      console.error('Error adding owner to team:', teamError);
    }

    return data.id;
  }

  /**
   * Update agency branding
   */
  static async updateBranding(
    agencyId: string,
    updates: Partial<AgencyBranding>
  ): Promise<boolean> {
    const { error } = await this.ensureSupabase()
      .from('agencies')
      .update({
        name: updates.name,
        logo_url: updates.logoUrl,
        primary_color: updates.primaryColor,
        secondary_color: updates.secondaryColor,
        footer_text: updates.footerText,
        website_url: updates.websiteUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agencyId);

    if (error) {
      console.error('Error updating agency branding:', error);
      return false;
    }

    return true;
  }

  /**
   * Check if agency can create more reports
   */
  static async canCreateReport(agencyId: string): Promise<boolean> {
    const agency = await this.getAgency(agencyId);
    if (!agency) return false;

    // Unlimited reports
    if (agency.monthlyReportLimit === -1) return true;

    // Check if under limit
    return agency.reportsUsedThisMonth < agency.monthlyReportLimit;
  }

  /**
   * Increment report usage
   */
  static async incrementReportUsage(agencyId: string): Promise<boolean> {
    const { data, error } = await this.ensureSupabase().rpc('increment_report_usage', {
      p_agency_id: agencyId,
    });

    if (error) {
      console.error('Error incrementing report usage:', error);
      return false;
    }

    return data === true;
  }

  /**
   * Log activity
   */
  static async logActivity(
    agencyId: string,
    userEmail: string,
    action: string,
    demoId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.ensureSupabase().from('activity_log').insert({
      agency_id: agencyId,
      demo_id: demoId,
      user_email: userEmail,
      action,
      metadata,
    });
  }

  /**
   * Get usage stats for agency
   */
  static async getUsageStats(agencyId: string): Promise<{
    reportsThisMonth: number;
    reportLimit: number;
    reportsRemaining: number;
    mostUsedAnalyses: Array<{ analysis: string; count: number }>;
  } | null> {
    const agency = await this.getAgency(agencyId);
    if (!agency) return null;

    // Get most used analyses from activity log
    const { data: activityData } = await this.ensureSupabase()
      .from('activity_log')
      .select('action, metadata')
      .eq('agency_id', agencyId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1000);

    const analysisCounts: Record<string, number> = {};
    activityData?.forEach((entry) => {
      if (entry.action.startsWith('analyzed_')) {
        const analysisType = entry.action.replace('analyzed_', '');
        analysisCounts[analysisType] = (analysisCounts[analysisType] || 0) + 1;
      }
    });

    const mostUsedAnalyses = Object.entries(analysisCounts)
      .map(([analysis, count]) => ({ analysis, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      reportsThisMonth: agency.reportsUsedThisMonth,
      reportLimit: agency.monthlyReportLimit,
      reportsRemaining:
        agency.monthlyReportLimit === -1
          ? -1
          : agency.monthlyReportLimit - agency.reportsUsedThisMonth,
      mostUsedAnalyses,
    };
  }

  /**
   * Update Stripe subscription
   */
  static async updateStripeSubscription(
    agencyId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string
  ): Promise<boolean> {
    const { error } = await this.ensureSupabase()
      .from('agencies')
      .update({
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agencyId);

    if (error) {
      console.error('Error updating Stripe subscription:', error);
      return false;
    }

    return true;
  }

  /**
   * Update agency plan
   */
  static async updatePlan(
    agencyId: string,
    plan: 'solo' | 'starter' | 'pro' | 'enterprise'
  ): Promise<boolean> {
    const reportLimit = plan === 'solo' ? 10 : plan === 'starter' ? 50 : -1;

    const { error } = await this.ensureSupabase()
      .from('agencies')
      .update({
        plan,
        monthly_report_limit: reportLimit,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agencyId);

    if (error) {
      console.error('Error updating plan:', error);
      return false;
    }

    return true;
  }
}

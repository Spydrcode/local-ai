/**
 * MonthlyReportAgent
 *
 * Generates comprehensive monthly business reports for contractors.
 * Analyzes KPIs, identifies risks and opportunities, prioritizes actions.
 *
 * Output: One-page executive summary with actionable insights
 */

import type {
  MonthlyReportInput,
  MonthlyReportOutput,
  MonthlyOnePager,
  KPISnapshot,
  BusinessRisk,
  BusinessOpportunity,
  ActionItem,
  Trend,
  RiskLevel,
  OpportunityImpact
} from '@/lib/types/contractor-reports';

export class MonthlyReportAgent {
  /**
   * Generate monthly one-pager report
   */
  static generateMonthlyReport(input: MonthlyReportInput): MonthlyReportOutput {
    const {
      demo_id,
      month_start,
      month_end,
      profile,
      leads_data,
      jobs_data,
      qc_data,
      predictions_data,
      market_signals
    } = input;

    // Step 1: Calculate KPI snapshot
    const kpi_snapshot = this.calculateKPIs(leads_data, jobs_data, qc_data, month_start, month_end);

    // Step 2: Identify risks
    const all_risks = this.identifyRisks(kpi_snapshot, leads_data, jobs_data, qc_data, profile);
    const top_3_risks = all_risks.slice(0, 3);

    // Step 3: Identify opportunities
    const all_opportunities = this.identifyOpportunities(
      kpi_snapshot,
      leads_data,
      jobs_data,
      market_signals,
      profile
    );
    const top_3_opportunities = all_opportunities.slice(0, 3);

    // Step 4: Generate action items
    const action_items = this.generateActionItems(top_3_risks, top_3_opportunities, kpi_snapshot);

    // Step 5: Write executive summary
    const executive_summary = this.generateExecutiveSummary(
      kpi_snapshot,
      top_3_risks,
      top_3_opportunities,
      profile
    );

    // Step 6: Calculate confidence
    const data_completeness = this.calculateDataCompleteness(leads_data, jobs_data, qc_data);
    const confidence_level = data_completeness >= 0.7 ? 'high' : data_completeness >= 0.4 ? 'medium' : 'low';

    // Step 7: Prepare lead source breakdown
    const lead_sources_breakdown = this.analyzeLeadSources(leads_data);

    // Step 8: Prepare job types breakdown
    const job_types_breakdown = this.analyzeJobTypes(jobs_data);

    const report: MonthlyOnePager = {
      demo_id,
      month: month_start.toISOString().slice(0, 7),
      generated_at: new Date().toISOString(),
      executive_summary,
      kpi_snapshot,
      top_3_risks,
      top_3_opportunities,
      action_items,
      lead_sources_breakdown,
      job_types_breakdown,
      data_completeness,
      confidence_level
    };

    // Step 9: Prepare chart data
    const charts_data = this.prepareChartData(leads_data, jobs_data, month_start, month_end);

    return {
      report,
      charts_data,
      export_ready: true
    };
  }

  /**
   * Calculate KPI snapshot
   */
  private static calculateKPIs(
    leads_data: any[],
    jobs_data: any[],
    qc_data: any[],
    month_start: Date,
    month_end: Date
  ): KPISnapshot {
    // Current month
    const current_leads = leads_data.filter(l => {
      const date = new Date(l.created_at);
      return date >= month_start && date <= month_end;
    });

    // Previous month
    const prev_month_start = new Date(month_start);
    prev_month_start.setMonth(prev_month_start.getMonth() - 1);
    const prev_month_end = new Date(month_end);
    prev_month_end.setMonth(prev_month_end.getMonth() - 1);

    const prev_leads = leads_data.filter(l => {
      const date = new Date(l.created_at);
      return date >= prev_month_start && date <= prev_month_end;
    });

    // Leads per week
    const weeks_in_month = Math.ceil((month_end.getTime() - month_start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const current_leads_per_week = current_leads.length / weeks_in_month;
    const prev_leads_per_week = prev_leads.length / weeks_in_month;
    const leads_trend = this.calculateTrend(current_leads_per_week, prev_leads_per_week);

    // Close rate
    const current_won = current_leads.filter(l => l.status === 'won').length;
    const current_close_rate = current_leads.length > 0 ? current_won / current_leads.length : 0;

    const prev_won = prev_leads.filter(l => l.status === 'won').length;
    const prev_close_rate = prev_leads.length > 0 ? prev_won / prev_leads.length : 0;
    const close_rate_trend = this.calculateTrend(current_close_rate, prev_close_rate);

    // Average ticket
    const current_revenue = current_leads.filter(l => l.actual_value).reduce((sum, l) => sum + l.actual_value, 0);
    const current_avg_ticket = current_won > 0 ? current_revenue / current_won : 0;

    const prev_revenue = prev_leads.filter(l => l.actual_value).reduce((sum, l) => sum + l.actual_value, 0);
    const prev_avg_ticket = prev_won > 0 ? prev_revenue / prev_won : 0;
    const avg_ticket_trend = this.calculateTrend(current_avg_ticket, prev_avg_ticket);

    // Job backlog
    const current_backlog_jobs = jobs_data.filter(j => {
      const status = j.status;
      return ['scheduled', 'in_progress'].includes(status);
    });
    const current_backlog_days = this.calculateBacklogDays(current_backlog_jobs);

    const prev_month_jobs = jobs_data.filter(j => {
      const date = new Date(j.created_at);
      return date >= prev_month_start && date <= prev_month_end;
    });
    const prev_backlog_jobs = prev_month_jobs.filter(j =>
      ['scheduled', 'in_progress'].includes(j.status)
    );
    const prev_backlog_days = this.calculateBacklogDays(prev_backlog_jobs);
    const backlog_trend = this.calculateTrend(prev_backlog_days, current_backlog_days); // Inverse (lower is better)

    // QC pass rate
    const current_qc = qc_data.filter(q => {
      const date = new Date(q.analyzed_at);
      return date >= month_start && date <= month_end;
    });
    const current_passed = current_qc.filter(q => q.overall_assessment === 'pass').length;
    const current_qc_pass_rate = current_qc.length > 0 ? current_passed / current_qc.length : 0;

    const prev_qc = qc_data.filter(q => {
      const date = new Date(q.analyzed_at);
      return date >= prev_month_start && date <= prev_month_end;
    });
    const prev_passed = prev_qc.filter(q => q.overall_assessment === 'pass').length;
    const prev_qc_pass_rate = prev_qc.length > 0 ? prev_passed / prev_qc.length : 0;
    const qc_trend = this.calculateTrend(current_qc_pass_rate, prev_qc_pass_rate);

    return {
      leads_per_week: {
        current: Math.round(current_leads_per_week * 10) / 10,
        prev_month: Math.round(prev_leads_per_week * 10) / 10,
        trend: leads_trend.trend,
        trend_percentage: leads_trend.percentage
      },
      close_rate: {
        current: Math.round(current_close_rate * 100) / 100,
        prev_month: Math.round(prev_close_rate * 100) / 100,
        trend: close_rate_trend.trend,
        trend_percentage: close_rate_trend.percentage
      },
      avg_ticket: {
        current: Math.round(current_avg_ticket),
        prev_month: Math.round(prev_avg_ticket),
        trend: avg_ticket_trend.trend,
        trend_percentage: avg_ticket_trend.percentage
      },
      job_backlog_days: {
        current: current_backlog_days,
        prev_month: prev_backlog_days,
        trend: backlog_trend.trend
      },
      qc_pass_rate: current_qc.length > 0 ? {
        current: Math.round(current_qc_pass_rate * 100) / 100,
        prev_month: Math.round(prev_qc_pass_rate * 100) / 100,
        trend: qc_trend.trend
      } : undefined,
      revenue: {
        current: Math.round(current_revenue),
        prev_month: Math.round(prev_revenue),
        trend: avg_ticket_trend.trend,
        trend_percentage: this.calculateTrend(current_revenue, prev_revenue).percentage
      }
    };
  }

  /**
   * Calculate trend
   */
  private static calculateTrend(current: number, previous: number): { trend: Trend; percentage: number } {
    if (previous === 0) {
      return { trend: 'stable', percentage: 0 };
    }

    const percentage = ((current - previous) / previous) * 100;

    let trend: Trend = 'stable';
    if (percentage > 5) trend = 'up';
    else if (percentage < -5) trend = 'down';

    return { trend, percentage: Math.round(percentage * 10) / 10 };
  }

  /**
   * Calculate backlog days
   */
  private static calculateBacklogDays(jobs: any[]): number {
    if (jobs.length === 0) return 0;

    const now = new Date();
    const total_days = jobs.reduce((sum, job) => {
      const scheduled = new Date(job.scheduled_date || job.created_at);
      const days_waiting = Math.ceil((now.getTime() - scheduled.getTime()) / (24 * 60 * 60 * 1000));
      return sum + Math.max(0, days_waiting);
    }, 0);

    return Math.round(total_days / jobs.length);
  }

  /**
   * Identify risks
   */
  private static identifyRisks(
    kpis: KPISnapshot,
    leads_data: any[],
    jobs_data: any[],
    qc_data: any[],
    profile: any
  ): BusinessRisk[] {
    const risks: BusinessRisk[] = [];

    // Lead volume risk
    if (kpis.leads_per_week.trend === 'down' && Math.abs(kpis.leads_per_week.trend_percentage) >= 20) {
      risks.push({
        risk: `Lead volume down ${Math.abs(kpis.leads_per_week.trend_percentage)}% — urgent attention needed`,
        severity: 'critical',
        confidence: 0.9,
        category: 'leads',
        detected_from: 'Lead tracking data',
        recommended_action: 'Run Weekly Lead Pulse, increase ad spend, launch promotion',
        timeline: 'Address this week'
      });
    } else if (kpis.leads_per_week.trend === 'down' && Math.abs(kpis.leads_per_week.trend_percentage) >= 10) {
      risks.push({
        risk: `Lead volume declining (${Math.abs(kpis.leads_per_week.trend_percentage)}%)`,
        severity: 'high',
        confidence: 0.8,
        category: 'leads',
        detected_from: 'Lead tracking data',
        recommended_action: 'Review marketing channels, test new ad campaigns',
        timeline: 'Address next week'
      });
    }

    // Close rate risk
    if (kpis.close_rate.current < 0.25) {
      risks.push({
        risk: `Low close rate (${Math.round(kpis.close_rate.current * 100)}%) — losing too many opportunities`,
        severity: 'high',
        confidence: 0.85,
        category: 'leads',
        detected_from: 'Lead conversion analysis',
        recommended_action: 'Review sales process, improve follow-up, check pricing competitiveness',
        timeline: 'Address this month'
      });
    }

    // Quality control risk
    if (kpis.qc_pass_rate && kpis.qc_pass_rate.current < 0.80) {
      risks.push({
        risk: `QC pass rate below 80% (${Math.round(kpis.qc_pass_rate.current * 100)}%) — quality issues detected`,
        severity: 'high',
        confidence: 0.9,
        category: 'quality',
        detected_from: 'QC analysis data',
        recommended_action: 'Review training, implement stricter QC checks, address common defects',
        timeline: 'Address this week'
      });
    }

    // Backlog risk
    if (kpis.job_backlog_days.current > 14) {
      risks.push({
        risk: `Job backlog at ${kpis.job_backlog_days.current} days — customers waiting too long`,
        severity: 'medium',
        confidence: 0.8,
        category: 'crew',
        detected_from: 'Job scheduling data',
        recommended_action: 'Hire additional crew, improve scheduling efficiency, or pause new bookings',
        timeline: 'Address this month'
      });
    }

    // Review sentiment risk (future - would come from review monitoring)
    // Crew capacity risk (future - would come from crew utilization data)

    // Sort by severity
    return risks.sort((a, b) => {
      const severity_order: Record<RiskLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return severity_order[a.severity] - severity_order[b.severity];
    });
  }

  /**
   * Identify opportunities
   */
  private static identifyOpportunities(
    kpis: KPISnapshot,
    leads_data: any[],
    jobs_data: any[],
    market_signals: any[],
    profile: any
  ): BusinessOpportunity[] {
    const opportunities: BusinessOpportunity[] = [];

    // Revenue growth opportunity
    if (kpis.revenue && kpis.revenue.trend === 'up' && kpis.revenue.trend_percentage >= 15) {
      opportunities.push({
        opportunity: `Revenue up ${kpis.revenue.trend_percentage}% — momentum to accelerate growth`,
        impact: 'high',
        confidence: 0.9,
        category: 'growth',
        detected_from: 'Revenue trend analysis',
        recommended_action: 'Invest in marketing, expand service offerings, hire to meet demand',
        estimated_value: `Additional $${Math.round(kpis.revenue.current * 0.2).toLocaleString()}/month potential`
      });
    }

    // High close rate = pricing power
    if (kpis.close_rate.current >= 0.45) {
      opportunities.push({
        opportunity: `High close rate (${Math.round(kpis.close_rate.current * 100)}%) — strong pricing power`,
        impact: 'high',
        confidence: 0.85,
        category: 'pricing',
        detected_from: 'Lead conversion analysis',
        recommended_action: 'Test 5-10% price increase, add premium service tiers',
        estimated_value: `$${Math.round(kpis.avg_ticket.current * 0.08).toLocaleString()} per job potential`
      });
    }

    // Excellent QC = marketing opportunity
    if (kpis.qc_pass_rate && kpis.qc_pass_rate.current >= 0.95) {
      opportunities.push({
        opportunity: `Excellent quality (${Math.round(kpis.qc_pass_rate.current * 100)}% QC pass rate) — showcase this`,
        impact: 'medium',
        confidence: 0.8,
        category: 'marketing',
        detected_from: 'QC analysis data',
        recommended_action: 'Request reviews from recent customers, post before/after photos, highlight quality guarantee',
        estimated_value: '10-15% more leads from improved reputation'
      });
    }

    // Market signals (permits, trends)
    if (market_signals.length > 0) {
      const permit_signals = market_signals.filter(s => s.signal_type === 'building_permit');
      const permit_count = permit_signals.reduce((sum, s) => sum + s.signal_value, 0);

      if (permit_count > 30) {
        opportunities.push({
          opportunity: `${permit_count} new building permits in service area — strong demand ahead`,
          impact: 'high',
          confidence: 0.75,
          category: 'market',
          detected_from: 'Building permit data',
          recommended_action: 'Reach out to builders/contractors, prepare for increased demand, pre-schedule crews',
          estimated_value: `${Math.round(permit_count * 0.3)} potential new customers`
        });
      }
    }

    // Low backlog = capacity to grow
    if (kpis.job_backlog_days.current <= 5) {
      opportunities.push({
        opportunity: `Low backlog (${kpis.job_backlog_days.current} days) — capacity to take more work`,
        impact: 'high',
        confidence: 0.85,
        category: 'growth',
        detected_from: 'Job scheduling data',
        recommended_action: 'Increase ad spend by 20-30%, run limited-time promotion, reactivate old leads',
        estimated_value: `Could handle ${Math.round(kpis.leads_per_week.current * 0.5)} more leads/week`
      });
    }

    // Sort by impact
    return opportunities.sort((a, b) => {
      const impact_order: Record<OpportunityImpact, number> = { high: 0, medium: 1, low: 2 };
      return impact_order[a.impact] - impact_order[b.impact];
    });
  }

  /**
   * Generate action items
   */
  private static generateActionItems(
    risks: BusinessRisk[],
    opportunities: BusinessOpportunity[],
    kpis: KPISnapshot
  ): ActionItem[] {
    const actions: ActionItem[] = [];

    // Add actions from risks (highest priority)
    risks.forEach((risk, i) => {
      actions.push({
        priority: i + 1,
        action: risk.recommended_action,
        category: risk.category,
        deadline: risk.timeline.includes('today') ? 'today' :
                  risk.timeline.includes('this week') ? 'this_week' :
                  risk.timeline.includes('next week') ? 'next_week' : 'this_month',
        estimated_time: risk.severity === 'critical' ? '2-4 hours' : '1-2 hours',
        impact: `Mitigate ${risk.severity} risk`,
        owner: risk.category === 'crew' ? 'foreman' : 'owner'
      });
    });

    // Add actions from opportunities
    opportunities.forEach((opp, i) => {
      if (actions.length < 5) {
        actions.push({
          priority: risks.length + i + 1,
          action: opp.recommended_action,
          category: opp.category,
          deadline: opp.impact === 'high' ? 'this_week' : 'next_week',
          estimated_time: '1-3 hours',
          impact: opp.estimated_value || `Capture ${opp.impact} opportunity`,
          owner: opp.category === 'marketing' ? 'admin' : 'owner'
        });
      }
    });

    return actions.slice(0, 5); // Top 5 actions
  }

  /**
   * Generate executive summary
   */
  private static generateExecutiveSummary(
    kpis: KPISnapshot,
    risks: BusinessRisk[],
    opportunities: BusinessOpportunity[],
    profile: any
  ): string {
    let summary = `**${this.getMonthName(new Date())} Performance Summary**\n\n`;

    // Overall trend
    const positive_trends = [
      kpis.leads_per_week.trend === 'up',
      kpis.close_rate.trend === 'up',
      kpis.avg_ticket.trend === 'up',
      kpis.qc_pass_rate?.trend === 'up'
    ].filter(Boolean).length;

    if (positive_trends >= 3) {
      summary += `Strong month overall. `;
    } else if (positive_trends >= 2) {
      summary += `Mixed performance with both wins and areas to address. `;
    } else {
      summary += `Challenging month requiring immediate attention. `;
    }

    // Key metrics
    summary += `Generated ${Math.round(kpis.leads_per_week.current * 4)} leads with `;
    summary += `${Math.round(kpis.close_rate.current * 100)}% close rate. `;

    if (kpis.revenue) {
      summary += `Revenue: $${kpis.revenue.current.toLocaleString()}`;
      if (kpis.revenue.trend === 'up') {
        summary += ` (+${kpis.revenue.trend_percentage}% vs. last month)`;
      } else if (kpis.revenue.trend === 'down') {
        summary += ` (${kpis.revenue.trend_percentage}% vs. last month)`;
      }
      summary += `. `;
    }

    // Top concern
    if (risks.length > 0) {
      summary += `\n\n**Top Priority:** ${risks[0].risk}`;
    }

    // Top opportunity
    if (opportunities.length > 0) {
      summary += `\n\n**Best Opportunity:** ${opportunities[0].opportunity}`;
    }

    return summary;
  }

  /**
   * Calculate data completeness
   */
  private static calculateDataCompleteness(
    leads_data: any[],
    jobs_data: any[],
    qc_data: any[]
  ): number {
    let score = 0;

    if (leads_data.length >= 10) score += 0.4;
    else if (leads_data.length >= 5) score += 0.2;
    else if (leads_data.length >= 1) score += 0.1;

    if (jobs_data.length >= 5) score += 0.3;
    else if (jobs_data.length >= 2) score += 0.15;

    if (qc_data.length >= 3) score += 0.3;
    else if (qc_data.length >= 1) score += 0.15;

    return Math.min(1.0, score);
  }

  /**
   * Analyze lead sources
   */
  private static analyzeLeadSources(leads_data: any[]): Array<{
    source: string;
    count: number;
    conversion_rate: number;
  }> {
    const sources: Record<string, { count: number; won: number }> = {};

    leads_data.forEach(lead => {
      const source = lead.source || 'unknown';
      if (!sources[source]) {
        sources[source] = { count: 0, won: 0 };
      }
      sources[source].count++;
      if (lead.status === 'won') {
        sources[source].won++;
      }
    });

    return Object.entries(sources)
      .map(([source, data]) => ({
        source,
        count: data.count,
        conversion_rate: data.count > 0 ? data.won / data.count : 0
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Analyze job types
   */
  private static analyzeJobTypes(jobs_data: any[]): Array<{
    type: string;
    count: number;
    avg_value: number;
  }> {
    const types: Record<string, { count: number; total_value: number }> = {};

    jobs_data.forEach(job => {
      const type = job.job_type || job.service_type || 'other';
      if (!types[type]) {
        types[type] = { count: 0, total_value: 0 };
      }
      types[type].count++;
      if (job.final_value) {
        types[type].total_value += job.final_value;
      }
    });

    return Object.entries(types)
      .map(([type, data]) => ({
        type,
        count: data.count,
        avg_value: data.count > 0 ? Math.round(data.total_value / data.count) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Prepare chart data
   */
  private static prepareChartData(
    leads_data: any[],
    jobs_data: any[],
    month_start: Date,
    month_end: Date
  ): any {
    // Leads trend by week
    const leads_trend: Array<{ week: string; count: number }> = [];
    const current_date = new Date(month_start);

    while (current_date <= month_end) {
      const week_end = new Date(current_date);
      week_end.setDate(week_end.getDate() + 6);

      const week_leads = leads_data.filter(l => {
        const date = new Date(l.created_at);
        return date >= current_date && date <= week_end;
      });

      leads_trend.push({
        week: `Week ${leads_trend.length + 1}`,
        count: week_leads.length
      });

      current_date.setDate(current_date.getDate() + 7);
    }

    // Revenue trend by week
    const revenue_trend = leads_trend.map((week, i) => {
      const week_start = new Date(month_start);
      week_start.setDate(week_start.getDate() + (i * 7));
      const week_end = new Date(week_start);
      week_end.setDate(week_end.getDate() + 6);

      const week_revenue = leads_data.filter(l => {
        const date = new Date(l.created_at);
        return date >= week_start && date <= week_end && l.status === 'won' && l.actual_value;
      }).reduce((sum, l) => sum + l.actual_value, 0);

      return {
        week: week.week,
        revenue: Math.round(week_revenue)
      };
    });

    // Lead sources pie chart
    const lead_sources = this.analyzeLeadSources(leads_data);

    return {
      leads_trend,
      revenue_trend,
      lead_sources
    };
  }

  /**
   * Get month name
   */
  private static getMonthName(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}

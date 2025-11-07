import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";
import { chromium } from "playwright";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type MonitorType =
  | "competitor_activity"
  | "seo_ranking"
  | "market_trend"
  | "sentiment_analysis"
  | "website_changes";

export type AlertPriority = "critical" | "high" | "medium" | "low";
export type AlertAction =
  | "alert_immediately"
  | "alert_daily_digest"
  | "alert_weekly_digest";

export interface Monitor {
  id: string;
  businessId: string;
  type: MonitorType;
  threshold: string;
  action: AlertAction;
  isActive: boolean;
  frequency: "realtime" | "hourly" | "daily" | "weekly";
  config: Record<string, any>;
  lastChecked?: Date;
  lastTriggered?: Date;
}

export interface Alert {
  id: string;
  monitorId: string;
  businessId: string;
  type: MonitorType;
  priority: AlertPriority;
  title: string;
  description: string;
  data: any;
  actionable: string[];
  createdAt: Date;
  acknowledged: boolean;
}

export interface MonitoringPreferences {
  frequency: "daily" | "weekly" | "monthly";
  alertMethods: Array<"email" | "in_app" | "slack" | "webhook">;
  quietHours?: { start: string; end: string };
  monitors: Partial<
    Record<
      MonitorType,
      {
        enabled: boolean;
        threshold: any;
        action: AlertAction;
      }
    >
  >;
}

export class BusinessMonitor {
  /**
   * Setup monitoring for a business
   */
  async setupMonitoring(
    businessId: string,
    preferences: MonitoringPreferences
  ): Promise<Monitor[]> {
    const monitors: Monitor[] = [];

    // Create monitors based on preferences
    for (const [type, config] of Object.entries(preferences.monitors)) {
      if (config.enabled) {
        const monitor = await this.createMonitor({
          businessId,
          type: type as MonitorType,
          threshold: config.threshold,
          action: config.action,
          frequency: preferences.frequency,
          config: {},
        });
        monitors.push(monitor);
      }
    }

    return monitors;
  }

  /**
   * Create a new monitor
   */
  private async createMonitor(data: {
    businessId: string;
    type: MonitorType;
    threshold: any;
    action: AlertAction;
    frequency: string;
    config: Record<string, any>;
  }): Promise<Monitor> {
    const { data: monitor, error } = await supabase
      .from("business_monitors")
      .insert({
        business_id: data.businessId,
        type: data.type,
        threshold: JSON.stringify(data.threshold),
        action: data.action,
        frequency: data.frequency,
        config: data.config,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create monitor: ${error.message}`);

    return {
      id: monitor.id,
      businessId: monitor.business_id,
      type: monitor.type,
      threshold: monitor.threshold,
      action: monitor.action,
      isActive: monitor.is_active,
      frequency: monitor.frequency,
      config: monitor.config,
    };
  }

  /**
   * Run all monitoring checks for a business
   */
  async runMonitoring(businessId: string): Promise<Alert[]> {
    const { data: monitors } = await supabase
      .from("business_monitors")
      .select("*")
      .eq("business_id", businessId)
      .eq("is_active", true);

    if (!monitors || monitors.length === 0) return [];

    const alerts: Alert[] = [];

    for (const monitor of monitors) {
      try {
        const alert = await this.checkMonitor(monitor);
        if (alert) {
          alerts.push(alert);
          await this.processAlert(alert, monitor);
        }
      } catch (error) {
        console.error(`Monitor check failed for ${monitor.id}:`, error);
      }
    }

    return alerts;
  }

  /**
   * Check a specific monitor
   */
  private async checkMonitor(monitor: any): Promise<Alert | null> {
    const currentState = await this.fetchCurrentState(monitor);
    const previousState = await this.getLastKnownState(monitor);

    const change = await this.detectSignificantChange(
      currentState,
      previousState,
      monitor.threshold,
      monitor.type
    );

    if (!change.isSignificant) {
      // Update last checked time
      await supabase
        .from("business_monitors")
        .update({ last_checked_at: new Date().toISOString() })
        .eq("id", monitor.id);
      return null;
    }

    // Create alert
    const alert: Alert = {
      id: crypto.randomUUID(),
      monitorId: monitor.id,
      businessId: monitor.business_id,
      type: monitor.type,
      priority: change.priority,
      title: change.title,
      description: change.description,
      data: change.data,
      actionable: change.actionableSteps,
      createdAt: new Date(),
      acknowledged: false,
    };

    // Store alert
    await supabase.from("alerts").insert({
      id: alert.id,
      monitor_id: alert.monitorId,
      business_id: alert.businessId,
      type: alert.type,
      priority: alert.priority,
      title: alert.title,
      description: alert.description,
      data: alert.data,
      actionable: alert.actionable,
      created_at: alert.createdAt.toISOString(),
      acknowledged: false,
    });

    // Update monitor state
    await supabase
      .from("business_monitors")
      .update({
        last_checked_at: new Date().toISOString(),
        last_triggered_at: new Date().toISOString(),
      })
      .eq("id", monitor.id);

    // Store current state for next comparison
    await this.storeState(monitor.id, currentState);

    return alert;
  }

  /**
   * Fetch current state based on monitor type
   */
  private async fetchCurrentState(monitor: any): Promise<any> {
    switch (monitor.type) {
      case "competitor_activity":
        return await this.checkCompetitorActivity(monitor);

      case "seo_ranking":
        return await this.checkSEORanking(monitor);

      case "market_trend":
        return await this.checkMarketTrends(monitor);

      case "sentiment_analysis":
        return await this.checkSentiment(monitor);

      case "website_changes":
        return await this.checkWebsiteChanges(monitor);

      default:
        return null;
    }
  }

  private async checkCompetitorActivity(monitor: any): Promise<any> {
    // Get business and competitors
    const { data: business } = await supabase
      .from("demos")
      .select("*")
      .eq("id", monitor.business_id)
      .single();

    if (!business) return null;

    // Check competitor websites for changes
    const competitors = business.competitors || [];
    const activities = [];

    for (const competitor of competitors.slice(0, 5)) {
      try {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(competitor.url, { timeout: 15000 });

        const content = await page.content();
        await browser.close();

        // Analyze for significant changes
        const analysis = await this.analyzeCompetitorChanges(
          competitor,
          content
        );
        if (analysis.hasSignificantChanges) {
          activities.push({
            competitor: competitor.name,
            changes: analysis.changes,
            url: competitor.url,
          });
        }
      } catch (error) {
        console.error(`Failed to check competitor ${competitor.name}:`, error);
      }
    }

    return { activities, timestamp: new Date().toISOString() };
  }

  private async checkSEORanking(monitor: any): Promise<any> {
    // This would integrate with SEO ranking APIs (e.g., SEMrush, Ahrefs)
    // For now, return mock data
    return {
      rankings: [],
      timestamp: new Date().toISOString(),
    };
  }

  private async checkMarketTrends(monitor: any): Promise<any> {
    const { data: business } = await supabase
      .from("demos")
      .select("industry")
      .eq("id", monitor.business_id)
      .single();

    if (!business) return null;

    // Use AI to analyze market trends
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Analyze current market trends and emerging opportunities in the ${business.industry} industry. Focus on trends that emerged in the last 7 days. Provide JSON response.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content || "{}");
  }

  private async checkSentiment(monitor: any): Promise<any> {
    // This would analyze reviews, social media, etc.
    // For now, return mock data
    return {
      sentiment: "neutral",
      score: 0.5,
      sources: [],
      timestamp: new Date().toISOString(),
    };
  }

  private async checkWebsiteChanges(monitor: any): Promise<any> {
    const { data: business } = await supabase
      .from("demos")
      .select("site_url")
      .eq("id", monitor.business_id)
      .single();

    if (!business?.site_url) return null;

    try {
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(business.site_url, { timeout: 15000 });

      const content = await page.content();
      const title = await page.title();
      const screenshot = await page.screenshot({ type: "png" });

      await browser.close();

      return {
        content,
        title,
        screenshot: screenshot.toString("base64"),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Website check failed:", error);
      return null;
    }
  }

  /**
   * Get last known state for comparison
   */
  private async getLastKnownState(monitor: any): Promise<any> {
    const { data } = await supabase
      .from("monitor_states")
      .select("state")
      .eq("monitor_id", monitor.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return data?.state || null;
  }

  /**
   * Detect significant changes
   */
  private async detectSignificantChange(
    currentState: any,
    previousState: any,
    threshold: any,
    monitorType: string
  ): Promise<{
    isSignificant: boolean;
    priority: AlertPriority;
    title: string;
    description: string;
    data: any;
    actionableSteps: string[];
  }> {
    if (!previousState || !currentState) {
      return {
        isSignificant: false,
        priority: "low",
        title: "",
        description: "",
        data: {},
        actionableSteps: [],
      };
    }

    // Use AI to analyze significance of changes
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You analyze business monitoring data to detect significant changes. Respond with JSON only.",
        },
        {
          role: "user",
          content: `Compare these states and determine if there's a significant change:

Previous: ${JSON.stringify(previousState).substring(0, 1000)}
Current: ${JSON.stringify(currentState).substring(0, 1000)}

Monitor type: ${monitorType}
Threshold: ${JSON.stringify(threshold)}

Return:
{
  "isSignificant": boolean,
  "priority": "critical" | "high" | "medium" | "low",
  "title": "Brief title",
  "description": "Detailed description",
  "actionableSteps": ["step 1", "step 2"]
}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || "{}");

    return {
      isSignificant: analysis.isSignificant || false,
      priority: analysis.priority || "low",
      title: analysis.title || "Change detected",
      description: analysis.description || "",
      data: { currentState, previousState },
      actionableSteps: analysis.actionableSteps || [],
    };
  }

  private async analyzeCompetitorChanges(
    competitor: any,
    content: string
  ): Promise<{
    hasSignificantChanges: boolean;
    changes: string[];
  }> {
    // Simplified analysis - in production, compare with stored content
    return {
      hasSignificantChanges: false,
      changes: [],
    };
  }

  /**
   * Store state for future comparison
   */
  private async storeState(monitorId: string, state: any): Promise<void> {
    await supabase.from("monitor_states").insert({
      monitor_id: monitorId,
      state,
      created_at: new Date().toISOString(),
    });

    // Cleanup old states (keep last 30)
    const { data: states } = await supabase
      .from("monitor_states")
      .select("id")
      .eq("monitor_id", monitorId)
      .order("created_at", { ascending: false })
      .range(30, 1000);

    if (states && states.length > 0) {
      await supabase
        .from("monitor_states")
        .delete()
        .in(
          "id",
          states.map((s) => s.id)
        );
    }
  }

  /**
   * Process and send alert
   */
  private async processAlert(alert: Alert, monitor: any): Promise<void> {
    // Get business alert preferences
    const { data: business } = await supabase
      .from("demos")
      .select("alert_preferences")
      .eq("id", alert.businessId)
      .single();

    const preferences = business?.alert_preferences || {};

    // Send based on action type and preferences
    if (monitor.action === "alert_immediately") {
      await this.sendImmediateAlert(alert, preferences);
    }
    // For digest alerts, they'll be collected and sent in batches
  }

  private async sendImmediateAlert(
    alert: Alert,
    preferences: any
  ): Promise<void> {
    // Implementation would depend on configured alert methods
    // Examples: email, Slack, webhook, etc.
    console.log("Immediate alert:", alert.title);
  }

  /**
   * Get alerts for a business
   */
  async getAlerts(
    businessId: string,
    options?: {
      unacknowledgedOnly?: boolean;
      limit?: number;
      priority?: AlertPriority;
    }
  ): Promise<Alert[]> {
    let query = supabase
      .from("alerts")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (options?.unacknowledgedOnly) {
      query = query.eq("acknowledged", false);
    }

    if (options?.priority) {
      query = query.eq("priority", options.priority);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch alerts: ${error.message}`);

    return (data || []).map((a) => ({
      id: a.id,
      monitorId: a.monitor_id,
      businessId: a.business_id,
      type: a.type,
      priority: a.priority,
      title: a.title,
      description: a.description,
      data: a.data,
      actionable: a.actionable,
      createdAt: new Date(a.created_at),
      acknowledged: a.acknowledged,
    }));
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    await supabase
      .from("alerts")
      .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
      .eq("id", alertId);
  }
}

import { createClient } from "@supabase/supabase-js";
import { createAICompletion } from "../unified-ai-client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * ActionPlanner
 *
 * Generates detailed 90-day execution plans with weekly milestones,
 * resource allocation, templates, and progress tracking.
 */

interface ExecutionPlan {
  id: string;
  businessId: string;
  planName: string;
  objective: string;
  timeline: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
  };
  phases: Phase[];
  resources: ResourceAllocation;
  successMetrics: SuccessMetric[];
  templates: ContentTemplate[];
  estimatedROI: {
    conservative: number;
    realistic: number;
    optimistic: number;
  };
  createdAt: Date;
}

interface Phase {
  phaseNumber: number;
  name: string;
  startDay: number;
  endDay: number;
  objective: string;
  milestones: Milestone[];
  dependencies: string[]; // IDs of tasks that must complete first
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDay: number; // Day number in the 90-day plan
  tasks: Task[];
  status: "not_started" | "in_progress" | "completed" | "blocked";
  completedAt?: Date;
}

interface Task {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  requiredSkills: string[];
  priority: "critical" | "high" | "medium" | "low";
  status: "not_started" | "in_progress" | "completed" | "blocked";
  assignee?: string;
  completedAt?: Date;
}

interface ResourceAllocation {
  timeCommitment: {
    hoursPerWeek: number;
    distribution: Record<string, number>; // e.g., { "content": 10, "marketing": 5 }
  };
  budgetRequired: {
    total: number;
    breakdown: Array<{
      category: string;
      amount: number;
      description: string;
    }>;
  };
  toolsNeeded: Array<{
    name: string;
    purpose: string;
    monthlyCost: number;
    alternatives?: string[];
  }>;
  teamNeeds: Array<{
    role: string;
    commitment: string; // e.g., "Full-time", "10 hours/week"
    optional: boolean;
  }>;
}

interface SuccessMetric {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  measuredBy: string; // How to measure this
  checkpointDays: number[]; // Days to check progress
}

interface ContentTemplate {
  id: string;
  type: "email" | "social_post" | "blog_post" | "landing_page" | "ad_copy";
  platform?: string;
  title: string;
  content: string;
  instructions: string;
  variables: string[]; // Placeholders to fill in
  useCaseDay: number; // Day in plan when this should be used
}

interface PlanProgress {
  planId: string;
  currentDay: number;
  daysRemaining: number;
  percentComplete: number;
  milestonesCompleted: number;
  totalMilestones: number;
  tasksCompleted: number;
  totalTasks: number;
  onTrack: boolean;
  blockers: string[];
  nextMilestone: Milestone;
  upcomingTasks: Task[];
}

export class ActionPlanner {
  /**
   * Generate a comprehensive 90-day execution plan
   */
  async generateExecutionPlan(
    businessId: string,
    recommendations: any[],
    businessContext: {
      name: string;
      industry: string;
      stage: string;
      currentMetrics?: Record<string, any>;
      constraints?: {
        budget?: number;
        time?: number;
        team?: number;
      };
    }
  ): Promise<ExecutionPlan> {
    const prompt = this.buildPlanPrompt(
      businessId,
      recommendations,
      businessContext
    );

    const completion = await createAICompletion({
      messages: [
        {
          role: "system",
          content: `You are an expert business strategist creating detailed 90-day execution plans. 
Your plans must be:
- Specific and actionable with clear tasks
- Realistic given constraints
- Include weekly milestones
- Provide resource estimates
- Include success metrics
- Account for dependencies between tasks

Return valid JSON matching the ExecutionPlan schema.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 4000,
      jsonMode: true,
    });

    const planData = JSON.parse(completion || "{}");

    // Generate plan ID
    const planId = `plan_${businessId}_${Date.now()}`;

    // Structure the execution plan
    const plan: ExecutionPlan = {
      id: planId,
      businessId,
      planName: planData.planName || "90-Day Growth Plan",
      objective: planData.objective,
      timeline: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        totalDays: 90,
      },
      phases: this.structurePhases(planData.phases || []),
      resources: planData.resources || this.getDefaultResources(),
      successMetrics: planData.successMetrics || [],
      templates: [],
      estimatedROI: planData.estimatedROI || {
        conservative: 0,
        realistic: 0,
        optimistic: 0,
      },
      createdAt: new Date(),
    };

    // Generate content templates
    plan.templates = await this.generateTemplates(plan, businessContext);

    // Store plan in database
    await this.storePlan(plan);

    return plan;
  }

  /**
   * Build prompt for plan generation
   */
  private buildPlanPrompt(
    businessId: string,
    recommendations: any[],
    context: any
  ): string {
    const constraintsStr = context.constraints
      ? `Constraints: ${JSON.stringify(context.constraints)}`
      : "No specific constraints";

    const topRecommendations = recommendations
      .slice(0, 10)
      .map(
        (r, i) =>
          `${i + 1}. ${r.title || r.name}: ${r.description || r.summary}`
      )
      .join("\n");

    return `Create a detailed 90-day execution plan for ${context.name}, a ${context.stage} business in the ${context.industry} industry.

${constraintsStr}

Top Recommendations to Implement:
${topRecommendations}

Generate a comprehensive plan with:
1. 3-4 phases (each ~3-4 weeks)
2. Weekly milestones for each phase
3. Specific tasks with hour estimates
4. Resource allocation (time, budget, tools, team)
5. Success metrics with checkpoints
6. Dependencies between tasks
7. ROI estimates (conservative, realistic, optimistic)

Return JSON with this structure:
{
  "planName": "string",
  "objective": "string",
  "phases": [
    {
      "phaseNumber": 1,
      "name": "string",
      "startDay": 1,
      "endDay": 30,
      "objective": "string",
      "milestones": [
        {
          "name": "string",
          "description": "string",
          "dueDay": 7,
          "tasks": [
            {
              "name": "string",
              "description": "string",
              "estimatedHours": 10,
              "requiredSkills": ["marketing", "copywriting"],
              "priority": "high"
            }
          ]
        }
      ],
      "dependencies": []
    }
  ],
  "resources": {
    "timeCommitment": { "hoursPerWeek": 20, "distribution": {} },
    "budgetRequired": { "total": 5000, "breakdown": [] },
    "toolsNeeded": [],
    "teamNeeds": []
  },
  "successMetrics": [
    {
      "name": "Website Traffic",
      "currentValue": 1000,
      "targetValue": 5000,
      "unit": "visitors/month",
      "measuredBy": "Google Analytics",
      "checkpointDays": [30, 60, 90]
    }
  ],
  "estimatedROI": {
    "conservative": 15000,
    "realistic": 25000,
    "optimistic": 40000
  }
}`;
  }

  /**
   * Structure phases with proper IDs and status
   */
  private structurePhases(phasesData: any[]): Phase[] {
    return phasesData.map((phase) => ({
      ...phase,
      milestones: phase.milestones.map((m: any) => ({
        id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...m,
        status: m.status || "not_started",
        tasks: m.tasks.map((t: any) => ({
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...t,
          status: t.status || "not_started",
        })),
      })),
    }));
  }

  /**
   * Generate content templates for the plan
   */
  private async generateTemplates(
    plan: ExecutionPlan,
    context: any
  ): Promise<ContentTemplate[]> {
    const templates: ContentTemplate[] = [];

    // Determine which templates to generate based on phases
    const templateTypes = this.determineNeededTemplates(plan);

    for (const templateType of templateTypes) {
      const template = await this.generateTemplate(
        templateType.type,
        templateType.platform,
        templateType.purpose,
        context,
        templateType.useDay
      );
      templates.push(template);
    }

    return templates;
  }

  /**
   * Determine which templates are needed based on plan
   */
  private determineNeededTemplates(plan: ExecutionPlan): Array<{
    type: ContentTemplate["type"];
    platform?: string;
    purpose: string;
    useDay: number;
  }> {
    const needed: Array<any> = [];

    // Scan plan for mentions of content needs
    for (const phase of plan.phases) {
      for (const milestone of phase.milestones) {
        for (const task of milestone.tasks) {
          const taskLower =
            task.name.toLowerCase() + " " + task.description.toLowerCase();

          if (taskLower.includes("email") || taskLower.includes("newsletter")) {
            needed.push({
              type: "email",
              purpose: task.description,
              useDay: milestone.dueDay,
            });
          }

          if (taskLower.includes("social") || taskLower.includes("post")) {
            const platforms = ["linkedin", "twitter", "facebook", "instagram"];
            for (const platform of platforms) {
              if (taskLower.includes(platform)) {
                needed.push({
                  type: "social_post",
                  platform,
                  purpose: task.description,
                  useDay: milestone.dueDay,
                });
              }
            }
          }

          if (taskLower.includes("blog") || taskLower.includes("article")) {
            needed.push({
              type: "blog_post",
              purpose: task.description,
              useDay: milestone.dueDay,
            });
          }

          if (
            taskLower.includes("landing page") ||
            taskLower.includes("sales page")
          ) {
            needed.push({
              type: "landing_page",
              purpose: task.description,
              useDay: milestone.dueDay,
            });
          }

          if (taskLower.includes("ad") || taskLower.includes("advertisement")) {
            needed.push({
              type: "ad_copy",
              purpose: task.description,
              useDay: milestone.dueDay,
            });
          }
        }
      }
    }

    // Remove duplicates and limit
    const unique = needed
      .filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (t) => t.type === item.type && t.platform === item.platform
          )
      )
      .slice(0, 15); // Max 15 templates

    return unique;
  }

  /**
   * Generate a single content template
   */
  private async generateTemplate(
    type: ContentTemplate["type"],
    platform: string | undefined,
    purpose: string,
    context: any,
    useDay: number
  ): Promise<ContentTemplate> {
    const prompt = `Create a ${type} template for ${context.name} (${context.industry}).
${platform ? `Platform: ${platform}` : ""}
Purpose: ${purpose}

The template should:
- Include placeholders in [BRACKETS] for customization
- Follow best practices for ${type}
- Be specific to their business
- Include clear instructions for use

Return JSON with: { "title": "string", "content": "string", "instructions": "string", "variables": ["VAR1", "VAR2"] }`;

    const completion = await createAICompletion({
      messages: [
        {
          role: "system",
          content:
            "You are an expert copywriter creating reusable content templates. Return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      maxTokens: 1500,
      jsonMode: true,
    });

    const templateData = JSON.parse(completion || "{}");

    return {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      platform,
      title: templateData.title,
      content: templateData.content,
      instructions: templateData.instructions,
      variables: templateData.variables || [],
      useCaseDay: useDay,
    };
  }

  /**
   * Get default resource allocation
   */
  private getDefaultResources(): ResourceAllocation {
    return {
      timeCommitment: {
        hoursPerWeek: 10,
        distribution: {},
      },
      budgetRequired: {
        total: 0,
        breakdown: [],
      },
      toolsNeeded: [],
      teamNeeds: [],
    };
  }

  /**
   * Store plan in database
   */
  private async storePlan(plan: ExecutionPlan): Promise<void> {
    await supabase.from("action_plans").insert({
      id: plan.id,
      business_id: plan.businessId,
      plan_name: plan.planName,
      objective: plan.objective,
      timeline: plan.timeline,
      phases: plan.phases,
      resources: plan.resources,
      success_metrics: plan.successMetrics,
      templates: plan.templates,
      estimated_roi: plan.estimatedROI,
      created_at: plan.createdAt,
    });
  }

  /**
   * Get plan progress
   */
  async getPlanProgress(planId: string): Promise<PlanProgress> {
    const { data: plan } = await supabase
      .from("action_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!plan) {
      throw new Error("Plan not found");
    }

    const startDate = new Date(plan.created_at);
    const currentDay =
      Math.floor((Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000)) +
      1;
    const daysRemaining = 90 - currentDay;

    // Count milestones and tasks
    let totalMilestones = 0;
    let completedMilestones = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    const blockers: string[] = [];

    for (const phase of plan.phases) {
      for (const milestone of phase.milestones) {
        totalMilestones++;
        if (milestone.status === "completed") completedMilestones++;
        if (milestone.status === "blocked") {
          blockers.push(`${milestone.name}: ${milestone.description}`);
        }

        for (const task of milestone.tasks) {
          totalTasks++;
          if (task.status === "completed") completedTasks++;
          if (task.status === "blocked") {
            blockers.push(`${task.name}: ${task.description}`);
          }
        }
      }
    }

    const percentComplete =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Determine if on track (completed tasks should be proportional to days elapsed)
    const expectedProgress = (currentDay / 90) * 100;
    const onTrack = percentComplete >= expectedProgress * 0.8; // 80% threshold

    // Find next milestone
    const nextMilestone = plan.phases
      .flatMap((p: any) => p.milestones)
      .filter((m: any) => m.status !== "completed" && m.dueDay >= currentDay)
      .sort((a: any, b: any) => a.dueDay - b.dueDay)[0];

    // Get upcoming tasks (next 7 days)
    const upcomingTasks = plan.phases
      .flatMap((p: any) => p.milestones)
      .flatMap((m: any) =>
        m.tasks.map((t: any) => ({ ...t, milestoneDueDay: m.dueDay }))
      )
      .filter(
        (t: any) =>
          t.status !== "completed" &&
          t.milestoneDueDay >= currentDay &&
          t.milestoneDueDay <= currentDay + 7
      )
      .sort((a: any, b: any) => a.milestoneDueDay - b.milestoneDueDay)
      .slice(0, 10);

    return {
      planId,
      currentDay: Math.max(1, Math.min(90, currentDay)),
      daysRemaining: Math.max(0, daysRemaining),
      percentComplete,
      milestonesCompleted: completedMilestones,
      totalMilestones,
      tasksCompleted: completedTasks,
      totalTasks,
      onTrack,
      blockers,
      nextMilestone,
      upcomingTasks,
    };
  }

  /**
   * Update task or milestone status
   */
  async updateStatus(
    planId: string,
    itemId: string,
    itemType: "milestone" | "task",
    status: "not_started" | "in_progress" | "completed" | "blocked"
  ): Promise<void> {
    const { data: plan } = await supabase
      .from("action_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!plan) {
      throw new Error("Plan not found");
    }

    // Update the status in the plan structure
    for (const phase of plan.phases) {
      for (const milestone of phase.milestones) {
        if (itemType === "milestone" && milestone.id === itemId) {
          milestone.status = status;
          if (status === "completed") {
            milestone.completedAt = new Date();
          }
        }

        for (const task of milestone.tasks) {
          if (itemType === "task" && task.id === itemId) {
            task.status = status;
            if (status === "completed") {
              task.completedAt = new Date();
            }
          }
        }
      }
    }

    // Save updated plan
    await supabase
      .from("action_plans")
      .update({ phases: plan.phases })
      .eq("id", planId);
  }

  /**
   * Get template by ID
   */
  async getTemplate(
    planId: string,
    templateId: string
  ): Promise<ContentTemplate | null> {
    const { data: plan } = await supabase
      .from("action_plans")
      .select("templates")
      .eq("id", planId)
      .single();

    if (!plan || !plan.templates) return null;

    return (
      plan.templates.find((t: ContentTemplate) => t.id === templateId) || null
    );
  }

  /**
   * Get all templates for a plan
   */
  async getTemplates(
    planId: string,
    type?: ContentTemplate["type"]
  ): Promise<ContentTemplate[]> {
    const { data: plan } = await supabase
      .from("action_plans")
      .select("templates")
      .eq("id", planId)
      .single();

    if (!plan || !plan.templates) return [];

    const templates = plan.templates as ContentTemplate[];

    if (type) {
      return templates.filter((t) => t.type === type);
    }

    return templates;
  }
}

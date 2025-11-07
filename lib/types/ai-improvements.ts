/**
 * Comprehensive TypeScript types for LocalAI 2.0 AI improvements
 */

// ============================================================================
// Streaming Types
// ============================================================================

export interface StreamChunk {
  type: "partial" | "complete" | "error" | "progress";
  content: string;
  progress?: number;
  estimatedTimeRemaining?: number;
  tokensGenerated?: number;
  metadata?: Record<string, any>;
}

export interface StreamingOptions {
  businessId: string;
  agentType: "strategic" | "marketing" | "competitive";
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (result: string) => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// Orchestration Types
// ============================================================================

export interface AgentResult {
  agentType: string;
  content: string;
  executionTime: number;
  confidence: number;
}

export interface SynthesisResult {
  executiveSummary: string;
  crossFunctionalOpportunities: string[];
  prioritizedRecommendations: Array<{
    recommendation: string;
    priority: number;
    supportingAgents: string[];
    reasoning: string;
  }>;
  contradictions: string[];
  quickWins: string[];
  longTermInitiatives: string[];
}

export interface ComprehensiveAnalysis {
  individual: Record<string, AgentResult>;
  synthesis: SynthesisResult;
  totalExecutionTime: number;
  analysisId: string;
}

// ============================================================================
// Caching Types
// ============================================================================

export interface CachedData<T> {
  data: T | null;
  freshness: FreshnessScore;
  fromCache: boolean;
  cacheKey: string;
}

export interface FreshnessScore {
  score: number; // 0-1
  factors: {
    age: number;
    businessDataChanged: boolean;
    competitorActivityDetected: boolean;
    industryVolatility: number;
    accessFrequency: number;
  };
  recommendation: "use" | "refresh_background" | "force_refresh";
}

export interface CacheStatistics {
  totalEntries: number;
  hitRate: number;
  avgAge: number;
  byType: Record<string, number>;
  oldestEntry?: Date;
  newestEntry?: Date;
}

// ============================================================================
// Monitoring Types
// ============================================================================

export type MonitorType =
  | "competitor_activity"
  | "seo_ranking"
  | "market_trend"
  | "sentiment_analysis"
  | "website_changes";

export type AlertPriority = "critical" | "high" | "medium" | "low";

export interface MonitorConfig {
  enabled: boolean;
  threshold: string;
  action: "alert_immediately" | "alert_daily_digest" | "alert_weekly_digest";
}

export interface MonitoringPreferences {
  frequency: "hourly" | "daily" | "weekly";
  alertMethods: Array<"email" | "in_app" | "slack" | "webhook">;
  monitors: Record<MonitorType, MonitorConfig>;
}

export interface Alert {
  id: string;
  businessId: string;
  monitorType: MonitorType;
  priority: AlertPriority;
  title: string;
  description: string;
  actionableInsights: string[];
  detectedAt: Date;
  acknowledgedAt?: Date;
}

// ============================================================================
// Personalization Types
// ============================================================================

export type InteractionType =
  | "view"
  | "dismiss"
  | "implement"
  | "share"
  | "bookmark"
  | "feedback";
export type ContentType =
  | "insight"
  | "recommendation"
  | "analysis"
  | "benchmark"
  | "alert";
export type EngagementLevel = "high" | "medium" | "low";

export interface UserBehavior {
  userId: string;
  businessId: string;
  interactionType: InteractionType;
  contentType: ContentType;
  contentId: string;
  contentCategory?: string;
  engagement?: {
    timeSpent?: number;
    completionRate?: number;
    actionTaken?: boolean;
  };
  context?: {
    deviceType?: string;
    timeOfDay?: string;
    dayOfWeek?: string;
  };
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface UserPreferences {
  userId: string;
  preferredContentTypes: Array<{
    type: string;
    score: number;
  }>;
  preferredCategories: Array<{
    category: string;
    score: number;
  }>;
  interactionPatterns: {
    avgTimeSpent: number;
    preferredTimeOfDay?: string;
    preferredDayOfWeek?: string;
    devicePreference?: string;
  };
  topicInterests: Array<{
    topic: string;
    relevanceScore: number;
  }>;
  implementationRate: number;
  engagementLevel: EngagementLevel;
  lastUpdated: Date;
}

export interface PersonalizedRecommendation {
  originalRecommendation: any;
  personalizedScore: number;
  reasoning: string[];
  priority: AlertPriority;
  estimatedEngagement: number;
}

// ============================================================================
// Action Planning Types
// ============================================================================

export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "blocked";
export type TaskPriority = AlertPriority;

export interface Task {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  requiredSkills: string[];
  priority: TaskPriority;
  status: TaskStatus;
  assignee?: string;
  completedAt?: Date;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDay: number;
  tasks: Task[];
  status: TaskStatus;
  completedAt?: Date;
}

export interface Phase {
  phaseNumber: number;
  name: string;
  startDay: number;
  endDay: number;
  objective: string;
  milestones: Milestone[];
  dependencies: string[];
}

export interface ResourceAllocation {
  timeCommitment: {
    hoursPerWeek: number;
    distribution: Record<string, number>;
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
    commitment: string;
    optional: boolean;
  }>;
}

export interface SuccessMetric {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  measuredBy: string;
  checkpointDays: number[];
}

export type TemplateType =
  | "email"
  | "social_post"
  | "blog_post"
  | "landing_page"
  | "ad_copy";

export interface ContentTemplate {
  id: string;
  type: TemplateType;
  platform?: string;
  title: string;
  content: string;
  instructions: string;
  variables: string[];
  useCaseDay: number;
}

export interface ExecutionPlan {
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

export interface PlanProgress {
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

// ============================================================================
// ROI Prediction Types
// ============================================================================

export interface Assumption {
  name: string;
  value: number;
  unit: string;
  source: "user_input" | "industry_average" | "ai_estimate" | "historical_data";
  confidence: number;
}

export interface RiskFactor {
  name: string;
  impact: "high" | "medium" | "low";
  probability: number;
  mitigation: string;
}

export interface SimulationResults {
  runs: number;
  distribution: {
    min: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    max: number;
    mean: number;
    stdDev: number;
  };
  probabilityOfProfit: number;
  probabilityOfBreakeven: number;
}

export interface ROIPrediction {
  recommendationId: string;
  businessId: string;
  recommendation: {
    title: string;
    description: string;
    category: string;
  };
  prediction: {
    conservative: number;
    realistic: number;
    optimistic: number;
    expectedValue: number;
    confidence: number;
  };
  timeframe: {
    months: number;
    breakEvenMonths?: number;
  };
  assumptions: Assumption[];
  riskFactors: RiskFactor[];
  simulation: SimulationResults;
  createdAt: Date;
}

export interface ActualROI {
  predictionId: string;
  businessId: string;
  actualRevenue: number;
  actualCost: number;
  actualROI: number;
  timeframe: number;
  notes?: string;
  recordedAt: Date;
}

export interface PredictionAccuracy {
  predictionId: string;
  predictedROI: number;
  actualROI: number;
  accuracy: number;
  variance: number;
  percentError: number;
  learnings: string[];
}

// ============================================================================
// Competitive Intelligence Types
// ============================================================================

export interface WebsiteAnalysis {
  url: string;
  title: string;
  description: string;
  valueProposition: string;
  targetAudience: string;
  keyFeatures: string[];
  ctaStrategy: string[];
  design: {
    primaryColors: string[];
    style: string;
    userExperience: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    headings: string[];
    keywords: string[];
  };
  performance: {
    loadTime?: number;
    mobileOptimized: boolean;
  };
}

export interface TechStack {
  frontend: string[];
  backend?: string[];
  analytics: string[];
  marketing: string[];
  hosting?: string;
  cdn?: string;
  cms?: string;
}

export interface ContentStrategy {
  blogFrequency: string;
  contentTypes: string[];
  topTopics: string[];
  contentQuality: "high" | "medium" | "low";
  seoOptimization: "strong" | "moderate" | "weak";
}

export interface SocialPresence {
  platforms: Array<{
    platform: string;
    url?: string;
    followers?: number;
    engagement?: number;
    postFrequency?: string;
    contentStyle?: string;
  }>;
  overallStrength: "strong" | "moderate" | "weak";
}

export interface PricingAnalysis {
  model: string;
  tiers: Array<{
    name: string;
    price: number;
    features: string[];
  }>;
  positioning: string;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CompetitorProfile {
  id: string;
  name: string;
  website: string;
  industry: string;
  lastAnalyzed: Date;
  analysis: {
    website: WebsiteAnalysis;
    techStack: TechStack;
    contentStrategy: ContentStrategy;
    socialPresence: SocialPresence;
    pricing?: PricingAnalysis;
    swot: SWOT;
  };
  marketPosition: {
    estimatedMarketShare?: number;
    growthRate?: number;
    positioning: string;
  };
}

export interface MarketGapAnalysis {
  gaps: Array<{
    area: string;
    description: string;
    opportunity: string;
    difficulty: "low" | "medium" | "high";
    potentialImpact: "low" | "medium" | "high";
  }>;
  whitespace: string[];
  recommendations: string[];
}

// ============================================================================
// Industry Benchmarks Types
// ============================================================================

export type BusinessStage = "startup" | "growth" | "established" | "enterprise";
export type MetricCategory =
  | "traffic"
  | "conversion"
  | "revenue"
  | "engagement"
  | "marketing"
  | "operations";
export type Performance =
  | "top_10"
  | "top_25"
  | "above_average"
  | "average"
  | "below_average";

export interface BenchmarkMetric {
  metricName: string;
  unit: string;
  description: string;
  category: MetricCategory;
}

export interface IndustryBenchmark {
  industry: string;
  businessStage: BusinessStage;
  metric: string;
  statistics: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    mean: number;
    sampleSize: number;
  };
  updatedAt: Date;
}

export interface BenchmarkComparison {
  businessId: string;
  industry: string;
  stage: string;
  metrics: Array<{
    metric: string;
    yourValue: number;
    benchmarks: {
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
    };
    percentile: number;
    performance: Performance;
    gap: number;
    insights: string[];
  }>;
  overallScore: number;
  strengths: string[];
  improvementAreas: string[];
  generatedAt: Date;
}

export interface BenchmarkInsight {
  metric: string;
  insight: string;
  recommendation: string;
  priority: TaskPriority;
  potentialImpact: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface APIResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StreamingAnalysisRequest {
  businessId: string;
  agentType: "strategic" | "marketing" | "competitive";
}

export interface ComprehensiveAnalysisRequest {
  businessId: string;
  useStreaming?: boolean;
}

export interface CacheManagementRequest {
  action: "stats" | "invalidate" | "cleanup";
  businessId?: string;
  cacheKey?: string;
  olderThan?: number;
}

export interface MonitoringManagementRequest {
  action: "setup" | "run_checks" | "acknowledge_alert" | "get_alerts";
  businessId: string;
  preferences?: MonitoringPreferences;
  alertId?: string;
}

export interface PersonalizationRequest {
  action: "track" | "get_preferences" | "personalize" | "engagement_summary";
  userId: string;
  businessId?: string;
  interactionType?: InteractionType;
  contentType?: ContentType;
  contentId?: string;
  recommendations?: any[];
  forceRefresh?: boolean;
}

export interface ActionPlanningRequest {
  action: "generate_plan" | "get_progress" | "update_status" | "get_templates";
  businessId?: string;
  planId?: string;
  recommendations?: any[];
  businessContext?: any;
  itemId?: string;
  itemType?: "milestone" | "task";
  status?: TaskStatus;
  type?: TemplateType;
}

export interface ROIPredictionRequest {
  action: "predict" | "record_actual" | "get_predictions" | "get_accuracy";
  businessId?: string;
  recommendationId?: string;
  predictionId?: string;
  recommendation?: any;
  businessContext?: any;
  actualData?: any;
  options?: any;
}

export interface CompetitiveIntelligenceRequest {
  action: "analyze_competitor" | "identify_gaps";
  competitorName?: string;
  competitorWebsite?: string;
  industry?: string;
  yourBusinessId?: string;
  competitorProfiles?: CompetitorProfile[];
  context?: any;
}

export interface BenchmarkingRequest {
  action:
    | "compare"
    | "get_recommendations"
    | "submit_metrics"
    | "get_industries"
    | "get_history";
  businessId?: string;
  industry?: string;
  stage?: BusinessStage;
  metrics?: Record<string, number>;
  comparison?: BenchmarkComparison;
  metricName?: string;
  months?: number;
}

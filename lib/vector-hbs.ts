/**
 * HBS Agent Vector Storage Optimization
 *
 * Specialized vector storage and retrieval for Harvard Business School agents:
 * - SWOT + TOWS + PESTEL analysis
 * - Business Model Canvas (9 blocks)
 * - Go-To-Market Strategy
 * - Cross-agent strategic insights
 */

import type { EnhancedMetadata, SimilarityResult, VectorChunk } from "./vector";
import { embedText, similaritySearch, upsertChunks } from "./vector";

/**
 * HBS-specific analysis types
 */
export type HBSAnalysisType =
  | "hbs_swot" // SWOT + TOWS + PESTEL
  | "hbs_business_model" // Business Model Canvas
  | "hbs_gtm" // Go-To-Market Strategy
  | "hbs_synthesis"; // Cross-agent synthesis

/**
 * Extended metadata for HBS agents
 */
export interface HBSVectorMetadata extends EnhancedMetadata {
  // HBS Framework identification
  hbsFramework: "SWOT" | "Business Model Canvas" | "GTM Strategy" | "Synthesis";
  hbsAgentName:
    | "SWOTAgent"
    | "OsterwalderAgent"
    | "GTMPlannerAgent"
    | "HBSOrchestrator";
  hbsLayer: "strategy" | "market" | "synthesis";

  // SWOT-specific
  swotQuadrant?: "strengths" | "weaknesses" | "opportunities" | "threats";
  towsStrategy?: "SO" | "ST" | "WO" | "WT"; // TOWS matrix quadrants
  pestelFactor?:
    | "political"
    | "economic"
    | "social"
    | "technological"
    | "environmental"
    | "legal";
  strategicPosition?:
    | "aggressive"
    | "conservative"
    | "defensive"
    | "competitive";

  // Business Model Canvas specific
  canvasBlock?:
    | "customer_segments"
    | "value_propositions"
    | "channels"
    | "customer_relationships"
    | "revenue_streams"
    | "key_resources"
    | "key_activities"
    | "key_partnerships"
    | "cost_structure";
  revenueModel?:
    | "subscription"
    | "transaction"
    | "freemium"
    | "licensing"
    | "advertising"
    | "hybrid";
  canvasCoherence?: number; // 0-1 score

  // GTM Strategy specific
  gtmApproach?:
    | "land_and_expand"
    | "bowling_pin"
    | "big_bang"
    | "segmented_rollout";
  channelType?:
    | "direct_sales"
    | "inside_sales"
    | "partners"
    | "online"
    | "retail"
    | "marketplace";
  pricingModel?:
    | "value_based"
    | "competitive"
    | "cost_plus"
    | "penetration"
    | "skimming"
    | "freemium";
  launchPhase?: "pre_launch" | "soft_launch" | "full_launch" | "post_launch";
  ltvCacRatio?: number; // Unit economics

  // Cross-cutting
  frameworkVersion?: string;
  synthesisNotes?: string;
  crossAgentReferences?: string[]; // Which other agents contributed to this insight
}

/**
 * Store SWOT analysis results in vector database
 */
export async function storeSWOTVectors(
  demoId: string,
  swotOutput: any
): Promise<void> {
  const chunks: VectorChunk[] = [];
  const analysis = swotOutput.analysis;

  // Store each SWOT quadrant as separate vectors for targeted retrieval
  const quadrants = [
    { name: "strengths", items: analysis.strengths },
    { name: "weaknesses", items: analysis.weaknesses },
    { name: "opportunities", items: analysis.opportunities },
    { name: "threats", items: analysis.threats },
  ];

  for (const quadrant of quadrants) {
    const content = `SWOT ${quadrant.name.toUpperCase()}: ${quadrant.items.map((item: any) => item.description).join("; ")}`;
    const { embedding } = await embedText(content);

    chunks.push({
      id: `${demoId}-swot-${quadrant.name}`,
      demoId,
      content,
      metadata: {
        demoId,
        analysisType: "hbs_swot" as any,
        category: "strategic",
        hbsFramework: "SWOT",
        hbsAgentName: "SWOTAgent",
        hbsLayer: "strategy",
        swotQuadrant: quadrant.name as any,
        confidence: swotOutput.confidence_score,
        timestamp: swotOutput.timestamp,
        tags: ["hbs", "swot", quadrant.name],
      } as HBSVectorMetadata,
      embedding: embedding as number[],
    });
  }

  // Store TOWS strategies
  const towsQuadrants = [
    { name: "SO", strategies: analysis.tows_strategies.SO },
    { name: "ST", strategies: analysis.tows_strategies.ST },
    { name: "WO", strategies: analysis.tows_strategies.WO },
    { name: "WT", strategies: analysis.tows_strategies.WT },
  ];

  for (const tows of towsQuadrants) {
    const content = `TOWS ${tows.name} Strategies: ${tows.strategies.map((s: any) => s.strategy).join("; ")}`;
    const { embedding } = await embedText(content);

    chunks.push({
      id: `${demoId}-tows-${tows.name}`,
      demoId,
      content,
      metadata: {
        demoId,
        analysisType: "hbs_swot" as any,
        category: "strategic",
        hbsFramework: "SWOT",
        hbsAgentName: "SWOTAgent",
        hbsLayer: "strategy",
        towsStrategy: tows.name as any,
        confidence: swotOutput.confidence_score,
        timestamp: swotOutput.timestamp,
        tags: ["hbs", "tows", tows.name.toLowerCase()],
      } as HBSVectorMetadata,
      embedding: embedding as number[],
    });
  }

  // Store PESTEL factors
  if (analysis.pestel_analysis) {
    const pestelFactors = Object.entries(analysis.pestel_analysis).filter(
      ([key]) => key !== "overall_macro_environment"
    );

    for (const [factor, data] of pestelFactors) {
      const factorData = data as any;
      const content = `PESTEL ${factor.toUpperCase()}: ${factorData.description || factorData.impact || JSON.stringify(factorData)}`;
      const { embedding } = await embedText(content);

      chunks.push({
        id: `${demoId}-pestel-${factor}`,
        demoId,
        content,
        metadata: {
          demoId,
          analysisType: "hbs_swot" as any,
          category: "strategic",
          hbsFramework: "SWOT",
          hbsAgentName: "SWOTAgent",
          hbsLayer: "strategy",
          pestelFactor: factor as any,
          confidence: swotOutput.confidence_score,
          timestamp: swotOutput.timestamp,
          tags: ["hbs", "pestel", factor],
        } as HBSVectorMetadata,
        embedding: embedding as number[],
      });
    }
  }

  // Store strategic position
  if (analysis.strategic_position) {
    const content = `Strategic Position: ${analysis.strategic_position.classification} - ${analysis.strategic_position.rationale}`;
    const { embedding } = await embedText(content);

    chunks.push({
      id: `${demoId}-strategic-position`,
      demoId,
      content,
      metadata: {
        demoId,
        analysisType: "hbs_swot" as any,
        category: "strategic",
        hbsFramework: "SWOT",
        hbsAgentName: "SWOTAgent",
        hbsLayer: "strategy",
        strategicPosition: analysis.strategic_position.classification,
        confidence: swotOutput.confidence_score,
        timestamp: swotOutput.timestamp,
        tags: [
          "hbs",
          "strategic-position",
          analysis.strategic_position.classification,
        ],
      } as HBSVectorMetadata,
      embedding: embedding as number[],
    });
  }

  // Store insights and recommendations
  for (const insight of swotOutput.insights) {
    const content = `SWOT Insight: ${insight.description}`;
    const { embedding } = await embedText(content);

    chunks.push({
      id: `${demoId}-swot-insight-${insight.type}-${chunks.length}`,
      demoId,
      content,
      metadata: {
        demoId,
        analysisType: "hbs_swot" as any,
        category: "strategic",
        hbsFramework: "SWOT",
        hbsAgentName: "SWOTAgent",
        hbsLayer: "strategy",
        priority: insight.priority,
        confidence: swotOutput.confidence_score,
        timestamp: swotOutput.timestamp,
        tags: ["hbs", "swot", "insight", insight.type],
      } as HBSVectorMetadata,
      embedding: embedding as number[],
    });
  }

  await upsertChunks(chunks);
  console.log(`✅ Stored ${chunks.length} SWOT vectors for demo ${demoId}`);
}

/**
 * Store Business Model Canvas results in vector database
 */
export async function storeBusinessModelVectors(
  demoId: string,
  bmcOutput: any
): Promise<void> {
  const chunks: VectorChunk[] = [];
  const canvas = bmcOutput.analysis;

  // Store each of the 9 canvas blocks
  const canvasBlocks = [
    { name: "customer_segments", data: canvas.customer_segments },
    { name: "value_propositions", data: canvas.value_propositions },
    { name: "channels", data: canvas.channels },
    { name: "customer_relationships", data: canvas.customer_relationships },
    { name: "revenue_streams", data: canvas.revenue_streams },
    { name: "key_resources", data: canvas.key_resources },
    { name: "key_activities", data: canvas.key_activities },
    { name: "key_partnerships", data: canvas.key_partnerships },
    { name: "cost_structure", data: canvas.cost_structure },
  ];

  for (const block of canvasBlocks) {
    const content = `Business Model Canvas - ${block.name.replace(/_/g, " ").toUpperCase()}: ${JSON.stringify(block.data)}`;
    const { embedding } = await embedText(content);

    chunks.push({
      id: `${demoId}-bmc-${block.name}`,
      demoId,
      content,
      metadata: {
        demoId,
        analysisType: "hbs_business_model" as any,
        category: "strategic",
        hbsFramework: "Business Model Canvas",
        hbsAgentName: "OsterwalderAgent",
        hbsLayer: "strategy",
        canvasBlock: block.name as any,
        revenueModel: canvas.revenue_model_type,
        canvasCoherence: canvas.canvas_coherence_score,
        confidence: bmcOutput.confidence_score,
        timestamp: bmcOutput.timestamp,
        tags: ["hbs", "business-model-canvas", block.name],
      } as HBSVectorMetadata,
      embedding: embedding as number[],
    });
  }

  // Store critical assumptions
  if (canvas.critical_assumptions && canvas.critical_assumptions.length > 0) {
    const content = `Business Model Assumptions: ${canvas.critical_assumptions.join("; ")}`;
    const { embedding } = await embedText(content);

    chunks.push({
      id: `${demoId}-bmc-assumptions`,
      demoId,
      content,
      metadata: {
        demoId,
        analysisType: "hbs_business_model" as any,
        category: "strategic",
        hbsFramework: "Business Model Canvas",
        hbsAgentName: "OsterwalderAgent",
        hbsLayer: "strategy",
        canvasCoherence: canvas.canvas_coherence_score,
        confidence: bmcOutput.confidence_score,
        timestamp: bmcOutput.timestamp,
        tags: ["hbs", "business-model-canvas", "assumptions"],
      } as HBSVectorMetadata,
      embedding: embedding as number[],
    });
  }

  // Store insights and recommendations
  for (const insight of bmcOutput.insights) {
    const content = `Business Model Insight: ${insight.description}`;
    const { embedding } = await embedText(content);

    chunks.push({
      id: `${demoId}-bmc-insight-${insight.type}-${chunks.length}`,
      demoId,
      content,
      metadata: {
        demoId,
        analysisType: "hbs_business_model" as any,
        category: "strategic",
        hbsFramework: "Business Model Canvas",
        hbsAgentName: "OsterwalderAgent",
        hbsLayer: "strategy",
        priority: insight.priority,
        confidence: bmcOutput.confidence_score,
        timestamp: bmcOutput.timestamp,
        tags: ["hbs", "business-model-canvas", "insight", insight.type],
      } as HBSVectorMetadata,
      embedding: embedding as number[],
    });
  }

  await upsertChunks(chunks);
  console.log(
    `✅ Stored ${chunks.length} Business Model Canvas vectors for demo ${demoId}`
  );
}

/**
 * Store GTM Strategy results in vector database
 */
export async function storeGTMStrategyVectors(
  demoId: string,
  gtmOutput: any
): Promise<void> {
  const chunks: VectorChunk[] = [];
  const strategy = gtmOutput.analysis;

  // Store market entry strategy
  const entryContent = `GTM Market Entry: ${strategy.entry_strategy.approach} - ${strategy.entry_strategy.rationale}`;
  const { embedding: entryEmbedding } = await embedText(entryContent);

  chunks.push({
    id: `${demoId}-gtm-entry`,
    demoId,
    content: entryContent,
    metadata: {
      demoId,
      analysisType: "hbs_gtm" as any,
      category: "strategic",
      hbsFramework: "GTM Strategy",
      hbsAgentName: "GTMPlannerAgent",
      hbsLayer: "market",
      gtmApproach: strategy.entry_strategy.approach,
      ltvCacRatio:
        strategy.estimated_ltv && strategy.estimated_cac
          ? strategy.estimated_ltv / strategy.estimated_cac
          : undefined,
      confidence: gtmOutput.confidence_score,
      timestamp: gtmOutput.timestamp,
      tags: ["hbs", "gtm", "market-entry", strategy.entry_strategy.approach],
    } as HBSVectorMetadata,
    embedding: entryEmbedding as number[],
  });

  // Store beachhead market
  if (strategy.beachhead_market) {
    const beachheadContent = `GTM Beachhead Market: ${strategy.beachhead_market.segment_name} - ${strategy.beachhead_market.why_beachhead}`;
    const { embedding } = await embedText(beachheadContent);

    chunks.push({
      id: `${demoId}-gtm-beachhead`,
      demoId,
      content: beachheadContent,
      metadata: {
        demoId,
        analysisType: "hbs_gtm" as any,
        category: "strategic",
        hbsFramework: "GTM Strategy",
        hbsAgentName: "GTMPlannerAgent",
        hbsLayer: "market",
        gtmApproach: strategy.entry_strategy.approach,
        confidence: gtmOutput.confidence_score,
        timestamp: gtmOutput.timestamp,
        tags: ["hbs", "gtm", "beachhead-market"],
      } as HBSVectorMetadata,
      embedding: embedding as number[],
    });
  }

  // Store channel strategy
  if (strategy.channel_strategy) {
    const channelContent = `GTM Channels: ${strategy.channel_strategy.primary_channels.join(", ")} - Distribution: ${strategy.distribution_model}`;
    const { embedding } = await embedText(channelContent);

    chunks.push({
      id: `${demoId}-gtm-channels`,
      demoId,
      content: channelContent,
      metadata: {
        demoId,
        analysisType: "hbs_gtm" as any,
        category: "strategic",
        hbsFramework: "GTM Strategy",
        hbsAgentName: "GTMPlannerAgent",
        hbsLayer: "market",
        channelType: strategy.channel_strategy.primary_channels[0] as any,
        confidence: gtmOutput.confidence_score,
        timestamp: gtmOutput.timestamp,
        tags: ["hbs", "gtm", "channels", strategy.distribution_model],
      } as HBSVectorMetadata,
      embedding: embedding as number[],
    });
  }

  // Store pricing strategy
  if (strategy.pricing_strategy) {
    const pricingContent = `GTM Pricing: ${strategy.pricing_strategy.pricing_model} - ${strategy.pricing_strategy.rationale}`;
    const { embedding } = await embedText(pricingContent);

    chunks.push({
      id: `${demoId}-gtm-pricing`,
      demoId,
      content: pricingContent,
      metadata: {
        demoId,
        analysisType: "hbs_gtm" as any,
        category: "strategic",
        hbsFramework: "GTM Strategy",
        hbsAgentName: "GTMPlannerAgent",
        hbsLayer: "market",
        pricingModel: strategy.pricing_strategy.pricing_model,
        confidence: gtmOutput.confidence_score,
        timestamp: gtmOutput.timestamp,
        tags: [
          "hbs",
          "gtm",
          "pricing",
          strategy.pricing_strategy.pricing_model,
        ],
      } as HBSVectorMetadata,
      embedding: embedding as number[],
    });
  }

  // Store acquisition strategy
  if (strategy.acquisition_strategy) {
    const acquisitionContent = `GTM Acquisition: ${strategy.acquisition_strategy.messaging_framework.core_message}`;
    const { embedding } = await embedText(acquisitionContent);

    chunks.push({
      id: `${demoId}-gtm-acquisition`,
      demoId,
      content: acquisitionContent,
      metadata: {
        demoId,
        analysisType: "hbs_gtm" as any,
        category: "strategic",
        hbsFramework: "GTM Strategy",
        hbsAgentName: "GTMPlannerAgent",
        hbsLayer: "market",
        ltvCacRatio:
          strategy.estimated_ltv && strategy.estimated_cac
            ? strategy.estimated_ltv / strategy.estimated_cac
            : undefined,
        confidence: gtmOutput.confidence_score,
        timestamp: gtmOutput.timestamp,
        tags: ["hbs", "gtm", "acquisition"],
      } as HBSVectorMetadata,
      embedding: embedding as number[],
    });
  }

  // Store launch plan
  if (strategy.launch_plan) {
    const launchContent = `GTM Launch: ${strategy.launch_plan.launch_type} - Timeline: ${strategy.launch_plan.estimated_timeline}`;
    const { embedding } = await embedText(launchContent);

    chunks.push({
      id: `${demoId}-gtm-launch`,
      demoId,
      content: launchContent,
      metadata: {
        demoId,
        analysisType: "hbs_gtm" as any,
        category: "strategic",
        hbsFramework: "GTM Strategy",
        hbsAgentName: "GTMPlannerAgent",
        hbsLayer: "market",
        launchPhase: "pre_launch",
        confidence: gtmOutput.confidence_score,
        timestamp: gtmOutput.timestamp,
        tags: ["hbs", "gtm", "launch", strategy.launch_plan.launch_type],
      } as HBSVectorMetadata,
      embedding: embedding as number[],
    });
  }

  // Store insights and recommendations
  for (const insight of gtmOutput.insights) {
    const content = `GTM Insight: ${insight.description}`;
    const { embedding } = await embedText(content);

    chunks.push({
      id: `${demoId}-gtm-insight-${insight.type}-${chunks.length}`,
      demoId,
      content,
      metadata: {
        demoId,
        analysisType: "hbs_gtm" as any,
        category: "strategic",
        hbsFramework: "GTM Strategy",
        hbsAgentName: "GTMPlannerAgent",
        hbsLayer: "market",
        priority: insight.priority,
        confidence: gtmOutput.confidence_score,
        timestamp: gtmOutput.timestamp,
        tags: ["hbs", "gtm", "insight", insight.type],
      } as HBSVectorMetadata,
      embedding: embedding as number[],
    });
  }

  await upsertChunks(chunks);
  console.log(
    `✅ Stored ${chunks.length} GTM Strategy vectors for demo ${demoId}`
  );
}

/**
 * Search SWOT analysis vectors
 */
export async function searchSWOTVectors(
  demoId: string,
  query: string,
  quadrant?: "strengths" | "weaknesses" | "opportunities" | "threats",
  topK = 5
): Promise<SimilarityResult[]> {
  const { embedding } = await embedText(query);

  const filters: any = {
    demoId,
    tags: ["hbs", "swot"],
  };

  if (quadrant) {
    filters.tags.push(quadrant);
  }

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters,
  });
}

/**
 * Search Business Model Canvas vectors
 */
export async function searchBusinessModelVectors(
  demoId: string,
  query: string,
  canvasBlock?: string,
  topK = 5
): Promise<SimilarityResult[]> {
  const { embedding } = await embedText(query);

  const filters: any = {
    demoId,
    tags: ["hbs", "business-model-canvas"],
  };

  if (canvasBlock) {
    filters.tags.push(canvasBlock);
  }

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters,
  });
}

/**
 * Search GTM Strategy vectors
 */
export async function searchGTMStrategyVectors(
  demoId: string,
  query: string,
  strategyComponent?:
    | "entry"
    | "channels"
    | "pricing"
    | "acquisition"
    | "launch",
  topK = 5
): Promise<SimilarityResult[]> {
  const { embedding } = await embedText(query);

  const filters: any = {
    demoId,
    tags: ["hbs", "gtm"],
  };

  if (strategyComponent) {
    filters.tags.push(strategyComponent);
  }

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters,
  });
}

/**
 * Get comprehensive HBS strategic context for a demo
 * Retrieves all stored HBS agent results (SWOT, BMC, GTM)
 */
export async function getHBSStrategicContext(demoId: string): Promise<{
  swot: SimilarityResult[];
  businessModel: SimilarityResult[];
  gtm: SimilarityResult[];
}> {
  const swotQuery = await embedText(
    "strategic position strengths weaknesses opportunities threats"
  );
  const bmcQuery = await embedText(
    "business model value proposition customer segments revenue streams"
  );
  const gtmQuery = await embedText(
    "go-to-market strategy channels pricing acquisition launch"
  );

  const [swotResults, bmcResults, gtmResults] = await Promise.all([
    similaritySearch({
      demoId,
      queryEmbedding: swotQuery.embedding as number[],
      topK: 10,
      filters: { tags: ["hbs", "swot"] },
    }),
    similaritySearch({
      demoId,
      queryEmbedding: bmcQuery.embedding as number[],
      topK: 10,
      filters: { tags: ["hbs", "business-model-canvas"] },
    }),
    similaritySearch({
      demoId,
      queryEmbedding: gtmQuery.embedding as number[],
      topK: 10,
      filters: { tags: ["hbs", "gtm"] },
    }),
  ]);

  return {
    swot: swotResults,
    businessModel: bmcResults,
    gtm: gtmResults,
  };
}

/**
 * Search across all HBS agents for specific insights
 */
export async function searchHBSCombinedInsights(
  demoId: string,
  query: string,
  insightType?: "opportunity" | "threat" | "warning" | "observation",
  minConfidence = 0.7,
  topK = 10
): Promise<SimilarityResult[]> {
  const { embedding } = await embedText(query);

  const filters: any = {
    demoId,
    tags: ["hbs", "insight"],
    minConfidence,
  };

  if (insightType) {
    filters.tags.push(insightType);
  }

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters,
  });
}

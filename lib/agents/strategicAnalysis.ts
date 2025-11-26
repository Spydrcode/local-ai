import OpenAI from "openai";
import { AgenticRAG } from "../rag/agentic-rag";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function scrapeWebsite(url: string) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "ForecastaAI-Bot/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return { title: titleMatch?.[1]?.trim() || "", content: content.substring(0, 10000) };
  } catch (error) {
    console.error(`Scrape failed for ${url}:`, error);
    return { title: "", content: "" };
  }
}

export async function analyzeStrategy(websiteUrl: string, businessName?: string, demoId?: string) {
  const scraped = await scrapeWebsite(websiteUrl);
  const name = businessName || scraped.title || "Business";

  let contextData = '';
  if (demoId) {
    const rag = new AgenticRAG();
    const ragResult = await rag.query({
      query: `Porter Five Forces and Blue Ocean Strategy for ${name}`,
      demoId,
    }).catch(() => null);
    
    if (ragResult?.sources.length) {
      contextData = `\n\nPREVIOUS STRATEGIC ANALYSIS:\n${ragResult.sources.map(s => s.content).join('\n')}`;
    }
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a strategic business consultant. Return valid JSON only." },
      {
        role: "user",
        content: `Analyze this business using Porter's Five Forces and Blue Ocean Strategy.

Business: ${name}
URL: ${websiteUrl}
Content: ${scraped.content.substring(0, 4000)}${contextData}

Return JSON with: competitiveForces (rivalryIntensity, buyerPower, supplierPower, threatOfNewEntrants, threatOfSubstitutes, strategicPosition), blueOceanOpportunities (eliminateFactors, reduceFactors, raiseFactors, createFactors, valueProposition), positioning (currentPosition, targetPosition, differentiators, competitiveAdvantages), marketOpportunities (uncontestedSpace, customerPainPoints, innovationAreas, pricingStrategy), actionPlan (quickWins, mediumTermMoves, longTermStrategy, weeklyActions)`,
      },
    ],
    temperature: 0.7,
    max_tokens: 3000,
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0]?.message?.content || "{}");
}

export async function generateSWOT(websiteUrl: string, businessName?: string, demoId?: string) {
  const scraped = await scrapeWebsite(websiteUrl);
  const name = businessName || scraped.title || "Business";

  let contextData = '';
  if (demoId) {
    const rag = new AgenticRAG();
    const ragResult = await rag.query({
      query: `SWOT analysis for ${name}`,
      demoId,
    }).catch(() => null);
    
    if (ragResult?.sources.length) {
      contextData = `\n\nPREVIOUS ANALYSIS:\n${ragResult.sources.map(s => s.content).join('\n')}`;
    }
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a business analyst. Return valid JSON only." },
      {
        role: "user",
        content: `Generate SWOT analysis for this business.

Business: ${name}
Content: ${scraped.content.substring(0, 2000)}${contextData}

Return JSON with: strengths (array), weaknesses (array), opportunities (array), threats (array)`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0]?.message?.content || "{}");
  return { ...result, businessName: name };
}

export async function generateQuickWins(websiteUrl: string, businessName?: string, demoId?: string) {
  const scraped = await scrapeWebsite(websiteUrl);
  const name = businessName || scraped.title || "Business";

  let contextData = '';
  if (demoId) {
    const rag = new AgenticRAG();
    const ragResult = await rag.query({
      query: `quick wins and action items for ${name}`,
      demoId,
    }).catch(() => null);
    
    if (ragResult?.sources.length) {
      contextData = `\n\nPREVIOUS RECOMMENDATIONS:\n${ragResult.sources.map(s => s.content).join('\n')}`;
    }
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a business consultant. Return valid JSON only." },
      {
        role: "user",
        content: `Identify 5 quick wins for this business.

Business: ${name}
Content: ${scraped.content.substring(0, 2000)}${contextData}

Return JSON with: wins (array of objects with title, description, impact, effort, timeframe)`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0]?.message?.content || "{}");
  return { ...result, businessName: name };
}

import { AgenticRAG } from '../rag/agentic-rag';

export interface LocalMarketData {
  demographics: {
    population: number;
    medianIncome: number;
    ageGroups: Record<string, number>;
  };
  competitionDensity: "high" | "medium" | "low";
  localSEO: {
    keywords: string[];
    opportunities: string[];
  };
  partnerships: Array<{
    type: string;
    benefit: string;
    approach: string;
  }>;
}

export async function getLocalMarketIntel(location: string, industry: string, demoId?: string): Promise<LocalMarketData> {
  try {
    let contextData = '';
    
    if (demoId) {
      const rag = new AgenticRAG();
      const ragResult = await rag.query({
        query: `local market analysis for ${industry} in ${location}`,
        demoId,
      }).catch(() => null);
      
      if (ragResult?.sources.length) {
        contextData = `\n\nEXISTING ANALYSIS:\n${ragResult.sources.map(s => s.content).join('\n')}`;
      }
    }

    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a local market analyst. Return valid JSON only." },
        {
          role: "user",
          content: `Analyze the local market for a ${industry} business in ${location}.${contextData}

Return JSON with:
- demographics: object with population (number), medianIncome (number), ageGroups (object with age ranges as keys, percentages as values)
- competitionDensity: "high" | "medium" | "low"
- localSEO: object with keywords (array) and opportunities (array)
- partnerships: array of 3-5 objects with type, benefit, approach`,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  } catch (error) {
    console.error('Local market intel failed:', error);
    return { demographics: { population: 0, medianIncome: 0, ageGroups: {} }, competitionDensity: 'medium', localSEO: { keywords: [], opportunities: [] }, partnerships: [] };
  }
}

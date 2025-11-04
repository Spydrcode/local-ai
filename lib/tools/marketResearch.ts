import { AgenticRAG } from '../rag/agentic-rag';

export interface MarketData {
  competitors: Array<{ name: string; type: string; strengths: string[]; weaknesses: string[] }>;
  marketSize: string;
  growthRate: string;
  trends: string[];
}

export async function getMarketData(industry: string, location?: string, demoId?: string): Promise<MarketData> {
  try {
    let contextData = '';
    
    // Use RAG to retrieve existing competitor analysis if available
    if (demoId) {
      const rag = new AgenticRAG();
      const ragResult = await rag.query({
        query: `competitor analysis for ${industry}${location ? ` in ${location}` : ''}`,
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
        { role: "system", content: "You are a market research analyst. Return valid JSON only." },
        {
          role: "user",
          content: `Analyze the competitive landscape for a ${industry} business${location ? ` in ${location}` : ''}.${contextData}

Return JSON with:
- competitors: array of 3-5 competitors with name, type (Direct/Indirect), strengths array, weaknesses array
- marketSize: estimated market size
- growthRate: annual growth rate
- trends: array of 3-5 current market trends`,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  } catch (error) {
    console.error('Market research failed:', error);
    return { competitors: [], marketSize: 'Unknown', growthRate: 'Unknown', trends: [] };
  }
}

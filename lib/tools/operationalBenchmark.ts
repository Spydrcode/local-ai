import { AgenticRAG } from '../rag/agentic-rag';

export interface OperationalBenchmark {
  currentState: "below" | "at" | "above";
  gaps: string[];
  automationOpportunities: Array<{
    task: string;
    tool: string;
    timeSavings: string;
    costSavings: string;
  }>;
  techStack: {
    current: string[];
    recommended: Array<{ tool: string; purpose: string; roi: string }>;
  };
}

export async function benchmarkOperations(industry: string, demoId?: string): Promise<OperationalBenchmark> {
  try {
    let contextData = '';
    
    if (demoId) {
      const rag = new AgenticRAG();
      const ragResult = await rag.query({
        query: `operational efficiency and automation for ${industry}`,
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
        { role: "system", content: "You are an operations consultant. Return valid JSON only." },
        {
          role: "user",
          content: `Analyze operational efficiency for a ${industry} business.${contextData}

Return JSON with:
- currentState: "below" | "at" | "above" industry standard
- gaps: array of 3-5 common operational gaps
- automationOpportunities: array of 3-5 objects with task, tool, timeSavings, costSavings
- techStack: object with current (array) and recommended (array of objects with tool, purpose, roi)`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  } catch (error) {
    console.error('Operations benchmark failed:', error);
    return { currentState: 'at', gaps: [], automationOpportunities: [], techStack: { current: [], recommended: [] } };
  }
}

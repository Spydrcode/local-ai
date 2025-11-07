import { NextApiRequest, NextApiResponse } from "next";
import { CompetitiveIntelligence } from "../../../lib/intelligence/CompetitiveIntelligence";

const intelligence = new CompetitiveIntelligence();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { action } = req.body;

    try {
      switch (action) {
        case "analyze_competitor":
          return await analyzeCompetitor(req, res);
        case "identify_gaps":
          return await identifyGaps(req, res);
        default:
          return res.status(400).json({ error: "Invalid action" });
      }
    } catch (error: any) {
      console.error("Competitive Intelligence API error:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function analyzeCompetitor(req: NextApiRequest, res: NextApiResponse) {
  const { competitorName, competitorWebsite, industry, context } = req.body;

  if (!competitorName || !competitorWebsite || !industry) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // This can take 30-60 seconds, so set a longer timeout
  const profile = await intelligence.analyzeCompetitor(
    competitorName,
    competitorWebsite,
    industry,
    context
  );

  res.status(200).json({ data: profile });
}

async function identifyGaps(req: NextApiRequest, res: NextApiResponse) {
  const { yourBusinessId, competitorProfiles } = req.body;

  if (!yourBusinessId || !competitorProfiles) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const gaps = await intelligence.identifyMarketGaps(
    yourBusinessId,
    competitorProfiles
  );

  res.status(200).json({ data: gaps });
}

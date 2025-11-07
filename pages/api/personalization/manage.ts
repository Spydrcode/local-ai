import { NextApiRequest, NextApiResponse } from "next";
import { PersonalizationEngine } from "../../../lib/personalization/PersonalizationEngine";

const engine = new PersonalizationEngine();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { action } = req.body;

    try {
      switch (action) {
        case "track":
          return await trackBehavior(req, res);
        case "get_preferences":
          return await getPreferences(req, res);
        case "personalize":
          return await personalizeRecommendations(req, res);
        case "engagement_summary":
          return await getEngagementSummary(req, res);
        default:
          return res.status(400).json({ error: "Invalid action" });
      }
    } catch (error: any) {
      console.error("Personalization API error:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function trackBehavior(req: NextApiRequest, res: NextApiResponse) {
  const {
    userId,
    businessId,
    interactionType,
    contentType,
    contentId,
    engagement,
    context,
    metadata,
  } = req.body;

  await engine.trackBehavior({
    userId,
    businessId,
    interactionType,
    contentType,
    contentId,
    engagement,
    context,
    metadata,
    timestamp: new Date(),
  });

  res.status(200).json({ success: true });
}

async function getPreferences(req: NextApiRequest, res: NextApiResponse) {
  const { userId, forceRefresh } = req.body;

  const preferences = await engine.getUserPreferences(userId, forceRefresh);

  res.status(200).json({ data: preferences });
}

async function personalizeRecommendations(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, recommendations, context } = req.body;

  const personalized = await engine.personalizeRecommendations(
    userId,
    recommendations,
    context
  );

  res.status(200).json({ data: personalized });
}

async function getEngagementSummary(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.body;

  const summary = await engine.getEngagementSummary(userId);

  res.status(200).json({ data: summary });
}

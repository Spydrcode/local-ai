import { NextApiRequest, NextApiResponse } from "next";
import { ROIPredictor } from "../../../lib/prediction/ROIPredictor";

const predictor = new ROIPredictor();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { action } = req.body;

    try {
      switch (action) {
        case "predict":
          return await predictROI(req, res);
        case "record_actual":
          return await recordActual(req, res);
        case "get_predictions":
          return await getPredictions(req, res);
        case "get_accuracy":
          return await getAccuracy(req, res);
        default:
          return res.status(400).json({ error: "Invalid action" });
      }
    } catch (error: any) {
      console.error("ROI Prediction API error:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function predictROI(req: NextApiRequest, res: NextApiResponse) {
  const { businessId, recommendationId, recommendation, businessContext } =
    req.body;

  if (!businessId || !recommendationId || !recommendation || !businessContext) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const prediction = await predictor.predictROI(
    businessId,
    recommendationId,
    recommendation,
    businessContext
  );

  res.status(200).json({ data: prediction });
}

async function recordActual(req: NextApiRequest, res: NextApiResponse) {
  const { predictionId, actualData } = req.body;

  if (!predictionId || !actualData) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const actual = await predictor.recordActualROI(predictionId, actualData);

  res.status(200).json({ data: actual });
}

async function getPredictions(req: NextApiRequest, res: NextApiResponse) {
  const { businessId, options } = req.body;

  if (!businessId) {
    return res.status(400).json({ error: "Business ID required" });
  }

  const predictions = await predictor.getPredictions(businessId, options);

  res.status(200).json({ data: predictions });
}

async function getAccuracy(req: NextApiRequest, res: NextApiResponse) {
  const { businessId } = req.body;

  if (!businessId) {
    return res.status(400).json({ error: "Business ID required" });
  }

  const accuracy = await predictor.getPredictionAccuracy(businessId);

  res.status(200).json({ data: accuracy });
}

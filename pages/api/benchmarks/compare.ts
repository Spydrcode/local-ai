import { NextApiRequest, NextApiResponse } from "next";
import { IndustryBenchmarks } from "../../../lib/benchmarking/IndustryBenchmarks";

const benchmarks = new IndustryBenchmarks();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { action } = req.body;

    try {
      switch (action) {
        case "compare":
          return await compare(req, res);
        case "get_recommendations":
          return await getRecommendations(req, res);
        case "submit_metrics":
          return await submitMetrics(req, res);
        case "get_industries":
          return await getIndustries(req, res);
        case "get_history":
          return await getHistory(req, res);
        default:
          return res.status(400).json({ error: "Invalid action" });
      }
    } catch (error: any) {
      console.error("Benchmarking API error:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function compare(req: NextApiRequest, res: NextApiResponse) {
  const { businessId, industry, stage, metrics } = req.body;

  if (!businessId || !industry || !stage || !metrics) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const comparison = await benchmarks.compareToIndustry(
    businessId,
    industry,
    stage,
    metrics
  );

  res.status(200).json({ data: comparison });
}

async function getRecommendations(req: NextApiRequest, res: NextApiResponse) {
  const { comparison } = req.body;

  if (!comparison) {
    return res.status(400).json({ error: "Comparison data required" });
  }

  const recommendations = await benchmarks.generateRecommendations(comparison);

  res.status(200).json({ data: recommendations });
}

async function submitMetrics(req: NextApiRequest, res: NextApiResponse) {
  const { industry, stage, metrics } = req.body;

  if (!industry || !stage || !metrics) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  await benchmarks.submitMetricsAnonymously(industry, stage, metrics);

  res
    .status(200)
    .json({
      success: true,
      message: "Metrics submitted anonymously for benchmark calculation",
    });
}

async function getIndustries(req: NextApiRequest, res: NextApiResponse) {
  const industries = await benchmarks.getAvailableIndustries();

  res.status(200).json({ data: industries });
}

async function getHistory(req: NextApiRequest, res: NextApiResponse) {
  const { industry, stage, metricName, months } = req.body;

  if (!industry || !stage || !metricName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const history = await benchmarks.getBenchmarkHistory(
    industry,
    stage,
    metricName,
    months
  );

  res.status(200).json({ data: history });
}

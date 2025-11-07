import { NextApiRequest, NextApiResponse } from "next";
import { ActionPlanner } from "../../../lib/planning/ActionPlanner";

const planner = new ActionPlanner();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { action } = req.body;

    try {
      switch (action) {
        case "generate_plan":
          return await generatePlan(req, res);
        case "get_progress":
          return await getProgress(req, res);
        case "update_status":
          return await updateStatus(req, res);
        case "get_templates":
          return await getTemplates(req, res);
        default:
          return res.status(400).json({ error: "Invalid action" });
      }
    } catch (error: any) {
      console.error("Action Planning API error:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function generatePlan(req: NextApiRequest, res: NextApiResponse) {
  const { businessId, recommendations, businessContext } = req.body;

  if (!businessId || !recommendations || !businessContext) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const plan = await planner.generateExecutionPlan(
    businessId,
    recommendations,
    businessContext
  );

  res.status(200).json({ data: plan });
}

async function getProgress(req: NextApiRequest, res: NextApiResponse) {
  const { planId } = req.body;

  if (!planId) {
    return res.status(400).json({ error: "Plan ID required" });
  }

  const progress = await planner.getPlanProgress(planId);

  res.status(200).json({ data: progress });
}

async function updateStatus(req: NextApiRequest, res: NextApiResponse) {
  const { planId, itemId, itemType, status } = req.body;

  if (!planId || !itemId || !itemType || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  await planner.updateStatus(planId, itemId, itemType, status);

  res.status(200).json({ success: true });
}

async function getTemplates(req: NextApiRequest, res: NextApiResponse) {
  const { planId, type } = req.body;

  if (!planId) {
    return res.status(400).json({ error: "Plan ID required" });
  }

  const templates = await planner.getTemplates(planId, type);

  res.status(200).json({ data: templates });
}

import { NextApiRequest, NextApiResponse } from "next";
import { BusinessMonitor } from "../../../lib/monitoring/BusinessMonitor";

const monitor = new BusinessMonitor();

/**
 * Monitoring management endpoints
 *
 * POST /api/monitoring/setup - Setup monitoring for a business
 * GET /api/monitoring/alerts?businessId=xxx - Get alerts
 * POST /api/monitoring/run - Run monitoring checks
 * POST /api/monitoring/acknowledge - Acknowledge an alert
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // POST: Setup monitoring
    if (req.method === "POST" && req.body.action === "setup") {
      const { businessId, preferences } = req.body;

      if (!businessId || !preferences) {
        return res
          .status(400)
          .json({ error: "businessId and preferences are required" });
      }

      const monitors = await monitor.setupMonitoring(businessId, preferences);

      return res.status(200).json({
        success: true,
        data: monitors,
      });
    }

    // POST: Run monitoring
    if (req.method === "POST" && req.body.action === "run") {
      const { businessId } = req.body;

      if (!businessId) {
        return res.status(400).json({ error: "businessId is required" });
      }

      const alerts = await monitor.runMonitoring(businessId);

      return res.status(200).json({
        success: true,
        data: alerts,
      });
    }

    // POST: Acknowledge alert
    if (req.method === "POST" && req.body.action === "acknowledge") {
      const { alertId } = req.body;

      if (!alertId) {
        return res.status(400).json({ error: "alertId is required" });
      }

      await monitor.acknowledgeAlert(alertId);

      return res.status(200).json({
        success: true,
        message: "Alert acknowledged",
      });
    }

    // GET: Get alerts
    if (req.method === "GET") {
      const { businessId, unacknowledgedOnly, limit, priority } = req.query;

      if (!businessId) {
        return res.status(400).json({ error: "businessId is required" });
      }

      const alerts = await monitor.getAlerts(String(businessId), {
        unacknowledgedOnly: unacknowledgedOnly === "true",
        limit: limit ? parseInt(String(limit)) : undefined,
        priority: priority as any,
      });

      return res.status(200).json({
        success: true,
        data: alerts,
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Monitoring error:", error);
    res.status(500).json({
      error: "Monitoring operation failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

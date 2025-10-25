import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { demoId } = req.query;

  if (!demoId || typeof demoId !== "string") {
    return res.status(400).json({ error: "Invalid demo ID" });
  }

  // GET: Fetch progress data
  if (req.method === "GET") {
    try {
      console.log(`📊 Fetching progress data for demo ${demoId}...`);

      // Fetch action items progress
      const { data: actionItems, error: actionError } = await supabase
        .from("action_items_progress")
        .select("*")
        .eq("demo_id", demoId)
        .order("created_at", { ascending: false });

      if (actionError) {
        console.error("Error fetching action items:", actionError);
      }

      // Fetch metric snapshots
      const { data: metrics, error: metricsError } = await supabase
        .from("metric_snapshots")
        .select("*")
        .eq("demo_id", demoId)
        .order("snapshot_date", { ascending: true });

      if (metricsError) {
        console.error("Error fetching metrics:", metricsError);
      }

      // Fetch re-analysis history
      const { data: reAnalyses, error: reAnalysisError } = await supabase
        .from("re_analysis_history")
        .select("*")
        .eq("demo_id", demoId)
        .order("analysis_date", { ascending: false });

      if (reAnalysisError) {
        console.error("Error fetching re-analyses:", reAnalysisError);
      }

      // Calculate progress statistics
      const totalActions = actionItems?.length || 0;
      const completedActions =
        actionItems?.filter((a) => a.status === "completed").length || 0;
      const inProgressActions =
        actionItems?.filter((a) => a.status === "in_progress").length || 0;
      const blockedActions =
        actionItems?.filter((a) => a.status === "blocked").length || 0;

      console.log(
        `✅ Progress data fetched: ${totalActions} actions, ${completedActions} completed`
      );

      return res.status(200).json({
        actionItems: actionItems || [],
        metrics: metrics || [],
        reAnalyses: reAnalyses || [],
        stats: {
          totalActions,
          completedActions,
          inProgressActions,
          blockedActions,
          completionRate:
            totalActions > 0
              ? Math.round((completedActions / totalActions) * 100)
              : 0,
        },
      });
    } catch (error) {
      console.error("Error fetching progress:", error);
      return res.status(500).json({
        error: "Failed to fetch progress data",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // POST: Update action item status
  if (req.method === "POST") {
    try {
      const { action } = req.body;

      if (action === "update_action_item") {
        const { id, status, notes } = req.body;

        const updateData: any = { status };

        if (status === "in_progress" && !req.body.started_at) {
          updateData.started_at = new Date().toISOString();
        }

        if (status === "completed" && !req.body.completed_at) {
          updateData.completed_at = new Date().toISOString();
        }

        if (notes) {
          updateData.notes = notes;
        }

        const { data, error } = await supabase
          .from("action_items_progress")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Error updating action item:", error);
          return res
            .status(500)
            .json({ error: "Failed to update action item" });
        }

        console.log(`✅ Action item ${id} updated to status: ${status}`);
        return res.status(200).json({ success: true, data });
      }

      if (action === "add_metric_snapshot") {
        const { metrics } = req.body;

        const { data, error } = await supabase
          .from("metric_snapshots")
          .insert({
            demo_id: demoId,
            ...metrics,
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding metric snapshot:", error);
          return res
            .status(500)
            .json({ error: "Failed to add metric snapshot" });
        }

        console.log(`✅ Metric snapshot added for demo ${demoId}`);
        return res.status(200).json({ success: true, data });
      }

      if (action === "create_action_item") {
        const { actionTitle, actionCategory, priority } = req.body;

        const { data, error } = await supabase
          .from("action_items_progress")
          .insert({
            demo_id: demoId,
            action_title: actionTitle,
            action_category: actionCategory,
            priority: priority || "Medium",
            status: "not_started",
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating action item:", error);
          return res
            .status(500)
            .json({ error: "Failed to create action item" });
        }

        console.log(`✅ Action item created: ${actionTitle}`);
        return res.status(200).json({ success: true, data });
      }

      return res.status(400).json({ error: "Invalid action" });
    } catch (error) {
      console.error("Error updating progress:", error);
      return res.status(500).json({
        error: "Failed to update progress",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // DELETE: Remove action item
  if (req.method === "DELETE") {
    try {
      const { actionItemId } = req.body;

      const { error } = await supabase
        .from("action_items_progress")
        .delete()
        .eq("id", actionItemId);

      if (error) {
        console.error("Error deleting action item:", error);
        return res.status(500).json({ error: "Failed to delete action item" });
      }

      console.log(`✅ Action item ${actionItemId} deleted`);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting action item:", error);
      return res.status(500).json({
        error: "Failed to delete action item",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

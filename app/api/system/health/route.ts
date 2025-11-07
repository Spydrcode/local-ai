/**
 * System Health & Metrics API
 *
 * Provides comprehensive health status and metrics for the agent system.
 * Use this for monitoring, debugging, and observability.
 */

import { agentSystem } from "@/lib/agents/core/AgentSystem";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "status"; // status | health | metrics | agents | tools

    switch (view) {
      case "health":
        // Simple health check
        const health = agentSystem.getHealthStatus();
        return NextResponse.json(health);

      case "metrics":
        // Detailed metrics
        const agentMetrics = agentSystem.getAgentMetrics();
        const toolMetrics = agentSystem.getToolMetrics();
        return NextResponse.json({
          agents: Array.from(agentMetrics as Map<string, any>).map(
            ([name, metrics]) => ({
              name,
              ...metrics,
            })
          ),
          tools: Array.from(toolMetrics as Map<string, any>).map(
            ([name, metrics]) => ({
              name,
              ...metrics,
            })
          ),
        });

      case "agents":
        // Agent-specific metrics
        const agentName = searchParams.get("agent");
        if (agentName) {
          const metrics = agentSystem.getAgentMetrics(agentName);
          return NextResponse.json(metrics);
        }
        return NextResponse.json(agentSystem.getAgentMetrics());

      case "tools":
        // Tool-specific metrics
        const toolName = searchParams.get("tool");
        if (toolName) {
          const metrics = agentSystem.getToolMetrics(toolName);
          return NextResponse.json(metrics);
        }
        return NextResponse.json(agentSystem.getToolMetrics());

      case "status":
      default:
        // Comprehensive system status
        const status = agentSystem.getSystemStatus();
        return NextResponse.json(status);
    }
  } catch (error) {
    console.error("Error getting system status:", error);
    return NextResponse.json(
      {
        error: "Failed to get system status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Clear cache for specific agent or all agents
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentName = searchParams.get("agent");

    agentSystem.clearCache(agentName || undefined);

    return NextResponse.json({
      success: true,
      message: agentName
        ? `Cache cleared for agent: ${agentName}`
        : "All caches cleared",
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      {
        error: "Failed to clear cache",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

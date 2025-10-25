import { load } from "cheerio";
import { customAlphabet } from "nanoid";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { throttle } from "../../server/rateLimiter";
import { supabaseAdmin } from "../../server/supabaseAdmin";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz1234567890", 15);

const requestSchema = z.object({
  url: z.string().url(),
});

type QuickAnalyzeResponse = {
  demoId: string;
  businessName: string;
  websiteUrl: string;
};

/**
 * Quick website analysis - minimal processing for instant dashboard access
 * Only extracts business name and creates demo record
 * No AI calls, no embeddings, no heavy processing
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QuickAnalyzeResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    throttle(req.socket.remoteAddress ?? "anonymous:quick");
  } catch (throttleError) {
    const retryAfter =
      (throttleError as { retryAfter?: number }).retryAfter ?? 60;
    return res
      .status(429)
      .setHeader("Retry-After", retryAfter)
      .json({ error: "Too many requests" });
  }

  const parseResult = requestSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  const { url } = parseResult.data;

  try {
    // Quick fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      headers: {
        "User-Agent": "LocalAIBot/1.0 (+https://localai.app)",
        Accept: "text/html",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);

    // Extract business name from common places
    let businessName = "";

    // Try meta tags first
    businessName =
      $('meta[property="og:site_name"]').attr("content") ||
      $('meta[name="application-name"]').attr("content") ||
      "";

    // Try title tag
    if (!businessName) {
      const title = $("title").text().trim();
      // Clean up common title patterns
      businessName = title
        .replace(/\s*[-|–—]\s*.*/g, "") // Remove everything after - or |
        .replace(/\s*\|\s*.*/g, "")
        .replace(/\bhome\b/gi, "")
        .replace(/\bwelcome\b/gi, "")
        .trim();
    }

    // Try first h1
    if (!businessName) {
      businessName = $("h1").first().text().trim();
    }

    // Fallback to domain name
    if (!businessName) {
      const domain = new URL(url).hostname;
      businessName = domain
        .replace(/^www\./, "")
        .replace(/\..+$/, "")
        .replace(/[-_]/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Limit length
    if (businessName.length > 100) {
      businessName = businessName.substring(0, 100);
    }

    // Generate demo ID
    const demoId = nanoid();

    // Create minimal demo record in database
    if (!supabaseAdmin) {
      throw new Error("Database connection not available");
    }

    const { error: dbError } = await supabaseAdmin.from("demos").insert({
      id: demoId,
      client_id: businessName,
      site_url: url,
      summary:
        "Analysis pending - use on-demand tools to generate insights",
    });

    if (dbError) {
      console.error("Database insert error:", dbError);
      throw new Error("Failed to create demo record");
    }

    return res.status(200).json({
      demoId,
      businessName,
      websiteUrl: url,
    });
  } catch (error) {
    console.error("Quick analyze error:", error);

    // Return more specific error messages
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return res
          .status(408)
          .json({ error: "Website took too long to respond" });
      }
      if (error.message.includes("Failed to fetch")) {
        return res
          .status(502)
          .json({ error: "Could not reach website - check URL" });
      }
    }

    return res.status(500).json({ error: "Failed to analyze site" });
  }
}

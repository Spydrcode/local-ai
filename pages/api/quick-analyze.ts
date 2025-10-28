import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";
import { rateLimit } from "../../lib/rateLimiter";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // Distributed rate limiting (Upstash Redis)
  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
    req.socket.remoteAddress ||
    "anonymous:quick";
  const { allowed, remaining, reset } = await rateLimit(
    `quick-analyze:${ip}`,
    10,
    60
  );
  if (!allowed) {
    res.setHeader(
      "Retry-After",
      Math.max(1, reset - Math.floor(Date.now() / 1000))
    );
    return res
      .status(429)
      .json({ error: "Too many requests. Please wait before trying again." });
  }

  try {
    // Generate demo ID
    const demoId = Math.random().toString(36).substring(2, 15);

    // Extract business name from URL
    const businessName = new URL(url).hostname
      .replace("www.", "")
      .split(".")[0];

    // Create demo record
    const { data, error } = await supabase
      .from("demos")
      .insert({
        id: demoId,
        client_id: demoId,
        summary: "Quick analysis pending...",
        site_url: url,
        key_items: [businessName],
      })
      .select()
      .single();

    if (error) {
      console.error("Database error details:", error);
      return res.status(500).json({
        error:
          "Database error: " +
          (error.message || error.details || "Unknown error"),
      });
    }

    res.json({ demoId, businessName });
  } catch (error) {
    console.error("Quick analyze error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
}

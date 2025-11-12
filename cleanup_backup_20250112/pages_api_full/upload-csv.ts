import { parse } from "csv-parse/sync";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { createChatCompletion } from "../../lib/openai";
import { throttle } from "../../server/rateLimiter";

const requestSchema = z.object({
  csv: z.string().min(10),
  demoId: z.string().optional(),
});

type UploadCsvResponse = {
  insights: string[];
  summary: string;
};

const CSV_PROMPT = `You are LocalIQ's Profit IQ assistant. Analyze the provided CSV rows and return:
- One sentence summary of performance
- Three bullet insights with percentage deltas if possible
Keep tone concise and data-backed.`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadCsvResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    throttle(`${req.socket.remoteAddress ?? "anonymous"}:csv`);
  } catch (throttleError) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const parseResult = requestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    const records = parse(parseResult.data.csv, {
      columns: true,
      skip_empty_lines: true,
    });

    const formatted = JSON.stringify(records.slice(0, 50));

    const response = await createChatCompletion({
      messages: [
        { role: "system", content: CSV_PROMPT },
        { role: "user", content: formatted },
      ],
      temperature: 0.3,
      maxTokens: 500,
    });

    const lines = response.split(/\n+/).filter(Boolean);

    return res.status(200).json({
      summary: lines[0] ?? response,
      insights: lines.slice(1, 4),
    });
  } catch (error) {
    console.error("CSV upload error", error);
    return res.status(500).json({ error: "Failed to process CSV" });
  }
}

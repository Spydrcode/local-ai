import { load } from "cheerio";
import { customAlphabet } from "nanoid";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { hfSummarize } from "../../lib/hf";
import { summarizeText } from "../../lib/openai";
import { SITE_SUMMARY_PROMPT } from "../../lib/prompts";
import { embedText, upsertChunks } from "../../lib/vector";
import { throttle } from "../../server/rateLimiter";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz1234567890", 12);

const requestSchema = z.object({
  url: z.string().url(),
  demoName: z.string().optional(),
});

type AnalyzeSiteResponse = {
  summary: string;
  keyItems: string[];
  embeddingsId: string;
};

const useHFFallback = process.env.USE_HF === "true";

function extractContactInfo(text: string) {
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/g);
  const phoneMatch = text.match(/\+?\d[\d\s().-]{7,}/g);
  return {
    emails: emailMatch ? Array.from(new Set(emailMatch)) : [],
    phones: phoneMatch ? Array.from(new Set(phoneMatch)) : [],
  };
}

function extractMenuItems($: ReturnType<typeof load>) {
  const menuSelectors = ["menu", "our menu", "services", "products"];
  const results = new Set<string>();

  $("nav, ul, ol, section").each((_index: number, element: unknown) => {
    const heading = $(element as any)
      .find("h1, h2, h3")
      .first()
      .text()
      .toLowerCase();
    if (menuSelectors.some((selector) => heading.includes(selector))) {
      $(element as any)
        .find("li, a, span")
        .each((_i: number, item: unknown) => {
          const text = $(item as any)
            .text()
            .trim();
          if (text && text.length < 80) {
            results.add(text);
          }
        });
    }
  });

  return Array.from(results).slice(0, 12);
}

function chunkContent(text: string, chunkSize = 750) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let buffer = "";

  for (const sentence of sentences) {
    if ((buffer + sentence).length > chunkSize) {
      chunks.push(buffer.trim());
      buffer = sentence;
    } else {
      buffer += ` ${sentence}`;
    }
  }

  if (buffer.trim()) {
    chunks.push(buffer.trim());
  }

  return chunks.filter(Boolean);
}

async function maybeStoreChunks({
  chunks,
  headings,
  sourceUrl,
  embeddingsId,
}: {
  chunks: string[];
  headings: string[];
  sourceUrl: string;
  embeddingsId: string;
}) {
  try {
    await upsertChunks(
      await Promise.all(
        chunks.map(async (content, index) => {
          const { embedding } = await embedText(content);
          const vector = Array.isArray(embedding)
            ? Array.isArray((embedding as unknown[])[0])
              ? ((embedding as unknown[])[0] as number[])
              : (embedding as number[])
            : [embedding as number];

          return {
            id: `${embeddingsId}-${index}`,
            demoId: embeddingsId,
            content,
            metadata: { source: sourceUrl, heading: headings[index] ?? null },
            embedding: vector,
          };
        })
      )
    );
  } catch (vectorError) {
    console.warn("Vector upsert skipped", vectorError);
  }
}

function fallbackSummaryFromHeadings({
  headings,
  menuItems,
  url,
}: {
  headings: string[];
  menuItems: string[];
  url: string;
}) {
  const topHeading = headings[0] ?? "local business";
  const fallbackMenu = menuItems.slice(0, 3).join(", ");
  return `Automated summary for ${url}: ${topHeading} with offerings such as ${fallbackMenu || "core services"}.`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeSiteResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    throttle(req.socket.remoteAddress ?? "anonymous:analyze");
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

  const { url, demoName } = parseResult.data;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "LocalIQBot/1.0 (+https://localiq.ai)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);

    const paragraphs: string[] = [];
    $("p, li").each((_index: number, element: unknown) => {
      const text = $(element as any)
        .text()
        .replace(/\s+/g, " ")
        .trim();
      if (text.length > 40) {
        paragraphs.push(text);
      }
    });

    const headings = $("h1, h2, h3")
      .map((_index: number, element: unknown) =>
        $(element as any)
          .text()
          .trim()
      )
      .get()
      .filter(Boolean)
      .slice(0, 10);

    const { emails, phones } = extractContactInfo(paragraphs.join(" "));
    const menuItems = extractMenuItems($);

    const rawText = paragraphs.join("\n");
    const contentChunks = chunkContent(rawText).slice(0, 12);

    const embeddingsId = nanoid();

    await maybeStoreChunks({
      chunks: contentChunks,
      headings,
      sourceUrl: url,
      embeddingsId,
    });

    let summary: string;
    try {
      summary = useHFFallback
        ? await hfSummarize(rawText)
        : await summarizeText({
            text: `${demoName ? `${demoName}\n` : ""}${rawText}`,
            prompt: SITE_SUMMARY_PROMPT,
          });
    } catch (summaryError) {
      console.warn(
        "Summary generation failed, using heuristic fallback",
        summaryError
      );
      summary = fallbackSummaryFromHeadings({ headings, menuItems, url });
    }

    const keyItems = [
      `Primary headings: ${headings.slice(0, 3).join(", ")}`,
      emails.length
        ? `Emails found: ${emails.join(", ")}`
        : "Emails: none detected",
      phones.length ? `Phones: ${phones.join(", ")}` : "Phones: none detected",
      menuItems.length
        ? `Menu/services: ${menuItems.slice(0, 6).join(", ")}`
        : "Menu/services not detected",
    ];

    return res.status(200).json({ summary, keyItems, embeddingsId });
  } catch (error) {
    console.error("Analyze site error", error);
    return res.status(500).json({ error: "Failed to analyze site" });
  }
}

import { webScraperAgent } from "@/lib/agents/WebScraperAgent";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Allow up to 60 seconds for comprehensive scraping

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { url, mode = "comprehensive", paths, extractors } = await req.json();

    // Validate URL
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    console.log(`[API] Web scraper request: ${url} (mode: ${mode})`);

    let result;

    switch (mode) {
      case "quick":
        result = await webScraperAgent.quickScrape(url);
        break;

      case "targeted":
        result = await webScraperAgent.targetedScrape({
          url,
          paths,
          extractors: extractors || {
            business: true,
            seo: true,
            social: true,
            competitors: false,
            reviews: false,
            metaAds: false,
          },
        });
        break;

      case "comprehensive":
      default:
        result = await webScraperAgent.scrapeAndAnalyze({
          url,
          paths: paths || ["/", "/about", "/services", "/pricing"],
        });
        break;
    }

    const duration = Date.now() - startTime;
    console.log(`[API] Web scraper completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: result,
      duration,
      mode,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error("[API] Web scraper error:", error);

    // Provide more specific error messages
    let errorMessage = "Scraping failed";
    let statusCode = 500;

    if (error.message.includes("timeout")) {
      errorMessage = "Website took too long to respond";
      statusCode = 504;
    } else if (
      error.message.includes("404") ||
      error.message.includes("not found")
    ) {
      errorMessage = "Website not found";
      statusCode = 404;
    } else if (
      error.message.includes("blocked") ||
      error.message.includes("403")
    ) {
      errorMessage = "Access to website was blocked";
      statusCode = 403;
    } else if (
      error.message.includes("network") ||
      error.message.includes("ECONNREFUSED")
    ) {
      errorMessage = "Network connection failed";
      statusCode = 503;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error.message,
        duration,
      },
      { status: statusCode }
    );
  }
}

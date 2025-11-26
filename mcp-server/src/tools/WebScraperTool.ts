/**
 * Web Scraper Tool
 * Fetches and extracts text content from websites
 */

interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  description?: string;
  error?: string;
}

/**
 * Scrapes a website and extracts clean text content
 */
export async function scrapeWebsite(url: string): Promise<ScrapedContent> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ForecastaAI-Bot/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    // Extract meta description
    const descMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
    );
    const description = descMatch ? descMatch[1].trim() : undefined;

    // Remove scripts, styles, and comments
    let cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    // Extract text from HTML tags
    const content = cleanHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      url,
      title,
      content: content.substring(0, 10000), // Limit to 10k chars
      description,
    };
  } catch (error) {
    return {
      url,
      title: "",
      content: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

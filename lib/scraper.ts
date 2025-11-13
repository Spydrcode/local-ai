import { chromium } from "playwright";
import * as cheerio from "cheerio";

/**
 * Fetch site pages using Playwright (local) or puppeteer-core with @sparticuz/chromium (production/Vercel)
 * Both methods provide full browser automation for multi-page scraping with dynamic content
 */
export async function fetchSitePages(
  url: string,
  paths: string[] = ["/", "/about", "/services", "/pricing"]
): Promise<Record<string, string>> {
  // Check if we're in a serverless environment (Vercel) where Playwright won't work
  const isServerless =
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
    console.log(
      "[Scraper] Running in serverless mode - using puppeteer-core with @sparticuz/chromium"
    );
    return fetchSitePagesPuppeteer(url, paths);
  }

  try {
    console.log("[Scraper] Using Playwright for scraping");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const results: Record<string, string> = {};
    try {
      for (const path of paths) {
        const fullUrl =
          url.endsWith("/") && path.startsWith("/")
            ? url.slice(0, -1) + path
            : url + path;
        try {
          await page.goto(fullUrl, {
            waitUntil: "domcontentloaded",
            timeout: 15000,
          });
          results[path] = await page.content();
        } catch (err) {
          results[path] = `ERROR: ${err}`;
        }
      }
    } finally {
      await browser.close();
    }
    return results;
  } catch (error) {
    console.error(
      "[Scraper] Playwright failed, falling back to cheerio + fetch:",
      error
    );
    return fetchSitePagesCheerio(url, paths);
  }
}

/**
 * Multi-page scraper for serverless environments using puppeteer-core with @sparticuz/chromium
 * Falls back to cheerio + fetch if puppeteer fails or times out
 */
async function fetchSitePagesPuppeteer(
  url: string,
  paths: string[]
): Promise<Record<string, string>> {
  try {
    // Dynamic imports for serverless compatibility
    const puppeteer = await import("puppeteer-core");
    const chromiumPackage = await import("@sparticuz/chromium");

    let browser;
    const results: Record<string, string> = {};

    try {
      console.log("[Scraper] Launching Chromium for serverless environment...");

      // Optimize chromium args for faster execution
      const args = [
        ...chromiumPackage.default.args,
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--single-process',
        '--no-zygote'
      ];

      // Launch browser with @sparticuz/chromium configuration
      browser = await puppeteer.default.launch({
        args,
        executablePath: await chromiumPackage.default.executablePath(),
        headless: true,
      });

      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Reduce timeout for faster failure/fallback
      for (const path of paths) {
        const fullUrl =
          url.endsWith("/") && path.startsWith("/")
            ? url.slice(0, -1) + path
            : url + path;

        try {
          console.log(`[Scraper] Fetching ${fullUrl} with puppeteer...`);
          await page.goto(fullUrl, {
            waitUntil: "domcontentloaded", // Faster than networkidle0
            timeout: 20000, // Reduced from 30s
          });

          results[path] = await page.content();
        } catch (err) {
          console.error(`[Scraper] Error fetching ${fullUrl}:`, err);
          results[path] =
            `ERROR: ${err instanceof Error ? err.message : String(err)}`;
        }
      }

      return results;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    console.error("[Scraper] Puppeteer failed, falling back to cheerio + fetch:", error);
    return fetchSitePagesCheerio(url, paths);
  }
}

/**
 * Cheerio + fetch fallback for when puppeteer fails
 * Provides basic multi-page scraping without JavaScript execution
 */
async function fetchSitePagesCheerio(
  url: string,
  paths: string[]
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  console.log("[Scraper] Using cheerio + fetch fallback");

  for (const path of paths) {
    const fullUrl =
      url.endsWith("/") && path.startsWith("/")
        ? url.slice(0, -1) + path
        : url + path;

    try {
      const response = await fetch(fullUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        results[path] = await response.text();
      } else {
        results[path] = `ERROR: HTTP ${response.status}`;
      }
    } catch (err) {
      console.error(`[Scraper] Error fetching ${fullUrl}:`, err);
      results[path] =
        `ERROR: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  return results;
}

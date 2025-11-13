import { chromium } from "playwright";

/**
 * Fetch site pages using Playwright (local) or puppeteer-core with @sparticuz/chromium (production/Vercel)
 * Both methods provide full browser automation for multi-page scraping with dynamic content
 */
export async function fetchSitePages(
  url: string,
  paths: string[] = ["/", "/about", "/services", "/pricing"]
): Promise<Record<string, string>> {
  // Check if we're in a serverless environment (Vercel) where Playwright won't work
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  if (isServerless) {
    console.log('[Scraper] Running in serverless mode - using puppeteer-core with @sparticuz/chromium');
    return fetchSitePagesSimple(url, paths);
  }

  try {
    console.log('[Scraper] Using Playwright for scraping');
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
    console.error('[Scraper] Playwright failed, falling back to simple fetch:', error);
    return fetchSitePagesSimple(url, paths);
  }
}

/**
 * Multi-page scraper for serverless environments using puppeteer-core with @sparticuz/chromium
 * This maintains the same quality as Playwright but works in Vercel/AWS Lambda
 */
async function fetchSitePagesSimple(
  url: string,
  paths: string[]
): Promise<Record<string, string>> {
  // Dynamic imports for serverless compatibility
  const puppeteer = await import('puppeteer-core');
  const chromiumPackage = await import('@sparticuz/chromium');
  
  let browser;
  const results: Record<string, string> = {};
  
  try {
    console.log('[Scraper] Launching Chromium for serverless environment...');
    
    // Launch browser with @sparticuz/chromium configuration
    browser = await puppeteer.default.launch({
      args: chromiumPackage.default.args,
      executablePath: await chromiumPackage.default.executablePath(),
      headless: true,
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    for (const path of paths) {
      const fullUrl =
        url.endsWith("/") && path.startsWith("/")
          ? url.slice(0, -1) + path
          : url + path;
      
      try {
        console.log(`[Scraper] Fetching ${fullUrl} with puppeteer...`);
        await page.goto(fullUrl, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });
        
        results[path] = await page.content();
      } catch (err) {
        console.error(`[Scraper] Error fetching ${fullUrl}:`, err);
        results[path] = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
      }
    }
    
    return results;
  } catch (error) {
    console.error('[Scraper] Puppeteer failed:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

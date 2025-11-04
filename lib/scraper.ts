import { chromium } from "playwright";

export async function fetchSitePages(
  url: string,
  paths: string[] = ["/", "/about", "/services", "/pricing"]
): Promise<Record<string, string>> {
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
}

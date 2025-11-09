/**
 * SEO Analyzer
 *
 * Analyzes website SEO performance using FREE APIs:
 * - Google PageSpeed Insights API (free, no credit card)
 * - OpenPageRank API (free domain authority)
 * - On-page SEO analysis (meta tags, headings, etc.)
 * - Technical SEO issues detection
 */

import type { SEOMetrics } from "./index";

// Extend SEOMetrics to include domain authority
export interface EnhancedSEOMetrics extends SEOMetrics {
  domainAuthority?: {
    score: number; // 0-10 scale
    rank: number; // OpenPageRank rank
  };
  logo?: string; // Clearbit logo URL
}

/**
 * Analyze SEO metrics for a website
 */
export async function analyzeSEO(url: string): Promise<EnhancedSEOMetrics> {
  try {
    // Extract domain from URL
    const domain = new URL(url).hostname.replace(/^www\./, "");

    // Run analyses in parallel
    const [pageSpeed, onPageSEO, domainAuthority, logo] = await Promise.all([
      analyzePageSpeed(url),
      analyzeOnPageSEO(url),
      getDomainAuthority(domain),
      getBusinessLogo(domain),
    ]);

    return {
      pageSpeed: pageSpeed.speeds,
      mobileUsability: pageSpeed.mobileUsable,
      metaTags: onPageSEO.metaTags,
      headings: onPageSEO.headings,
      images: onPageSEO.images,
      links: onPageSEO.links,
      technicalIssues: [...pageSpeed.issues, ...onPageSEO.issues],
      domainAuthority,
      logo,
    };
  } catch (error) {
    throw new Error(
      `SEO analysis failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Analyze page speed using Google PageSpeed Insights API (free)
 */
async function analyzePageSpeed(url: string): Promise<{
  speeds: { desktop: number; mobile: number };
  mobileUsable: boolean;
  issues: string[];
}> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

  if (!apiKey) {
    // Fallback: Use basic fetch timing
    return fallbackPageSpeed(url);
  }

  try {
    const issues: string[] = [];

    // Test mobile
    const mobileUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&key=${apiKey}`;
    const mobileResponse = await fetch(mobileUrl, {
      signal: AbortSignal.timeout(30000),
    });
    const mobileData = await mobileResponse.json();

    // Test desktop
    const desktopUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=desktop&key=${apiKey}`;
    const desktopResponse = await fetch(desktopUrl, {
      signal: AbortSignal.timeout(30000),
    });
    const desktopData = await desktopResponse.json();

    // Extract scores (0-100)
    const mobileScore =
      Math.round(
        (mobileData.lighthouseResult?.categories?.performance?.score || 0) * 100
      );
    const desktopScore =
      Math.round(
        (desktopData.lighthouseResult?.categories?.performance?.score || 0) *
          100
      );

    // Check mobile usability
    const mobileUsable =
      mobileData.lighthouseResult?.audits?.["viewport"]?.score === 1;

    if (!mobileUsable) {
      issues.push("Not mobile-friendly: Missing or incorrect viewport meta tag");
    }

    // Extract key issues
    if (mobileScore < 50) {
      issues.push(`Poor mobile performance: ${mobileScore}/100`);
    }
    if (desktopScore < 50) {
      issues.push(`Poor desktop performance: ${desktopScore}/100`);
    }

    return {
      speeds: {
        desktop: desktopScore,
        mobile: mobileScore,
      },
      mobileUsable,
      issues,
    };
  } catch (error) {
    console.warn("[SEOAnalyzer] PageSpeed Insights failed:", error);
    return fallbackPageSpeed(url);
  }
}

/**
 * Fallback page speed analysis (basic timing)
 */
async function fallbackPageSpeed(url: string): Promise<{
  speeds: { desktop: number; mobile: number };
  mobileUsable: boolean;
  issues: string[];
}> {
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });
    const loadTime = Date.now() - startTime;

    // Rough estimate: <2s = 90+, <4s = 70+, <6s = 50+, else lower
    const score =
      loadTime < 2000
        ? 90
        : loadTime < 4000
          ? 70
          : loadTime < 6000
            ? 50
            : 30;

    const html = await response.text();
    const mobileUsable = html.includes('name="viewport"');

    const issues: string[] = [];
    if (score < 70) {
      issues.push(`Slow load time: ${loadTime}ms`);
    }
    if (!mobileUsable) {
      issues.push("Missing viewport meta tag - not mobile optimized");
    }

    return {
      speeds: {
        desktop: score,
        mobile: score - 10, // Assume mobile is slightly slower
      },
      mobileUsable,
      issues,
    };
  } catch (error) {
    return {
      speeds: { desktop: 0, mobile: 0 },
      mobileUsable: false,
      issues: ["Unable to measure page speed"],
    };
  }
}

/**
 * Analyze on-page SEO elements
 */
async function analyzeOnPageSEO(url: string): Promise<{
  metaTags: SEOMetrics["metaTags"];
  headings: SEOMetrics["headings"];
  images: SEOMetrics["images"];
  links: SEOMetrics["links"];
  issues: string[];
}> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });
    const html = await response.text();

    const issues: string[] = [];

    // Extract meta tags
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    const descMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
    );
    const description = descMatch ? descMatch[1].trim() : undefined;

    const keywordsMatch = html.match(
      /<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i
    );
    const keywords = keywordsMatch ? keywordsMatch[1].trim() : undefined;

    // Validate meta tags
    if (!title) {
      issues.push("Missing title tag");
    } else if (title.length < 30 || title.length > 60) {
      issues.push(`Title length not optimal: ${title.length} chars (ideal: 30-60)`);
    }

    if (!description) {
      issues.push("Missing meta description");
    } else if (description.length < 120 || description.length > 160) {
      issues.push(
        `Meta description length not optimal: ${description.length} chars (ideal: 120-160)`
      );
    }

    // Extract headings
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];

    const h1s = h1Matches.map((h) =>
      h.replace(/<[^>]+>/g, "").trim()
    );
    const h2s = h2Matches
      .map((h) => h.replace(/<[^>]+>/g, "").trim())
      .slice(0, 10);

    if (h1s.length === 0) {
      issues.push("Missing H1 heading");
    } else if (h1s.length > 1) {
      issues.push(`Multiple H1 headings found: ${h1s.length} (should be 1)`);
    }

    // Analyze images
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    const imagesWithAlt = imgMatches.filter((img) =>
      img.includes("alt=")
    ).length;
    const totalImages = imgMatches.length;
    const missingAlt = totalImages - imagesWithAlt;

    if (missingAlt > 0) {
      issues.push(
        `${missingAlt}/${totalImages} images missing alt text (bad for SEO & accessibility)`
      );
    }

    // Analyze links
    const linkMatches = html.match(/<a[^>]*href=["']([^"']+)["']/gi) || [];
    const internalLinks = linkMatches.filter(
      (link) => !link.includes("http") || link.includes(url)
    ).length;
    const externalLinks = linkMatches.length - internalLinks;

    return {
      metaTags: {
        title,
        description,
        keywords,
      },
      headings: {
        h1: h1s,
        h2: h2s,
      },
      images: {
        total: totalImages,
        withAlt: imagesWithAlt,
        missingAlt,
      },
      links: {
        internal: internalLinks,
        external: externalLinks,
      },
      issues,
    };
  } catch (error) {
    throw new Error(
      `On-page SEO analysis failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Enhanced SEO functions using free APIs
 *
 * Add these to seo-analyzer.ts:
 */

/**
 * Get domain authority using OpenPageRank API (free, no credit card)
 */
export async function getDomainAuthority(
  domain: string
): Promise<{ score: number; rank: number } | undefined> {
  const apiKey = process.env.OPENPAGERANK_API_KEY;

  if (!apiKey) {
    console.log(
      "[SEO] OpenPageRank API key not configured - skipping domain authority"
    );
    return undefined;
  }

  try {
    const response = await fetch(
      `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${domain}`,
      {
        headers: {
          "API-OPR": apiKey,
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      console.warn(`[SEO] OpenPageRank API error: ${response.status}`);
      return undefined;
    }

    const data = await response.json();

    if (data.response && data.response.length > 0) {
      const result = data.response[0];
      return {
        score: Math.round(result.page_rank_decimal * 10) / 10, // 0-10 scale
        rank: result.rank || 0,
      };
    }

    return undefined;
  } catch (error) {
    console.warn("[SEO] OpenPageRank failed:", error);
    return undefined;
  }
}

/**
 * Get business logo using Clearbit Logo API (completely free, no signup)
 */
export async function getBusinessLogo(
  domain: string
): Promise<string | undefined> {
  try {
    const logoUrl = `https://logo.clearbit.com/${domain}`;

    // Test if logo exists (Clearbit returns 404 if not found)
    const response = await fetch(logoUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return logoUrl;
    }

    return undefined;
  } catch (error) {
    console.warn("[SEO] Clearbit logo fetch failed:", error);
    return undefined;
  }
}

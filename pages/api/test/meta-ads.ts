import { searchCompetitorAds } from "@/lib/data-collectors";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Test Meta Ads Library Integration
 *
 * GET /api/test/meta-ads
 *
 * Quick endpoint to verify Meta Ads Library token is configured and working
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check if token is configured
  const token = process.env.META_ADS_LIBRARY_TOKEN;
  if (!token) {
    return res.status(503).json({
      success: false,
      error: "Meta Ads Library token not configured",
      message: "Please set META_ADS_LIBRARY_TOKEN in your .env.local file",
      instructions:
        "Get your token from: https://www.facebook.com/ads/library/api",
    });
  }

  try {
    console.log("[MetaAdsTest] Testing API with simple search...");

    // Test with a simple search for "coffee" ads
    const ads = await searchCompetitorAds({
      keyword: "coffee shop",
      countries: ["US"],
      limit: 3,
      accessToken: token,
    });

    console.log(`[MetaAdsTest] Successfully retrieved ${ads.length} ads`);

    return res.status(200).json({
      success: true,
      message: "Meta Ads Library integration is working!",
      tokenConfigured: true,
      testResults: {
        searchKeyword: "coffee shop",
        adsFound: ads.length,
        sampleAds: ads.slice(0, 2).map((ad) => ({
          pageName: ad.pageName,
          platforms: ad.platforms,
          headline: ad.creative.headline,
          isActive: ad.isActive,
        })),
      },
      nextSteps: [
        "Visit /business-context to set up your business information",
        "Add competitors to enable competitive intelligence",
        "Use /api/meta-ads/competitive-intel to analyze competitor ads",
      ],
    });
  } catch (error) {
    console.error("[MetaAdsTest] Error:", error);

    return res.status(500).json({
      success: false,
      error: "Meta Ads API test failed",
      message: error instanceof Error ? error.message : "Unknown error",
      troubleshooting: [
        "Verify the token has not expired",
        "Check the token has Ads Library API permissions",
        "Visit https://developers.facebook.com to regenerate token if needed",
      ],
    });
  }
}

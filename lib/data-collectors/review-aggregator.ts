/**
 * Review Aggregation
 *
 * Collects reviews from multiple sources:
 * - Google Places API (primary source)
 * - Yelp scraping (fallback)
 * - Website testimonials
 *
 * Provides sentiment analysis and theme extraction.
 */

import type { ReviewData, ReviewSummary } from "./index";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ReviewAggregationParams {
  businessName: string;
  location?: string;
  website?: string;
  limit?: number;
}

/**
 * Aggregate reviews from multiple sources
 */
export async function aggregateReviews(
  params: ReviewAggregationParams
): Promise<ReviewSummary> {
  const { businessName, location, website, limit = 50 } = params;

  try {
    const allReviews: ReviewData[] = [];

    // Step 1: Try Google Places API (if configured)
    if (process.env.GOOGLE_PLACES_API_KEY) {
      try {
        const googleReviews = await fetchGoogleReviews(
          businessName,
          location
        );
        allReviews.push(...googleReviews);
      } catch (error) {
        console.warn("[ReviewAggregator] Google Places failed:", error);
      }
    }

    // Step 2: Scrape Yelp (basic implementation)
    try {
      const yelpReviews = await scrapeYelpReviews(businessName, location);
      allReviews.push(...yelpReviews);
    } catch (error) {
      console.warn("[ReviewAggregator] Yelp scraping failed:", error);
    }

    // Step 3: Extract testimonials from website (if provided)
    if (website) {
      try {
        const testimonials = await extractTestimonials(website);
        allReviews.push(...testimonials);
      } catch (error) {
        console.warn("[ReviewAggregator] Testimonial extraction failed:", error);
      }
    }

    // Limit total reviews
    const limitedReviews = allReviews.slice(0, limit);

    // Analyze sentiment and themes
    const analyzed = await analyzeSentimentAndThemes(limitedReviews);

    // Build summary
    const summary: ReviewSummary = {
      totalReviews: allReviews.length,
      averageRating:
        allReviews.length > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) /
            allReviews.length
          : 0,
      sources: buildSourceBreakdown(allReviews),
      recentReviews: limitedReviews.slice(0, 10),
      sentimentBreakdown: {
        positive: analyzed.filter((r) => r.sentiment === "positive").length,
        negative: analyzed.filter((r) => r.sentiment === "negative").length,
        neutral: analyzed.filter((r) => r.sentiment === "neutral").length,
      },
      commonThemes: extractCommonThemes(analyzed),
    };

    return summary;
  } catch (error) {
    throw new Error(
      `Review aggregation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Fetch reviews from Google Places API
 */
async function fetchGoogleReviews(
  businessName: string,
  location?: string
): Promise<ReviewData[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return [];
  }

  try {
    // Step 1: Search for place
    const searchQuery = location
      ? `${businessName} ${location}`
      : businessName;

    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id&key=${apiKey}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.candidates || searchData.candidates.length === 0) {
      console.warn("[ReviewAggregator] No Google Place found");
      return [];
    }

    const placeId = searchData.candidates[0].place_id;

    // Step 2: Get place details with reviews
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;

    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (!detailsData.result?.reviews) {
      return [];
    }

    // Convert to our format
    const reviews: ReviewData[] = detailsData.result.reviews.map(
      (review: any) => ({
        source: "google" as const,
        rating: review.rating,
        text: review.text,
        author: review.author_name,
        date: review.time
          ? new Date(review.time * 1000).toISOString()
          : undefined,
        sentiment: "neutral" as const, // Will be analyzed later
      })
    );

    return reviews;
  } catch (error) {
    console.error("[ReviewAggregator] Google Places API error:", error);
    return [];
  }
}

/**
 * Scrape Yelp reviews (basic implementation)
 */
async function scrapeYelpReviews(
  businessName: string,
  location?: string
): Promise<ReviewData[]> {
  // TODO: Implement Yelp scraping or use Yelp Fusion API
  // For MVP, return empty array
  return [];
}

/**
 * Extract testimonials from business website
 */
async function extractTestimonials(websiteUrl: string): Promise<ReviewData[]> {
  // TODO: Scrape common testimonial sections
  // For MVP, return empty array
  return [];
}

/**
 * Analyze sentiment and extract themes from reviews
 */
async function analyzeSentimentAndThemes(
  reviews: ReviewData[]
): Promise<ReviewData[]> {
  if (reviews.length === 0) {
    return [];
  }

  try {
    // Batch analyze reviews (process in chunks of 20)
    const chunkSize = 20;
    const analyzed: ReviewData[] = [];

    for (let i = 0; i < reviews.length; i += chunkSize) {
      const chunk = reviews.slice(i, i + chunkSize);

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: `Analyze review sentiment and extract themes. Return valid JSON only.`,
          },
          {
            role: "user",
            content: `Analyze these reviews and assign sentiment + themes.

REVIEWS:
${chunk.map((r, idx) => `${idx + 1}. [${r.rating}⭐] ${r.text}`).join("\n\n")}

For each review, return:
- sentiment: "positive" | "negative" | "neutral"
- themes: Array of 1-3 key themes (e.g., ["customer service", "quality", "pricing"])

Return JSON array:
[
  { "sentiment": "positive", "themes": ["customer service", "quality"] },
  ...
]`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = response.choices[0]?.message?.content;
      if (result) {
        const parsed = JSON.parse(result);
        const analyses = Array.isArray(parsed)
          ? parsed
          : parsed.reviews || [];

        chunk.forEach((review, idx) => {
          const analysis = analyses[idx] || {
            sentiment: "neutral",
            themes: [],
          };
          analyzed.push({
            ...review,
            sentiment: analysis.sentiment,
            themes: analysis.themes,
          });
        });
      } else {
        analyzed.push(...chunk);
      }
    }

    return analyzed;
  } catch (error) {
    console.error("[ReviewAggregator] Sentiment analysis failed:", error);
    return reviews; // Return original reviews without analysis
  }
}

/**
 * Build source breakdown
 */
function buildSourceBreakdown(reviews: ReviewData[]): ReviewSummary["sources"] {
  const sources: ReviewSummary["sources"] = {};

  const googleReviews = reviews.filter((r) => r.source === "google");
  if (googleReviews.length > 0) {
    sources.google = {
      count: googleReviews.length,
      rating:
        googleReviews.reduce((sum, r) => sum + r.rating, 0) /
        googleReviews.length,
    };
  }

  const yelpReviews = reviews.filter((r) => r.source === "yelp");
  if (yelpReviews.length > 0) {
    sources.yelp = {
      count: yelpReviews.length,
      rating:
        yelpReviews.reduce((sum, r) => sum + r.rating, 0) / yelpReviews.length,
    };
  }

  const facebookReviews = reviews.filter((r) => r.source === "facebook");
  if (facebookReviews.length > 0) {
    sources.facebook = {
      count: facebookReviews.length,
      rating:
        facebookReviews.reduce((sum, r) => sum + r.rating, 0) /
        facebookReviews.length,
    };
  }

  return sources;
}

/**
 * Extract common themes across all reviews
 */
function extractCommonThemes(
  reviews: ReviewData[]
): { theme: string; count: number; sentiment: string }[] {
  const themeCounts: Map<
    string,
    { count: number; positive: number; negative: number }
  > = new Map();

  reviews.forEach((review) => {
    if (!review.themes) return;

    review.themes.forEach((theme) => {
      const existing = themeCounts.get(theme) || {
        count: 0,
        positive: 0,
        negative: 0,
      };

      existing.count++;
      if (review.sentiment === "positive") existing.positive++;
      if (review.sentiment === "negative") existing.negative++;

      themeCounts.set(theme, existing);
    });
  });

  // Convert to array and sort by count
  const themes = Array.from(themeCounts.entries())
    .map(([theme, stats]) => ({
      theme,
      count: stats.count,
      sentiment:
        stats.positive > stats.negative
          ? "positive"
          : stats.negative > stats.positive
            ? "negative"
            : "neutral",
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return themes;
}

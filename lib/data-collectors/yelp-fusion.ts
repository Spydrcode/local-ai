/**
 * Yelp Fusion API Integration
 * Provides additional review data, pricing signals, and business details
 * Docs: https://docs.developer.yelp.com/docs/fusion-intro
 *
 * Free tier: 5,000 API calls/day
 * Get API key: https://www.yelp.com/developers
 */

export interface YelpBusiness {
  id: string;
  alias: string;
  name: string;
  image_url: string;
  is_closed: boolean;
  url: string;
  review_count: number;
  categories: Array<{
    alias: string;
    title: string;
  }>;
  rating: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  transactions: string[];
  price?: string; // "$", "$$", "$$$", "$$$$"
  location: {
    address1: string;
    address2?: string;
    address3?: string;
    city: string;
    zip_code: string;
    country: string;
    state: string;
    display_address: string[];
  };
  phone: string;
  display_phone: string;
  distance?: number;
  attributes?: {
    business_temp_closed?: boolean;
    menu_url?: string;
    open24_hours?: boolean;
    waitlist_reservation?: boolean;
  };
}

export interface YelpReview {
  id: string;
  url: string;
  text: string;
  rating: number;
  time_created: string;
  user: {
    id: string;
    profile_url: string;
    image_url?: string;
    name: string;
  };
}

export interface YelpSearchResponse {
  businesses: YelpBusiness[];
  total: number;
  region: {
    center: {
      longitude: number;
      latitude: number;
    };
  };
}

/**
 * Search for a business on Yelp
 */
export async function searchYelpBusiness(
  businessName: string,
  location: string
): Promise<YelpBusiness | null> {
  const apiKey = process.env.YELP_API_KEY;

  if (!apiKey) {
    console.warn("⚠️  YELP_API_KEY not configured - skipping Yelp data collection");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.yelp.com/v3/businesses/search?` +
        new URLSearchParams({
          term: businessName,
          location: location,
          limit: "1",
          sort_by: "best_match",
        }),
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error("❌ Yelp API: Invalid API key");
      } else if (response.status === 429) {
        console.error("❌ Yelp API: Rate limit exceeded");
      } else {
        console.error(`❌ Yelp API error: ${response.status} ${response.statusText}`);
      }
      return null;
    }

    const data: YelpSearchResponse = await response.json();

    if (!data.businesses || data.businesses.length === 0) {
      console.log(`ℹ️  No Yelp listing found for "${businessName}" in ${location}`);
      return null;
    }

    console.log(`✅ Found Yelp business: ${data.businesses[0].name} (${data.businesses[0].rating}⭐, ${data.businesses[0].review_count} reviews)`);
    return data.businesses[0];
  } catch (error) {
    console.error("Error fetching Yelp business:", error);
    return null;
  }
}

/**
 * Get reviews for a specific business
 */
export async function getYelpReviews(
  businessId: string
): Promise<YelpReview[]> {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `https://api.yelp.com/v3/businesses/${businessId}/reviews?limit=50&sort_by=newest`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`Yelp reviews error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.reviews?.length || 0} Yelp reviews`);
    return data.reviews || [];
  } catch (error) {
    console.error("Error fetching Yelp reviews:", error);
    return [];
  }
}

/**
 * Get complete Yelp data (business + reviews)
 */
export async function getYelpData(
  businessName: string,
  location: string
): Promise<{
  business: YelpBusiness | null;
  reviews: YelpReview[];
  metadata: {
    source: string;
    collectedAt: string;
    hasData: boolean;
  };
}> {
  const startTime = Date.now();

  const business = await searchYelpBusiness(businessName, location);

  if (!business) {
    return {
      business: null,
      reviews: [],
      metadata: {
        source: "yelp",
        collectedAt: new Date().toISOString(),
        hasData: false,
      },
    };
  }

  const reviews = await getYelpReviews(business.id);

  const duration = Date.now() - startTime;
  console.log(`✅ Yelp data collection complete (${duration}ms)`);

  return {
    business,
    reviews,
    metadata: {
      source: "yelp",
      collectedAt: new Date().toISOString(),
      hasData: true,
    },
  };
}

/**
 * Extract pricing insights from Yelp data
 */
export function extractPricingInsights(yelpBusiness: YelpBusiness | null): {
  priceLevel: string;
  priceDescription: string;
  competitivePricing: string;
} {
  if (!yelpBusiness?.price) {
    return {
      priceLevel: "unknown",
      priceDescription: "Pricing information not available",
      competitivePricing: "mid-range",
    };
  }

  const priceMap: Record<string, { level: string; desc: string; competitive: string }> = {
    "$": {
      level: "budget",
      desc: "Budget-friendly pricing",
      competitive: "low-cost",
    },
    "$$": {
      level: "moderate",
      desc: "Moderate pricing",
      competitive: "mid-range",
    },
    "$$$": {
      level: "upscale",
      desc: "Upscale pricing",
      competitive: "premium",
    },
    "$$$$": {
      level: "luxury",
      desc: "Luxury pricing",
      competitive: "high-end",
    },
  };

  const pricing = priceMap[yelpBusiness.price] || priceMap["$$"];

  return {
    priceLevel: pricing.level,
    priceDescription: pricing.desc,
    competitivePricing: pricing.competitive,
  };
}

/**
 * Compare business with competitors on Yelp
 */
export async function getCompetitorComparison(
  industry: string,
  location: string,
  limit: number = 5
): Promise<Array<{
  name: string;
  rating: number;
  reviewCount: number;
  priceLevel: string;
  distance?: number;
}>> {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `https://api.yelp.com/v3/businesses/search?` +
        new URLSearchParams({
          term: industry,
          location: location,
          limit: limit.toString(),
          sort_by: "rating",
        }),
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) return [];

    const data: YelpSearchResponse = await response.json();

    return data.businesses.map((b) => ({
      name: b.name,
      rating: b.rating,
      reviewCount: b.review_count,
      priceLevel: b.price || "$$",
      distance: b.distance,
    }));
  } catch (error) {
    console.error("Error fetching competitor comparison:", error);
    return [];
  }
}

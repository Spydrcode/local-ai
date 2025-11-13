/**
 * Google My Business / Google Maps Platform Integration
 * Provides local business data, reviews, photos, and Q&A
 * Docs: https://developers.google.com/maps/documentation/places/web-service
 *
 * Cost: Free (with usage limits, part of Google Maps Platform)
 * Get API key: https://console.cloud.google.com/
 * Required APIs: Places API, Maps JavaScript API
 */

import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

export interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  url: string; // Google Maps URL
  rating?: number;
  user_ratings_total?: number;
  price_level?: number; // 0-4 (0=Free, 1=Inexpensive, 2=Moderate, 3=Expensive, 4=Very Expensive)
  opening_hours?: {
    open_now: boolean;
    periods?: Array<{
      close?: { day: number; time: string };
      open: { day: number; time: string };
    }>;
    weekday_text: string[];
  };
  reviews?: Array<{
    author_name: string;
    author_url: string;
    language: string;
    profile_photo_url?: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time: number;
  }>;
  photos?: Array<{
    height: number;
    width: number;
    photo_reference: string;
    html_attributions: string[];
  }>;
  types: string[];
  business_status?: string; // "OPERATIONAL", "CLOSED_TEMPORARILY", "CLOSED_PERMANENTLY"
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

/**
 * Find business on Google Maps
 */
export async function findGoogleBusiness(
  businessName: string,
  location: string
): Promise<GooglePlace | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn(
      "⚠️  GOOGLE_MAPS_API_KEY not configured - skipping Google My Business data"
    );
    return null;
  }

  try {
    // Step 1: Find Place from Text
    const findResponse = await client.findPlaceFromText({
      params: {
        input: `${businessName} ${location}`,
        inputtype: "textquery" as any,
        fields: ["place_id", "name"],
        key: apiKey,
      },
      timeout: 10000,
    });

    const placeId = findResponse.data.candidates?.[0]?.place_id;

    if (!placeId) {
      console.log(
        `ℹ️  No Google My Business listing found for "${businessName}" in ${location}`
      );
      return null;
    }

    // Step 2: Get Place Details
    const detailsResponse = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: [
          "place_id",
          "name",
          "formatted_address",
          "formatted_phone_number",
          "international_phone_number",
          "website",
          "url",
          "rating",
          "user_ratings_total",
          "price_level",
          "opening_hours",
          "reviews",
          "photos",
          "types",
          "business_status",
          "geometry",
        ],
        key: apiKey,
      },
      timeout: 10000,
    });

    const place = detailsResponse.data.result as GooglePlace;

    console.log(
      `✅ Found Google My Business: ${place.name} (${place.rating || "N/A"}⭐, ${place.user_ratings_total || 0} reviews)`
    );

    return place;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.error("❌ Google Maps API: Invalid API key");
    } else if (error.response?.status === 403) {
      console.error(
        "❌ Google Maps API: Access forbidden - check API restrictions"
      );
    } else if (error.response?.status === 429) {
      console.error("❌ Google Maps API: Quota exceeded");
    } else {
      console.error("Error fetching Google My Business:", error.message);
    }
    return null;
  }
}

/**
 * Get photo URL from photo reference
 */
export function getGooglePhotoUrl(
  photoReference: string,
  maxWidth: number = 800
): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return "";

  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
}

/**
 * Extract hours of operation in readable format
 */
export function extractHoursOfOperation(place: GooglePlace): {
  isOpen: boolean;
  hours: string[];
  alwaysOpen: boolean;
} {
  if (!place.opening_hours) {
    return {
      isOpen: false,
      hours: [],
      alwaysOpen: false,
    };
  }

  // Check if always open (24/7)
  const alwaysOpen =
    place.opening_hours.periods?.length === 1 &&
    place.opening_hours.periods[0].open.day === 0 &&
    place.opening_hours.periods[0].open.time === "0000" &&
    !place.opening_hours.periods[0].close;

  return {
    isOpen: place.opening_hours.open_now,
    hours: place.opening_hours.weekday_text || [],
    alwaysOpen,
  };
}

/**
 * Extract pricing level description
 */
export function extractPricingLevel(place: GooglePlace): {
  level: number;
  description: string;
  symbol: string;
} {
  const priceLevel = place.price_level ?? 2; // Default to moderate

  const pricingMap: Record<number, { description: string; symbol: string }> = {
    0: { description: "Free", symbol: "Free" },
    1: { description: "Inexpensive", symbol: "$" },
    2: { description: "Moderate", symbol: "$$" },
    3: { description: "Expensive", symbol: "$$$" },
    4: { description: "Very Expensive", symbol: "$$$$" },
  };

  const pricing = pricingMap[priceLevel] || pricingMap[2];

  return {
    level: priceLevel,
    description: pricing.description,
    symbol: pricing.symbol,
  };
}

/**
 * Analyze review sentiment and themes
 */
export function analyzeGoogleReviews(place: GooglePlace): {
  averageRating: number;
  totalReviews: number;
  recentReviews: number;
  ratingDistribution: Record<number, number>;
  commonThemes: string[];
} {
  if (!place.reviews || place.reviews.length === 0) {
    return {
      averageRating: place.rating || 0,
      totalReviews: place.user_ratings_total || 0,
      recentReviews: 0,
      ratingDistribution: {},
      commonThemes: [],
    };
  }

  const ratingDistribution: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  place.reviews.forEach((review) => {
    ratingDistribution[review.rating] =
      (ratingDistribution[review.rating] || 0) + 1;
  });

  // Extract common themes from reviews (simple keyword extraction)
  const commonWords: Record<string, number> = {};
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "as",
    "is",
    "was",
    "are",
    "were",
    "been",
    "be",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "my",
    "your",
    "his",
    "her",
    "our",
    "their",
    "very",
    "really",
    "so",
    "too",
    "just",
  ]);

  place.reviews.forEach((review) => {
    const words = review.text
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));

    words.forEach((word) => {
      commonWords[word] = (commonWords[word] || 0) + 1;
    });
  });

  // Get top themes
  const commonThemes = Object.entries(commonWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  return {
    averageRating: place.rating || 0,
    totalReviews: place.user_ratings_total || 0,
    recentReviews: place.reviews.length,
    ratingDistribution,
    commonThemes,
  };
}

/**
 * Get nearby competitors
 */
export async function getNearbyCompetitors(
  location: { lat: number; lng: number },
  businessType: string,
  radiusMeters: number = 5000
): Promise<
  Array<{
    name: string;
    rating: number;
    userRatingsTotal: number;
    vicinity: string;
    priceLevel?: number;
  }>
> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await client.placesNearby({
      params: {
        location: `${location.lat},${location.lng}`,
        radius: radiusMeters,
        type: businessType,
        key: apiKey,
      },
      timeout: 10000,
    });

    const places = response.data.results || [];

    return places.map((place: any) => ({
      name: place.name,
      rating: place.rating || 0,
      userRatingsTotal: place.user_ratings_total || 0,
      vicinity: place.vicinity || "",
      priceLevel: place.price_level,
    }));
  } catch (error) {
    console.error("Error fetching nearby competitors:", error);
    return [];
  }
}

/**
 * Get complete Google My Business data
 */
export async function getGoogleMyBusinessData(
  businessName: string,
  location: string
): Promise<{
  place: GooglePlace | null;
  hours: ReturnType<typeof extractHoursOfOperation>;
  pricing: ReturnType<typeof extractPricingLevel>;
  reviewAnalysis: ReturnType<typeof analyzeGoogleReviews>;
  photos: string[];
  metadata: {
    source: string;
    collectedAt: string;
    hasData: boolean;
  };
}> {
  const startTime = Date.now();

  const place = await findGoogleBusiness(businessName, location);

  if (!place) {
    return {
      place: null,
      hours: { isOpen: false, hours: [], alwaysOpen: false },
      pricing: { level: 2, description: "Moderate", symbol: "$$" },
      reviewAnalysis: {
        averageRating: 0,
        totalReviews: 0,
        recentReviews: 0,
        ratingDistribution: {},
        commonThemes: [],
      },
      photos: [],
      metadata: {
        source: "google-mybusiness",
        collectedAt: new Date().toISOString(),
        hasData: false,
      },
    };
  }

  const hours = extractHoursOfOperation(place);
  const pricing = extractPricingLevel(place);
  const reviewAnalysis = analyzeGoogleReviews(place);
  const photos =
    place.photos
      ?.slice(0, 5)
      .map((p) => getGooglePhotoUrl(p.photo_reference)) || [];

  const duration = Date.now() - startTime;
  console.log(`✅ Google My Business data collection complete (${duration}ms)`);

  return {
    place,
    hours,
    pricing,
    reviewAnalysis,
    photos,
    metadata: {
      source: "google-mybusiness",
      collectedAt: new Date().toISOString(),
      hasData: true,
    },
  };
}

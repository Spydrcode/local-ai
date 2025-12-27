/**
 * Priority Generator
 * 
 * Generates actionable, prioritized recommendations based on scraped website data.
 * Uses data-driven rules to identify most impactful fixes for small businesses.
 */

export interface Priority {
  priority: number;
  item: string;
  impact: string;
}

export function generatePriorities(data: any): Priority[] {
  const priorities: Priority[] = [];
  let priorityCount = 1;

  // Check for SEO issues (high impact, easy fix)
  if (!data.seo?.title || data.seo?.title.length < 30) {
    priorities.push({
      priority: priorityCount++,
      item: "Improve website SEO metadata",
      impact: "High - Your page title is missing or too short. This directly affects Google rankings. A well-crafted 50-60 character title can improve click-through rates by 20-30%."
    });
  }

  // Check for reviews (critical for trust)
  if (!data.reviews?.totalReviews || data.reviews.totalReviews < 10) {
    priorities.push({
      priority: priorityCount++,
      item: "Build up your online reviews",
      impact: "Critical - You need at least 10-15 reviews to build trust. 88% of consumers trust online reviews as much as personal recommendations."
    });
  }

  // Check for social presence (baseline visibility)
  if (!data.social?.platforms || data.social.platforms.length === 0) {
    priorities.push({
      priority: priorityCount++,
      item: "Establish social media presence",
      impact: "Medium - Claim your profiles on Facebook and Instagram at minimum. Even inactive profiles show you exist and add credibility."
    });
  }

  // Check for competitive density
  if (data.competitors?.length > 3) {
    priorities.push({
      priority: priorityCount++,
      item: "Differentiate from crowded market",
      impact: `Medium - We found ${data.competitors.length} direct competitors. You need a clear unique selling proposition to stand out.`
    });
  }

  // Check for mobile optimization (critical in 2025)
  if (data.seo && !data.seo.isMobileFriendly) {
    priorities.push({
      priority: priorityCount++,
      item: "Make website mobile-friendly",
      impact: "High - 60% of searches happen on mobile. If your site isn't mobile-optimized, you're losing more than half of potential customers."
    });
  }

  // Ensure we have at least 3 priorities
  if (priorities.length < 3) {
    priorities.push({
      priority: priorityCount++,
      item: "Collect customer testimonials",
      impact: "Medium - Video or written testimonials on your website increase conversion rates by 34%. Start with your happiest customers."
    });
  }

  return priorities.slice(0, 5);
}

/**
 * Generate basic priorities for businesses without websites
 */
export function generateBasicPriorities(): Priority[] {
  return [
    {
      priority: 1,
      item: "Create a basic website",
      impact: "Critical - Most customers search online before buying. A simple 1-page site with contact info can capture 30-50% more leads."
    },
    {
      priority: 2,
      item: "Set up Google Business Profile",
      impact: "High - Free listing that appears in local searches and Google Maps. Takes 15 minutes, increases visibility by 70%."
    },
    {
      priority: 3,
      item: "Get your first 5 online reviews",
      impact: "High - 84% of people trust online reviews as much as personal recommendations. Start with recent satisfied customers."
    }
  ];
}

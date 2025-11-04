/**
 * SEO Analyzer Tool
 * Analyzes website content for SEO opportunities
 */

export interface SEOAnalysis {
  keywords: string[];
  metaQuality: {
    hasTitle: boolean;
    hasDescription: boolean;
    titleLength: number;
    descriptionLength: number;
  };
  contentIssues: string[];
  recommendations: string[];
}

/**
 * Analyzes scraped website content for SEO
 */
export function analyzeSEO(
  content: string,
  title: string,
  description?: string
): SEOAnalysis {
  // Extract potential keywords (simple word frequency)
  const words = content
    .toLowerCase()
    .match(/\b[a-z]{4,}\b/g) || [];
  
  const wordFreq = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const keywords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);

  const issues: string[] = [];
  const recommendations: string[] = [];

  if (!title || title.length < 30) {
    issues.push("Title tag too short");
    recommendations.push("Expand title to 50-60 characters with primary keywords");
  }

  if (!description || description.length < 120) {
    issues.push("Meta description missing or too short");
    recommendations.push("Add compelling 150-160 character meta description");
  }

  if (content.length < 500) {
    issues.push("Thin content - less than 500 words");
    recommendations.push("Expand content to at least 800-1000 words");
  }

  return {
    keywords,
    metaQuality: {
      hasTitle: !!title,
      hasDescription: !!description,
      titleLength: title?.length || 0,
      descriptionLength: description?.length || 0,
    },
    contentIssues: issues,
    recommendations,
  };
}

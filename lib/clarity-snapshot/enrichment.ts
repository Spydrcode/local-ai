/**
 * Clarity Snapshot Enrichment
 * 
 * Optional, non-blocking evidence extraction from:
 * - Website (homepage title, services snippet)
 * - Google Business Profile (snippet from search/url)
 * - Social (bio/description snippet)
 * 
 * Timeout: 5 seconds total
 * Fallback: Return empty array on any failure
 */

import type { EvidenceNugget } from '../types/clarity-snapshot';

// ============================================================================
// ENRICHMENT OPTIONS
// ============================================================================

export interface EnrichmentInput {
  websiteUrl?: string;
  googleBusinessUrl?: string;
  socialUrl?: string;
}

export interface EnrichmentResult {
  nuggets: EvidenceNugget[];
  duration: number;
  timedOut: boolean;
}

// ============================================================================
// ENRICHMENT ENGINE
// ============================================================================

export class SnapshotEnricher {
  private timeout: number = 5000; // 5 seconds max
  
  /**
   * Enrich with evidence from provided sources
   * Non-blocking: returns empty array on failure
   */
  async enrich(input: EnrichmentInput): Promise<EnrichmentResult> {
    const startTime = Date.now();
    const nuggets: EvidenceNugget[] = [];
    let timedOut = false;
    
    try {
      // Create promises for parallel extraction
      const promises: Promise<EvidenceNugget | null>[] = [];
      
      if (input.websiteUrl) {
        promises.push(
          this.extractWebsiteNugget(input.websiteUrl)
            .catch(err => {
              console.warn('[Enrichment] Website extraction failed:', err.message);
              return null;
            })
        );
      }
      
      if (input.googleBusinessUrl) {
        promises.push(
          this.extractGoogleBusinessNugget(input.googleBusinessUrl)
            .catch(err => {
              console.warn('[Enrichment] GBP extraction failed:', err.message);
              return null;
            })
        );
      }
      
      if (input.socialUrl) {
        promises.push(
          this.extractSocialNugget(input.socialUrl)
            .catch(err => {
              console.warn('[Enrichment] Social extraction failed:', err.message);
              return null;
            })
        );
      }
      
      // Race against timeout
      const results = await Promise.race([
        Promise.allSettled(promises),
        this.createTimeout()
      ]);
      
      if (results === 'timeout') {
        timedOut = true;
        console.warn('[Enrichment] Timed out after 5s');
      } else {
        // Collect successful nuggets
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            nuggets.push(result.value);
          }
        });
      }
      
    } catch (error) {
      console.error('[Enrichment] Unexpected error:', error);
    }
    
    const duration = Date.now() - startTime;
    
    return {
      nuggets,
      duration,
      timedOut
    };
  }
  
  /**
   * Extract evidence from website homepage
   */
  private async extractWebsiteNugget(url: string): Promise<EvidenceNugget | null> {
    try {
      // Use existing web scraper if available
      const { scrapeWebsite } = await import('../data-collectors/website-scraper');
      
      const scraped = await scrapeWebsite(url);
      
      // Extract a meaningful snippet from business data
      const name = scraped.name || '';
      const description = scraped.description || '';
      const services = scraped.services.join(', ');
      
      // Build snippet from available data
      let snippet = name;
      if (description && description.length > 10) {
        snippet = `${name} - ${description}`;
      } else if (services) {
        snippet = `${name} - ${services}`;
      }
      
      // Look for service indicators
      const serviceText = (description + ' ' + services).toLowerCase();
      const serviceKeywords = ['service', 'offer', 'provide', 'specialize', 'expert'];
      const hasServiceMention = serviceKeywords.some(kw => serviceText.includes(kw));
      
      // Truncate to 150 chars
      if (snippet.length > 150) {
        snippet = snippet.substring(0, 147) + '...';
      }
      
      return {
        source: 'website',
        snippet,
        relevance: hasServiceMention ? 'high' : 'medium'
      };
      
    } catch (error) {
      console.warn('[Enrichment] Website scraping error:', error);
      return null;
    }
  }
  
  /**
   * Extract evidence from Google Business Profile
   */
  private async extractGoogleBusinessNugget(url: string): Promise<EvidenceNugget | null> {
    try {
      // Simple approach: fetch the page and extract meta description
      // In production, you might use Google My Business API or web scraping
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(3000)
      });
      
      if (!response.ok) {
        return null;
      }
      
      const html = await response.text();
      
      // Extract business name and description from meta tags or structured data
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
      const snippet = descMatch ? descMatch[1] : 'Google Business Profile present';
      
      return {
        source: 'google_business',
        snippet: snippet.substring(0, 150),
        relevance: 'medium'
      };
      
    } catch (error) {
      // Fallback: at least acknowledge GBP presence
      return {
        source: 'google_business',
        snippet: 'Business has Google Business Profile',
        relevance: 'low'
      };
    }
  }
  
  /**
   * Extract evidence from social media profile
   */
  private async extractSocialNugget(url: string): Promise<EvidenceNugget | null> {
    try {
      // Determine platform from URL
      const platform = this.detectPlatform(url);
      
      if (!platform) {
        return null;
      }
      
      // For social media, we can't easily scrape due to auth/dynamic content
      // In production, you'd use social media APIs
      // For now, just acknowledge presence
      
      return {
        source: 'social',
        snippet: `Active on ${platform}`,
        relevance: 'low'
      };
      
    } catch (error) {
      console.warn('[Enrichment] Social extraction error:', error);
      return null;
    }
  }
  
  /**
   * Detect social platform from URL
   */
  private detectPlatform(url: string): string | null {
    const lower = url.toLowerCase();
    
    if (lower.includes('facebook.com')) return 'Facebook';
    if (lower.includes('instagram.com')) return 'Instagram';
    if (lower.includes('linkedin.com')) return 'LinkedIn';
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'Twitter/X';
    if (lower.includes('youtube.com')) return 'YouTube';
    if (lower.includes('tiktok.com')) return 'TikTok';
    
    return null;
  }
  
  /**
   * Create timeout promise
   */
  private createTimeout(): Promise<'timeout'> {
    return new Promise(resolve => {
      setTimeout(() => resolve('timeout'), this.timeout);
    });
  }
}

// ============================================================================
// FACTORY & EXPORT
// ============================================================================

let enricherInstance: SnapshotEnricher | null = null;

export function getEnricher(): SnapshotEnricher {
  if (!enricherInstance) {
    enricherInstance = new SnapshotEnricher();
  }
  return enricherInstance;
}

/**
 * Example: Using Enhanced Data Collection with Business Context
 * 
 * This example demonstrates how to leverage the new business context
 * and Meta Ads intelligence in your components.
 */

import { getStoredBusinessContext, useBusinessContext } from '@/lib/hooks/useBusinessContext';
import { useEffect, useState } from 'react';

export function EnhancedAnalysisExample() {
  const { context, hasContext } = useBusinessContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runEnhancedAnalysis = async (websiteUrl: string) => {
    setIsAnalyzing(true);

    try {
      // Option 1: Use stored business context
      const response = await fetch('/api/data-collection/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: websiteUrl,
          businessContext: context, // Uses stored context
        }),
      });

      const { data } = await response.json();

      // Now you have access to:
      console.log('Website data:', data.business);
      console.log('Competitors:', data.competitors);
      console.log('Meta Ads intelligence:', data.metaAds);
      console.log('Business context:', data.businessContext);

      // Use Meta Ads insights
      if (data.metaAds) {
        console.log('Competitor ad strategies:', data.metaAds.competitors);
        console.log('Industry insights:', data.metaAds.industryInsights);
        console.log('Opportunities:', data.metaAds.opportunities);
      }

      setResults(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCompetitorAdInsights = async () => {
    if (!context?.competitors || context.competitors.length === 0) {
      alert('Please add competitors in Business Context first');
      return;
    }

    try {
      const response = await fetch('/api/meta-ads/competitive-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitors: context.competitors,
          industry: context.industry,
        }),
      });

      const { data } = await response.json();

      // Display competitor advertising insights
      data.competitors.forEach((competitor: any) => {
        console.log(`${competitor.pageName}:`);
        console.log(`- Active ads: ${competitor.totalActiveAds}`);
        console.log(`- Top messages:`, competitor.topMessages);
        console.log(`- Top CTAs:`, competitor.topCTAs);
        console.log(`- Platforms:`, competitor.platforms);
      });

      // Show opportunities
      console.log('Marketing opportunities:', data.opportunities);
    } catch (error) {
      console.error('Meta Ads analysis failed:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Enhanced Analysis Example</h2>

      {/* Show business context status */}
      {hasContext && context ? (
        <div className="mb-4 p-4 bg-emerald-500/20 border border-emerald-500 rounded">
          <p className="text-emerald-300">
            ✓ Business context loaded: {context.industry || 'No industry set'}
          </p>
          <p className="text-sm text-emerald-300/70">
            {context.competitors?.length || 0} competitors tracked
          </p>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500 rounded">
          <p className="text-yellow-300">
            ⚠️ No business context found. Visit /business-context to set it up.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4">
        <button
          onClick={() => runEnhancedAnalysis('https://example.com')}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isAnalyzing ? 'Analyzing...' : 'Run Enhanced Analysis'}
        </button>

        <button
          onClick={getCompetitorAdInsights}
          disabled={!hasContext}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Get Competitor Ad Insights
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-6 p-4 bg-slate-800 rounded">
          <h3 className="font-bold mb-2">Analysis Results:</h3>
          
          {/* Display Meta Ads insights */}
          {results.metaAds && (
            <div className="mb-4">
              <h4 className="font-semibold text-emerald-400">
                Competitive Ad Intelligence
              </h4>
              <p className="text-sm">
                Analyzed {results.metaAds.industryInsights.totalAdsAnalyzed} ads
                from {results.metaAds.competitors.length} competitors
              </p>

              <div className="mt-2">
                <p className="font-medium">Opportunities:</p>
                <ul className="list-disc pl-5 text-sm">
                  {results.metaAds.opportunities.map((opp: string, i: number) => (
                    <li key={i}>{opp}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-2">
                <p className="font-medium">Popular CTAs in your industry:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {results.metaAds.industryInsights.popularCTAs
                    .slice(0, 5)
                    .map((cta: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                      >
                        {cta}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Display business context */}
          {results.businessContext && (
            <div>
              <h4 className="font-semibold text-blue-400">Business Context</h4>
              <p className="text-sm">
                Industry: {results.businessContext.industry}
              </p>
              <p className="text-sm">
                Target: {results.businessContext.targetAudience}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Example: Auto-fill forms with business context
 */
export function AutoFilledFormExample() {
  const { context } = useBusinessContext();
  const [formData, setFormData] = useState({
    industry: '',
    targetAudience: '',
    goals: [] as string[],
  });

  // Auto-fill when business context loads
  useEffect(() => {
    if (context) {
      setFormData({
        industry: context.industry || '',
        targetAudience: context.targetAudience || '',
        goals: context.marketingGoals || [],
      });
    }
  }, [context]);

  return (
    <form className="space-y-4">
      <input
        type="text"
        value={formData.industry}
        placeholder="Industry"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        value={formData.targetAudience}
        placeholder="Target Audience"
        className="w-full p-2 border rounded"
      />
      {/* Form fields are auto-populated from business context */}
    </form>
  );
}

/**
 * Example: Using business context in AI prompts
 */
export async function generatePersonalizedContent(topic: string) {
  const context = getStoredBusinessContext();

  if (!context) {
    throw new Error('Business context required. Please set up at /business-context');
  }

  // Use business context to personalize AI prompts
  const prompt = `Create content about ${topic} for a ${context.subNiche || context.industry} business.

Target Audience: ${context.targetAudience}
Primary Services: ${context.primaryServices?.join(', ')}
Marketing Goals: ${context.marketingGoals?.join(', ')}
Current Challenges: ${context.currentChallenges?.join(', ')}

Make the content highly specific to this business's unique position in the market.`;

  // Send to AI endpoint
  const response = await fetch('/api/generate-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, context }),
  });

  return response.json();
}

/**
 * Example: Competitive positioning with Meta Ads insights
 */
export async function getCompetitivePositioning(businessUrl: string) {
  const context = getStoredBusinessContext();

  // Collect all data
  const dataResponse = await fetch('/api/data-collection/enhanced', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: businessUrl,
      businessContext: context,
    }),
  });

  const { data } = await dataResponse.json();

  // Analyze competitive position
  const positioning = {
    // Your services vs competitors
    uniqueServices: data.business.services.filter(
      (service: string) =>
        !data.competitors.some((c: any) => c.services.includes(service))
    ),

    // Gaps in competitor advertising
    advertisingOpportunities: data.metaAds?.opportunities || [],

    // Platforms competitors aren't using
    underutilizedPlatforms: ['Instagram', 'Facebook', 'TikTok'].filter(
      (platform) =>
        !data.metaAds?.industryInsights.commonPlatforms.includes(platform)
    ),

    // Messages competitors aren't using
    messagingGaps: findMessagingGaps(
      context?.primaryServices || [],
      data.metaAds?.industryInsights.messagingThemes || []
    ),
  };

  return positioning;
}

function findMessagingGaps(yourServices: string[], competitorMessages: string[]) {
  // Simple gap analysis - find services not mentioned in competitor ads
  return yourServices.filter(
    (service) =>
      !competitorMessages.some((msg) =>
        msg.toLowerCase().includes(service.toLowerCase())
      )
  );
}

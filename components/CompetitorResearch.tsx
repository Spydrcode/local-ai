'use client';

import { AlertCircle, DollarSign, Loader2, Plus, Search, Target, TrendingUp, X } from 'lucide-react';
import React, { useState } from 'react';

interface CompetitorData {
  name: string;
  url: string;
  offerings: string[];
  pricing: string[];
  differentiators: string[];
  strengths: string[];
  weaknesses: string[];
}

interface CompetitiveGaps {
  gaps: string[];
  opportunities: string[];
  recommendations: string[];
}

interface CompetitorResearchProps {
  demoId: string;
}

const CompetitorResearch: React.FC<CompetitorResearchProps> = ({ demoId }) => {
  const [competitorUrls, setCompetitorUrls] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    competitors: CompetitorData[];
    competitiveGaps: CompetitiveGaps;
  } | null>(null);

  const addUrlField = () => {
    if (competitorUrls.length < 5) {
      setCompetitorUrls([...competitorUrls, '']);
    }
  };

  const removeUrlField = (index: number) => {
    setCompetitorUrls(competitorUrls.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, value: string) => {
    const updated = [...competitorUrls];
    updated[index] = value;
    setCompetitorUrls(updated);
  };

  const handleAnalyze = async () => {
    const validUrls = competitorUrls.filter(url => url.trim() !== '');
    
    if (validUrls.length === 0) {
      setError('Please enter at least one competitor URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/competitor-research/${demoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitorUrls: validUrls })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze competitors');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center mb-2">
          <Search className="h-6 w-6 mr-2" />
          <h2 className="text-2xl font-bold">Automated Competitor Research</h2>
        </div>
        <p className="text-white/90">
          Fortune 500-level competitive intelligence: scrape competitor websites and analyze positioning
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Competitor Websites</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add up to 5 competitor URLs for automated scraping and analysis
        </p>

        <div className="space-y-3">
          {competitorUrls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                placeholder="https://competitor-website.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {competitorUrls.length > 1 && (
                <button
                  onClick={() => removeUrlField(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          {competitorUrls.length < 5 && (
            <button
              onClick={addUrlField}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Another
            </button>
          )}
          
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ml-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Analyze Competitors
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <>
          {/* Competitive Gaps */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-indigo-600" />
              Competitive Gaps & Opportunities
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Market Gaps
                </h4>
                <ul className="space-y-2">
                  {results.competitiveGaps.gaps.map((gap, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Opportunities
                </h4>
                <ul className="space-y-2">
                  {results.competitiveGaps.opportunities.map((opp, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {results.competitiveGaps.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Competitor Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Competitor Analysis ({results.competitors.length})</h3>
            
            {results.competitors.map((competitor, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Competitor Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 text-lg">{competitor.name}</h4>
                  <a 
                    href={competitor.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {competitor.url}
                  </a>
                </div>

                {/* Competitor Details */}
                <div className="p-6 grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-gray-600" />
                        Offerings
                      </h5>
                      <ul className="space-y-1">
                        {competitor.offerings.map((offering, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            {offering}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-600" />
                        Pricing
                      </h5>
                      <ul className="space-y-1">
                        {competitor.pricing.map((price, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            {price}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-2 text-gray-600" />
                        Differentiators
                      </h5>
                      <ul className="space-y-1">
                        {competitor.differentiators.map((diff, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            {diff}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-emerald-700 mb-2">Strengths</h5>
                      <ul className="space-y-1">
                        {competitor.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-emerald-500 mr-2">✓</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-red-700 mb-2">Weaknesses</h5>
                      <ul className="space-y-1">
                        {competitor.weaknesses.map((weakness, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-red-500 mr-2">✗</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Call to Action */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold mb-2">Need Deeper Competitive Intelligence?</h3>
        <p className="text-white/90 mb-4">
          We Build Apps provides ongoing competitive monitoring and strategic positioning services
        </p>
        <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Learn More
        </button>
      </div>
    </div>
  );
};

export default CompetitorResearch;

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl) {
      setError('Please enter a website URL');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Only do quick site scraping to get basic info
      const response = await fetch('/api/quick-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      
      // Navigate directly to dashboard with minimal data
      router.push(`/analysis/${data.demoId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load website. Please check the URL and try again.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950/20">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300 mb-3">
              We Build Apps
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <h1 className="text-4xl font-bold text-white">Local AI</h1>
            </div>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Instant AI-powered business intelligence dashboard - Just paste a URL
          </p>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-3">
            Get immediate access to your dashboard. All analyses run on-demand when you need them.
          </p>
        </div>

        {/* Main Input Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-4 bg-slate-800 border border-slate-600 rounded-lg text-white text-lg placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                  required
                />
                <p className="text-xs text-slate-400 mt-2">
                  💡 Tip: Dashboard loads instantly - all analyses are on-demand
                </p>
              </div>

              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Loading Dashboard...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Open Dashboard
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Features Preview */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900/30 rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-3">⚡ Instant Access</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Dashboard loads in &lt;3 seconds</li>
                <li>• No waiting for full analysis</li>
                <li>• Run only what you need</li>
                <li>• Cost-efficient on-demand AI</li>
              </ul>
            </div>
            
            <div className="bg-slate-900/30 rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-3">📊 Strategic Intelligence</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Porter's Five Forces analysis</li>
                <li>• Competitor intelligence</li>
                <li>• Brand & conversion insights</li>
                <li>• ROI improvement opportunities</li>
              </ul>
            </div>
            
            <div className="bg-slate-900/30 rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-3">🚀 Marketing Assets</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Social media content calendar</li>
                <li>• Platform-specific posts</li>
                <li>• Website grade & redesign</li>
                <li>• AI-powered recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

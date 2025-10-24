'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
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
      const response = await fetch('/api/analyze-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: websiteUrl, 
          demoName: businessName || undefined 
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      
      // Generate full demo
      const demoResponse = await fetch('/api/generate-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: businessName || websiteUrl,
          siteText: data.summary,
          metadata: {
            url: websiteUrl,
            keyItems: data.keyItems,
            embeddingsId: data.embeddingsId,
          },
        }),
      });

      if (!demoResponse.ok) {
        throw new Error('Demo generation failed');
      }

      const demoData = await demoResponse.json();
      router.push(`/analysis/${demoData.demoId}`);
    } catch (err) {
      setError('Analysis failed. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20">
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
            Get comprehensive AI-powered insights about any business website in minutes
          </p>
        </div>

        {/* Main Input Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Website URL *
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Business Name (Optional)
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Business Name"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                />
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
                    Analyzing Website...
                  </>
                ) : (
                  'Generate Business Intelligence Report'
                )}
              </button>
            </form>
          </div>

          {/* Features Preview */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/30 rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-3">📊 Comprehensive Analysis</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Competitor landscape analysis</li>
                <li>• Brand voice & messaging audit</li>
                <li>• Conversion path optimization</li>
                <li>• ROI projections & opportunities</li>
              </ul>
            </div>
            
            <div className="bg-slate-900/30 rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-3">🚀 Marketing Assets</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Social media content calendar</li>
                <li>• Blog post recommendations</li>
                <li>• Website redesign mockups</li>
                <li>• Branded content suggestions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

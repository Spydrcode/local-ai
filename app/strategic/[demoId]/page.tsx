/**
 * Strategic Dashboard - Professional Business Intelligence Tool
 * 
 * Combines Porter's frameworks, competitive intelligence, and financial analysis
 * into a comprehensive strategic planning dashboard
 */

'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface StrategicDashboardData {
  demoId: string;
  businessName: string;
  websiteUrl: string;
  porterAnalysis?: {
    fiveForces: string;
    valueChain: string;
    positioning: string;
  };
  competitiveIntel?: {
    intelligence: string;
    competitorCount: number;
  };
  profitability?: {
    financialHealth: any;
    opportunities: any[];
  };
}

export default function StrategicDashboard() {
  const params = useParams();
  const demoId = (params?.demoId as string) || '';
  const [data, setData] = useState<StrategicDashboardData | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (demoId) {
      fetchBasicData();
    }
  }, [demoId]);

  const fetchBasicData = async () => {
    try {
      const response = await fetch(`/api/comprehensive-analysis/${demoId}`);
      if (response.ok) {
        const result = await response.json();
        setData({
          demoId,
          businessName: result.businessName,
          websiteUrl: result.websiteUrl,
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const runPorterAnalysis = async (type: string) => {
    setLoading({ ...loading, [type]: true });
    try {
      const response = await fetch('/api/porter-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoId, analysisType: type }),
      });
      const result = await response.json();
      setData(prev => prev ? {
        ...prev,
        porterAnalysis: {
          fiveForces: type === 'forces' || type === 'all' ? result.fiveForces : prev.porterAnalysis?.fiveForces,
          valueChain: type === 'valuechain' || type === 'all' ? result.valueChain : prev.porterAnalysis?.valueChain,
          positioning: type === 'positioning' || type === 'all' ? result.positioning : prev.porterAnalysis?.positioning,
        },
      } : prev);
    } catch (error) {
      console.error(`Failed to run ${type} analysis:`, error);
    } finally {
      setLoading({ ...loading, [type]: false });
    }
  };

  const runCompetitiveIntel = async () => {
    setLoading({ ...loading, competitive: true });
    try {
      const response = await fetch('/api/competitive-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          businessContext: `Business: ${data?.businessName}\nWebsite: ${data?.websiteUrl}`,
          competitorUrls: [] // Can add competitor URLs
        }),
      });
      const result = await response.json();
      setData(prev => ({
        ...prev!,
        competitiveIntel: {
          intelligence: result.intelligence,
          competitorCount: result.competitorDataGathered || 0,
        },
      }));
    } catch (error) {
      console.error('Failed to run competitive intelligence:', error);
    } finally {
      setLoading({ ...loading, competitive: false });
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading strategic dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 py-6">
        <div className="container mx-auto px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200 mb-1">We Build Apps</p>
          <h1 className="text-3xl font-bold mb-2">Local AI - Strategic Intelligence Dashboard</h1>
          <p className="text-emerald-100">{data.businessName}</p>
          <p className="text-sm text-emerald-200">{data.websiteUrl}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'porter', label: '🎯 Porter Analysis' },
              { id: 'competitive', label: '🏢 Competitive Intel' },
              { id: 'profitability', label: '💰 Profitability' },
              { id: 'strategy', label: '🚀 Strategic Plan' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium ${
                  activeSection === tab.id
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-slate-900 rounded-xl p-6 border border-emerald-500/20">
                <h3 className="text-lg font-semibold mb-4">Quick Intelligence</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => runPorterAnalysis('all')}
                    disabled={loading.all}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {loading.all ? 'Analyzing...' : 'Run Full Porter Analysis'}
                  </button>
                  <button
                    onClick={runCompetitiveIntel}
                    disabled={loading.competitive}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {loading.competitive ? 'Gathering...' : 'Competitive Intelligence'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Strategic Frameworks</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>✓ Porter's Five Forces Analysis</li>
                  <li>✓ Value Chain Analysis</li>
                  <li>✓ Generic Strategies Positioning</li>
                  <li>✓ Competitive Intelligence</li>
                  <li>✓ Profitability Optimization</li>
                  <li>✓ Pricing Strategy</li>
                </ul>
              </div>

              <div className="bg-slate-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Data Sources</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>🌐 Website Analysis (Pinecone)</li>
                  <li>🤖 GPT-4 Strategic Analysis</li>
                  <li>🔍 Competitor Scraping</li>
                  <li>📊 Financial Modeling</li>
                  <li>💡 AI-Powered Recommendations</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">About This Tool</h3>
              <div className="prose prose-invert max-w-none text-slate-300">
                <p>
                  This professional business intelligence platform combines proven strategic frameworks
                  from Michael Porter with cutting-edge AI to provide small businesses with Fortune 500-level
                  strategic analysis.
                </p>
                <h4 className="text-white mt-4 mb-2">How It Works:</h4>
                <ul className="space-y-2">
                  <li>
                    <strong className="text-emerald-400">Pinecone Vector Database:</strong> Stores your business 
                    and competitor data as semantic vectors, enabling intelligent similarity search and context retrieval.
                  </li>
                  <li>
                    <strong className="text-emerald-400">GPT-4 Analysis:</strong> Applies Porter's strategic frameworks 
                    to your specific business, generating actionable insights tailored to your market position.
                  </li>
                  <li>
                    <strong className="text-emerald-400">Competitive Intelligence:</strong> Scrapes and analyzes 
                    competitor websites to identify market gaps and differentiation opportunities.
                  </li>
                  <li>
                    <strong className="text-emerald-400">MCP Server:</strong> Exposes all analysis tools via Model 
                    Context Protocol, allowing integration with Copilot, Claude, and custom workflows.
                  </li>
                  <li>
                    <strong className="text-emerald-400">Financial Modeling:</strong> Projects profitability scenarios 
                    and identifies high-ROI improvements using AI-powered analysis.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'porter' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <button
                onClick={() => runPorterAnalysis('forces')}
                className="bg-slate-900 rounded-xl p-6 hover:bg-slate-800 transition-colors text-left"
              >
                <h3 className="text-xl font-semibold mb-2">Five Forces Analysis</h3>
                <p className="text-slate-400 text-sm">
                  Analyze industry structure and competitive intensity
                </p>
                {loading.forces && <p className="mt-2 text-emerald-400">Analyzing...</p>}
              </button>

              <button
                onClick={() => runPorterAnalysis('valuechain')}
                className="bg-slate-900 rounded-xl p-6 hover:bg-slate-800 transition-colors text-left"
              >
                <h3 className="text-xl font-semibold mb-2">Value Chain Analysis</h3>
                <p className="text-slate-400 text-sm">
                  Identify competitive advantages in operations
                </p>
                {loading.valuechain && <p className="mt-2 text-emerald-400">Analyzing...</p>}
              </button>

              <button
                onClick={() => runPorterAnalysis('positioning')}
                className="bg-slate-900 rounded-xl p-6 hover:bg-slate-800 transition-colors text-left"
              >
                <h3 className="text-xl font-semibold mb-2">Strategic Positioning</h3>
                <p className="text-slate-400 text-sm">
                  Determine optimal competitive strategy
                </p>
                {loading.positioning && <p className="mt-2 text-emerald-400">Analyzing...</p>}
              </button>
            </div>

            {data.porterAnalysis?.fiveForces && (
              <div className="bg-slate-900 rounded-xl p-8 border border-slate-800">
                <h3 className="text-2xl font-bold mb-6 text-emerald-400">Five Forces Analysis Results</h3>
                <div className="prose prose-invert prose-lg max-w-none">
                  <style jsx global>{`
                    .prose h3 {
                      font-size: 1.5rem;
                      font-weight: 700;
                      margin-top: 2.5rem;
                      margin-bottom: 1rem;
                      padding-bottom: 0.75rem;
                      border-bottom: 2px solid rgb(16 185 129 / 0.3);
                      color: rgb(110 231 183);
                    }
                    .prose h4 {
                      font-size: 1.25rem;
                      font-weight: 600;
                      margin-top: 1.5rem;
                      margin-bottom: 0.75rem;
                      color: rgb(52 211 153);
                    }
                    .prose ul {
                      margin-top: 1rem;
                      margin-bottom: 1.5rem;
                      padding-left: 1.5rem;
                    }
                    .prose li {
                      margin-top: 0.5rem;
                      margin-bottom: 0.5rem;
                      line-height: 1.7;
                      color: rgb(203 213 225);
                    }
                    .prose strong {
                      font-weight: 600;
                      color: rgb(248 250 252);
                    }
                    .prose p {
                      margin-top: 1rem;
                      margin-bottom: 1rem;
                      line-height: 1.7;
                      color: rgb(203 213 225);
                    }
                    .prose hr {
                      margin-top: 3rem;
                      margin-bottom: 3rem;
                      border-color: rgb(51 65 85);
                    }
                    .prose ol {
                      margin-top: 1rem;
                      margin-bottom: 1.5rem;
                      padding-left: 1.5rem;
                    }
                    .prose blockquote {
                      border-left: 4px solid rgb(16 185 129);
                      padding-left: 1rem;
                      margin: 1.5rem 0;
                      font-style: italic;
                      color: rgb(226 232 240);
                    }
                  `}</style>
                  <div className="formatted-analysis">
                    {data.porterAnalysis.fiveForces.split('\n').map((line, idx) => {
                      // Convert markdown-style headers
                      if (line.startsWith('### ')) {
                        return <h3 key={idx}>{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('#### ')) {
                        return <h4 key={idx}>{line.replace('#### ', '')}</h4>;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={idx}><strong>{line.replace(/\*\*/g, '')}</strong></p>;
                      }
                      if (line.startsWith('- ')) {
                        return <li key={idx}>{line.replace('- ', '')}</li>;
                      }
                      if (line.trim() === '---') {
                        return <hr key={idx} />;
                      }
                      if (line.trim()) {
                        return <p key={idx}>{line}</p>;
                      }
                      return <div key={idx} className="h-2" />;
                    })}
                  </div>
                </div>
              </div>
            )}

            {data.porterAnalysis?.valueChain && (
              <div className="bg-slate-900 rounded-xl p-8 border border-slate-800">
                <h3 className="text-2xl font-bold mb-6 text-blue-400">Value Chain Analysis Results</h3>
                <div className="prose prose-invert prose-lg max-w-none">
                  <div className="formatted-analysis">
                    {data.porterAnalysis.valueChain.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return <h3 key={idx} className="text-blue-300 border-blue-500/30">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('#### ')) {
                        return <h4 key={idx} className="text-blue-400">{line.replace('#### ', '')}</h4>;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={idx}><strong>{line.replace(/\*\*/g, '')}</strong></p>;
                      }
                      if (line.startsWith('- ')) {
                        return <li key={idx}>{line.replace('- ', '')}</li>;
                      }
                      if (line.match(/^\d+\.\s/)) {
                        return <li key={idx} className="list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
                      }
                      if (line.trim() === '---') {
                        return <hr key={idx} />;
                      }
                      if (line.trim()) {
                        return <p key={idx}>{line}</p>;
                      }
                      return <div key={idx} className="h-2" />;
                    })}
                  </div>
                </div>
              </div>
            )}

            {data.porterAnalysis?.positioning && (
              <div className="bg-slate-900 rounded-xl p-8 border border-slate-800">
                <h3 className="text-2xl font-bold mb-6 text-purple-400">Strategic Positioning Results</h3>
                <div className="prose prose-invert prose-lg max-w-none">
                  <div className="formatted-analysis">
                    {data.porterAnalysis.positioning.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return <h3 key={idx} className="text-purple-300 border-purple-500/30">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('#### ')) {
                        return <h4 key={idx} className="text-purple-400">{line.replace('#### ', '')}</h4>;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={idx}><strong>{line.replace(/\*\*/g, '')}</strong></p>;
                      }
                      if (line.startsWith('- ')) {
                        return <li key={idx}>{line.replace('- ', '')}</li>;
                      }
                      if (line.match(/^\d+\.\s/)) {
                        return <li key={idx} className="list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
                      }
                      if (line.trim() === '---') {
                        return <hr key={idx} />;
                      }
                      if (line.trim()) {
                        return <p key={idx}>{line}</p>;
                      }
                      return <div key={idx} className="h-2" />;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'competitive' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-8 border border-slate-800">
              <h3 className="text-2xl font-bold mb-4 text-amber-400">Competitive Intelligence</h3>
              {!data.competitiveIntel ? (
                <div>
                  <p className="text-slate-300 mb-6 text-lg">
                    Run competitive intelligence analysis to gather insights about your competitors
                    and identify market opportunities.
                  </p>
                  <button
                    onClick={runCompetitiveIntel}
                    disabled={loading.competitive}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-3 px-8 rounded-lg transition-colors font-semibold"
                  >
                    {loading.competitive ? 'Gathering Intelligence...' : 'Run Analysis'}
                  </button>
                </div>
              ) : (
                <div className="prose prose-invert prose-lg max-w-none">
                  <div className="formatted-analysis">
                    {data.competitiveIntel.intelligence.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return <h3 key={idx} className="text-amber-300 border-amber-500/30">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('#### ')) {
                        return <h4 key={idx} className="text-amber-400">{line.replace('#### ', '')}</h4>;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={idx}><strong>{line.replace(/\*\*/g, '')}</strong></p>;
                      }
                      if (line.startsWith('- ')) {
                        return <li key={idx}>{line.replace('- ', '')}</li>;
                      }
                      if (line.match(/^\d+\.\s/)) {
                        return <li key={idx} className="list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
                      }
                      if (line.trim() === '---') {
                        return <hr key={idx} />;
                      }
                      if (line.trim()) {
                        return <p key={idx}>{line}</p>;
                      }
                      return <div key={idx} className="h-2" />;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

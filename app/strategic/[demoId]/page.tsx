/**
 * Strategic Dashboard - Professional Business Intelligence Tool
 * 
 * Combines Porter's frameworks, competitive intelligence, and financial analysis
 * into a comprehensive strategic planning dashboard
 */

'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Collapsible Analysis Section Component
function CollapsibleSection({ 
  title, 
  content, 
  color = 'emerald',
  defaultOpen = false 
}: { 
  title: string; 
  content: string; 
  color?: 'emerald' | 'blue' | 'purple' | 'amber';
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const colorClasses = {
    emerald: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      hover: 'hover:bg-emerald-500/20',
    },
    blue: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      hover: 'hover:bg-blue-500/20',
    },
    purple: {
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      hover: 'hover:bg-purple-500/20',
    },
    amber: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      hover: 'hover:bg-amber-500/20',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`border ${colors.border} rounded-lg overflow-hidden mb-4`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-6 py-4 ${colors.bg} ${colors.hover} transition-colors flex items-center justify-between`}
      >
        <h4 className={`text-lg font-semibold ${colors.text}`}>{title}</h4>
        <svg 
          className={`w-5 h-5 ${colors.text} transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-slate-900/50">
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

// Five Forces Summary Component
function FiveForcesSummary({ analysis }: { analysis: string }) {
  // Parse the analysis into sections
  const sections = analysis.split(/(?=\d+\.\s+[A-Z\s]+\n)/g).filter(s => s.trim());
  const intro = sections[0] || '';
  const forces = sections.slice(1, 6);
  const overall = sections.slice(6).join('\n\n');

  return (
    <div id="five-forces-results" className="bg-slate-900 rounded-xl p-8 border border-slate-800">
      <h3 className="text-2xl font-bold mb-6 text-emerald-400">Five Forces Analysis Results</h3>
      
      {intro && <p className="text-slate-300 mb-6 leading-relaxed">{intro}</p>}
      
      <div className="space-y-3">
        {forces.map((force, idx) => {
          const titleMatch = force.match(/\d+\.\s+([A-Z\s]+(?:\([^)]+\))?)/);
          const title = titleMatch ? titleMatch[1].trim() : `Force ${idx + 1}`;
          return (
            <CollapsibleSection
              key={idx}
              title={title}
              content={force}
              color="emerald"
              defaultOpen={idx === 0}
            />
          );
        })}
      </div>

      {overall && (
        <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <h4 className="text-xl font-bold text-emerald-400 mb-4">Overall Analysis Summary</h4>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {overall}
          </div>
        </div>
      )}
    </div>
  );
}

// Value Chain Summary Component
function ValueChainSummary({ analysis }: { analysis: string }) {
  // Parse sections
  const primaryMatch = analysis.match(/PRIMARY ACTIVITIES:([\s\S]*?)(?=SUPPORT ACTIVITIES:|$)/);
  const supportMatch = analysis.match(/SUPPORT ACTIVITIES:([\s\S]*?)(?=Final Deliverables:|$)/);
  const finalsMatch = analysis.match(/Final Deliverables:([\s\S]*$)/);

  const primaryActivities = primaryMatch ? primaryMatch[1].split(/(?=\*\*[A-Z\s]+\*\*)/).filter(s => s.trim()) : [];
  const supportActivities = supportMatch ? supportMatch[1].split(/(?=\*\*[A-Z\s]+\*\*)/).filter(s => s.trim()) : [];
  const finals = finalsMatch ? finalsMatch[1] : '';

  return (
    <div id="value-chain-results" className="bg-slate-900 rounded-xl p-8 border border-slate-800">
      <h3 className="text-2xl font-bold mb-6 text-blue-400">Value Chain Analysis Results</h3>
      
      <div className="mb-8">
        <h4 className="text-xl font-semibold text-blue-300 mb-4">Primary Activities</h4>
        <div className="space-y-3">
          {primaryActivities.map((activity, idx) => {
            const titleMatch = activity.match(/\*\*([A-Z\s&]+)\*\*/);
            const title = titleMatch ? titleMatch[1].trim() : `Activity ${idx + 1}`;
            return (
              <CollapsibleSection
                key={idx}
                title={title}
                content={activity}
                color="blue"
                defaultOpen={idx === 0}
              />
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-xl font-semibold text-blue-300 mb-4">Support Activities</h4>
        <div className="space-y-3">
          {supportActivities.map((activity, idx) => {
            const titleMatch = activity.match(/\*\*([A-Z\s]+)\*\*/);
            const title = titleMatch ? titleMatch[1].trim() : `Support ${idx + 1}`;
            return (
              <CollapsibleSection
                key={idx}
                title={title}
                content={activity}
                color="blue"
              />
            );
          })}
        </div>
      </div>

      {finals && (
        <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="text-xl font-bold text-blue-400 mb-4">Key Recommendations</h4>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {finals}
          </div>
        </div>
      )}
    </div>
  );
}

// Strategic Positioning Summary Component
function StrategicPositioningSummary({ analysis }: { analysis: string }) {
  const sections = [
    { title: 'Current Strategy Diagnosis', match: /Current Strategy Diagnosis:([\s\S]*?)(?=Recommended Positioning|$)/ },
    { title: 'Recommended Positioning', match: /Recommended Positioning[\s\S]*?:([\s\S]*?)(?=Competitive Position Map|$)/ },
    { title: 'Competitive Position Map', match: /Competitive Position Map([\s\S]*?)(?=Action Plan|$)/ },
    { title: 'Action Plan', match: /Action Plan([\s\S]*?)(?=Risk Assessment|$)/ },
    { title: 'Risk Assessment', match: /Risk Assessment([\s\S]*$)/ },
  ];

  return (
    <div id="positioning-results" className="bg-slate-900 rounded-xl p-8 border border-slate-800">
      <h3 className="text-2xl font-bold mb-6 text-purple-400">Strategic Positioning Results</h3>
      
      <div className="space-y-3">
        {sections.map((section, idx) => {
          const match = analysis.match(section.match);
          const content = match ? match[1] || match[0] : '';
          if (!content.trim()) return null;
          
          return (
            <CollapsibleSection
              key={idx}
              title={section.title}
              content={content}
              color="purple"
              defaultOpen={idx === 0}
            />
          );
        })}
      </div>
    </div>
  );
}

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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
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
      alert(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
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
      alert(`Competitive intelligence failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      <div className="bg-linear-to-r from-emerald-600 to-blue-600 py-6">
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
            {/* Action Bar */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Porter's Framework Analysis</h3>
                  <p className="text-slate-400">Generate comprehensive strategic insights using Michael Porter's proven frameworks</p>
                </div>
                <button
                  onClick={() => runPorterAnalysis('all')}
                  disabled={loading.all}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                >
                  {loading.all ? 'Analyzing All...' : 'Run Full Analysis'}
                </button>
              </div>
            </div>

            {/* Analysis Cards Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Five Forces Card */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="bg-linear-to-r from-emerald-600 to-emerald-700 p-4">
                  <h3 className="text-lg font-semibold text-white">Five Forces Analysis</h3>
                </div>
                <div className="p-6">
                  {loading.forces || loading.all ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
                      <p className="text-emerald-400">Analyzing...</p>
                    </div>
                  ) : data.porterAnalysis?.fiveForces ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 mb-3">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">Analysis Complete</span>
                      </div>
                      <p className="text-slate-300 text-sm line-clamp-4">
                        {data.porterAnalysis.fiveForces.substring(0, 200)}...
                      </p>
                      <a href="#five-forces-results" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium inline-flex items-center gap-1">
                        View Full Analysis 
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4 text-sm">Analyze industry structure and competitive intensity</p>
                      <button
                        onClick={() => runPorterAnalysis('forces')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        Run Analysis
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Value Chain Card */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="bg-linear-to-r from-blue-600 to-blue-700 p-4">
                  <h3 className="text-lg font-semibold text-white">Value Chain Analysis</h3>
                </div>
                <div className="p-6">
                  {loading.valuechain || loading.all ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                      <p className="text-blue-400">Analyzing...</p>
                    </div>
                  ) : data.porterAnalysis?.valueChain ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-blue-400 mb-3">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">Analysis Complete</span>
                      </div>
                      <p className="text-slate-300 text-sm line-clamp-4">
                        {data.porterAnalysis.valueChain.substring(0, 200)}...
                      </p>
                      <a href="#value-chain-results" className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1">
                        View Full Analysis
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4 text-sm">Identify competitive advantages in operations</p>
                      <button
                        onClick={() => runPorterAnalysis('valuechain')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        Run Analysis
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Strategic Positioning Card */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="bg-linear-to-r from-purple-600 to-purple-700 p-4">
                  <h3 className="text-lg font-semibold text-white">Strategic Positioning</h3>
                </div>
                <div className="p-6">
                  {loading.positioning || loading.all ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                      <p className="text-purple-400">Analyzing...</p>
                    </div>
                  ) : data.porterAnalysis?.positioning ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-purple-400 mb-3">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">Analysis Complete</span>
                      </div>
                      <p className="text-slate-300 text-sm line-clamp-4">
                        {data.porterAnalysis.positioning.substring(0, 200)}...
                      </p>
                      <a href="#positioning-results" className="text-purple-400 hover:text-purple-300 text-sm font-medium inline-flex items-center gap-1">
                        View Full Analysis
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4 text-sm">Determine optimal competitive strategy</p>
                      <button
                        onClick={() => runPorterAnalysis('positioning')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        Run Analysis
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full Results Sections */}
            {data.porterAnalysis?.fiveForces && (
              <FiveForcesSummary analysis={data.porterAnalysis.fiveForces} />
            )}

            {data.porterAnalysis?.valueChain && (
              <ValueChainSummary analysis={data.porterAnalysis.valueChain} />
            )}

            {data.porterAnalysis?.positioning && (
              <StrategicPositioningSummary analysis={data.porterAnalysis.positioning} />
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

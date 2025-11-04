'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// All available tools and dashboards
const businessIntelligenceTools = [
  {
    id: 'business-dna-analysis',
    title: 'Business DNA Analysis',
    description: 'What makes your business unique in your market',
    icon: '🧬',
    color: 'emerald',
    tier: 'free',
    category: 'foundation'
  },
  {
    id: 'local-market-intelligence',
    title: 'Local Market Position',
    description: 'How you stack up against nearby competitors',
    icon: '📍',
    color: 'blue',
    tier: 'free',
    category: 'foundation'
  },
  {
    id: 'customer-sentiment-tracker',
    title: 'Customer Voice Dashboard',
    description: 'What customers say about you online (reviews, social)',
    icon: '💬',
    color: 'purple',
    tier: 'pro',
    category: 'foundation'
  },
  {
    id: 'economic-intelligence',
    title: 'Economic Reality Check',
    description: 'How economic trends affect your local market',
    icon: '📊',
    color: 'amber',
    tier: 'free',
    category: 'foundation'
  }
];

const strategicAdvantageTools = [
  {
    id: 'competitive-moat',
    title: 'Your Competitive Moat',
    description: 'Why customers choose you over competitors (Porter simplified)',
    icon: '🏰',
    color: 'purple',
    tier: 'pro',
    category: 'strategic'
  },
  {
    id: 'value-chain-optimizer',
    title: 'Business Process Optimizer',
    description: 'Where you make money vs where you lose it',
    icon: '⚙️',
    color: 'blue',
    tier: 'pro',
    category: 'strategic'
  },
  {
    id: 'swot-live-dashboard',
    title: 'Live SWOT Dashboard',
    description: 'Real-time strengths/weaknesses from customer feedback',
    icon: '📊',
    color: 'emerald',
    tier: 'pro',
    category: 'strategic'
  },
  {
    id: 'pricing-power-analysis',
    title: 'Pricing Power Analysis',
    description: 'How much more can you charge (and why)',
    icon: '💰',
    color: 'amber',
    tier: 'pro',
    category: 'strategic'
  },
  {
    id: 'local-expansion-roadmap',
    title: 'Local Growth Playbook',
    description: 'Next 3 moves to dominate your local market',
    icon: '🗺️',
    color: 'violet',
    tier: 'consultation',
    category: 'strategic'
  },
  {
    id: 'quick-wins-generator',
    title: 'This Week\'s Action Plan',
    description: 'High-impact moves you can execute immediately',
    icon: '⚡',
    color: 'red',
    tier: 'free',
    category: 'strategic'
  }
];

const marketingEngineTools = [
  {
    id: 'customer-magnet-posts',
    title: 'Customer Magnet Posts',
    description: 'Social content that brings in new customers',
    icon: '🧲',
    color: 'pink',
    tier: 'pro',
    category: 'content'
  },
  {
    id: 'local-seo-content',
    title: 'Local SEO Content Engine',
    description: 'Content that gets you found by nearby customers',
    icon: '📍',
    color: 'emerald',
    tier: 'pro',
    category: 'content'
  },
  {
    id: 'conversion-website',
    title: 'High-Converting Website',
    description: 'Website designs that turn visitors into customers',
    icon: '🎯',
    color: 'blue',
    tier: 'pro',
    category: 'content'
  },
  {
    id: 'email-nurture-sequences',
    title: 'Email Follow-Up Sequences',
    description: 'Automated emails that close more sales',
    icon: '📧',
    color: 'purple',
    tier: 'pro',
    category: 'content'
  },
  {
    id: 'review-generation-system',
    title: 'Review Generation System',
    description: 'Get more 5-star reviews automatically',
    icon: '⭐',
    color: 'amber',
    tier: 'pro',
    category: 'content'
  }
];

const growthAcceleratorTools = [
  {
    id: 'revenue-leaks-detector',
    title: 'Revenue Leaks Detector',
    description: 'Find where you\'re losing money right now',
    icon: '🔍',
    color: 'red',
    tier: 'pro',
    category: 'optimization'
  },
  {
    id: 'kpi-dashboard',
    title: 'Small Business KPI Dashboard',
    description: 'Track the metrics that actually matter',
    icon: '📊',
    color: 'blue',
    tier: 'pro',
    category: 'optimization'
  },
  {
    id: 'profit-optimizer',
    title: 'Profit Optimizer',
    description: 'Increase margins without raising prices',
    icon: '💎',
    color: 'emerald',
    tier: 'consultation',
    category: 'optimization'
  },
  {
    id: 'customer-lifetime-maximizer',
    title: 'Customer Lifetime Maximizer',
    description: 'Get more value from existing customers',
    icon: '🎯',
    color: 'purple',
    tier: 'consultation',
    category: 'optimization'
  },
  {
    id: 'automation-opportunities',
    title: 'Automation Opportunities',
    description: 'Save 10+ hours per week with smart automation',
    icon: '🤖',
    color: 'cyan',
    tier: 'pro',
    category: 'optimization'
  },
  {
    id: 'growth-accelerator-plan',
    title: '90-Day Growth Plan',
    description: 'Your step-by-step path to 25% more revenue',
    icon: '🚀',
    color: 'amber',
    tier: 'consultation',
    category: 'optimization'
  }
];

const specializedDashboards = [
  {
    id: 'porter-intelligence-stack',
    title: 'Porter Intelligence Stack',
    description: 'Complete strategic analysis with Strategic Frameworks: SWOT, Business Model Canvas, Go-to-Market + Porter\'s Five Forces',
    icon: '�',
    color: 'emerald',
    tier: 'pro',
    category: 'advanced'
  },
  {
    id: 'economic-intelligence',
    title: 'Economic Intelligence Center',
    description: 'Real-time market analysis and economic forecasting',
    icon: '📈',
    color: 'blue',
    tier: 'free',
    category: 'advanced'
  }
];

export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('hero');
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
      const response = await fetch('/api/quick-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl }),
      });

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        // Try to parse JSON error body, but fall back to text if server returned HTML (e.g., Next.js error page)
        if (contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Analysis failed');
        } else {
          const text = await response.text();
          // If it's an HTML page (Next.js error / 404), avoid showing the full HTML to the user.
          const isHtml = /^\s*<!doctype\s+html|^\s*<html/i.test(text) || text.trim().startsWith('<');
          if (isHtml) {
            // Log full HTML server-side in console, but surface a short, actionable message to the user
            console.error('Server returned HTML error page for /api/quick-analyze', text.slice(0, 500));
            throw new Error('Server returned an HTML error (404/500). Check the dev server logs for details.');
          }

          const trimmed = text.length > 500 ? text.slice(0, 500) + '... (truncated)' : text;
          throw new Error(trimmed || 'Analysis failed');
        }
      }

      // Successful response: prefer JSON, but defensively fall back to parsing text
      let data: any;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Invalid response from server');
        }
      }

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
      {/* Navigation */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-white">Local AI</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveSection('hero')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'hero' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Get Started
              </button>
              <button
                onClick={() => setActiveSection('tools')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'tools' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Tools
              </button>
              <button
                onClick={() => setActiveSection('dashboards')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'dashboards' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dashboards
              </button>
              <div className="text-xs text-emerald-300 font-medium tracking-wide">
                SMB STRATEGY HUB
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {activeSection === 'hero' && (
        <div className="relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight">
                  Strategic Intelligence
                  <span className="block text-emerald-400">For Small Business</span>
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  Get instant AI-powered strategic insights. Porter's Five Forces, SWOT analysis, and proven business frameworks 
                  simplified for small business owners.
                </p>
              </div>

              {/* Main CTA Form */}
              <div className="max-w-xl mx-auto">
                <form onSubmit={handleAnalyze} className="space-y-4">
                  <div className="relative">
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="Enter website URL (e.g., https://example.com)"
                      className="w-full px-6 py-4 bg-white/5 backdrop-blur border border-white/10 rounded-2xl text-white text-lg placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-emerald-500/25"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Start Strategic Analysis
                      </>
                    )}
                  </button>
                </form>
                
                <p className="text-sm text-slate-400 mt-4">
                  ⚡ Dashboard loads in under 3 seconds • 20+ AI-powered tools available on-demand
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16">
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">20+</div>
                  <div className="text-slate-300">Strategic Tools</div>
                </div>
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">3</div>
                  <div className="text-slate-300">Specialized Dashboards</div>
                </div>
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">70%</div>
                  <div className="text-slate-300">Cost Reduction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Tools Section */}
      {activeSection === 'tools' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Complete AI Toolkit</h2>
            <p className="text-slate-400 text-lg">20+ specialized tools organized by strategic focus</p>
            <div className="flex justify-center gap-4 mt-6">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-bold">FREE</span>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-bold">PRO</span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-bold">CONSULTATION</span>
            </div>
          </div>

          {/* Business Intelligence Tools */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
              <span>🧭</span> Business Intelligence
              <span className="text-sm font-normal text-slate-400">What makes you the go-to choice locally</span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {businessIntelligenceTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>

          {/* Strategic Advantage Tools */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-3">
              <span>🎯</span> Strategic Advantage
              <span className="text-sm font-normal text-slate-400">Proven strategic frameworks simplified for small business</span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {strategicAdvantageTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>

          {/* Marketing Engine Tools */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-pink-400 mb-6 flex items-center gap-3">
              <span>📱</span> Marketing Engine
              <span className="text-sm font-normal text-slate-400">Content that converts visitors to customers</span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketingEngineTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>

          {/* Growth Accelerator Tools */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-3">
              <span>�</span> Growth Accelerator
              <span className="text-sm font-normal text-slate-400">Track & improve what matters most</span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {growthAcceleratorTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>

          {/* CTA to Start */}
          <div className="text-center mt-16">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to unlock your business intelligence?</h3>
              <p className="text-slate-300 mb-6">Enter your website URL to access all these tools instantly</p>
              <button
                onClick={() => setActiveSection('hero')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200"
              >
                Start Your Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specialized Dashboards Section */}
      {activeSection === 'dashboards' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Specialized Dashboards</h2>
            <p className="text-slate-400 text-lg">Advanced analytical interfaces for deep strategic insights</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {specializedDashboards.map((dashboard) => (
              <DashboardCard key={dashboard.id} dashboard={dashboard} />
            ))}
          </div>

          {/* Feature Comparison */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Why Choose Our Dashboards?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Real-Time Analysis</h4>
                <p className="text-slate-400 text-sm">
                  Live data feeds from Google Business, social media, and economic indicators
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎓</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Strategic Intelligence</h4>
                <p className="text-slate-400 text-sm">
                  Porter's Five Forces, SWOT, Business Model Canvas translated for SMBs
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Action-Oriented</h4>
                <p className="text-slate-400 text-sm">
                  Every insight includes "Here's what to do this week" specific action steps
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <button
              onClick={() => setActiveSection('hero')}
              className="bg-linear-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg"
            >
              Access All Dashboards
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Tool Card Component
function ToolCard({ tool }: { tool: any }) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-emerald-500/20 text-emerald-400';
      case 'pro': return 'bg-amber-500/20 text-amber-400';
      case 'consultation': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="group bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 h-full hover:bg-white/10 transition-all duration-300 hover:border-white/20">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-${tool.color}-500/20 rounded-xl flex items-center justify-center`}>
          <span className="text-2xl">{tool.icon}</span>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-bold ${getTierColor(tool.tier)}`}>
          {tool.tier.toUpperCase()}
        </span>
      </div>
      
      <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
        {tool.title}
      </h4>
      <p className="text-slate-400 text-sm leading-relaxed">
        {tool.description}
      </p>
      
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className={`w-2 h-2 rounded-full bg-${tool.color}-400`}></div>
          <span className="capitalize">{tool.category}</span>
        </div>
      </div>
    </div>
  );
}

// Dashboard Card Component
function DashboardCard({ dashboard }: { dashboard: any }) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pro': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'consultation': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className={`group border-2 rounded-2xl p-8 h-full transition-all duration-300 hover:scale-105 ${getTierColor(dashboard.tier)}`}>
      <div className="text-center">
        <div className={`w-20 h-20 bg-${dashboard.color}-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
          <span className="text-4xl">{dashboard.icon}</span>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-xl font-bold text-white">{dashboard.title}</h3>
          <span className={`px-2 py-1 rounded text-xs font-bold ${getTierColor(dashboard.tier).split(' ')[1]} ${getTierColor(dashboard.tier).split(' ')[2]}`}>
            {dashboard.tier.toUpperCase()}
          </span>
        </div>
        
        <p className="text-slate-300 mb-6 leading-relaxed">
          {dashboard.description}
        </p>
        
        <div className="space-y-3">
          {dashboard.id === 'porter-intelligence-stack' && (
            <div className="text-left">
              <div className="text-sm font-semibold text-slate-300 mb-2">Strategic Frameworks:</div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Porter's Five Forces Analysis</li>
                <li>• SWOT Analysis (4-quadrant matrix)</li>
                <li>• Business Model Canvas (9-block)</li>
                <li>• Go-to-Market Strategy</li>
                <li>• Value Chain Analysis</li>
                <li>• Competitive Moat Builder</li>
                <li>• Strategic synthesis & action plans</li>
              </ul>
            </div>
          )}
          
          {dashboard.id === 'economic-intelligence' && (
            <div className="text-left">
              <div className="text-sm font-semibold text-slate-300 mb-2">Real-time Data:</div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Economic indicators & trends</li>
                <li>• Market forecasting (3-year)</li>
                <li>• Industry-specific scenarios</li>
                <li>• Local market conditions</li>
              </ul>
            </div>
          )}
        </div>
        
        <button className={`w-full mt-6 py-3 px-4 rounded-xl font-medium transition-all duration-200 bg-${dashboard.color}-500/20 text-${dashboard.color}-400 hover:bg-${dashboard.color}-500/30 border border-${dashboard.color}-500/30`}>
          Explore Dashboard
        </button>
      </div>
    </div>
  );
}

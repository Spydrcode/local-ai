"use client";
// Add missing AnalysisStatus type
type AnalysisStatus = {
  [key: string]: 'not-run' | 'running' | 'completed' | 'error';
};
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import WebsiteDesignGallery from '@/components/WebsiteDesignGallery';

interface AnalysisData {
  demoId: string;
  businessName: string;
  websiteUrl: string;
  siteSummary?: string;
  keyItems?: string[];
  aiInsights?: string[];
  socialPosts?: Array<{
    platform: string;
    content: string;
    emojis: string;
  }>;
  contentCalendar?: Array<{
    day: string;
    content: string;
    platform: string;
    hashtags: string[];
    date?: string;
    time?: string;
    postType?: string;
    engagement?: string;
  }>;
  competitorAnalysis?: {
    competitors: Array<{
      name: string;
      url: string;
      strengths: string[];
      weaknesses: string[];
    }>;
    opportunities: string[];
  };
  brandAnalysis?: {
    tone: string;
    voice: string;
    messaging: string[];
  };
  conversionAnalysis?: {
    currentPath: string[];
    recommendations: string[];
    projectedImprovement: string;
  };
  websiteGrade?: {
    score: number;
    improvements: string[];
    roiProjection: string;
  };
  mockupUrl?: string;
  implementationRoadmap?: any;
}

const analysisModules = [
  {
    id: 'site-analysis',
    title: 'Business DNA Analysis',
    description: 'What makes your business unique in your market',
    icon: '🧬',
    category: 'foundation',
    endpoint: (demoId: string) => `/api/analyze-site-data/${demoId}`,
    color: 'emerald',
    tier: 'free'
  },
  {
    id: 'local-market-intelligence',
    title: 'Local Market Position',
    description: 'How you stack up against nearby competitors',
    icon: '📍',
    category: 'foundation',
    endpoint: (demoId: string) => `/api/local-market-analysis/${demoId}`,
    color: 'blue'
  },
  {
    id: 'customer-sentiment-tracker',
    title: 'Customer Voice Dashboard',
    description: 'What customers say about you online (reviews, social)',
    icon: '💬',
    category: 'foundation',
    endpoint: (demoId: string) => `/api/customer-sentiment/${demoId}`,
    color: 'purple'
  },
  {
    id: 'economic-intelligence',
    title: 'Economic Reality Check',
    description: 'How economic trends affect your local market',
    icon: '�',
    category: 'foundation',
    endpoint: (demoId: string) => `/api/economic-intelligence/${demoId}`,
    color: 'amber'
  },
  // Strategic Advantage (SMB-Optimized Strategic Frameworks)
  {
    id: 'competitive-moat',
    title: 'Your Competitive Moat',
    description: 'Why customers choose you over competitors (Porter simplified)',
    icon: '�',
    category: 'strategic',
    endpoint: (demoId: string) => `/api/competitive-moat/${demoId}`,
    color: 'purple'
  },
  {
    id: 'value-chain-optimizer',
    title: 'Business Process Optimizer',
    description: 'Where you make money vs where you lose it',
    icon: '⚙️',
    category: 'strategic',
    endpoint: (demoId: string) => `/api/value-chain-optimizer/${demoId}`,
    color: 'blue'
  },
  {
    id: 'swot-live-dashboard',
    title: 'Live SWOT Dashboard',
    description: 'Real-time strengths/weaknesses from customer feedback',
    icon: '📊',
    category: 'strategic',
    endpoint: (demoId: string) => `/api/swot-live-dashboard/${demoId}`,
    color: 'emerald'
  },
  {
    id: 'pricing-power-analysis',
    title: 'Pricing Power Analysis',
    description: 'How much more can you charge (and why)',
    icon: '💰',
    category: 'strategic',
    endpoint: (demoId: string) => `/api/pricing-power/${demoId}`,
    color: 'amber'
  },
  {
    id: 'local-expansion-roadmap',
    title: 'Local Growth Playbook',
    description: 'Next 3 moves to dominate your local market',
    icon: '�️',
    category: 'strategic',
    endpoint: (demoId: string) => `/api/local-expansion/${demoId}`,
    color: 'violet'
  },
  {
    id: 'quick-wins-generator',
    title: 'This Week\'s Action Plan',
    description: 'High-impact moves you can execute immediately',
    icon: '⚡',
    category: 'strategic',
    endpoint: (demoId: string) => `/api/quick-wins/${demoId}`,
    color: 'red'
  },
  // Marketing Engine (Content that Converts)
  {
    id: 'customer-magnet-posts',
    title: 'Customer Magnet Posts',
    description: 'Social content that brings in new customers',
    icon: '🧲',
    category: 'content',
    endpoint: (demoId: string) => `/api/customer-magnet-posts/${demoId}`,
    color: 'pink'
  },
  {
    id: 'local-seo-content',
    title: 'Local SEO Content Engine',
    description: 'Content that gets you found by nearby customers',
    icon: '�',
    category: 'content',
    endpoint: (demoId: string) => `/api/local-seo-content/${demoId}`,
    color: 'emerald'
  },
  {
    id: 'conversion-website',
    title: 'High-Converting Website',
    description: 'Website designs that turn visitors into customers',
    icon: '�',
    category: 'content',
    endpoint: (demoId: string) => `/api/website/generate`,
    method: 'POST',
    body: (demoId: string) => ({ demoId }),
    color: 'blue'
  },
  {
    id: 'email-nurture-sequences',
    title: 'Email Follow-Up Sequences',
    description: 'Automated emails that close more sales',
    icon: '�',
    category: 'content',
    endpoint: (demoId: string) => `/api/email-sequences/${demoId}`,
    color: 'purple'
  },
  {
    id: 'review-generation-system',
    title: 'Review Generation System',
    description: 'Get more 5-star reviews automatically',
    icon: '⭐',
    category: 'content',
    endpoint: (demoId: string) => `/api/review-system/${demoId}`,
    color: 'amber'
  },
  // Growth Accelerator (Track & Improve)
  {
    id: 'revenue-leaks-detector',
    title: 'Revenue Leaks Detector',
    description: 'Find where you\'re losing money right now',
    icon: '�',
    category: 'optimization',
    endpoint: (demoId: string) => `/api/revenue-leaks/${demoId}`,
    color: 'red'
  },
  {
    id: 'kpi-dashboard',
    title: 'Small Business KPI Dashboard',
    description: 'Track the metrics that actually matter',
    icon: '📊',
    category: 'optimization',
    endpoint: (demoId: string) => `/api/kpi-dashboard/${demoId}`,
    color: 'blue'
  },
  {
    id: 'profit-optimizer',
    title: 'Profit Optimizer',
    description: 'Increase margins without raising prices',
    icon: '�',
    category: 'optimization',
    endpoint: (demoId: string) => `/api/profit-optimizer/${demoId}`,
    color: 'emerald'
  },
  {
    id: 'customer-lifetime-maximizer',
    title: 'Customer Lifetime Maximizer',
    description: 'Get more value from existing customers',
    icon: '🎯',
    category: 'optimization',
    endpoint: (demoId: string) => `/api/customer-lifetime/${demoId}`,
    color: 'purple'
  },
  {
    id: 'automation-opportunities',
    title: 'Automation Opportunities',
    description: 'Save 10+ hours per week with smart automation',
    icon: '🤖',
    category: 'optimization',
    endpoint: (demoId: string) => `/api/automation-opportunities/${demoId}`,
    color: 'cyan'
  },
  {
    id: 'growth-accelerator-plan',
    title: '90-Day Growth Plan',
    description: 'Your step-by-step path to 25% more revenue',
    icon: '�',
    category: 'optimization',
    endpoint: (demoId: string) => `/api/growth-plan/${demoId}`,
    color: 'amber'
  }
];

const categories = [
  { id: 'foundation', label: '🧭 Business Intelligence', description: 'What makes you the go-to choice locally' },
  { id: 'strategic', label: '🎯 Strategic Advantage', description: 'Proven strategic frameworks simplified for small business' },
  { id: 'content', label: '📱 Marketing Engine', description: 'Content that converts visitors to customers' },
  { id: 'optimization', label: '📈 Growth Accelerator', description: 'Track & improve what matters most' }
];

// Helper function to provide action-oriented button text
function getActionButtonText(moduleId: string): string {
  const buttonTexts: Record<string, string> = {
    'competitive-moat': 'Find My Competitive Edge',
    'value-chain-optimizer': 'Optimize My Processes',
    'swot-live-dashboard': 'Check My Reputation',
    'pricing-power-analysis': 'Analyze My Pricing',
    'local-expansion-roadmap': 'Plan My Growth',
    'quick-wins-generator': 'Get Quick Wins',
    'customer-magnet-posts': 'Create Magnet Content',
    'local-seo-content': 'Boost Local SEO',
    'conversion-website': 'Design High-Converting Site',
    'email-nurture-sequences': 'Build Email Sequences',
    'review-generation-system': 'Get More Reviews',
    'revenue-leaks-detector': 'Find Revenue Leaks',
    'kpi-dashboard': 'Track Key Metrics',
    'profit-optimizer': 'Increase Profits',
    'customer-lifetime-maximizer': 'Maximize Customer Value',
    'automation-opportunities': 'Automate My Work',
    'growth-accelerator-plan': 'Accelerate Growth',
    'business-dna-analysis': 'Discover My DNA',
    'local-market-intelligence': 'Map My Market',
    'customer-sentiment-tracker': 'Track Customer Voice',
    'economic-intelligence': 'Check Market Reality'
  };
  
  return buttonTexts[moduleId] || 'Run Analysis';
}

// Helper function to provide action-oriented next steps
function getModuleActionSteps(moduleId: string): string {
  const actionSteps: Record<string, string> = {
    'competitive-moat': 'List your top 3 differentiators and update your website homepage to feature them prominently.',
    'value-chain-optimizer': 'Identify the 1-2 processes taking most of your time and research automation tools.',
    'swot-live-dashboard': 'Check your Google Business reviews and respond to any negative feedback within 24 hours.',
    'pricing-power-analysis': 'Test a 10-15% price increase on your premium service with new customers.',
    'local-expansion-roadmap': 'Claim your Google Business listing and add photos, hours, and contact info.',
    'quick-wins-generator': 'Pick the top 3 recommended actions and schedule time to complete them this week.',
    'customer-magnet-posts': 'Schedule the first week of social posts and track which ones get the most engagement.',
    'local-seo-content': 'Add location-based keywords to your homepage title and meta description.',
    'conversion-website': 'Update your homepage headline to focus on customer benefits, not features.',
    'email-nurture-sequences': 'Set up a simple email sequence for new leads using your existing email platform.',
    'review-generation-system': 'Send follow-up emails to your last 10 customers asking for reviews.',
    'revenue-leaks-detector': 'Track where potential customers drop off and fix the biggest leak first.',
    'kpi-dashboard': 'Start tracking these 3 metrics weekly: new leads, conversion rate, average transaction value.',
    'profit-optimizer': 'Review your pricing and identify 1-2 low-margin services to raise prices on.',
    'customer-lifetime-maximizer': 'Create an upsell offer for existing customers and test it this month.',
    'automation-opportunities': 'Automate your most time-consuming weekly task using available tools.',
    'growth-accelerator-plan': 'Focus on the first 30 days of recommendations and track progress weekly.',
    'business-dna-analysis': 'Update your elevator pitch to focus on customer outcomes, not what you do.',
    'local-market-intelligence': 'Visit or call your top 3 competitors to understand their pricing and offerings.',
    'customer-sentiment-tracker': 'Set up Google Alerts for your business name and respond to mentions.',
    'economic-intelligence': 'Adjust your marketing message to address current economic concerns customers have.'
  };
  
  return actionSteps[moduleId] || 'Review the analysis results and implement the top 3 recommendations this week.';
}

export default function AnalysisPage() {
  const params = useParams();
  const demoId = (params?.demoId as string) || '';
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('foundation');
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>({});
  const [analysisErrors, setAnalysisErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/analyze-site-data/${demoId}?_t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          setAnalysisData(data);
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (demoId) {
      fetchInitialData();
    }
  }, [demoId]);

  const runAnalysis = async (moduleId: string) => {
    if (analysisStatus[moduleId] === 'running') return;

    const module = analysisModules.find(m => m.id === moduleId);
    if (!module) return;

    setAnalysisStatus(prev => ({ ...prev, [moduleId]: 'running' }));
    setAnalysisErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[moduleId];
      return newErrors;
    });

    try {
      const method = (module as any).method || 'GET';
      const body = (module as any).body ? JSON.stringify((module as any).body(demoId)) : undefined;
      
      const response = await fetch(module.endpoint(demoId), {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        body,
      });
      
      if (!response.ok) {
        let errorMessage = `Analysis failed for ${module.title}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          errorMessage = `${errorMessage} (${response.status} ${response.statusText}) - Endpoint: ${module.endpoint(demoId)} Method: ${method}`;
        }
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Handle redirects for mockup and presentation generators
      if ((moduleId === 'website-mockup' || moduleId === 'presentation-generator') && data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      
      setAnalysisData(prev => {
        if (!prev) return prev;
        const updates: Partial<AnalysisData> = {};

        switch (moduleId) {
          case 'site-analysis':
            updates.siteSummary = data.summary;
            updates.keyItems = data.keyItems;
            break;
          case 'ai-insights':
            updates.aiInsights = data.insights;
            break;
          case 'social-posts':
            updates.socialPosts = data.posts;
            break;
          case 'content-calendar':
            updates.contentCalendar = data.calendar;
            break;
          case 'competitor-research':
            updates.competitorAnalysis = data;
            break;
          case 'brand-analysis':
            updates.brandAnalysis = data;
            break;
          case 'conversion-analysis':
            updates.conversionAnalysis = data;
            break;
          case 'website-grade':
            updates.websiteGrade = data;
            break;
          case 'economic-intelligence':
            // Store economic intelligence data with both possible keys
            (updates as any)['economic-intelligence'] = data.data || data;
            (updates as any)['economic_intelligence'] = data.data || data;
            break;
          case 'competitive-moat':
          case 'value-chain-optimizer':
          case 'swot-live-dashboard':
          case 'pricing-power-analysis':
          case 'quick-wins-generator':
          case 'revenue-leaks-detector':
          case 'customer-magnet-posts':
          case 'local-seo-content':
          case 'email-nurture-sequences':
          case 'review-generation-system':
          case 'growth-accelerator-plan':
          case 'profit-optimizer':
          case 'automation-opportunities':
          case 'kpi-dashboard':
          case 'customer-lifetime-maximizer':
            // Store data from APIs that return {success: true, data: ...}
            (updates as any)[moduleId] = data.data || data;
            break;
          case 'porter-analysis':
          case 'hbs-business-model':
          case 'hbs-swot':
          case 'hbs-gtm':
          case 'roi-calculator':
          case 'implementation-roadmap':
          case 'website-mockup':
          case 'presentation-generator':
            // Store generic data for these modules
            (updates as any)[moduleId] = data;
            break;
        }

        return { ...prev, ...updates };
      });

      setAnalysisStatus(prev => ({ ...prev, [moduleId]: 'completed' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setAnalysisStatus(prev => ({ ...prev, [moduleId]: 'error' }));
      setAnalysisErrors(prev => ({ ...prev, [moduleId]: errorMessage }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Analysis not found</p>
          <a href="/" className="text-emerald-400 hover:text-emerald-300">
            ← Start new analysis
          </a>
        </div>
      </div>
    );
  }

  const currentModules = analysisModules.filter(m => m.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                🏠 New Business
              </a>
              <div className="h-6 w-px bg-white/20"></div>
              <div>
                <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>🎯</span>
                  {analysisData.businessName}
                  <span className="text-sm bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">SMB Strategy Hub</span>
                </h1>
                <a 
                  href={analysisData.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                >
                  <span>🌐</span>
                  {analysisData.websiteUrl}
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <a
                href={`/economic/${demoId}`}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
              >
                📊 Market Reality
              </a>
              <a
                href={`/porter/${demoId}`}
                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm font-medium"
              >
                � Strategic Frameworks
              </a>
              <a
                href={`/strategic-v2/${demoId}`}
                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm font-medium"
              >
                🏰 Porter Intelligence
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeCategory === category.id
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="text-left">
                  <div>{category.label}</div>
                  <div className="text-xs opacity-75">{category.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {categories.find(c => c.id === activeCategory)?.label}
          </h2>
          <p className="text-slate-400 mb-4">
            {categories.find(c => c.id === activeCategory)?.description}
          </p>
          
          {activeCategory === 'foundation' && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                💡 <strong>What this means:</strong> Instead of generic analysis, we look at your specific market position. 
                Think "What makes customers drive past your competitors to get to you?"
              </p>
            </div>
          )}
          
          {activeCategory === 'strategic' && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-purple-300 text-sm">
                💡 <strong>Strategic Intelligence for Small Business:</strong> We take complex frameworks like Porter's Five Forces 
                and translate them into plain English with actionable steps you can take this week.
              </p>
            </div>
          )}
          
          {activeCategory === 'content' && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
              <p className="text-emerald-300 text-sm">
                💡 <strong>Content that converts:</strong> Not just pretty posts, but marketing materials designed to bring in customers. 
                Every piece has a purpose: get found, build trust, close sales.
              </p>
            </div>
          )}
          
          {activeCategory === 'optimization' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-amber-300 text-sm">
                💡 <strong>Measure what matters:</strong> Track the KPIs that actually impact your bottom line. 
                Find hidden profit opportunities and automate time-consuming tasks.
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {currentModules.map((module) => (
            <AnalysisModule
              key={module.id}
              module={module}
              status={analysisStatus[module.id] || 'not-run'}
              error={analysisErrors[module.id]}
              data={analysisData}
              onRun={() => runAnalysis(module.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface AnalysisModuleProps {
  module: typeof analysisModules[0];
  status: 'not-run' | 'running' | 'completed' | 'error';
  error?: string;
  data: AnalysisData;
  onRun: () => void;
}

function AnalysisModule({ module, status, error, data, onRun }: AnalysisModuleProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400';
      case 'running': return 'bg-blue-500/20 text-blue-400';
      case 'error': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-700/50 text-slate-400';
    }
  };

  const getButtonStyle = () => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30';
      case 'running': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-not-allowed';
      default: return 'bg-emerald-500 hover:bg-emerald-600 text-white';
    }
  };

  const handleExport = async () => {
    if (module.id === 'content-calendar' && data.contentCalendar) {
      try {
        const response = await fetch('/api/export-content-calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentCalendar: data.contentCalendar,
            businessName: data.businessName
          })
        });
        
        if (response.ok) {
          const exportData = await response.json();
          const blob = new Blob([exportData.csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = exportData.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Failed to export:', error);
      }
    }
  };

  const renderContent = () => {
    switch (module.id) {
      case 'site-analysis':
        return (
          <>
            {data.siteSummary && (
              <div className="mb-4">
                <h4 className="font-medium text-white mb-2">Website Summary</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{data.siteSummary}</p>
              </div>
            )}
            {data.keyItems && data.keyItems.length > 0 && (
              <div>
                <h4 className="font-medium text-white mb-2">Key Items</h4>
                <div className="flex flex-wrap gap-2">
                  {data.keyItems.map((item, index) => (
                    <span key={index} className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      
      case 'ai-insights':
        return data.aiInsights && data.aiInsights.length > 0 ? (
          <div className="space-y-3">
            {data.aiInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-emerald-400 text-lg">💡</span>
                <p className="text-slate-300 text-sm">{insight}</p>
              </div>
            ))}
          </div>
        ) : null;

      case 'social-posts':
        return data.socialPosts && data.socialPosts.length > 0 ? (
          <div className="grid gap-4">
            {data.socialPosts.slice(0, 2).map((post, index) => (
              <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{post.emojis}</span>
                  <span className="font-medium text-white text-sm">{post.platform}</span>
                </div>
                <p className="text-slate-300 text-sm">{post.content}</p>
              </div>
            ))}
            {data.socialPosts.length > 2 && (
              <p className="text-slate-400 text-xs">+{data.socialPosts.length - 2} more posts</p>
            )}
          </div>
        ) : null;

      case 'content-calendar':
        return data.contentCalendar && data.contentCalendar.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">Content Calendar ({data.contentCalendar.length} posts)</h4>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.contentCalendar.slice(0, 3).map((item, index) => (
                <div key={index} className="bg-slate-800/50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-white">{item.day}</span>
                    <span className="text-xs text-slate-400">{item.platform}</span>
                  </div>
                  <p className="text-slate-300 text-xs line-clamp-2">{item.content}</p>
                </div>
              ))}
              {data.contentCalendar.length > 3 && (
                <p className="text-slate-400 text-xs text-center">+{data.contentCalendar.length - 3} more posts</p>
              )}
            </div>
          </div>
        ) : null;

      case 'economic-intelligence':
        const economicData = (data as any)['economic-intelligence'] || (data as any)['economic_intelligence'];
        if (economicData && status === 'completed') {
          return (
            <div className="space-y-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                <p className="text-emerald-400 text-sm font-medium">✅ Economic Analysis Complete</p>
                <p className="text-slate-300 text-xs mt-1">{economicData.industry || 'Industry'} risk assessment generated</p>
              </div>
              
              {economicData.industryImpact && (
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Overall Risk Level</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      economicData.industryImpact.overallRisk === 'critical' ? 'bg-red-500 text-white' :
                      economicData.industryImpact.overallRisk === 'high' ? 'bg-orange-500 text-white' :
                      economicData.industryImpact.overallRisk === 'moderate' ? 'bg-yellow-500 text-white' :
                      'bg-emerald-500 text-white'
                    }`}>
                      {economicData.industryImpact.overallRisk?.toUpperCase()}
                    </span>
                  </div>
                  <a 
                    href={`/economic/${data.demoId}`}
                    className="text-blue-400 hover:text-blue-300 text-xs underline"
                  >
                    View Full Economic Intelligence Report →
                  </a>
                </div>
              )}
              
              {economicData.profitPrediction && economicData.profitPrediction.adjustedForecast && (
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <h5 className="text-white text-xs font-medium mb-2">💰 Revenue Predictions</h5>
                  <div className="space-y-1">
                    {['year1', 'year2', 'year3'].slice(0, 2).map((yearKey, index) => {
                      const forecast = economicData.profitPrediction.adjustedForecast[yearKey];
                      return forecast ? (
                        <div key={yearKey} className="flex justify-between text-xs">
                          <span className="text-slate-400">Year {index + 1}</span>
                          <span className="text-emerald-400">{forecast.revenue}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        }
        return null;

      case 'pricing-power-analysis':
        const pricingData = (data as any)[module.id];
        if (pricingData && status === 'completed') {
          return (
            <div className="space-y-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                <p className="text-emerald-400 text-sm font-medium">✅ Pricing Analysis Complete</p>
                <p className="text-slate-300 text-xs mt-1">{pricingData.product || 'Product'} pricing intelligence</p>
              </div>
              
              {pricingData.currentMarketData && (
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <h5 className="text-white text-xs font-medium mb-2">💰 Current Market Data</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Wholesale Cost:</span>
                      <span className="text-white ml-1">{pricingData.currentMarketData.wholesaleCost}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Retail Price:</span>
                      <span className="text-white ml-1">{pricingData.currentMarketData.retailPrice}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Margin:</span>
                      <span className="text-emerald-400 ml-1">{pricingData.currentMarketData.margin}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {pricingData.pricingRecommendations && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-400 text-xs font-semibold mb-1">🎯 Pricing Recommendations:</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current:</span>
                      <span className="text-white">{pricingData.pricingRecommendations.currentPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recommended:</span>
                      <span className="text-emerald-400">{pricingData.pricingRecommendations.recommendedPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Increase:</span>
                      <span className="text-emerald-400">{pricingData.pricingRecommendations.priceIncrease}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }
        return null;

      case 'competitive-moat':
      case 'value-chain-optimizer':
      case 'swot-live-dashboard':
      case 'quick-wins-generator':
        const moduleData = (data as any)[module.id];
        if (moduleData && status === 'completed') {
          return (
            <div className="space-y-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                <p className="text-emerald-400 text-sm font-medium">✅ Analysis Complete</p>
                <p className="text-slate-300 text-xs mt-1">Strategic insights generated</p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-400 text-xs font-semibold mb-1">🎯 Here's what to do this week:</p>
                <p className="text-slate-300 text-xs">
                  {getModuleActionSteps(module.id)}
                </p>
              </div>
            </div>
          );
        }
        return null;

      case 'conversion-website':
        if (status === 'completed') {
          return <WebsiteDesignGallery demoId={data.demoId} />;
        }
        return null;

      case 'customer-magnet-posts':
      case 'local-seo-content':
      case 'email-nurture-sequences':
      case 'review-generation-system':
        const contentData = (data as any)[module.id];
        if (contentData && status === 'completed') {
          return (
            <div className="space-y-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                <p className="text-emerald-400 text-sm font-medium">✅ Content Generated</p>
                <p className="text-slate-300 text-xs mt-1">Marketing content ready to use</p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-400 text-xs font-semibold mb-1">🎯 Here's what to do this week:</p>
                <p className="text-slate-300 text-xs">
                  {getModuleActionSteps(module.id)}
                </p>
              </div>
            </div>
          );
        }
        return null;

      default:
        // Generic display for other modules
        const genericData = (data as any)[module.id];
        if (genericData && status === 'completed') {
          return (
            <div className="space-y-2">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                <p className="text-emerald-400 text-sm font-medium">✅ Analysis Complete</p>
                <p className="text-slate-300 text-xs mt-1">Strategic insights generated</p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-400 text-xs font-semibold mb-1">🎯 Here's what to do this week:</p>
                <p className="text-slate-300 text-xs">
                  {getModuleActionSteps(module.id)}
                </p>
              </div>
            </div>
          );
        }
        return null;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 bg-${module.color}-500/20 rounded-xl flex items-center justify-center`}>
            <span className="text-lg">{module.icon}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-white">{module.title}</h3>
              {(module as any).tier === 'free' && (
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-bold">FREE</span>
              )}
              {(module as any).tier === 'pro' && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs font-bold">PRO</span>
              )}
              {(module as any).tier === 'consultation' && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-bold">CONSULTATION</span>
              )}
            </div>
            <p className="text-slate-400 text-sm">{module.description}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {status === 'completed' ? 'Completed' :
           status === 'running' ? 'Running...' :
           status === 'error' ? 'Error' :
           'Ready'}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">
            <span className="font-medium">Error:</span> {error}
          </p>
        </div>
      )}

      {status === 'completed' && (
        <div className="mb-4">
          {renderContent()}
        </div>
      )}

      <button
        onClick={onRun}
        disabled={status === 'running'}
        className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${getButtonStyle()}`}
      >
        {status === 'running' ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
            Analyzing...
          </div>
        ) : status === 'completed' ? (
          <div className="flex items-center justify-center gap-2">
            <span>🔄</span>
            Update Analysis
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>🚀</span>
            {getActionButtonText(module.id)}
          </div>
        )}
      </button>
    </div>
  );
}
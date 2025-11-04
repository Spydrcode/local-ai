/**
 * HBS Intelligence Dashboard - Harvard Business School Strategic Frameworks
 * 
 * Combines SWOT Analysis, Business Model Canvas, and Go-To-Market Strategy
 * into a comprehensive strategic intelligence platform
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type TabType = 'swot' | 'bmc' | 'gtm' | 'overview';

interface Demo {
  id: string;
  client_id: string;
  swot_analysis?: any;
  business_model_canvas?: any;
  gtm_strategy?: any;
}

export default function HBSIntelligencePage() {
  const params = useParams();
  const router = useRouter();
  const demoId = params?.demoId as string;
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [demo, setDemo] = useState<Demo | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<{ swot?: boolean; bmc?: boolean; gtm?: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  // Fetch demo data
  useEffect(() => {
    if (!demoId) return;

    const fetchDemo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/demos/${demoId}`);
        if (!response.ok) throw new Error('Failed to fetch demo');
        const data = await response.json();
        setDemo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load demo');
      } finally {
        setLoading(false);
      }
    };

    fetchDemo();
  }, [demoId]);

  // Generate SWOT Analysis
  const generateSWOT = async () => {
    if (!demoId) return;
    
    setGenerating(prev => ({ ...prev, swot: true }));
    try {
      const response = await fetch(`/api/hbs/swot-analysis/${demoId}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to generate SWOT analysis');
      
      const data = await response.json();
      setDemo(prev => prev ? { ...prev, swot_analysis: data } : null);
      setActiveTab('swot');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate SWOT');
    } finally {
      setGenerating(prev => ({ ...prev, swot: false }));
    }
  };

  // Generate Business Model Canvas
  const generateBMC = async () => {
    if (!demoId) return;
    
    setGenerating(prev => ({ ...prev, bmc: true }));
    try {
      const response = await fetch(`/api/hbs/business-model/${demoId}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to generate Business Model Canvas');
      
      const data = await response.json();
      setDemo(prev => prev ? { ...prev, business_model_canvas: data } : null);
      setActiveTab('bmc');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate BMC');
    } finally {
      setGenerating(prev => ({ ...prev, bmc: false }));
    }
  };

  // Generate GTM Strategy
  const generateGTM = async () => {
    if (!demoId) return;
    
    setGenerating(prev => ({ ...prev, gtm: true }));
    try {
      const response = await fetch(`/api/hbs/gtm-strategy/${demoId}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to generate GTM Strategy');
      
      const data = await response.json();
      setDemo(prev => prev ? { ...prev, gtm_strategy: data } : null);
      setActiveTab('gtm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate GTM');
    } finally {
      setGenerating(prev => ({ ...prev, gtm: false }));
    }
  };

  if (loading) {
    return (
  <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading HBS Intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
  <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-slate-300">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                HBS Strategic Intelligence
              </h1>
              <p className="text-slate-400">
                {demo?.client_id} • Harvard Business School Frameworks
              </p>
            </div>
            <button
              onClick={() => router.push(`/demo/${demoId}`)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-300"
            >
              ← Back to Demo
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              label="Overview"
              icon="📊"
            />
            <TabButton
              active={activeTab === 'swot'}
              onClick={() => setActiveTab('swot')}
              label="SWOT Analysis"
              icon="🎯"
              hasData={!!demo?.swot_analysis}
            />
            <TabButton
              active={activeTab === 'bmc'}
              onClick={() => setActiveTab('bmc')}
              label="Business Model Canvas"
              icon="📐"
              hasData={!!demo?.business_model_canvas}
            />
            <TabButton
              active={activeTab === 'gtm'}
              onClick={() => setActiveTab('gtm')}
              label="Go-To-Market"
              icon="🚀"
              hasData={!!demo?.gtm_strategy}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <OverviewTab 
            demo={demo}
            onGenerateSWOT={generateSWOT}
            onGenerateBMC={generateBMC}
            onGenerateGTM={generateGTM}
            generating={generating}
          />
        )}
        
        {activeTab === 'swot' && (
          <SWOTTab 
            data={demo?.swot_analysis}
            onGenerate={generateSWOT}
            generating={generating.swot}
          />
        )}
        
        {activeTab === 'bmc' && (
          <BMCTab 
            data={demo?.business_model_canvas}
            onGenerate={generateBMC}
            generating={generating.bmc}
          />
        )}
        
        {activeTab === 'gtm' && (
          <GTMTab 
            data={demo?.gtm_strategy}
            onGenerate={generateGTM}
            generating={generating.gtm}
          />
        )}
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({ 
  active, 
  onClick, 
  label, 
  icon,
  hasData 
}: { 
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
  hasData?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap
        ${active 
          ? 'bg-emerald-500 text-white' 
          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
        }
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {hasData && !active && (
        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
      )}
    </button>
  );
}

// Overview Tab
function OverviewTab({ 
  demo, 
  onGenerateSWOT, 
  onGenerateBMC, 
  onGenerateGTM,
  generating 
}: { 
  demo: Demo | null;
  onGenerateSWOT: () => void;
  onGenerateBMC: () => void;
  onGenerateGTM: () => void;
  generating: { swot?: boolean; bmc?: boolean; gtm?: boolean };
}) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          Harvard Business School Strategic Frameworks
        </h2>
        <p className="text-slate-300 mb-6 leading-relaxed">
          Comprehensive strategic analysis using three proven HBS frameworks. Each framework provides
          unique insights into your business strategy, competitive position, and market opportunity.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* SWOT Card */}
          <AnalysisCard
            title="SWOT Analysis"
            icon="🎯"
            description="Analyze Strengths, Weaknesses, Opportunities, and Threats with TOWS strategies and PESTEL factors."
            hasData={!!demo?.swot_analysis}
            onGenerate={onGenerateSWOT}
            generating={generating.swot}
            features={[
              '4-Quadrant Matrix',
              'TOWS Strategies',
              'PESTEL Analysis',
              'Strategic Position'
            ]}
          />

          {/* BMC Card */}
          <AnalysisCard
            title="Business Model Canvas"
            icon="📐"
            description="Map your business model across 9 building blocks from customer segments to revenue streams."
            hasData={!!demo?.business_model_canvas}
            onGenerate={onGenerateBMC}
            generating={generating.bmc}
            features={[
              '9-Block Canvas',
              'Value Propositions',
              'Revenue Model',
              'Cost Structure'
            ]}
          />

          {/* GTM Card */}
          <AnalysisCard
            title="Go-To-Market Strategy"
            icon="🚀"
            description="Develop your market entry strategy with beachhead markets, channels, and pricing."
            hasData={!!demo?.gtm_strategy}
            onGenerate={onGenerateGTM}
            generating={generating.gtm}
            features={[
              'Beachhead Market',
              'Channel Strategy',
              'Pricing Model',
              'Unit Economics'
            ]}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          label="SWOT Analysis"
          value={demo?.swot_analysis ? 'Complete' : 'Not Started'}
          color={demo?.swot_analysis ? 'emerald' : 'slate'}
          icon="✓"
        />
        <StatCard
          label="Business Model Canvas"
          value={demo?.business_model_canvas ? 'Complete' : 'Not Started'}
          color={demo?.business_model_canvas ? 'emerald' : 'slate'}
          icon="✓"
        />
        <StatCard
          label="GTM Strategy"
          value={demo?.gtm_strategy ? 'Complete' : 'Not Started'}
          color={demo?.gtm_strategy ? 'emerald' : 'slate'}
          icon="✓"
        />
      </div>
    </div>
  );
}

// Analysis Card Component
function AnalysisCard({
  title,
  icon,
  description,
  hasData,
  onGenerate,
  generating,
  features
}: {
  title: string;
  icon: string;
  description: string;
  hasData: boolean;
  onGenerate: () => void;
  generating?: boolean;
  features: string[];
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/50 transition-colors">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-4">{description}</p>
      
      <ul className="space-y-2 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="text-slate-300 text-sm flex items-center gap-2">
            <span className="text-emerald-500">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={onGenerate}
        disabled={generating}
        className={`
          w-full py-2 px-4 rounded-lg font-medium transition-colors
          ${hasData
            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
            : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }
          ${generating ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Generating...
          </span>
        ) : hasData ? (
          'Regenerate'
        ) : (
          'Generate Analysis'
        )}
      </button>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  color,
  icon
}: {
  label: string;
  value: string;
  color: 'emerald' | 'slate';
  icon: string;
}) {
  const colors = {
    emerald: 'border-emerald-500/30 bg-emerald-500/10',
    slate: 'border-slate-700 bg-slate-800/50'
  };

  return (
    <div className={`border ${colors[color]} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-slate-400 text-sm">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${color === 'emerald' ? 'text-emerald-400' : 'text-slate-500'}`}>
        {value}
      </p>
    </div>
  );
}

// SWOT Tab (Placeholder)
function SWOTTab({ data, onGenerate, generating }: { data: any; onGenerate: () => void; generating?: boolean }) {
  if (!data) {
    return (
      <EmptyState
        title="SWOT Analysis Not Generated"
        description="Generate a comprehensive SWOT analysis with TOWS strategies and PESTEL factors."
        onGenerate={onGenerate}
        generating={generating}
      />
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
      <h2 className="text-2xl font-bold text-emerald-400 mb-6">SWOT Analysis Results</h2>
      <pre className="text-slate-300 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

// BMC Tab (Placeholder)
function BMCTab({ data, onGenerate, generating }: { data: any; onGenerate: () => void; generating?: boolean }) {
  if (!data) {
    return (
      <EmptyState
        title="Business Model Canvas Not Generated"
        description="Map your business model across 9 building blocks with revenue streams and cost structure."
        onGenerate={onGenerate}
        generating={generating}
      />
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
      <h2 className="text-2xl font-bold text-blue-400 mb-6">Business Model Canvas</h2>
      <pre className="text-slate-300 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

// GTM Tab (Placeholder)
function GTMTab({ data, onGenerate, generating }: { data: any; onGenerate: () => void; generating?: boolean }) {
  if (!data) {
    return (
      <EmptyState
        title="Go-To-Market Strategy Not Generated"
        description="Develop your market entry strategy with beachhead markets, channels, and unit economics."
        onGenerate={onGenerate}
        generating={generating}
      />
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
      <h2 className="text-2xl font-bold text-purple-400 mb-6">Go-To-Market Strategy</h2>
      <pre className="text-slate-300 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

// Empty State Component
function EmptyState({
  title,
  description,
  onGenerate,
  generating
}: {
  title: string;
  description: string;
  onGenerate: () => void;
  generating?: boolean;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
      <div className="max-w-md mx-auto">
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 mb-6">{description}</p>
        <button
          onClick={onGenerate}
          disabled={generating}
          className={`
            px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium
            hover:bg-emerald-600 transition-colors
            ${generating ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating Analysis...
            </span>
          ) : (
            'Generate Analysis'
          )}
        </button>
      </div>
    </div>
  );
}

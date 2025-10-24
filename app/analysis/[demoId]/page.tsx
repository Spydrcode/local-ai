'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AnalysisData {
  demoId: string;
  businessName: string;
  websiteUrl: string;
  competitorAnalysis: {
    competitors: Array<{
      name: string;
      url: string;
      strengths: string[];
      weaknesses: string[];
    }>;
    opportunities: string[];
  };
  brandAnalysis: {
    tone: string;
    voice: string;
    messaging: string[];
  };
  conversionAnalysis: {
    currentPath: string[];
    recommendations: string[];
    projectedImprovement: string;
  };
  contentCalendar: Array<{
    day: string;
    content: string;
    platform: string;
    hashtags: string[];
  }>;
  websiteGrade: {
    score: number;
    improvements: string[];
    roiProjection: string;
  };
  socialPosts: Array<{
    platform: string;
    content: string;
    emojis: string;
  }>;
  blogPosts: Array<{
    title: string;
    outline: string[];
    keywords: string[];
  }>;
}

export default function AnalysisPage() {
  const params = useParams();
  const demoId = (params?.demoId as string) || '';
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/comprehensive-analysis/${demoId}`);
        if (response.ok) {
          const data = await response.json();
          setAnalysisData(data);
        }
      } catch (error) {
        console.error('Failed to fetch analysis:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (demoId) {
      fetchAnalysis();
    }
  }, [demoId]);

  const handleGenerateMockup = async () => {
    setActionLoading('mockup');
    try {
      const response = await fetch('/api/generate-mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoId }),
      });
      const data = await response.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      console.error('Failed to generate mockup:', error);
      alert('Failed to generate mockup. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSocialPosts = () => {
    window.location.href = `/demo/${demoId}`;
  };

  const handleExportCalendar = async () => {
    setActionLoading('calendar');
    try {
      const response = await fetch('/api/export-content-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contentCalendar: analysisData?.contentCalendar || [],
          businessName: analysisData?.businessName || 'Business'
        }),
      });
      const data = await response.json();
      if (data.csv) {
        const blob = new Blob([data.csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export calendar:', error);
      alert('Failed to export calendar. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGeneratePresentation = async () => {
    setActionLoading('presentation');
    try {
      const response = await fetch('/api/generate-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoId }),
      });
      const data = await response.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      console.error('Failed to generate presentation:', error);
      alert('Failed to generate presentation. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white">Generating comprehensive analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white">Analysis not found</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'competitors', label: 'Competitors', icon: '🏢' },
    { id: 'brand', label: 'Brand Voice', icon: '🎯' },
    { id: 'conversion', label: 'Conversion', icon: '🔄' },
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'social', label: 'Social Media', icon: '📱' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300 mb-1">
                We Build Apps
              </p>
              <h1 className="text-2xl font-bold text-white mb-1">
                <span className="text-emerald-400">Local AI</span> - {analysisData.businessName}
              </h1>
              <a 
                href={analysisData.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
              >
                {analysisData.websiteUrl}
              </a>
            </div>
            <div className="flex gap-3">
              <a 
                href={`/strategic/${demoId}`}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Strategic Dashboard
              </a>
              <button 
                onClick={handleGeneratePresentation}
                disabled={actionLoading === 'presentation'}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {actionLoading === 'presentation' ? 'Loading...' : 'Generate Presentation'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Website Grade & ROI</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl font-bold text-emerald-400">
                    {analysisData.websiteGrade.score}/100
                  </div>
                  <div>
                    <p className="text-white font-medium">Current Performance</p>
                    <p className="text-slate-400 text-sm">{analysisData.websiteGrade.roiProjection}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {analysisData.websiteGrade.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-emerald-400">•</span>
                      <span className="text-slate-300 text-sm">{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={handleGenerateMockup}
                    disabled={actionLoading === 'mockup'}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                  >
                    {actionLoading === 'mockup' ? 'Loading...' : 'Generate Website Mockup'}
                  </button>
                  <button 
                    onClick={handleCreateSocialPosts}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                  >
                    Create Social Posts
                  </button>
                  <button 
                    onClick={handleExportCalendar}
                    disabled={actionLoading === 'calendar'}
                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                  >
                    {actionLoading === 'calendar' ? 'Exporting...' : 'Export Content Calendar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Social Media Posts</h2>
                <div className="space-y-4">
                  {analysisData.socialPosts.map((post, index) => (
                    <div key={index} className="bg-slate-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{post.emojis}</span>
                        <span className="font-medium text-white">{post.platform}</span>
                      </div>
                      <p className="text-slate-300 text-sm">{post.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Content Calendar</h2>
                <div className="space-y-3">
                  {analysisData.contentCalendar.map((item, index) => (
                    <div key={index} className="bg-slate-800 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-white">{item.day}</span>
                        <span className="text-xs text-slate-400">{item.platform}</span>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{item.content}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.hashtags.map((tag, i) => (
                          <span key={i} className="text-xs text-emerald-400">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'competitors' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Competitive Analysis</h2>
                <button
                  onClick={() => window.location.href = `/strategic/${demoId}`}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  View Strategic Dashboard →
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {analysisData.competitorAnalysis.competitors.map((competitor, index) => (
                  <div key={index} className="bg-slate-800 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-white mb-2">{competitor.name}</h3>
                    <a 
                      href={competitor.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-400 text-sm hover:underline mb-4 block"
                    >
                      {competitor.url}
                    </a>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-emerald-400 mb-2">Strengths</h4>
                        <ul className="space-y-1">
                          {competitor.strengths.map((strength, i) => (
                            <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                              <span className="text-emerald-400">✓</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-red-400 mb-2">Weaknesses</h4>
                        <ul className="space-y-1">
                          {competitor.weaknesses.map((weakness, i) => (
                            <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                              <span className="text-red-400">✗</span>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-slate-800 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Market Opportunities</h3>
                <div className="space-y-2">
                  {analysisData.competitorAnalysis.opportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">💡</span>
                      <p className="text-slate-300 text-sm">{opportunity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'brand' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Brand Voice Analysis</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-lg p-5">
                  <h3 className="text-lg font-medium text-emerald-400 mb-3">Tone</h3>
                  <p className="text-slate-300">{analysisData.brandAnalysis.tone}</p>
                </div>
                
                <div className="bg-slate-800 rounded-lg p-5">
                  <h3 className="text-lg font-medium text-emerald-400 mb-3">Voice</h3>
                  <p className="text-slate-300">{analysisData.brandAnalysis.voice}</p>
                </div>
              </div>

              <div className="mt-6 bg-slate-800 rounded-lg p-5">
                <h3 className="text-lg font-medium text-emerald-400 mb-4">Key Messaging</h3>
                <div className="space-y-3">
                  {analysisData.brandAnalysis.messaging.map((message, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-emerald-400 font-bold text-lg">{index + 1}.</span>
                      <p className="text-slate-300">{message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'conversion' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Conversion Optimization</h2>
              
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">📈</span>
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-400">Projected Improvement</h3>
                    <p className="text-2xl font-bold text-white">{analysisData.conversionAnalysis.projectedImprovement}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-5 mb-6">
                <h3 className="text-lg font-medium text-white mb-4">Current Conversion Path</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {analysisData.conversionAnalysis.currentPath.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="bg-slate-700 px-4 py-2 rounded-lg">
                        <span className="text-slate-300 text-sm">{step}</span>
                      </div>
                      {index < analysisData.conversionAnalysis.currentPath.length - 1 && (
                        <span className="text-slate-500">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-5">
                <h3 className="text-lg font-medium text-white mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {analysisData.conversionAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-emerald-400 text-xl">→</span>
                      <p className="text-slate-300">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Content Strategy</h2>
              
              <div className="space-y-6">
                {analysisData.blogPosts.map((post, index) => (
                  <div key={index} className="bg-slate-800 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">{post.title}</h3>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-emerald-400 mb-2">Outline</h4>
                      <ol className="space-y-2">
                        {post.outline.map((point, i) => (
                          <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                            <span className="text-emerald-400">{i + 1}.</span>
                            {point}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-emerald-400 mb-2">Target Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {post.keywords.map((keyword, i) => (
                          <span key={i} className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
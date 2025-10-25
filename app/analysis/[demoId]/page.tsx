'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AnalysisData {
  demoId: string;
  businessName: string;
  websiteUrl: string;
  // Initial Analysis
  siteSummary?: string;
  keyItems?: string[];
  aiInsights?: string[];
  // Social Media
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
  // Strategic Analysis
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
  // Website Redesign
  websiteGrade?: {
    score: number;
    improvements: string[];
    roiProjection: string;
  };
  mockupUrl?: string;
  implementationRoadmap?: any;
}

interface AnalysisStatus {
  [key: string]: 'not-run' | 'running' | 'completed' | 'error';
}

export default function AnalysisPage() {
  const params = useParams();
  const demoId = (params?.demoId as string) || '';
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('initial');
  const [newUrl, setNewUrl] = useState('');
  const [isLoadingNewUrl, setIsLoadingNewUrl] = useState(false);
  const [analysisErrors, setAnalysisErrors] = useState<Record<string, string>>({});
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>({
    'site-analysis': 'not-run',
    'ai-insights': 'not-run',
    'social-posts': 'not-run',
    'content-calendar': 'not-run',
    'competitor-research': 'not-run',
    'brand-analysis': 'not-run',
    'conversion-analysis': 'not-run',
    'website-grade': 'not-run',
    'mockup-generation': 'not-run',
    'implementation-roadmap': 'not-run'
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      // Reset state when loading new demo
      setIsLoading(true);
      setAnalysisData(null);
      setAnalysisErrors({});
      setAnalysisStatus({
        'site-analysis': 'not-run',
        'ai-insights': 'not-run',
        'social-posts': 'not-run',
        'content-calendar': 'not-run',
        'competitor-research': 'not-run',
        'brand-analysis': 'not-run',
        'conversion-analysis': 'not-run',
        'website-grade': 'not-run',
        'mockup-generation': 'not-run',
        'implementation-roadmap': 'not-run'
      });

      try {
        // Add cache-busting parameter to force fresh data
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

  useEffect(() => {
    console.log('Analysis data updated:', analysisData);
  }, [analysisData]);

  const runAnalysis = async (analysisType: string) => {
    if (analysisStatus[analysisType] === 'running') return;

    // Check prerequisites for mockup generation
    if (analysisType === 'mockup-generation' && (!analysisData || !analysisData.siteSummary)) {
      // Automatically run site analysis first
      console.log('Mockup generation requires site analysis - running it first...');
      setAnalysisErrors(prev => ({ 
        ...prev, 
        'mockup-generation': 'Running site analysis first...' 
      }));
      
      try {
        await runAnalysis('site-analysis');
        // After site analysis completes, the user can click mockup generation again
        setAnalysisErrors(prev => ({ 
          ...prev, 
          'mockup-generation': 'Site analysis complete! Click "Generate Mockup" again.' 
        }));
        return;
      } catch (error) {
        setAnalysisErrors(prev => ({ 
          ...prev, 
          'mockup-generation': 'Failed to run site analysis. Please run it manually first.' 
        }));
        return;
      }
    }

    setAnalysisStatus(prev => ({ ...prev, [analysisType]: 'running' }));

    try {
      let endpoint = '';
      let method = 'GET';
      let body = undefined;

      switch (analysisType) {
        case 'site-analysis':
          endpoint = `/api/analyze-site-data/${demoId}`;
          break;
        case 'ai-insights':
          endpoint = `/api/ai-insights/${demoId}`;
          break;
        case 'social-posts':
          endpoint = `/api/social-media-analysis/${demoId}`;
          break;
        case 'content-calendar':
          endpoint = `/api/content-calendar/${demoId}`;
          break;
        case 'competitor-research':
          endpoint = `/api/competitor-analysis/${demoId}`;
          break;
        case 'brand-analysis':
          endpoint = `/api/brand-analysis/${demoId}`;
          break;
        case 'conversion-analysis':
          endpoint = `/api/conversion-analysis/${demoId}`;
          break;
        case 'website-grade':
          endpoint = `/api/website-grade/${demoId}`;
          break;
        case 'mockup-generation':
          endpoint = `/api/generate-mockup`;
          method = 'POST';
          body = JSON.stringify({ demoId });
          break;
        case 'implementation-roadmap':
          endpoint = `/api/implementation-roadmap/${demoId}`;
          break;
        default:
          throw new Error('Unknown analysis type');
      }

      const response = await fetch(endpoint, {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        body,
      });

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = 'Analysis failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use status text
          errorMessage = `${errorMessage} (${response.status} ${response.statusText})`;
        }
        console.error(`${analysisType} failed:`, errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`${analysisType} response:`, data);

      if (analysisType === 'mockup-generation' && data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      // Update analysis data
      setAnalysisData(prev => {
        if (!prev) return prev;
        const updates: Partial<AnalysisData> = {};

        switch (analysisType) {
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
            console.log('Content calendar data:', data.calendar);
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
          case 'implementation-roadmap':
            updates.implementationRoadmap = data;
            break;
        }

        console.log('Updates to apply:', updates);
        return { ...prev, ...updates };
      });

      setAnalysisStatus(prev => ({ ...prev, [analysisType]: 'completed' }));
      // Clear any previous error for this analysis type
      setAnalysisErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[analysisType];
        return newErrors;
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      console.error(`${analysisType} failed:`, errorMessage);
      setAnalysisStatus(prev => ({ ...prev, [analysisType]: 'error' }));
      setAnalysisErrors(prev => ({ ...prev, [analysisType]: errorMessage }));
    }
  };

  const handleNewUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || isLoadingNewUrl) return;

    setIsLoadingNewUrl(true);
    try {
      const response = await fetch('/api/quick-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        // Force full page reload with cache busting to ensure fresh data
        window.location.href = `/analysis/${data.demoId}?t=${Date.now()}`;
      } else {
        alert('Failed to analyze URL. Please check the URL and try again.');
      }
    } catch (error) {
      console.error('Failed to analyze new URL:', error);
      alert('Failed to analyze URL. Please try again.');
    } finally {
      setIsLoadingNewUrl(false);
    }
  };

  const tabs = [
    { id: 'initial', label: 'Initial Analysis', icon: '🔍', description: 'Website scraping & AI insights' },
    { id: 'social', label: 'Social Media', icon: '📱', description: 'Content & calendar planning' },
    { id: 'strategic', label: 'Strategic Analysis', icon: '🎯', description: 'Porter & competitor analysis' },
    { id: 'redesign', label: 'Website Redesign', icon: '🎨', description: 'Mockups & implementation' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white">Loading business analysis...</p>
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

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
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
                href={`/economic/${demoId}`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Economic Intelligence
              </a>
              <a
                href={`/strategic-v2/${demoId}`}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Strategic Dashboard
              </a>
              <a
                href="/"
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                New Analysis
              </a>
            </div>
          </div>

          {/* Quick URL Input */}
          <form onSubmit={handleNewUrl} className="mt-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Analyze another website..."
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoadingNewUrl}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoadingNewUrl ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Analyze
                  </>
                )}
              </button>
            </div>
          </form>
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
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'initial' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Initial Website Analysis</h2>
              <p className="text-slate-400">Get comprehensive insights about your website and business</p>
            </div>

            {/* Site Analysis */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Website Content Analysis</h3>
                    <p className="text-slate-400 text-sm">Extract and analyze website content</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  analysisStatus['site-analysis'] === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  analysisStatus['site-analysis'] === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  analysisStatus['site-analysis'] === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-700/50 text-slate-400'
                }`}>
                  {analysisStatus['site-analysis'] === 'completed' ? 'Completed' :
                   analysisStatus['site-analysis'] === 'running' ? 'Analyzing...' :
                   analysisStatus['site-analysis'] === 'error' ? 'Error' :
                   'Not Run'}
                </div>
              </div>

              {/* Error message display */}
              {analysisErrors['site-analysis'] && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">
                    <span className="font-medium">Error:</span> {analysisErrors['site-analysis']}
                  </p>
                </div>
              )}

              {analysisData.siteSummary && (
                <div className="mb-4">
                  <h4 className="font-medium text-white mb-2">Website Summary</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{analysisData.siteSummary}</p>
                </div>
              )}

              {analysisData.keyItems && analysisData.keyItems.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-white mb-2">Key Items Identified</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.keyItems.map((item, index) => (
                      <span key={index} className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => runAnalysis('site-analysis')}
                disabled={analysisStatus['site-analysis'] === 'running'}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  analysisStatus['site-analysis'] === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : analysisStatus['site-analysis'] === 'running'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {analysisStatus['site-analysis'] === 'running' ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Analyzing Website...
                  </div>
                ) : analysisStatus['site-analysis'] === 'completed' ? (
                  'Re-run Analysis'
                ) : (
                  'Run Website Analysis'
                )}
              </button>
            </div>

            {/* AI Insights */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">AI Business Insights</h3>
                    <p className="text-slate-400 text-sm">Generate intelligent business recommendations</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  analysisStatus['ai-insights'] === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  analysisStatus['ai-insights'] === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  analysisStatus['ai-insights'] === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-700/50 text-slate-400'
                }`}>
                  {analysisStatus['ai-insights'] === 'completed' ? 'Completed' :
                   analysisStatus['ai-insights'] === 'running' ? 'Generating...' :
                   analysisStatus['ai-insights'] === 'error' ? 'Error' :
                   'Not Run'}
                </div>
              </div>

              {/* Error message display */}
              {analysisErrors['ai-insights'] && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">
                    <span className="font-medium">Error:</span> {analysisErrors['ai-insights']}
                  </p>
                </div>
              )}

              {analysisData.aiInsights && analysisData.aiInsights.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-white mb-3">AI Insights</h4>
                  <div className="space-y-3">
                    {analysisData.aiInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-emerald-400 text-lg">💡</span>
                        <p className="text-slate-300 text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => runAnalysis('ai-insights')}
                disabled={analysisStatus['ai-insights'] === 'running'}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  analysisStatus['ai-insights'] === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : analysisStatus['ai-insights'] === 'running'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {analysisStatus['ai-insights'] === 'running' ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Generating Insights...
                  </div>
                ) : analysisStatus['ai-insights'] === 'completed' ? (
                  'Regenerate Insights'
                ) : (
                  'Generate AI Insights'
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Social Media Dashboard</h2>
              <p className="text-slate-400">Create and manage your social media content strategy</p>
            </div>

            {/* Social Posts */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Social Media Posts</h3>
                    <p className="text-slate-400 text-sm">Generate platform-specific social content</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  analysisStatus['social-posts'] === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  analysisStatus['social-posts'] === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  analysisStatus['social-posts'] === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-700/50 text-slate-400'
                }`}>
                  {analysisStatus['social-posts'] === 'completed' ? 'Completed' :
                   analysisStatus['social-posts'] === 'running' ? 'Generating...' :
                   analysisStatus['social-posts'] === 'error' ? 'Error' :
                   'Not Run'}
                </div>
              </div>

              {analysisData.socialPosts && analysisData.socialPosts.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-white mb-3">Generated Posts</h4>
                  <div className="grid md:grid-cols-2 gap-4">
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
              )}

              <button
                onClick={() => runAnalysis('social-posts')}
                disabled={analysisStatus['social-posts'] === 'running'}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  analysisStatus['social-posts'] === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : analysisStatus['social-posts'] === 'running'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {analysisStatus['social-posts'] === 'running' ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Generating Posts...
                  </div>
                ) : analysisStatus['social-posts'] === 'completed' ? (
                  'Regenerate Posts'
                ) : (
                  'Generate Social Posts'
                )}
              </button>
            </div>

            {/* Content Calendar */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">90-Day Content Calendar</h3>
                    <p className="text-slate-400 text-sm">Plan your content strategy for the next 90 days</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  analysisStatus['content-calendar'] === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  analysisStatus['content-calendar'] === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  analysisStatus['content-calendar'] === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-700/50 text-slate-400'
                }`}>
                  {analysisStatus['content-calendar'] === 'completed' ? 'Completed' :
                   analysisStatus['content-calendar'] === 'running' ? 'Planning...' :
                   analysisStatus['content-calendar'] === 'error' ? 'Error' :
                   'Not Run'}
                </div>
              </div>

              {analysisData.contentCalendar && analysisData.contentCalendar.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Content Calendar ({analysisData.contentCalendar.length} posts)</h4>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/export-content-calendar', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              contentCalendar: analysisData.contentCalendar,
                              businessName: analysisData.businessName
                            })
                          });
                          
                          if (response.ok) {
                            const data = await response.json();
                            const blob = new Blob([data.csv], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = data.filename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          }
                        } catch (error) {
                          console.error('Failed to export calendar:', error);
                          alert('Failed to export calendar');
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export to CSV
                    </button>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {analysisData.contentCalendar.map((item, index) => (
                      <div key={index} className="bg-slate-800 rounded-lg p-4 border-l-4 border-emerald-500">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-semibold text-white text-lg">{item.day}</span>
                            <div className="text-xs text-slate-400 mt-1">
                              📅 {item.date || 'Date TBD'} • ⏰ {item.time || 'Time TBD'} • 📱 {item.platform}
                            </div>
                          </div>
                          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-medium">
                            {item.postType || 'Post'}
                          </span>
                        </div>

                        <p className="text-slate-300 text-sm mb-3 leading-relaxed">{item.content}</p>

                        {item.engagement && (
                          <div className="bg-slate-700/50 rounded p-2 mb-3">
                            <span className="text-xs text-slate-400">💡 Engagement Strategy: </span>
                            <span className="text-xs text-slate-300">{item.engagement}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(item.hashtags) ? item.hashtags.map((tag, i) => (
                            <span key={i} className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </span>
                          )) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => runAnalysis('content-calendar')}
                disabled={analysisStatus['content-calendar'] === 'running'}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  analysisStatus['content-calendar'] === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : analysisStatus['content-calendar'] === 'running'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {analysisStatus['content-calendar'] === 'running' ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Creating Calendar...
                  </div>
                ) : analysisStatus['content-calendar'] === 'completed' ? (
                  'Update Calendar'
                ) : (
                  'Generate Content Calendar'
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'strategic' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Strategic Analysis Dashboard</h2>
              <p className="text-slate-400">Michael Porter analysis and competitive intelligence</p>
            </div>

            {/* Competitor Research */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏢</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Competitor Analysis</h3>
                    <p className="text-slate-400 text-sm">Analyze competitors using Porter's Five Forces</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  analysisStatus['competitor-research'] === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  analysisStatus['competitor-research'] === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  analysisStatus['competitor-research'] === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-700/50 text-slate-400'
                }`}>
                  {analysisStatus['competitor-research'] === 'completed' ? 'Completed' :
                   analysisStatus['competitor-research'] === 'running' ? 'Analyzing...' :
                   analysisStatus['competitor-research'] === 'error' ? 'Error' :
                   'Not Run'}
                </div>
              </div>

              {analysisData.competitorAnalysis && (
                <div className="mb-4">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {analysisData.competitorAnalysis.competitors.map((competitor, index) => (
                      <div key={index} className="bg-slate-800 rounded-lg p-5">
                        <h4 className="text-lg font-semibold text-white mb-2">{competitor.name}</h4>
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
                            <h5 className="text-sm font-medium text-emerald-400 mb-2">Strengths</h5>
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
                            <h5 className="text-sm font-medium text-red-400 mb-2">Weaknesses</h5>
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

                  <div className="bg-slate-800 rounded-lg p-5">
                    <h4 className="text-lg font-semibold text-white mb-4">Market Opportunities</h4>
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
              )}

              <button
                onClick={() => runAnalysis('competitor-research')}
                disabled={analysisStatus['competitor-research'] === 'running'}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  analysisStatus['competitor-research'] === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : analysisStatus['competitor-research'] === 'running'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {analysisStatus['competitor-research'] === 'running' ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Analyzing Competitors...
                  </div>
                ) : analysisStatus['competitor-research'] === 'completed' ? (
                  'Re-analyze Competitors'
                ) : (
                  'Run Competitor Analysis'
                )}
              </button>
            </div>

            {/* Brand Analysis */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Brand Voice Analysis</h3>
                    <p className="text-slate-400 text-sm">Analyze and define your brand personality</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  analysisStatus['brand-analysis'] === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  analysisStatus['brand-analysis'] === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  analysisStatus['brand-analysis'] === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-700/50 text-slate-400'
                }`}>
                  {analysisStatus['brand-analysis'] === 'completed' ? 'Completed' :
                   analysisStatus['brand-analysis'] === 'running' ? 'Analyzing...' :
                   analysisStatus['brand-analysis'] === 'error' ? 'Error' :
                   'Not Run'}
                </div>
              </div>

              {analysisData.brandAnalysis && (
                <div className="mb-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-800 rounded-lg p-5">
                      <h4 className="text-lg font-medium text-emerald-400 mb-3">Tone</h4>
                      <p className="text-slate-300">{analysisData.brandAnalysis.tone}</p>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-5">
                      <h4 className="text-lg font-medium text-emerald-400 mb-3">Voice</h4>
                      <p className="text-slate-300">{analysisData.brandAnalysis.voice}</p>
                    </div>
                  </div>

                  <div className="mt-6 bg-slate-800 rounded-lg p-5">
                    <h4 className="text-lg font-medium text-emerald-400 mb-4">Key Messaging</h4>
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
              )}

              <button
                onClick={() => runAnalysis('brand-analysis')}
                disabled={analysisStatus['brand-analysis'] === 'running'}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  analysisStatus['brand-analysis'] === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : analysisStatus['brand-analysis'] === 'running'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {analysisStatus['brand-analysis'] === 'running' ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Analyzing Brand...
                  </div>
                ) : analysisStatus['brand-analysis'] === 'completed' ? (
                  'Re-analyze Brand'
                ) : (
                  'Run Brand Analysis'
                )}
              </button>
            </div>

            {/* Conversion Analysis */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Conversion Optimization</h3>
                    <p className="text-slate-400 text-sm">Optimize your customer journey and conversion funnel</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  analysisStatus['conversion-analysis'] === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  analysisStatus['conversion-analysis'] === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  analysisStatus['conversion-analysis'] === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-700/50 text-slate-400'
                }`}>
                  {analysisStatus['conversion-analysis'] === 'completed' ? 'Completed' :
                   analysisStatus['conversion-analysis'] === 'running' ? 'Analyzing...' :
                   analysisStatus['conversion-analysis'] === 'error' ? 'Error' :
                   'Not Run'}
                </div>
              </div>

              {analysisData.conversionAnalysis && (
                <div className="mb-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">📈</span>
                      <div>
                        <h4 className="text-lg font-semibold text-emerald-400">Projected Improvement</h4>
                        <p className="text-2xl font-bold text-white">{analysisData.conversionAnalysis.projectedImprovement}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-5 mb-6">
                    <h4 className="text-lg font-medium text-white mb-4">Current Conversion Path</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {analysisData.conversionAnalysis.currentPath.map((step, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="bg-slate-700 px-4 py-2 rounded-lg">
                            <span className="text-slate-300 text-sm">{step}</span>
                          </div>
                          {index < analysisData.conversionAnalysis!.currentPath.length - 1 && (
                            <span className="text-slate-500">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-5">
                    <h4 className="text-lg font-medium text-white mb-4">Recommendations</h4>
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
              )}

              <button
                onClick={() => runAnalysis('conversion-analysis')}
                disabled={analysisStatus['conversion-analysis'] === 'running'}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  analysisStatus['conversion-analysis'] === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : analysisStatus['conversion-analysis'] === 'running'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {analysisStatus['conversion-analysis'] === 'running' ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Analyzing Conversion...
                  </div>
                ) : analysisStatus['conversion-analysis'] === 'completed' ? (
                  'Re-analyze Conversion'
                ) : (
                  'Run Conversion Analysis'
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'redesign' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Website Redesign Dashboard</h2>
              <p className="text-slate-400">Mockups, ROI analysis, and implementation planning</p>
            </div>

            {/* Website Grade & ROI */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Website Performance Grade</h3>
                    <p className="text-slate-400 text-sm">Analyze current website performance and ROI potential</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  analysisStatus['website-grade'] === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  analysisStatus['website-grade'] === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  analysisStatus['website-grade'] === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-700/50 text-slate-400'
                }`}>
                  {analysisStatus['website-grade'] === 'completed' ? 'Completed' :
                   analysisStatus['website-grade'] === 'running' ? 'Analyzing...' :
                   analysisStatus['website-grade'] === 'error' ? 'Error' :
                   'Not Run'}
                </div>
              </div>

              {analysisData.websiteGrade && (
                <div className="mb-4">
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
              )}

              <button
                onClick={() => runAnalysis('website-grade')}
                disabled={analysisStatus['website-grade'] === 'running'}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  analysisStatus['website-grade'] === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : analysisStatus['website-grade'] === 'running'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {analysisStatus['website-grade'] === 'running' ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Grading Website...
                  </div>
                ) : analysisStatus['website-grade'] === 'completed' ? (
                  'Re-grade Website'
                ) : (
                  'Grade Website Performance'
                )}
              </button>
            </div>

            {/* Mockup Generation */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Website Redesign Mockups</h3>
                    <p className="text-slate-400 text-sm">Generate professional website mockups and design concepts</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  analysisStatus['mockup-generation'] === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  analysisStatus['mockup-generation'] === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  analysisStatus['mockup-generation'] === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-700/50 text-slate-400'
                }`}>
                  {analysisStatus['mockup-generation'] === 'completed' ? 'Completed' :
                   analysisStatus['mockup-generation'] === 'running' ? 'Generating...' :
                   analysisStatus['mockup-generation'] === 'error' ? 'Error' :
                   'Not Run'}
                </div>
              </div>

              {analysisData.mockupUrl && (
                <div className="mb-4">
                  <h4 className="font-medium text-white mb-3">Generated Mockup</h4>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-emerald-400 text-sm mb-2">Mockup generated successfully!</p>
                    <a
                      href={analysisData.mockupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm underline"
                    >
                      View Mockup →
                    </a>
                  </div>
                </div>
              )}

              {analysisErrors['mockup-generation'] && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{analysisErrors['mockup-generation']}</p>
                </div>
              )}

              <button
                onClick={() => runAnalysis('mockup-generation')}
                disabled={analysisStatus['mockup-generation'] === 'running'}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  analysisStatus['mockup-generation'] === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : analysisStatus['mockup-generation'] === 'running'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {analysisStatus['mockup-generation'] === 'running' ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Generating Mockups...
                  </div>
                ) : analysisStatus['mockup-generation'] === 'completed' ? (
                  'Regenerate Mockups'
                ) : (
                  'Generate Website Mockups'
                )}
              </button>
            </div>

            {/* Implementation Roadmap */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🗺️</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Implementation Roadmap</h3>
                    <p className="text-slate-400 text-sm">Create a step-by-step plan for website redesign implementation</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  analysisStatus['implementation-roadmap'] === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  analysisStatus['implementation-roadmap'] === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  analysisStatus['implementation-roadmap'] === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-700/50 text-slate-400'
                }`}>
                  {analysisStatus['implementation-roadmap'] === 'completed' ? 'Completed' :
                   analysisStatus['implementation-roadmap'] === 'running' ? 'Planning...' :
                   analysisStatus['implementation-roadmap'] === 'error' ? 'Error' :
                   'Not Run'}
                </div>
              </div>

              {analysisData.implementationRoadmap && (
                <div className="mb-4">
                  <h4 className="font-medium text-white mb-3">Implementation Plan</h4>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-slate-300 text-sm">Implementation roadmap generated successfully!</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => runAnalysis('implementation-roadmap')}
                disabled={analysisStatus['implementation-roadmap'] === 'running'}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  analysisStatus['implementation-roadmap'] === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : analysisStatus['implementation-roadmap'] === 'running'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {analysisStatus['implementation-roadmap'] === 'running' ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Creating Roadmap...
                  </div>
                ) : analysisStatus['implementation-roadmap'] === 'completed' ? (
                  'Update Roadmap'
                ) : (
                  'Generate Implementation Roadmap'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import DemoOverview from '@/components/DemoOverview';
import type {
    DemoBlogPost,
    DemoChatbotConfig,
    DemoHomepageMock,
    DemoInsights,
    DemoSocialPost,
} from '@/types/demo';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface AnalyzeResponse {
  summary: string;
  keyItems: string[];
  embeddingsId: string;
}

interface GenerateDemoResponse {
  demoId: string;
  chatbotConfig: DemoChatbotConfig;
  insights: DemoInsights;
  socialPosts: DemoSocialPost[];
  homepage: DemoHomepageMock;
  blogPost: DemoBlogPost;
}

const SAMPLE_DEMOS = [
  { id: 'demo-joes-bbq', name: "Joe's BBQ", url: 'https://joesbbq.example.com' },
  { id: 'demo-sunny-coffee', name: 'Sunny Coffee', url: 'https://sunnycoffee.example.com' },
  { id: 'demo-propane-pro', name: 'PropanePro', url: 'https://propanepro.example.com' },
];

export default function DemoBuilderPage() {
  const [siteUrl, setSiteUrl] = useState('');
  const [demoName, setDemoName] = useState('');
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResponse | null>(null);
  const [insights, setInsights] = useState<DemoInsights | null>(null);
  const [demoResult, setDemoResult] = useState<GenerateDemoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'analyzing' | 'insights' | 'generating' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const resetAndGoHome = () => {
    if (confirm('Are you sure? This will discard the current demo.')) {
      window.location.href = '/';
    }
  };

  const progressText = useMemo(() => {
    switch (step) {
      case 'analyzing':
        return 'Crawling site and extracting structure...';
      case 'insights':
        return 'AI insights generated! Review below or generate full demo.';
      case 'generating':
        return 'Generating homepage, social posts, blog content...';
      case 'done':
        return 'Demo ready! Launch preview below.';
      default:
        return 'Paste a URL to get AI-powered insights.';
    }
  }, [step]);

  async function getInsights(targetUrl: string, customName?: string) {
    setIsLoading(true);
    setError(null);
    setDemoResult(null);
    setAnalyzeResult(null);
    setInsights(null);

    try {
      setStep('analyzing');
      const analyzeResponse = await fetch('/api/analyze-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, demoName: customName }),
      });

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze site. Check logs for details.');
      }

      const analyzeJson: AnalyzeResponse = await analyzeResponse.json();
      setAnalyzeResult(analyzeJson);

      // Generate just the insights first
      const insightsResponse = await fetch('/api/generate-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: customName ?? targetUrl,
          siteText: analyzeJson.summary,
          metadata: {
            url: targetUrl,
            keyItems: analyzeJson.keyItems,
            embeddingsId: analyzeJson.embeddingsId,
          },
          insightsOnly: true,
        }),
      });

      if (!insightsResponse.ok) {
        throw new Error('Insights generation failed. See server logs.');
      }

      const insightsJson = await insightsResponse.json();
      setInsights(insightsJson.insights);
      setStep('insights');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unexpected error occurred');
      setStep('idle');
    } finally {
      setIsLoading(false);
    }
  }

  async function generateFullDemo() {
    if (!analyzeResult || !insights) return;

    setIsLoading(true);
    setError(null);

    try {
      setStep('generating');
      const generateResponse = await fetch('/api/generate-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: demoName || siteUrl,
          siteText: analyzeResult.summary,
          metadata: {
            url: siteUrl,
            keyItems: analyzeResult.keyItems,
            embeddingsId: analyzeResult.embeddingsId,
          },
        }),
      });

      if (!generateResponse.ok) {
        throw new Error('Demo generation failed. See server logs.');
      }

      const demoJson: GenerateDemoResponse = await generateResponse.json();
      setDemoResult(demoJson);
      setStep('done');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unexpected error occurred');
      setStep('insights');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-24 pt-12 text-slate-100">
      <div className="flex flex-col gap-6 border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/50">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
              Live personalized demo
            </p>
            <h1 className="text-3xl font-semibold text-white">Build a SmartLocal demo</h1>
            <p className="text-sm text-slate-300">
              Crawl a prospect site, generate Profit IQ insights, and preview the chatbot. For production loads, add your Supabase table + Pinecone keys.
            </p>
          </div>
          <button
            onClick={resetAndGoHome}
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-400/50 hover:bg-white/10 hover:text-white"
            type="button"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>New Demo</span>
          </button>
        </div>

        <form
          className="grid w-full gap-4 md:grid-cols-[2fr,1fr,auto]"
          onSubmit={(event) => {
            event.preventDefault();
            if (!siteUrl) {
              setError('Please enter a valid URL.');
              return;
            }
            getInsights(siteUrl, demoName || undefined);
          }}
        >
          <input
            value={siteUrl}
            onChange={(event) => setSiteUrl(event.target.value)}
            placeholder="https://prospect-website.com"
            className="h-12 rounded-full border border-white/10 bg-white/10 px-5 text-sm text-white placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none"
            disabled={step === 'insights' || step === 'done'}
          />
          <input
            value={demoName}
            onChange={(event) => setDemoName(event.target.value)}
            placeholder="Demo name (optional)"
            className="h-12 rounded-full border border-white/10 bg-white/10 px-5 text-sm text-white placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none"
            disabled={step === 'insights' || step === 'done'}
          />
          <button
            type="submit"
            disabled={isLoading || step === 'insights' || step === 'done'}
            className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-400/60"
          >
            {isLoading ? 'Processing…' : 'Get Insights'}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <span className="rounded-full bg-white/10 px-4 py-2">{progressText}</span>
          {error ? <span className="text-red-300">{error}</span> : null}
        </div>
      </div>

      {analyzeResult && insights && !demoResult ? (
        <section className="mt-10 space-y-6">
          {/* Generate Demo Button - Top */}
          <div className="flex justify-center">
            <button
              onClick={generateFullDemo}
              disabled={isLoading}
              className="rounded-full bg-linear-to-r from-emerald-400 to-teal-400 px-8 py-4 text-lg font-bold text-emerald-950 shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Generating Full Demo...' : '✨ Generate Full Demo'}
            </button>
          </div>

          {/* AI Insights Section */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/20">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Profit IQ Analysis</h2>
                <p className="text-sm text-slate-400">AI-powered insights for {demoName || siteUrl}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Main Profit IQ Insight */}
              <div className="rounded-xl bg-linear-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 p-6">
                <p className="text-base leading-relaxed text-white">{insights.profitIq}</p>
              </div>

              {/* Action Items */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-white">Recommended Actions</h3>
                <div className="space-y-3">
                  {insights.actions.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400 font-bold text-emerald-950">
                        {idx + 1}
                      </div>
                      <p className="text-sm leading-relaxed text-slate-200">{action}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Site Analysis Summary */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-6">
                <h3 className="mb-3 text-lg font-semibold text-white">Site Analysis</h3>
                <p className="mb-4 text-sm text-slate-300">{analyzeResult.summary}</p>
                {analyzeResult.keyItems && analyzeResult.keyItems.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-white">Key Items Identified:</p>
                    <div className="flex flex-wrap gap-2">
                      {analyzeResult.keyItems.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Generate Demo Button - Bottom */}
          <div className="flex justify-center">
            <button
              onClick={generateFullDemo}
              disabled={isLoading}
              className="rounded-full bg-linear-to-r from-emerald-400 to-teal-400 px-8 py-4 text-lg font-bold text-emerald-950 shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Generating Full Demo...' : '✨ Generate Full Demo'}
            </button>
          </div>

          <p className="text-center text-sm text-slate-400">
            Click "Generate Full Demo" to create homepage mockup, social posts, and blog content
          </p>
        </section>
      ) : null}

      {demoResult ? (
        <div className="mt-10">
          <DemoOverview
            demoId={demoResult.demoId}
            chatbotConfig={demoResult.chatbotConfig}
            insights={demoResult.insights}
            socialPosts={demoResult.socialPosts}
            homepage={demoResult.homepage}
            blogPost={demoResult.blogPost}
          />
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link
              href={`/demo/${demoResult.demoId}`}
              className="rounded-full bg-emerald-400 px-5 py-2 font-semibold text-emerald-950 hover:bg-emerald-300"
            >
              Open full preview
            </Link>
            <Link
              href={`/demo/${demoResult.demoId}?mode=present`}
              className="rounded-full border border-emerald-300 px-5 py-2 font-semibold text-emerald-200 hover:text-white"
            >
              Present mode
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

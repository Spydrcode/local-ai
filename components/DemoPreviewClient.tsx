'use client';

import type {
    DemoBlogPost,
    DemoChatbotConfig,
    DemoHomepageMock,
    DemoInsights,
    DemoSocialPost,
} from '@/types/demo';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import ChatWidget from './ChatWidget';
import DemoOverview from './DemoOverview';
import HomepageMockup from './HomepageMockup';

export interface DemoPreviewData {
  id: string;
  name: string;
  summary: string;
  brandColor?: string;
  siteUrl?: string;
  chatbotConfig: DemoChatbotConfig;
  insights: DemoInsights;
  socialPosts: DemoSocialPost[];
  homepage?: DemoHomepageMock;
  blogPost?: DemoBlogPost;
}

interface DemoPreviewClientProps {
  demo: DemoPreviewData;
  presentMode?: boolean;
}

const brandPresets = [
  { label: 'BBQ Heat', color: '#B22222', chatbotName: 'Pitmaster Ally' },
  { label: 'Morning Roast', color: '#FFB347', chatbotName: 'Sunny Barista' },
  { label: 'Service Pro', color: '#0057B7', chatbotName: 'Propane Specialist' },
];

export default function DemoPreviewClient({ demo, presentMode = false }: DemoPreviewClientProps) {
  const persona = demo.chatbotConfig.persona ?? 'SmartLocal Assistant';
  const [brandColor, setBrandColor] = useState(demo.brandColor ?? '#34d399');
  const [chatbotName, setChatbotName] = useState(() => persona.split(' ')[0] || 'SmartLocal Bot');
  const [subscribeState, setSubscribeState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL ?? 'http://localhost:3000';

  const embedSnippet = useMemo(() => {
    const params = new URLSearchParams({
      mode: 'present',
      brandColor,
      chatbot: chatbotName,
    });
    return `<iframe src="${vercelUrl}/demo/${demo.id}?${params.toString()}" style="width:100%;height:620px;border:0;border-radius:18px" allow="clipboard-write"></iframe>`;
  }, [demo.id, vercelUrl, brandColor, chatbotName]);

  async function triggerCheckout() {
    try {
      setSubscribeState('loading');
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoId: demo.id }),
      });

      if (!response.ok) {
        throw new Error('Checkout failed');
      }

      const payload = (await response.json()) as { url: string };
      setSubscribeState('success');
      window.location.href = payload.url;
    } catch (err) {
      console.error(err);
      setSubscribeState('error');
    }
  }

  if (presentMode) {
    return (
      <div className="flex min-h-screen flex-col gap-4 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-3 md:gap-8 md:px-6 md:py-10">
        {/* Header */}
        <header
          className="rounded-2xl px-4 py-4 text-white shadow-2xl md:rounded-3xl md:px-8 md:py-6"
          style={{ backgroundColor: brandColor }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/70 md:text-sm">AI-Generated Demo</p>
              <h1 className="text-2xl font-bold md:text-4xl">{demo.name}</h1>
              <p className="mt-1 text-xs text-white/80 md:text-sm">Powered by LocalIQ SmartLocal · {chatbotName}</p>
            </div>
            <div className="rounded-full bg-white/15 px-4 py-2 text-xs text-white/90 md:text-sm">
              <span className="truncate">{demo.siteUrl ?? 'prospect site'}</span>
            </div>
          </div>
        </header>

        {/* Full Homepage Mockup */}
        {demo.homepage ? (
          <div className="space-y-3 md:space-y-4">
            <div className="flex flex-col gap-2 px-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-bold text-white md:text-2xl">
                <span className="text-emerald-400">✨</span> AI-Generated Homepage Redesign
              </h2>
              <span className="inline-flex w-fit rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 md:px-4 md:py-2 md:text-sm">
                Live Preview
              </span>
            </div>
            <HomepageMockup
              homepage={demo.homepage}
              insights={demo.insights}
              businessName={demo.name}
              brandColor={brandColor}
            />
          </div>
        ) : null}

        {/* Interactive Features Grid */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {/* AI Chatbot Widget */}
          <div className="rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-white/10 p-4 shadow-xl backdrop-blur-sm md:rounded-3xl md:p-6">
            <div className="mb-3 flex items-center justify-between md:mb-4">
              <h2 className="text-base font-semibold text-white md:text-xl">AI Chatbot Assistant</h2>
              <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-semibold text-green-300 md:px-3">
                Live
              </span>
            </div>
            <ChatWidget 
              demoId={demo.id} 
              sessionId="present" 
              title={`${chatbotName} Assistant`} 
              accentColor={brandColor} 
            />
          </div>

          {/* Social Media Content */}
          {demo.socialPosts && demo.socialPosts.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-white/10 p-4 shadow-xl backdrop-blur-sm md:rounded-3xl md:p-6">
              <h2 className="mb-3 text-base font-semibold text-white md:mb-4 md:text-xl">Social Media Campaign</h2>
              <div className="space-y-3">
                {demo.socialPosts.slice(0, 3).map((post, idx) => (
                  <div key={idx} className="rounded-xl border border-white/20 bg-black/40 p-4 backdrop-blur-sm md:rounded-2xl md:p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xl md:text-2xl">
                        {post.platform === 'Facebook' ? '📘' : post.platform === 'Instagram' ? '📸' : '💼'}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                        {post.platform}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-200">{post.copy}</p>
                    <div className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 md:mt-3 md:px-4">
                      {post.cta}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Blog Content Preview */}
        {demo.blogPost ? (
          <div className="rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-white/10 p-5 shadow-xl backdrop-blur-sm md:rounded-3xl md:p-8">
            <h2 className="mb-4 text-lg font-semibold text-white md:mb-6 md:text-2xl">SEO Blog Content</h2>
            <div className="space-y-4 md:space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white md:text-3xl">{demo.blogPost.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-slate-300 md:mt-3 md:text-lg">{demo.blogPost.excerpt}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {demo.blogPost.suggestedTags.slice(0, 6).map((tag) => (
                  <span key={tag} className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 md:px-4 md:py-1.5 md:text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 md:mb-3 md:text-sm">Article Outline</p>
                <div className="space-y-2">
                  {demo.blogPost.outline.slice(0, 5).map((line, idx) => (
                    <div key={idx} className="flex items-start gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 md:gap-3 md:rounded-xl md:px-4 md:py-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-300 md:h-6 md:w-6">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-200">{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex flex-wrap items-center gap-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Demo preview</p>
            <h1 className="text-3xl font-semibold text-white">{demo.name}</h1>
            <p className="text-sm text-slate-300">{demo.summary}</p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-slate-200">
              <span>Switch brand:</span>
              {brandPresets.map((preset) => (
                <button
                  key={preset.label}
                  className="h-6 w-6 rounded-full border border-white/20"
                  style={{ backgroundColor: preset.color, opacity: preset.color === brandColor ? 1 : 0.7 }}
                  onClick={() => {
                    setBrandColor(preset.color);
                    setChatbotName(preset.chatbotName);
                  }}
                  title={preset.label}
                  type="button"
                />
              ))}
              <input
                value={brandColor}
                onChange={(event) => setBrandColor(event.target.value)}
                type="color"
                className="h-6 w-10 rounded border border-white/10 bg-transparent"
                aria-label="Custom brand color"
              />
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-slate-200">
              <span>Chatbot name</span>
              <input
                value={chatbotName}
                onChange={(event) => setChatbotName(event.target.value)}
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white focus:outline-none"
              />
            </div>
            <button
              onClick={triggerCheckout}
              className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-300"
              type="button"
            >
              {subscribeState === 'loading' ? 'Loading…' : 'Save as client'}
            </button>
            {subscribeState === 'error' ? (
              <span className="text-xs text-red-300">Unable to reach Stripe. Double-check API keys.</span>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
        <ChatWidget demoId={demo.id} title={`${chatbotName} Assistant`} accentColor={brandColor} />
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Embed widget</p>
            <p className="mt-2 text-sm">Paste this snippet into any CMS or website builder.</p>
            <textarea
              value={embedSnippet}
              readOnly
              className="mt-3 h-40 w-full rounded-2xl bg-black/50 p-3 text-xs text-emerald-200"
            />
            <p className="mt-2 text-xs text-slate-500">
              Update `NEXT_PUBLIC_VERCEL_URL` to reflect your production domain before sharing.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Need sample data?</p>
            <p className="mt-2">
              Load presets from <code className="rounded bg-black/50 px-2 py-1">seed/sample-demos.json</code> or trigger `/api/generate-demo` for live content.
            </p>
            <Link href="/demo" className="mt-3 inline-flex text-emerald-200 underline-offset-2 hover:text-white hover:underline">
              Back to demo builder
            </Link>
          </div>
        </div>
      </div>

      <DemoOverview
        demoId={demo.id}
        chatbotConfig={demo.chatbotConfig}
        insights={demo.insights}
        socialPosts={demo.socialPosts}
        homepage={demo.homepage}
        blogPost={demo.blogPost}
      />
    </div>
  );
}

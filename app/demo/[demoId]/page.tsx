import type {
    DemoBlogPost,
    DemoChatbotConfig,
    DemoHomepageMock,
    DemoInsights,
    DemoSocialPost,
} from '@/types/demo';
import { notFound } from 'next/navigation';
import DemoPreviewClient, { DemoPreviewData } from '../../../components/DemoPreviewClient';
import sampleDemos from '../../../seed/sample-demos.json';
import { getDemoFromCache } from '../../../server/demoCache';
import { supabaseAdmin } from '../../../server/supabaseAdmin';

function deriveName(preferred?: string | null, url?: string | null, fallbackId?: string) {
  if (preferred && preferred.trim().length > 0) {
    return preferred.trim();
  }

  if (url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  return fallbackId ?? 'LocalIQ Demo';
}

function normalizePreview(source: {
  id: string;
  name?: string | null;
  clientId?: string | null;
  summary?: string | null;
  brandColor?: string | null;
  siteUrl?: string | null;
  chatbotConfig?: DemoChatbotConfig | null;
  insights?: DemoInsights | null;
  socialPosts?: DemoSocialPost[] | null;
  homepage?: DemoHomepageMock | null;
  blogPost?: DemoBlogPost | null;
}): DemoPreviewData {
  return {
    id: source.id,
    name: deriveName(source.name ?? source.clientId ?? undefined, source.siteUrl, source.id),
    summary: source.summary ?? '',
    brandColor: source.brandColor ?? undefined,
    siteUrl: source.siteUrl ?? undefined,
    chatbotConfig:
      source.chatbotConfig ??
      ({
        persona: 'LocalIQ assistant',
        faq: [],
      } satisfies DemoChatbotConfig),
    insights:
      source.insights ??
      ({
        profitIq: 'No insights available yet.',
        actions: [],
      } satisfies DemoInsights),
    socialPosts: Array.isArray(source.socialPosts) ? source.socialPosts : [],
    homepage: source.homepage ?? undefined,
    blogPost: source.blogPost ?? undefined,
  };
}

async function fetchDemo(demoId: string): Promise<DemoPreviewData | null> {
  console.log('[fetchDemo] Looking for demoId:', demoId);
  const cached = getDemoFromCache(demoId);
  console.log('[fetchDemo] Cache hit:', cached ? 'YES' : 'NO');
  if (cached) {
    console.log('[fetchDemo] Using cached demo:', cached.clientId, cached.url);
    return normalizePreview({
      id: cached.id,
      clientId: cached.clientId,
      summary: cached.summary,
      siteUrl: cached.url,
      chatbotConfig: cached.chatbotConfig,
      insights: cached.insights,
      socialPosts: cached.socialPosts,
      homepage: cached.homepage,
      blogPost: cached.blogPost,
    });
  }

  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('demos')
      .select(
        'id, client_id, summary, brand_color, site_url, chatbot_config, insights, social_posts, homepage_blueprint, blog_post'
      )
      .eq('id', demoId)
      .maybeSingle();

    if (error) {
      const missingTable = error.message?.includes('Could not find the table') ?? false;
      if (missingTable) {
        console.info('Supabase demos table not found; defaulting to cache/seed data.');
      } else {
        console.error('Supabase demo fetch failed', error.message);
      }
    }

    if (data) {
      return normalizePreview({
        id: data.id as string,
        name: null,
        clientId: (data.client_id as string) ?? null,
        summary: (data.summary as string) ?? '',
        brandColor: (data.brand_color as string) ?? undefined,
        siteUrl: (data.site_url as string) ?? undefined,
        chatbotConfig: (data.chatbot_config as DemoChatbotConfig) ?? null,
        insights: (data.insights as DemoInsights) ?? null,
        socialPosts: (data.social_posts as DemoSocialPost[]) ?? null,
        homepage: (data.homepage_blueprint as DemoHomepageMock) ?? null,
        blogPost: (data.blog_post as DemoBlogPost) ?? null,
      });
    }
  }

  const fallback = (sampleDemos as Array<DemoPreviewData & { posts?: DemoSocialPost[] }>).find(
    (demo) => demo.id === demoId
  );

  if (!fallback) {
    return null;
  }

  return normalizePreview({
    id: fallback.id,
    name: fallback.name,
    clientId: fallback.name,
    summary: fallback.summary,
    brandColor: fallback.brandColor,
    siteUrl: fallback.siteUrl,
    chatbotConfig: fallback.chatbotConfig,
    insights: fallback.insights,
    socialPosts: fallback.socialPosts ?? fallback.posts ?? [],
    homepage: fallback.homepage ?? null,
    blogPost: fallback.blogPost ?? null,
  });
}

interface DemoPageProps {
  params: Promise<{ demoId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DemoPage({ params, searchParams }: DemoPageProps) {
  const { demoId } = await params;
  const demo = await fetchDemo(demoId);

  if (!demo) {
    notFound();
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const presentMode = resolvedSearchParams?.mode === 'present';

  if (typeof resolvedSearchParams?.brandColor === 'string') {
    demo.brandColor = String(resolvedSearchParams.brandColor);
  }

  if (typeof resolvedSearchParams?.chatbot === 'string') {
    demo.chatbotConfig.persona = String(resolvedSearchParams.chatbot);
  }

  return <DemoPreviewClient demo={demo} presentMode={presentMode} />;
}

import SocialPostCard from "@/components/SocialPostCard";
import WebsiteDesignGallery from "@/components/WebsiteDesignGallery";
import type {
    DemoBlogPost,
    DemoChatbotConfig,
    DemoHomepageMock,
    DemoInsights,
    DemoSocialPost,
} from "@/types/demo";

interface DemoOverviewProps {
  demoId: string;
  chatbotConfig: DemoChatbotConfig;
  insights: DemoInsights;
  socialPosts?: DemoSocialPost[];
  homepage?: DemoHomepageMock;
  blogPost?: DemoBlogPost;
}

export default function DemoOverview({
  demoId,
  chatbotConfig,
  insights,
  socialPosts,
  homepage,
  blogPost,
}: DemoOverviewProps) {
  const postsToRender = socialPosts && socialPosts.length > 0 ? socialPosts : [];

  return (
    <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 md:grid-cols-[2fr,3fr]">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-300">Demo #{demoId}</p>
          <h2 className="text-2xl font-semibold text-white">Profit IQ summary</h2>
          <p className="mt-2 text-sm text-slate-300">{insights.profitIq}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Top actions</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-200">
            {(insights.actions ?? []).map((action) => (
              <li key={action} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Chatbot persona</p>
          <p className="text-sm text-slate-300">{chatbotConfig.persona}</p>
          <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-200">
            {(chatbotConfig.faq ?? []).map((faq) => (
              <div key={faq.question}>
                <p className="font-semibold text-white">Q: {faq.question}</p>
                <p>A: {faq.answer}</p>
              </div>
            ))}
            {chatbotConfig.faq?.length ? null : (
              <p className="text-sm text-slate-500">No FAQs generated yet.</p>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {/* Website Design Gallery */}
        <div>
          <p className="text-sm font-semibold text-white mb-3">Professional Website Designs</p>
          <WebsiteDesignGallery demoId={demoId} />
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Social post ideas</p>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {postsToRender.length > 0 ? (
              postsToRender.map((post) => (
                <SocialPostCard key={`${post.platform}-${post.copy.slice(0, 12)}`} post={post} />
              ))
            ) : (
              <p className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-500">
                No social posts generated for this demo.
              </p>
            )}
          </div>
        </div>

        {homepage ? (
          <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/50 p-5">
            <div>
              <p className="text-sm font-semibold text-white">Homepage blueprint</p>
              <p className="text-xs uppercase tracking-widest text-slate-500">Hero concept</p>
              <h3 className="mt-1 text-lg font-semibold text-white">{homepage.hero.headline}</h3>
              <p className="text-sm text-slate-300">{homepage.hero.subheadline}</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-emerald-200">
                <span>{homepage.hero.ctaLabel}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                <span>{homepage.style.tone}</span>
              </div>
            </div>
            <div className="grid gap-2 text-sm text-slate-200 md:grid-cols-2">
              {homepage.sections.slice(0, 4).map((section) => (
                <div key={`${section.title}-${section.body.slice(0, 12)}`} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm font-semibold text-white">{section.title}</p>
                  <p className="mt-1 text-sm text-slate-300">{section.body}</p>
                  {section.ctaLabel ? (
                    <p className="mt-2 text-xs uppercase tracking-wide text-emerald-200">CTA: {section.ctaLabel}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {blogPost ? (
          <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/50 p-5">
            <p className="text-sm font-semibold text-white">Blog post draft</p>
            <h3 className="text-lg font-semibold text-white">{blogPost.title}</h3>
            <p className="text-sm text-slate-300">{blogPost.excerpt}</p>
            <div className="flex flex-wrap gap-2 text-xs text-emerald-200">
              {blogPost.suggestedTags.map((tag) => (
                <span key={tag} className="rounded-full border border-emerald-500/40 px-3 py-1">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              {blogPost.outline.slice(0, 5).map((line) => (
                <p key={line} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

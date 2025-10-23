interface SocialPostCardProps {
  post: {
    platform: string;
    copy: string;
    cta: string;
  };
}

export default function SocialPostCard({ post }: SocialPostCardProps) {
  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">{post.platform}</p>
        <p className="text-sm text-white">{post.copy}</p>
      </div>
      <p className="mt-4 text-xs font-semibold text-emerald-200">CTA: {post.cta}</p>
    </article>
  );
}

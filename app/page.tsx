export default function Home() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-950">
  <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.12),transparent_55%)]" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-lg font-semibold text-emerald-300">
            LQ
          </span>
          <div>
            <p className="text-2xl font-semibold text-white">LocalIQ</p>
            <p className="text-sm text-slate-400">SmartLocal demo engine</p>
          </div>
        </div>
        <nav className="hidden gap-8 text-sm text-slate-300 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#workflow" className="hover:text-white">Workflow</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
        </nav>
        <a
          href="/demo"
          className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400/20"
        >
          Launch demo
        </a>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-24">
        <section className="grid gap-10 md:grid-cols-[3fr,2fr] md:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-widest text-slate-300 ring-1 ring-white/10">
              Built for local sales teams
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Personalize every local pitch with AI-generated demos in minutes.
            </h1>
            <p className="text-lg text-slate-300">
              Paste a prospect URL, and LocalIQ crawls the site, generates Profit IQ insights, and spins up a branded chatbot ready to present or embed. No data science team required.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-300"
                href="/demo"
              >
                Try the live demo flow
              </a>
              <a
                className="rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                href="#workflow"
              >
                See how it works
              </a>
            </div>
            <dl className="grid gap-6 text-sm text-slate-300 sm:grid-cols-3">
              <div>
                <dt className="font-semibold text-white">Site → Demo in</dt>
                <dd>under 3 minutes</dd>
              </div>
              <div>
                <dt className="font-semibold text-white">Ready for</dt>
                <dd>tablet & live pitch</dd>
              </div>
              <div>
                <dt className="font-semibold text-white">Managed via</dt>
                <dd>Supabase + Stripe</dd>
              </div>
            </dl>
          </div>
          <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-emerald-950/30">
            <div className="space-y-4 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-wide text-emerald-300">Demo Preview</p>
              <div className="rounded-xl bg-slate-900/70 p-4">
                <p className="text-xs font-semibold text-slate-400">Profit IQ Spotlight</p>
                <p className="mt-2 text-base text-white">
                  "Lunch rush is up 12%. Launch a Tuesday loyalty flash to keep momentum."
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-900/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Chatbot</p>
                <p className="mt-2 text-sm text-slate-200">
                  <span className="text-emerald-300">LocalIQ:</span> We recommend featuring online ordering above the fold and offering a Thursday bundle for Joe's BBQ regulars.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 md:grid-cols-3">
          {[
            {
              title: "Smart crawl",
              description: "Parse headings, menus, CTAs, and contact info from any local business site for instant personalization.",
            },
            {
              title: "Profit IQ",
              description: "Blend site copy with optional CSV data to surface opportunities and weekly wins.",
            },
            {
              title: "Sales-ready",
              description: "Present mode, brand switches, and embeddable chat widget let reps wow prospects instantly.",
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-2xl bg-slate-950/60 p-6">
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm text-slate-300">{feature.description}</p>
            </div>
          ))}
        </section>

        <section id="workflow" className="grid gap-10 md:grid-cols-2">
          <div className="space-y-5">
            <h2 className="text-3xl font-semibold text-white">Workflow in three steps</h2>
            <p className="text-slate-300">
              LocalIQ automates the grunt work so your team can focus on the close. APIs stay behind secure serverless routes with Supabase JWT protection.
            </p>
          </div>
          <ol className="space-y-6 text-sm text-slate-200">
            <li className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">01 Crawl</p>
              <p className="mt-1 text-base text-white">Paste the prospect URL.</p>
              <p className="mt-1 text-slate-300">`/api/analyze-site` fetches HTML, extracts structured insights, and stores embeddings.</p>
            </li>
            <li className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">02 Generate</p>
              <p className="mt-1 text-base text-white">Auto-build Profit IQ + social posts.</p>
              <p className="mt-1 text-slate-300">`/api/generate-demo` crafts insights with OpenAI or Hugging Face fallback.</p>
            </li>
            <li className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">03 Present</p>
              <p className="mt-1 text-base text-white">Share the live chatbot + insights.</p>
              <p className="mt-1 text-slate-300">Switch brand colors, launch Present Mode, or embed the widget on-site.</p>
            </li>
          </ol>
        </section>

        <section id="pricing" className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-10">
          <h2 className="text-3xl font-semibold text-white">Pricing</h2>
          <p className="mt-3 max-w-lg text-slate-100">
            Launch with a single SmartLocal seat. Upgrade inside the dashboard once Stripe subscription webhooks are connected.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-[2fr,3fr] md:items-end">
            <div className="rounded-2xl bg-slate-950/70 p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Starter</p>
              <p className="mt-2 text-4xl font-bold text-white">$149<span className="text-base font-medium text-slate-300">/month</span></p>
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                <li>Unlimited demo crawls</li>
                <li>Embeddable chatbot widget</li>
                <li>Weekly Profit IQ email summary</li>
              </ul>
              <a
                href="/demo"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-slate-200"
              >
                Start free demo
              </a>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/5 p-6 text-sm text-slate-200">
              <p className="font-semibold text-white">Need custom rollout?</p>
              <p className="mt-2">Hook into Supabase or Pinecone vectors, bring your own prompts, or white-label the Present Mode.</p>
              <a
                href="mailto:partners@localiq.ai"
                className="mt-4 inline-flex text-emerald-200 underline-offset-2 hover:text-white hover:underline"
              >
                partners@localiq.ai
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

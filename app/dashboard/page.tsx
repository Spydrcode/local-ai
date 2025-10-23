import Link from "next/link";
import sampleDemos from "../../seed/sample-demos.json";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-16 text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Dashboard</p>
          <h1 className="text-3xl font-semibold text-white">Your LocalIQ workspace</h1>
          <p className="text-sm text-slate-300">
            Hook this page into Supabase auth + subscription status. See `server/auth.ts` for JWT guard helpers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/demo"
            className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-300"
          >
            Launch new demo
          </Link>
          <button className="rounded-full border border-white/15 px-5 py-2 text-sm text-slate-200">
            Manage billing
          </button>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {(sampleDemos as Array<{ id: string; name: string; summary: string }>).map((demo) => (
          <Link
            key={demo.id}
            href={`/demo/${demo.id}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 transition hover:border-emerald-300"
          >
            <p className="text-xs uppercase tracking-wide text-emerald-200">Demo</p>
            <h2 className="mt-2 text-lg font-semibold text-white">{demo.name}</h2>
            <p className="mt-2 text-sm text-slate-300">{demo.summary}</p>
            <span className="mt-4 inline-flex text-emerald-300">Open →</span>
          </Link>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
        <h2 className="text-lg font-semibold text-white">Integrations</h2>
        <ul className="mt-3 space-y-2">
          <li>Supabase auth + Postgres. Update `server/supabaseAdmin.ts` to ensure service role key is set server-side only.</li>
          <li>Stripe subscriptions via `/api/subscribe`. Wire webhook to mark subscriptions active.</li>
          <li>Optional SendGrid weekly insight digest in `server/email.ts`.</li>
        </ul>
      </section>
    </div>
  );
}

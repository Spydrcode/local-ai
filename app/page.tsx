"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"

const marketingChallenges = [
  {
    icon: "🎯",
    challenge: "Don't know where to start with marketing?",
    solution: "Get AI-powered strategy tailored to your business in 2 minutes",
  },
  {
    icon: "🔍",
    challenge: "Struggling with SEO and online visibility?",
    solution: "Get a 90-day SEO roadmap with specific actions to rank higher",
  },
  {
    icon: "📱",
    challenge: "Running out of content ideas?",
    solution: "Generate 30 days of platform-specific content instantly",
  },
  {
    icon: "🏆",
    challenge: "Competitors beating you online?",
    solution: "Discover what they're doing and how to differentiate",
  },
]

const aiCapabilities = [
  {
    icon: "🤖",
    title: "19 AI Marketing Workflows",
    description: "Specialized workflows for SEO, content, social media, brand voice, competitors, and more",
    features: ["Marketing Intelligence", "SEO Strategy", "Content Calendar", "Brand Voice Analysis"],
  },
  {
    icon: "🎓",
    title: "Harvard & Strategic Frameworks",
    description: "World-class strategies from HBS professors and proven business frameworks",
    features: ["Jobs-to-be-Done", "Blue Ocean Strategy", "BCG Matrix", "Ansoff Growth Matrix", "OKR Framework"],
  },
  {
    icon: "📊",
    title: "Modern ML Practices",
    description: "Cutting-edge machine learning for personalization and optimization",
    features: ["AI Personalization", "Attribution Modeling", "Marketing Mix Optimization", "Predictive Analytics"],
  },
]

const workflows = [
  {
    id: "full-marketing-strategy",
    icon: "🎯",
    name: "Full Marketing Strategy",
    description: "Comprehensive analysis with SEO, content, social, brand, and competitor insights",
    time: "~2 min",
    bestFor: "Complete marketing overhaul",
  },
  {
    id: "quick-analysis",
    icon: "⚡",
    name: "Quick Wins",
    description: "Fast audit with immediate actionable improvements you can implement today",
    time: "~30 sec",
    bestFor: "Quick improvements",
  },
  {
    id: "seo-strategy",
    icon: "🔍",
    name: "SEO Strategy",
    description: "90-day SEO roadmap with keyword research, technical fixes, and content plan",
    time: "~1 min",
    bestFor: "Improving Google rankings",
  },
  {
    id: "content-strategy",
    icon: "📝",
    name: "Content Strategy",
    description: "30-day multi-channel content calendar with platform-specific posts",
    time: "~1 min",
    bestFor: "Content planning",
  },
  {
    id: "social-media-strategy",
    icon: "📱",
    name: "Social Media Strategy",
    description: "Platform-specific strategies for Instagram, Facebook, LinkedIn, TikTok, and more",
    time: "~1 min",
    bestFor: "Growing social presence",
  },
  {
    id: "brand-analysis",
    icon: "🎨",
    name: "Brand Voice",
    description: "Define your brand voice, archetype, and messaging framework",
    time: "~45 sec",
    bestFor: "Brand consistency",
  },
]

export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [selectedWorkflow, setSelectedWorkflow] = useState("full-marketing-strategy")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!websiteUrl) {
      setError("Please enter your website URL")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      // Store selection and redirect to marketing hub
      sessionStorage.setItem('marketingRequest', JSON.stringify({
        website: websiteUrl,
        workflow: selectedWorkflow,
        timestamp: new Date().toISOString()
      }))

      router.push("/grow")
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-white">Local AI</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/grow" className="text-sm font-medium text-slate-300 hover:text-white">Marketing Hub</Link>
              <Link href="/demo" className="text-sm font-medium text-slate-300 hover:text-white">Strategic Frameworks</Link>
              <Link href="/pricing" className="text-sm font-medium text-slate-300 hover:text-white">Pricing</Link>
              <Link href="/agency/dashboard" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">Agency Portal</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 via-slate-950 to-slate-950" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Powered by 19 AI Workflows + Harvard & Strategic Frameworks
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              AI Marketing Strategy
              <span className="bg-linear-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent"> Platform</span>
            </h1>

            <p className="mb-10 text-xl leading-relaxed text-slate-300 sm:text-2xl">
              Get world-class marketing intelligence in minutes. Powered by Harvard Business School frameworks and modern AI.
            </p>

            <form onSubmit={handleAnalyze} className="mx-auto mb-8 max-w-2xl">
              <div className="mb-4">
                <Input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => { setWebsiteUrl(e.target.value); setError("") }}
                  placeholder="Enter your website URL (e.g., yourbusiness.com)"
                  className="h-14 text-base text-center"
                  required
                  disabled={isAnalyzing}
                />
              </div>

              {/* Workflow Selection */}
              <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {workflows.slice(0, 6).map((workflow) => (
                  <button
                    key={workflow.id}
                    type="button"
                    onClick={() => setSelectedWorkflow(workflow.id)}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      selectedWorkflow === workflow.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-2xl">{workflow.icon}</span>
                      <span className="text-xs text-slate-400">{workflow.time}</span>
                    </div>
                    <div className="text-sm font-medium text-white">{workflow.name}</div>
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-4 rounded-md border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
              )}

              <Button
                type="submit"
                disabled={isAnalyzing}
                size="lg"
                className="h-14 w-full text-lg bg-emerald-500 hover:bg-emerald-600 sm:w-auto sm:px-16"
              >
                {isAnalyzing ? "Processing..." : "Generate Marketing Strategy"}
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free analysis
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Results in 30s - 2min
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No signup required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketing Challenges Section */}
      <section className="border-t border-white/10 bg-slate-900/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-white">Marketing Challenges We Solve</h2>
            <p className="text-slate-400">AI-powered solutions for small business marketing</p>
          </div>

          <div className="mx-auto max-w-4xl grid gap-6 sm:grid-cols-2">
            {marketingChallenges.map((item, idx) => (
              <Card key={idx} className="p-6 bg-slate-900/50 border-slate-700 hover:border-emerald-500/50 transition-all">
                <div className="flex gap-4">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{item.challenge}</h3>
                    <p className="text-slate-400">{item.solution}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-4xl font-bold text-white">Powered by Advanced AI</h2>
            <p className="text-xl text-slate-400">The most sophisticated marketing intelligence platform for small businesses</p>
          </div>

          <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-3">
            {aiCapabilities.map((capability, idx) => (
              <Card key={idx} className="p-8 bg-slate-900/50 border-slate-700 hover:border-emerald-500/50 transition-all">
                <div className="text-5xl mb-4">{capability.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{capability.title}</h3>
                <p className="text-slate-400 mb-6">{capability.description}</p>
                <div className="space-y-2">
                  {capability.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-sm text-slate-300">
                      <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Details Section */}
      <section className="border-t border-white/10 bg-slate-900/30 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-4xl font-bold text-white">Choose Your Analysis Type</h2>
            <p className="text-xl text-slate-400">From quick wins to comprehensive strategies</p>
          </div>

          <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="p-6 bg-slate-900/50 border-slate-700 hover:border-emerald-500/50 transition-all">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-4xl">{workflow.icon}</span>
                  <span className="text-xs rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-emerald-400">
                    {workflow.time}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{workflow.name}</h3>
                <p className="text-sm text-slate-400 mb-3">{workflow.description}</p>
                <div className="text-xs text-slate-500">
                  <span className="font-medium text-emerald-400">Best for:</span> {workflow.bestFor}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="mb-3 text-4xl font-bold text-white">What You Get</h2>
              <p className="text-xl text-slate-400">Comprehensive marketing intelligence</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Card className="p-8 bg-linear-to-br from-emerald-900/20 to-slate-900/50 border-emerald-500/30">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>📊</span>
                  Marketing Intelligence
                </h3>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Brand voice analysis and messaging framework</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>SEO audit with technical fixes and keyword opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Content strategy with platform-specific recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Social media presence analysis and growth tactics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Competitor marketing analysis and differentiation opportunities</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8 bg-linear-to-br from-blue-900/20 to-slate-900/50 border-blue-500/30">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  Actionable Strategy
                </h3>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Specific recommendations (not generic advice)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Step-by-step next actions to implement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>90-day roadmap with prioritized tasks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Expected impact and timeline for each action</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>AI chat assistant for follow-up questions</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/10 bg-linear-to-b from-emerald-900/20 via-slate-900 to-slate-950 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">Ready to Transform Your Marketing?</h2>
          <p className="mb-8 text-xl text-slate-300">Get world-class strategy in minutes, not months.</p>
          <Button
            size="lg"
            className="h-16 px-16 text-lg bg-emerald-500 hover:bg-emerald-600"
            onClick={() => document.querySelector('input')?.focus()}
          >
            Start Free Analysis Now
          </Button>
          <p className="mt-4 text-sm text-slate-400">No credit card required • Instant results</p>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-semibold text-white">Local AI</span>
            </div>
            <p className="text-sm text-slate-500">© 2025 Local AI. AI-Powered Marketing Strategy Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

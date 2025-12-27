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
    title: "19 AI Marketing Tools",
    description: "Automated tools for SEO, content creation, social media, and competitive analysis",
    features: ["Get More Customers Online", "Rank Higher on Google", "30-Day Content Calendar", "Stand Out From Competitors"],
  },
  {
    icon: "🎓",
    title: "Expert Business Strategies",
    description: "Proven growth strategies used by successful businesses worldwide",
    features: ["Find What Customers Really Want", "Discover Untapped Markets", "Smart Growth Planning", "Set Clear Business Goals"],
  },
  {
    icon: "📊",
    title: "Smart Recommendations",
    description: "AI analyzes your business and creates personalized marketing plans",
    features: ["Custom Strategy for Your Business", "Track What's Working", "Optimize Your Marketing Budget", "Predict Future Trends"],
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
  const [businessName, setBusinessName] = useState("")
  const [industry, setIndustry] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleContractorSetup = async () => {
    try {
      // Redirect directly to contractor onboarding
      // No need to create a demo entry - that pollutes the agency client list
      router.push('/contractor/onboard');
    } catch (err: any) {
      console.error('Error setting up contractor:', err);
      setError(err.message || 'Failed to start contractor setup. Please try again.');
    }
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate URL
    if (!websiteUrl.trim()) {
      setError("Please enter your website URL")
      return
    }

    // Add https:// if missing
    let url = websiteUrl.trim()
    if (!url.match(/^https?:\/\//)) {
      url = 'https://' + url
      setWebsiteUrl(url)
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      setError("Please enter a valid website URL (e.g., yourbusiness.com)")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      console.log("[Homepage] Starting website intelligence scan for:", websiteUrl)
      
      // Call WebScraperAgent API for comprehensive analysis
      const response = await fetch('/api/web-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url, // Use validated URL
          mode: 'comprehensive', // Full intelligence extraction
          paths: ["/", "/about", "/services", "/pricing", "/contact"]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to analyze website')
      }

      const { data, duration } = await response.json()

      console.log(`[Homepage] Intelligence scan completed in ${duration}ms`)
      console.log("[Homepage] Data collected:", {
        business: !!data.business,
        competitors: data.competitors?.length || 0,
        seo: !!data.seo,
        social: !!data.social,
        reviews: data.reviews?.totalReviews || 0,
        brandAnalysis: !!data.brandAnalysis,
        contentAnalysis: !!data.contentAnalysis
      })

      // Create compact version for sessionStorage (avoid quota exceeded)
      const compactData = {
        business: data.business,
        brandAnalysis: data.brandAnalysis,
        seo: data.seo ? {
          title: data.seo.title,
          metaDescription: data.seo.metaDescription,
          keywords: data.seo.keywords?.slice(0, 10) // Limit keywords
        } : undefined,
        social: data.social,
        reviews: data.reviews ? {
          totalReviews: data.reviews.totalReviews,
          averageRating: data.reviews.averageRating,
          highlights: data.reviews.highlights?.slice(0, 3) // Limit highlights
        } : undefined,
        competitors: data.competitors?.slice(0, 5).map((c: any) => ({ // Limit to top 5 competitors
          name: c.name,
          url: c.url,
          differentiators: c.differentiators?.slice(0, 3)
        })),
        userProvidedName: businessName || undefined,
        userProvidedIndustry: industry || undefined,
        scrapedAt: new Date().toISOString(),
        source: 'web-scraper-agent',
        metadata: {
          url: websiteUrl
        }
      }

      try {
        // Store compact data in sessionStorage
        sessionStorage.setItem('websiteIntelligence', JSON.stringify(compactData))
        sessionStorage.setItem('marketingAnalysis', JSON.stringify(compactData))
        sessionStorage.setItem('lastAnalyzedUrl', websiteUrl)

        console.log("[Homepage] Compact intelligence data stored in sessionStorage")
      } catch (storageError) {
        console.warn("[Homepage] SessionStorage quota exceeded, storing minimal data only")
        // Store absolute minimum if still failing
        sessionStorage.setItem('lastAnalyzedUrl', websiteUrl)
        sessionStorage.setItem('businessName', data.business?.name || '')
      }

      console.log("[Homepage] Redirecting to dashboard")

      // Redirect to dashboard with all tools
      router.push("/dashboard")
    } catch (err: any) {
      console.error("[Homepage] Analysis failed:", err)
      setError(err.message || "Failed to analyze website. Please check the URL and try again.")
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
              <span className="text-xl font-semibold text-white">2ndmynd</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white">Dashboard</Link>
              <Link href="/clarity-snapshot" className="text-sm font-medium text-cyan-400 hover:text-cyan-300">✨ Free Clarity Snapshot</Link>
              <Link href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white">How It Works</Link>
              <Link href="/agency" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">Agency Portal</Link>
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
              Powered by 19 AI Tools + Expert Business Strategies
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              Get Instant Clarity
              <span className="bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> on Your Business</span>
            </h1>

            <p className="mb-10 text-xl leading-relaxed text-slate-300 sm:text-2xl">
              Know exactly what's working and what to fix first — in 30 seconds.
            </p>

            <div className="mb-8">
              <Link href="/clarity-snapshot">
                <Button
                  size="lg"
                  className="h-16 px-12 text-xl bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/25"
                >
                  ✨ Get Your Free Clarity Snapshot
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No email required
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Results in 30 seconds
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Free forever
              </div>
            </div>

            <p className="mt-8 text-slate-500 text-sm">
              Need comprehensive marketing strategy? 
              <button
                onClick={() => document.getElementById('full-platform')?.scrollIntoView({ behavior: 'smooth' })}
                className="ml-2 text-emerald-400 hover:text-emerald-300 underline"
              >
                Explore full platform →
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* Clarity Snapshot Secondary CTA - Removed, now primary above */}

      {/* Full Platform Section */}
      <section id="full-platform" className="border-t border-white/10 bg-slate-900/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Full AI Marketing Platform
            </div>
            <h2 className="mb-3 text-3xl font-bold text-white">Need More Than Quick Insights?</h2>
            <p className="text-slate-400">Get comprehensive marketing intelligence with our full platform</p>
          </div>

          <div className="mx-auto max-w-3xl">
            <Card className="p-8 bg-slate-900/70 border-emerald-500/30">
              <form onSubmit={handleAnalyze} className="space-y-4">
                <div>
                  <Input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => { setWebsiteUrl(e.target.value); setError("") }}
                    placeholder="Enter your website URL (e.g., yourbusiness.com)"
                    className="h-14 text-base"
                    required
                    disabled={isAnalyzing}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Business Name (Optional)"
                    className="h-12 text-base"
                    disabled={isAnalyzing}
                  />
                  <Input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Industry (e.g., Plumbing, Restaurant)"
                    className="h-12 text-base"
                    disabled={isAnalyzing}
                  />
                </div>

                {error && (
                  <div className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
                )}

                <Button
                  type="submit"
                  disabled={isAnalyzing}
                  size="lg"
                  className="h-14 w-full text-lg bg-emerald-500 hover:bg-emerald-600"
                >
                  {isAnalyzing ? "Processing..." : "Generate Full Marketing Strategy"}
                </Button>

                <p className="text-center text-xs text-slate-500">
                  Includes: SEO audit, content calendar, competitor analysis, brand voice, and more
                </p>
              </form>
            </Card>
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

      {/* Contractor Copilot Section */}
      <section id="contractor" className="border-t border-white/10 bg-linear-to-b from-orange-900/20 via-slate-900 to-slate-950 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-400">
                <span className="text-lg">👷</span>
                Built for Contractors
              </div>
              <h2 className="mb-4 text-4xl font-bold text-white">
                Contractor Copilot
              </h2>
              <p className="text-xl text-slate-300">
                Operational AI for HVAC, Plumbing, Roofing, Remodeling & Field Services
              </p>
            </div>

            {/* Contractor Features Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
              <Card className="p-6 bg-slate-900/50 border-orange-500/30 hover:border-orange-500/50 transition-all">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">Weekly Lead Pulse</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Predict next week's leads with seasonal signals. Get 3 actions + ready-to-run ads.
                </p>
                <div className="text-xs text-orange-400 font-medium">HVAC, Plumbing, Roofing</div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-orange-500/30 hover:border-orange-500/50 transition-all">
                <div className="text-4xl mb-3">👷</div>
                <h3 className="text-xl font-bold text-white mb-2">Hire & Onboard Kit</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Auto-generate job ads and role-specific onboarding checklists.
                </p>
                <div className="text-xs text-orange-400 font-medium">All Industries</div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-orange-500/30 hover:border-orange-500/50 transition-all">
                <div className="text-4xl mb-3">📸</div>
                <h3 className="text-xl font-bold text-white mb-2">QC Photo Checker</h3>
                <p className="text-sm text-slate-400 mb-3">
                  AI-powered quality control with automated punch lists.
                </p>
                <div className="text-xs text-orange-400 font-medium">HVAC, Roofing, Remodeling</div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-orange-500/30 hover:border-orange-500/50 transition-all">
                <div className="text-4xl mb-3">📄</div>
                <h3 className="text-xl font-bold text-white mb-2">Monthly One-Pager</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Executive summary for you + investor-grade for lenders.
                </p>
                <div className="text-xs text-orange-400 font-medium">All Industries</div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-orange-500/30 hover:border-orange-500/50 transition-all">
                <div className="text-4xl mb-3">🚨</div>
                <h3 className="text-xl font-bold text-white mb-2">Monitoring & Alerts</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Slack/email alerts for ranking drops, bad reviews, competitor moves.
                </p>
                <div className="text-xs text-orange-400 font-medium">All Industries</div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-orange-500/30 hover:border-orange-500/50 transition-all">
                <div className="text-4xl mb-3">🔌</div>
                <h3 className="text-xl font-bold text-white mb-2">Integration Layer</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Connect ServiceTitan, Jobber, QuickBooks - sync jobs & customers.
                </p>
                <div className="text-xs text-orange-400 font-medium">8 Integrations</div>
              </Card>
            </div>

            {/* Contractor CTA */}
            <div className="text-center">
              <Button
                size="lg"
                className="h-14 px-12 text-lg bg-orange-500 hover:bg-orange-600"
                onClick={handleContractorSetup}
              >
                Set Up Contractor Profile
              </Button>
              <p className="mt-4 text-sm text-slate-400">
                6-step setup • Free to try • Built specifically for field service contractors
              </p>
            </div>

            {/* Supported Industries */}
            <div className="mt-12 text-center">
              <p className="text-sm text-slate-500 mb-3">Optimized for:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['HVAC', 'Plumbing', 'Roofing', 'Remodeling', 'Landscaping', 'Electrical', 'Painting', 'Concrete', 'Propane', 'Fencing'].map((industry) => (
                  <span key={industry} className="px-3 py-1 text-xs rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400">
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/10 bg-linear-to-b from-cyan-900/20 via-slate-900 to-slate-950 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">Ready for Instant Business Clarity?</h2>
          <p className="mb-8 text-xl text-slate-300">No signup, no email, no waiting. Just clear answers.</p>
          <Link href="/clarity-snapshot">
            <Button
              size="lg"
              className="h-16 px-16 text-lg bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/25"
            >
              ✨ Get Your Free Clarity Snapshot
            </Button>
          </Link>
          <p className="mt-4 text-sm text-slate-400">Takes 30 seconds • Completely free</p>
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
              <span className="font-semibold text-white">2ndmynd</span>
            </div>
            <p className="text-sm text-slate-500">(c) 2025 2ndmynd. AI-Powered Marketing Strategy Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

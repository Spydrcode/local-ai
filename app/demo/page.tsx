"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { useState } from "react"

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState<string>("overview")

  const demos = [
    {
      id: "overview",
      title: "Platform Overview",
      icon: "🎯",
      description: "See how Forecasta AI analyzes your business and generates actionable marketing strategies",
    },
    {
      id: "marketing-strategy",
      title: "Marketing Strategy",
      icon: "📊",
      description: "Full marketing analysis with SEO, content, social media, and competitive insights",
    },
    {
      id: "seo-analysis",
      title: "SEO Analysis",
      icon: "🔍",
      description: "Technical SEO audit, keyword opportunities, and 90-day optimization roadmap",
    },
    {
      id: "content-calendar",
      title: "Content Calendar",
      icon: "📝",
      description: "30-day multi-platform content strategy with ready-to-post content",
    },
    {
      id: "brand-voice",
      title: "Brand Voice Analysis",
      icon: "🎨",
      description: "Define your brand personality, messaging framework, and voice guidelines",
    },
    {
      id: "competitive-intel",
      title: "Competitive Intelligence",
      icon: "🏆",
      description: "Analyze competitor strategies and discover differentiation opportunities",
    },
  ]

  const features = [
    {
      title: "19 AI Workflows",
      items: [
        "Marketing Intelligence Collection",
        "Brand Voice Analysis",
        "SEO Strategy & Technical Audit",
        "Content Strategy & Calendar",
        "Social Media Strategy",
        "Competitive Analysis",
        "Email Marketing",
        "Local SEO Optimization",
        "And 11 more specialized workflows..."
      ]
    },
    {
      title: "Harvard Business Frameworks",
      items: [
        "Jobs-to-be-Done Framework",
        "Blue Ocean Strategy",
        "BCG Growth-Share Matrix",
        "Ansoff Growth Matrix",
        "OKR Framework",
        "Porter's Five Forces",
        "Value Proposition Canvas",
        "Strategic Positioning"
      ]
    },
    {
      title: "Modern ML Practices",
      items: [
        "AI-Powered Personalization",
        "Attribution Modeling",
        "Marketing Mix Optimization",
        "Predictive Analytics",
        "Customer Segmentation",
        "Sentiment Analysis",
        "Trend Forecasting",
        "Performance Prediction"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-white">Forecasta AI</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white">Dashboard</Link>
              <Link href="/pricing" className="text-sm font-medium text-slate-300 hover:text-white">Pricing</Link>
              <Link href="/" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">Try It Free</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-linear-to-br from-emerald-500/10 via-slate-950 to-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Live Platform Demo
            </div>

            <h1 className="mb-6 text-5xl font-bold text-white sm:text-6xl">
              See Forecasta AI in <span className="bg-linear-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Action</span>
            </h1>

            <p className="mb-10 text-xl text-slate-300">
              Explore how our AI-powered platform generates world-class marketing strategies in minutes
            </p>

            <Link href="/">
              <Button size="lg" className="h-14 px-12 text-lg bg-emerald-500 hover:bg-emerald-600">
                Try It Free Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Navigation */}
      <section className="border-t border-white/10 py-12 bg-slate-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose a Demo</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`p-6 rounded-lg border-2 text-left transition-all ${
                  activeDemo === demo.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                }`}
              >
                <div className="text-3xl mb-3">{demo.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{demo.title}</h3>
                <p className="text-sm text-slate-400">{demo.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {activeDemo === "overview" && (
              <div className="space-y-12">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">Platform Capabilities</h2>
                  <p className="text-xl text-slate-400">Everything you need for effective marketing</p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                  {features.map((feature, idx) => (
                    <Card key={idx} className="p-8 bg-slate-900/50 border-slate-700">
                      <h3 className="text-xl font-bold text-white mb-6">{feature.title}</h3>
                      <ul className="space-y-3">
                        {feature.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-2 text-sm text-slate-300">
                            <svg className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ))}
                </div>

                <Card className="p-10 bg-linear-to-br from-emerald-900/20 to-slate-900/50 border-emerald-500/30">
                  <h3 className="text-2xl font-bold text-white mb-4">How It Works</h3>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white font-bold">1</div>
                        <h4 className="text-lg font-semibold text-white">Enter Your Website</h4>
                      </div>
                      <p className="text-slate-400">Simply provide your business website URL to get started</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white font-bold">2</div>
                        <h4 className="text-lg font-semibold text-white">AI Analysis</h4>
                      </div>
                      <p className="text-slate-400">19 AI workflows analyze your marketing across all channels</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white font-bold">3</div>
                        <h4 className="text-lg font-semibold text-white">Get Strategy</h4>
                      </div>
                      <p className="text-slate-400">Receive comprehensive strategy with actionable next steps</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeDemo === "marketing-strategy" && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">Full Marketing Strategy Demo</h2>
                  <p className="text-xl text-slate-400">Comprehensive analysis across all marketing channels</p>
                </div>

                <Card className="p-8 bg-slate-900/50 border-slate-700">
                  <h3 className="text-xl font-bold text-white mb-6">What's Included</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold text-emerald-400 mb-3">Marketing Intelligence</h4>
                      <ul className="space-y-2 text-slate-300">
                        <li>• Website analysis and content audit</li>
                        <li>• Brand voice and messaging framework</li>
                        <li>• Target audience identification</li>
                        <li>• Current marketing strengths & gaps</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-400 mb-3">Strategic Recommendations</h4>
                      <ul className="space-y-2 text-slate-300">
                        <li>• SEO optimization roadmap</li>
                        <li>• Content strategy & calendar</li>
                        <li>• Social media growth tactics</li>
                        <li>• Competitive differentiation</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">⏱️</span>
                    <div>
                      <h4 className="font-semibold text-white">Analysis Time</h4>
                      <p className="text-slate-400">Typically completes in 90-120 seconds</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeDemo !== "overview" && activeDemo !== "marketing-strategy" && (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">🚧</div>
                <h3 className="text-2xl font-bold text-white mb-4">Demo Coming Soon</h3>
                <p className="text-slate-400 mb-8">This demo is currently being prepared. Try the platform now to see it in action!</p>
                <Link href="/">
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600">
                    Try It Free
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/10 bg-linear-to-b from-emerald-900/20 via-slate-900 to-slate-950 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">Ready to Try It Yourself?</h2>
          <p className="mb-8 text-xl text-slate-300">Get your free marketing analysis in minutes</p>
          <Link href="/">
            <Button size="lg" className="h-16 px-16 text-lg bg-emerald-500 hover:bg-emerald-600">
              Start Free Analysis
            </Button>
          </Link>
          <p className="mt-4 text-sm text-slate-400">No credit card required • Instant results</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-semibold text-white">Forecasta AI</span>
            </div>
            <p className="text-sm text-slate-500">© 2025 Forecasta AI. AI-Powered Marketing Strategy Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

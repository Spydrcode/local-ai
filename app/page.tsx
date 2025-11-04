"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const toolCategories = [
  {
    id: "intelligence",
    title: "Business Intelligence",
    description: "Understand your market position",
    tools: [
      {
        id: "business-dna",
        title: "Business DNA Analysis",
        description: "Discover what makes your business unique in your market",
        tier: "free",
      },
      {
        id: "market-position",
        title: "Local Market Position",
        description: "See how you compare against nearby competitors",
        tier: "free",
      },
      {
        id: "customer-voice",
        title: "Customer Voice Dashboard",
        description: "Real-time sentiment from reviews and social media",
        tier: "pro",
      },
      {
        id: "economic-check",
        title: "Economic Reality Check",
        description: "How economic trends impact your local market",
        tier: "free",
      },
    ],
  },
  {
    id: "strategy",
    title: "Strategic Advantage",
    description: "Build your competitive moat",
    tools: [
      {
        id: "competitive-moat",
        title: "Competitive Moat Builder",
        description: "Why customers choose you over competitors",
        tier: "pro",
      },
      {
        id: "process-optimizer",
        title: "Business Process Optimizer",
        description: "Identify where you make and lose money",
        tier: "pro",
      },
      {
        id: "swot-dashboard",
        title: "Live SWOT Dashboard",
        description: "Real-time strengths and weaknesses analysis",
        tier: "pro",
      },
      {
        id: "pricing-power",
        title: "Pricing Power Analysis",
        description: "Discover your optimal pricing strategy",
        tier: "pro",
      },
    ],
  },
  {
    id: "growth",
    title: "Growth Accelerator",
    description: "Scale your business faster",
    tools: [
      {
        id: "revenue-leaks",
        title: "Revenue Leaks Detector",
        description: "Find and fix where you're losing money",
        tier: "pro",
      },
      {
        id: "kpi-dashboard",
        title: "KPI Dashboard",
        description: "Track metrics that actually matter",
        tier: "pro",
      },
      {
        id: "automation",
        title: "Automation Opportunities",
        description: "Save 10+ hours per week with smart automation",
        tier: "pro",
      },
      {
        id: "growth-plan",
        title: "90-Day Growth Plan",
        description: "Your roadmap to 25% more revenue",
        tier: "consultation",
      },
    ],
  },
]

const stats = [
  { value: "20+", label: "AI-Powered Tools" },
  { value: "< 3s", label: "Analysis Time" },
  { value: "70%", label: "Cost Reduction" },
]

export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!websiteUrl) {
      setError("Please enter a website URL")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      const response = await fetch("/api/quick-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Analysis failed")
        } else {
          throw new Error("Server error. Please try again.")
        }
      }

      const data = await response.json()
      router.push(`/analysis/${data.demoId}`)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to analyze website. Please check the URL and try again."
      setError(errorMessage)
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleToolClick = (toolId: string) => {
    console.log("[v0] Tool clicked:", toolId)
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-semibold">Local AI</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#tools" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Tools
              </a>
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Features
              </a>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Strategic Intelligence for Your Business
          </h1>

          <p className="mb-10 text-balance text-lg leading-relaxed text-muted-foreground">
            Get instant AI-powered insights with proven business frameworks. SWOT analysis, competitive intelligence,
            and growth strategies in under 3 seconds.
          </p>

          <form onSubmit={handleAnalyze} className="mx-auto mb-6 max-w-xl">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="url"
                value={websiteUrl}
                onChange={(e) => {
                  setWebsiteUrl(e.target.value)
                  setError("")
                }}
                placeholder="Enter your website URL"
                className="h-12 flex-1"
                required
              />
              <Button type="submit" disabled={isAnalyzing} size="lg" className="h-12 px-8 font-medium">
                {isAnalyzing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"></div>
                    Analyzing
                  </>
                ) : (
                  "Start Free Analysis"
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-3 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </form>

          <p className="text-sm text-muted-foreground">No credit card required • Results in under 3 seconds</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border bg-card p-6 text-center">
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="tools" className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">All Tools</h2>
            <p className="text-muted-foreground">20+ specialized tools organized by strategic focus</p>
          </div>

          <div className="space-y-12">
            {toolCategories.map((category) => (
              <div key={category.id}>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {category.tools.map((tool) => (
                    <Card
                      key={tool.id}
                      className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                      onClick={() => handleToolClick(tool.id)}
                    >
                      <CardHeader className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base leading-snug">{tool.title}</CardTitle>
                          <Badge
                            variant="secondary"
                            className={
                              tool.tier === "free"
                                ? "shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : tool.tier === "pro"
                                  ? "shrink-0 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "shrink-0 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }
                          >
                            {tool.tier === "free" ? "Free" : tool.tier === "pro" ? "Pro" : "Consult"}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm leading-relaxed">{tool.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-3 text-3xl font-bold">Why Local AI?</h2>
            <p className="text-muted-foreground">
              Advanced analytical capabilities designed specifically for small business owners
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Real-Time Analysis</CardTitle>
                <CardDescription className="leading-relaxed">
                  Live data feeds from Google Business, social media, and economic indicators give you up-to-the-minute
                  insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-lg">Strategic Intelligence</CardTitle>
                <CardDescription className="leading-relaxed">
                  Porter's Five Forces, SWOT, and Business Model Canvas translated into actionable insights for SMBs.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <CardTitle className="text-lg">Action-Oriented</CardTitle>
                <CardDescription className="leading-relaxed">
                  Every insight includes specific action steps you can implement this week to improve your business.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-lg border bg-card p-8 text-center shadow-sm">
            <h2 className="mb-3 text-2xl font-bold">Ready to get started?</h2>
            <p className="mb-6 text-muted-foreground">Enter your website URL to access all tools instantly</p>

            <form onSubmit={handleAnalyze} className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="url"
                value={websiteUrl}
                onChange={(e) => {
                  setWebsiteUrl(e.target.value)
                  setError("")
                }}
                placeholder="Enter your website URL"
                className="h-12 flex-1"
                required
              />
              <Button type="submit" disabled={isAnalyzing} size="lg" className="h-12 px-8">
                {isAnalyzing ? "Analyzing" : "Get Started"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-semibold">Local AI</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 Local AI. Strategic intelligence for small business.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect, useState } from "react"

interface CompetitiveInsight {
  question: string
  insight: string
  action: string
}

interface GrowthAnalysis {
  business_name: string
  website: string
  what_makes_you_different: string[]
  why_customers_choose_competitors: CompetitiveInsight[]
  your_strengths: string[]
  opportunities: string[]
  threats_to_watch: string[]
  quick_wins: Array<{
    title: string
    why: string
    action: string
    difficulty: string
  }>
}

export default function GrowPage() {
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [industry, setIndustry] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const [analysis, setAnalysis] = useState<GrowthAnalysis | null>(null)

  useEffect(() => {
    // Check if we have initial analysis from homepage
    const stored = sessionStorage.getItem('initialAnalysis')
    if (stored) {
      try {
        const initialData = JSON.parse(stored)
        // Pre-fill the form with data from homepage
        setWebsiteUrl(initialData.website || "")
        setBusinessName(initialData.business_name || "")
        
        // Automatically trigger full analysis with the data we have
        if (initialData.business_name && initialData.website) {
          handleAutoAnalyze(initialData.website, initialData.business_name, initialData.industry || "")
        }
        
        // DON'T remove - keep it for other pages (Content Creator, AI Tools)
        // sessionStorage.removeItem('initialAnalysis')
      } catch (e) {
        console.error('Failed to parse stored analysis', e)
      }
    }
  }, [])

  const handleAutoAnalyze = async (website: string, name: string, ind: string) => {
    setIsAnalyzing(true)
    setError("")

    try {
      const response = await fetch("/api/grow-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          website,
          business_name: name,
          industry: ind || "general"
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      setError("Couldn't complete the analysis. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!websiteUrl || !businessName) {
      setError("Please fill in all fields")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      const response = await fetch("/api/grow-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          website: websiteUrl,
          business_name: businessName,
          industry: industry || "general"
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      setError("Couldn't complete the analysis. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

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
              <span className="text-xl font-semibold text-white">Local AI</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/grow" className="text-sm font-medium text-emerald-400">Grow My Business</Link>
              <Link href="/content" className="text-sm font-medium text-slate-300 hover:text-white">Content Creator</Link>
              <Link href="/tools" className="text-sm font-medium text-slate-300 hover:text-white">AI Tools</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {!analysis ? (
          /* Analysis Form */
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-white mb-4">Grow Your Business</h1>
              <p className="text-lg text-slate-400">
                Find out what's working, what's not, and exactly what to do next
              </p>
            </div>

            <Card className="p-8 bg-slate-900/50 border-slate-700">
              <form onSubmit={handleAnalyze} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Name
                  </label>
                  <Input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Joe's Coffee Shop"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Website
                  </label>
                  <Input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://joescoffee.com"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Industry (optional)
                  </label>
                  <Input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Coffee shop, retail, services, etc."
                    className="w-full"
                  />
                </div>

                {error && (
                  <div className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isAnalyzing}
                  className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white text-base"
                >
                  {isAnalyzing ? "Analyzing Your Business..." : "Analyze My Business"}
                </Button>

                <p className="text-sm text-slate-400 text-center">
                  Takes about 30 seconds • Free analysis
                </p>
              </form>
            </Card>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{analysis.business_name}</h1>
                <p className="text-slate-400">{analysis.website}</p>
              </div>
              <Button
                onClick={() => {
                  setAnalysis(null)
                  setWebsiteUrl("")
                  setBusinessName("")
                  setIndustry("")
                }}
                variant="outline"
              >
                Analyze Different Business
              </Button>
            </div>

            {/* Empty state if no analysis data */}
            {(!analysis.what_makes_you_different || analysis.what_makes_you_different.length === 0) &&
             (!analysis.why_customers_choose_competitors || analysis.why_customers_choose_competitors.length === 0) &&
             (!analysis.your_strengths || analysis.your_strengths.length === 0) &&
             (!analysis.opportunities || analysis.opportunities.length === 0) &&
             (!analysis.quick_wins || analysis.quick_wins.length === 0) && (
              <Card className="p-12 bg-slate-900/30 border-slate-700 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🔄</div>
                  <h3 className="text-xl font-bold text-white mb-2">Analysis in Progress</h3>
                  <p className="text-slate-400 mb-6">
                    We're analyzing your business. This should only take a moment...
                  </p>
                  <Button
                    onClick={() => {
                      setAnalysis(null)
                      setWebsiteUrl("")
                      setBusinessName("")
                      setIndustry("")
                    }}
                    variant="outline"
                  >
                    Start Over
                  </Button>
                </div>
              </Card>
            )}

            {/* What Makes You Different */}
            {analysis.what_makes_you_different && analysis.what_makes_you_different.length > 0 && (
              <Card className="p-8 bg-slate-900/50 border-emerald-500/20">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>💎</span>
                  What Makes You Different
                </h2>
                <div className="space-y-3">
                  {analysis.what_makes_you_different.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className="text-emerald-400 mt-1">✓</span>
                      <p className="text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Why Customers Choose Competitors (Porter's 5 Forces in disguise) */}
            {analysis.why_customers_choose_competitors && analysis.why_customers_choose_competitors.length > 0 && (
              <Card className="p-8 bg-slate-900/50 border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>🔍</span>
                  Why Customers Choose Competitors
                </h2>
                <p className="text-slate-400 mb-6">Understanding this helps you stand out</p>
                <div className="space-y-6">
                  {analysis.why_customers_choose_competitors.map((insight, idx) => (
                    <div key={idx} className="border-l-2 border-orange-500/50 pl-6 py-2">
                      <h3 className="text-lg font-semibold text-white mb-2">{insight.question}</h3>
                      <p className="text-slate-300 mb-3">{insight.insight}</p>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <p className="text-sm font-medium text-emerald-400 mb-1">What to do:</p>
                        <p className="text-sm text-slate-300">{insight.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Your Strengths & Opportunities (SWOT in disguise) */}
            {((analysis.your_strengths && analysis.your_strengths.length > 0) || 
              (analysis.opportunities && analysis.opportunities.length > 0)) && (
              <div className="grid md:grid-cols-2 gap-6">
                {analysis.your_strengths && analysis.your_strengths.length > 0 && (
                  <Card className="p-6 bg-slate-900/50 border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>💪</span>
                      Your Strengths
                    </h3>
                    <div className="space-y-2">
                      {analysis.your_strengths.map((strength, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-emerald-400">•</span>
                          <p className="text-slate-300 text-sm">{strength}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {analysis.opportunities && analysis.opportunities.length > 0 && (
                  <Card className="p-6 bg-slate-900/50 border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>🚀</span>
                      Opportunities to Grow
                    </h3>
                    <div className="space-y-2">
                      {analysis.opportunities.map((opportunity, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-blue-400">•</span>
                          <p className="text-slate-300 text-sm">{opportunity}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Things to Watch Out For */}
            {analysis.threats_to_watch && analysis.threats_to_watch.length > 0 && (
              <Card className="p-6 bg-slate-900/50 border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>⚠️</span>
                  Things to Watch Out For
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {analysis.threats_to_watch.map((threat, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-yellow-400">⚡</span>
                      <p className="text-slate-300 text-sm">{threat}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Quick Wins */}
            {analysis.quick_wins && analysis.quick_wins.length > 0 && (
              <Card className="p-8 bg-linear-to-br from-emerald-900/20 to-slate-900/50 border-emerald-500/30">
                <h2 className="text-2xl font-bold text-white mb-2">Start Here: Your Top 3 Quick Wins</h2>
                <p className="text-slate-400 mb-6">Simple actions that will make the biggest difference</p>
                <div className="space-y-4">
                  {analysis.quick_wins.slice(0, 3).map((win, idx) => (
                    <Card key={idx} className="p-6 bg-slate-900/70 border-slate-700 hover:border-emerald-500/50 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">{win.title}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          win.difficulty === 'easy' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : win.difficulty === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        }`}>
                          {win.difficulty}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-4">{win.why}</p>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <p className="text-sm font-medium text-emerald-400 mb-1">Action:</p>
                        <p className="text-sm text-slate-300">{win.action}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* CTA */}
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold text-white mb-4">Need Help with Content?</h3>
              <p className="text-slate-400 mb-6">Get 30 days of social media posts created in minutes</p>
              <Link href="/content">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 px-8">
                  Create Content Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
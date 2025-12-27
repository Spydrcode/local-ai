"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/Badge"
import { useState } from "react"
import Link from "next/link"
import {
  generatePriorities,
  generateBasicPriorities,
  extractMarketingSignals,
  generateBasicMarketingSignals,
  extractOperationsSignals,
  generateBasicOperationsSignals,
  extractCompetitiveSignals,
  generateBasicCompetitiveSignals
} from "@/lib/snapshot"

interface SnapshotResult {
  whatsHappening: string[]
  whatToFixFirst: {
    priority: number
    item: string
    impact: string
  }[]
  signals: {
    marketing: string[]
    operations: string[]
    competitive: string[]
  }
  businessName: string
  analysisTime: number
}

type LoadingStep = 'finding' | 'scanning' | 'analyzing' | 'generating' | null

export default function ClaritySnapshotPage() {
  const [step, setStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loadingStep, setLoadingStep] = useState<LoadingStep>(null)
  const [result, setResult] = useState<SnapshotResult | null>(null)
  const [error, setError] = useState("")
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Step 1: Business identification
  const [businessName, setBusinessName] = useState("")
  const [city, setCity] = useState("")
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState("")

  // Step 2: Website (optional)
  const [websiteUrl, setWebsiteUrl] = useState("")

  // Step 3: Business type (optional)
  const [businessType, setBusinessType] = useState("")

  const handleStep1Next = () => {
    if (!businessName.trim() && !googleBusinessUrl.trim()) {
      setError("Please provide either a business name + city OR a Google Business URL")
      return
    }
    if (businessName.trim() && !city.trim() && !googleBusinessUrl.trim()) {
      setError("Please provide a city for your business")
      return
    }
    setError("")
    setStep(2)
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError("")
    setLoadingStep('finding')

    try {
      // Simulate loading steps for better UX
      if (websiteUrl) {
        setLoadingStep('scanning')
        
        const response = await fetch('/api/web-scraper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: websiteUrl,
            mode: 'snapshot',
            businessName: businessName || undefined,
            businessType: businessType || undefined
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Unable to analyze website')
        }

        setLoadingStep('analyzing')
        const { data, duration } = await response.json()

        setLoadingStep('generating')
        
        // Transform to snapshot result format
        const snapshotResult: SnapshotResult = {
          businessName: data.business?.name || businessName || 'Your Business',
          analysisTime: duration,
          whatsHappening: [
            data.business?.description || "Local business with online presence",
            data.seo?.title ? `Website found: "${data.seo.title}"` : "Website detected",
            data.social?.platforms?.length > 0 
              ? `Active on ${data.social.platforms.length} social platform(s)` 
              : "Limited social media presence",
            data.reviews?.totalReviews 
              ? `${data.reviews.totalReviews} customer reviews (${data.reviews.averageRating?.toFixed(1)} avg rating)`
              : "No reviews found online"
          ].filter(Boolean),
          whatToFixFirst: generatePriorities(data),
          signals: {
            marketing: extractMarketingSignals(data),
            operations: extractOperationsSignals(data),
            competitive: extractCompetitiveSignals(data)
          }
        }

        setResult(snapshotResult)
        setStep(4)
      } else {
        setLoadingStep('generating')
        
        // Small delay for perceived analysis
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // No website - provide basic analysis
        const basicResult: SnapshotResult = {
          businessName: businessName || 'Your Business',
          analysisTime: 150,
          whatsHappening: [
            `${businessType || 'Local business'} in ${city}`,
            googleBusinessUrl ? "Listed on Google Business" : "No confirmed Google Business listing",
            "No website detected",
            "Online visibility is limited"
          ],
          whatToFixFirst: generateBasicPriorities(),
          signals: {
            marketing: generateBasicMarketingSignals(),
            operations: generateBasicOperationsSignals(),
            competitive: generateBasicCompetitiveSignals()
          }
        }

        setResult(basicResult)
        setStep(4)
      }

    } catch (err: any) {
      console.error('Clarity Snapshot error:', err)
      
      // Provide helpful error messages
      let errorMessage = 'Analysis failed. Please try again.'
      
      if (err.message.includes('404') || err.message.includes('not found')) {
        errorMessage = 'Website not found. Please check the URL and try again.'
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Website took too long to respond. Please try again or skip the website step.'
      } else if (err.message.includes('blocked') || err.message.includes('403')) {
        errorMessage = 'Unable to access website. Please try again or skip the website step.'
      } else if (err.message.includes('Invalid URL') || err.message.includes('URL')) {
        errorMessage = 'Invalid website URL. Please enter a valid URL (e.g., https://example.com)'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsAnalyzing(false)
      setLoadingStep(null)
    }
  }

  const handleReset = () => {
    setStep(1)
    setResult(null)
    setError("")
    setBusinessName("")
    setCity("")
    setGoogleBusinessUrl("")
    setWebsiteUrl("")
    setBusinessType("")
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Clarity Snapshot
          </h1>
          <p className="text-xl text-slate-300 mb-3">
            See exactly what's working and what needs attention.
          </p>
          <p className="text-slate-400">
            No email, no signup. Just clarity.
          </p>
        </div>

        {!result ? (
          <>
            {/* Progress Indicator */}
            {step < 4 && !isAnalyzing && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3].map(s => (
                    <div
                      key={s}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        s <= step ? 'bg-cyan-500' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-slate-400 text-sm">
                  Step {step} of 3
                </p>
              </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <Card className="p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                    <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className={`text-lg font-medium transition-opacity ${
                      loadingStep === 'finding' ? 'text-white' : 'text-slate-600'
                    }`}>
                      {loadingStep === 'finding' && '→'} Finding your business listing...
                    </div>
                    <div className={`text-lg font-medium transition-opacity ${
                      loadingStep === 'scanning' ? 'text-white' : 'text-slate-600'
                    }`}>
                      {loadingStep === 'scanning' && '→'} Scanning your website...
                    </div>
                    <div className={`text-lg font-medium transition-opacity ${
                      loadingStep === 'analyzing' ? 'text-white' : 'text-slate-600'
                    }`}>
                      {loadingStep === 'analyzing' && '→'} Analyzing signals...
                    </div>
                    <div className={`text-lg font-medium transition-opacity ${
                      loadingStep === 'generating' ? 'text-white' : 'text-slate-600'
                    }`}>
                      {loadingStep === 'generating' && '→'} Generating priorities...
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm mt-6">
                    This usually takes 10-30 seconds
                  </p>
                </div>
              </Card>
            )}

            {/* Error Message */}
            {error && !isAnalyzing && (
              <Card className="mb-8 p-5 bg-red-500/5 border-red-500/30">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-red-300 font-medium mb-1">Unable to complete analysis</p>
                    <p className="text-red-300/80 text-sm">{error}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 1: Business Identification */}
            {step === 1 && !isAnalyzing && (
              <Card className="p-8 sm:p-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Tell us about your business
                  </h2>
                  <p className="text-slate-400">
                    We'll find the rest automatically
                  </p>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2.5">
                      Business Name <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="text"
                      value={businessName}
                      onChange={(e) => { setBusinessName(e.target.value); setError("") }}
                      placeholder="ABC Plumbing"
                      className="w-full text-base"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2.5">
                      City <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="text"
                      value={city}
                      onChange={(e) => { setCity(e.target.value); setError("") }}
                      placeholder="Phoenix, AZ"
                      className="w-full text-base"
                    />
                  </div>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-slate-900 text-slate-500 text-sm">or</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2.5">
                      Google Business Profile URL
                    </label>
                    <Input
                      type="url"
                      value={googleBusinessUrl}
                      onChange={(e) => { setGoogleBusinessUrl(e.target.value); setError("") }}
                      placeholder="https://maps.google.com/..."
                      className="w-full text-base"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      If you have a Google Business listing, paste the link here
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleStep1Next} size="lg" className="bg-cyan-500 hover:bg-cyan-600">
                    Continue
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Website (Optional) */}
            {step === 2 && !isAnalyzing && (
              <Card className="p-8 sm:p-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Do you have a website?
                  </h2>
                  <p className="text-slate-400">
                    Optional — helps us give better recommendations
                  </p>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-300 mb-2.5">
                    Website URL
                  </label>
                  <Input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => { setWebsiteUrl(e.target.value); setError("") }}
                    placeholder="https://yourwebsite.com"
                    className="w-full text-base"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="secondary" onClick={() => setStep(1)} className="sm:order-1">
                    Back
                  </Button>
                  <div className="flex gap-3 sm:order-2 sm:ml-auto">
                    <Button variant="outline" onClick={() => setStep(3)}>
                      Skip
                    </Button>
                    <Button onClick={() => setStep(3)} className="bg-cyan-500 hover:bg-cyan-600">
                      Continue
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 3: Business Type (Optional) */}
            {step === 3 && !isAnalyzing && (
              <Card className="p-8 sm:p-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    What type of business?
                  </h2>
                  <p className="text-slate-400">
                    Optional — helps us tailor your snapshot
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {[
                    'Plumbing', 'HVAC', 'Roofing', 'Electrical', 
                    'Landscaping', 'Restaurant', 'Retail', 'Professional Services',
                    'Home Services', 'Health & Wellness', 'Automotive', 'Other'
                  ].map((type) => (
                    <button
                      key={type}
                      onClick={() => setBusinessType(type)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        businessType === type
                          ? 'border-cyan-500 bg-cyan-500/10 text-white'
                          : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="font-medium text-sm">{type}</div>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="secondary" onClick={() => setStep(2)} className="sm:order-1">
                    Back
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    size="lg"
                    className="bg-cyan-500 hover:bg-cyan-600 sm:order-2 sm:ml-auto"
                  >
                    Get My Snapshot
                  </Button>
                </div>
              </Card>
            )}
          </>
        ) : (
          /* Results */
          <div className="space-y-8">
            {/* Summary Header */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {result.businessName}
              </h2>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  Analysis complete
                </Badge>
                <span>•</span>
                <span>{(result.analysisTime / 1000).toFixed(1)}s</span>
              </div>
            </div>

            {/* Top Priorities - Hero Section */}
            <Card className="p-8 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-transparent border-cyan-500/20">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  What to focus on first
                </h3>
                <p className="text-slate-400 text-sm">
                  Prioritized by potential impact
                </p>
              </div>
              
              <div className="space-y-4">
                {result.whatToFixFirst.slice(0, 3).map((fix) => (
                  <div key={fix.priority} className="group">
                    <div className="flex items-start gap-4 p-5 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                        <span className="text-cyan-400 font-bold">{fix.priority}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
                          {fix.item}
                        </h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {fix.impact}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {result.whatToFixFirst.length > 3 && (
                <button
                  onClick={() => setExpandedSection(expandedSection === 'priorities' ? null : 'priorities')}
                  className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors"
                >
                  {expandedSection === 'priorities' ? 'Show less' : `Show ${result.whatToFixFirst.length - 3} more priorities`}
                  <svg 
                    className={`w-4 h-4 transition-transform ${expandedSection === 'priorities' ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}

              {expandedSection === 'priorities' && result.whatToFixFirst.length > 3 && (
                <div className="mt-4 space-y-4 pt-4 border-t border-slate-800">
                  {result.whatToFixFirst.slice(3).map((fix) => (
                    <div key={fix.priority} className="group">
                      <div className="flex items-start gap-4 p-5 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                          <span className="text-cyan-400 font-bold">{fix.priority}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
                            {fix.item}
                          </h4>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            {fix.impact}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Current State Overview - Expandable */}
            <div>
              <button
                onClick={() => setExpandedSection(expandedSection === 'overview' ? null : 'overview')}
                className="w-full"
              >
                <Card className="p-6 hover:border-slate-700 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📊</span>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-white">Current State</h3>
                        <p className="text-sm text-slate-400">{result.whatsHappening.length} observations</p>
                      </div>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'overview' ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </Card>
              </button>

              {expandedSection === 'overview' && (
                <Card className="mt-2 p-6 border-slate-800">
                  <ul className="space-y-3">
                    {result.whatsHappening.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-cyan-400 mt-1.5 text-xs">●</span>
                        <span className="text-slate-300 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            {/* Detailed Signals - Expandable */}
            <div>
              <button
                onClick={() => setExpandedSection(expandedSection === 'signals' ? null : 'signals')}
                className="w-full"
              >
                <Card className="p-6 hover:border-slate-700 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔍</span>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-white">Detailed Analysis</h3>
                        <p className="text-sm text-slate-400">Marketing, operations, and competitive insights</p>
                      </div>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'signals' ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </Card>
              </button>

              {expandedSection === 'signals' && (
                <div className="mt-2 grid sm:grid-cols-3 gap-4">
                  <Card className="p-5 border-slate-800">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <span>📢</span> Marketing
                    </h4>
                    <ul className="space-y-2.5">
                      {result.signals.marketing.map((signal, i) => (
                        <li key={i} className="text-xs text-slate-400 leading-relaxed">{signal}</li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-5 border-slate-800">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <span>⚙️</span> Operations
                    </h4>
                    <ul className="space-y-2.5">
                      {result.signals.operations.map((signal, i) => (
                        <li key={i} className="text-xs text-slate-400 leading-relaxed">{signal}</li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-5 border-slate-800">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <span>🏆</span> Competitive
                    </h4>
                    <ul className="space-y-2.5">
                      {result.signals.competitive.map((signal, i) => (
                        <li key={i} className="text-xs text-slate-400 leading-relaxed">{signal}</li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}
            </div>

            {/* Optional Support CTA */}
            <Card className="p-8 bg-slate-900/50 border-slate-800 text-center">
              <p className="text-slate-300 mb-4">
                Need help implementing these changes?
              </p>
              <Button 
                variant="outline"
                onClick={() => window.open('https://calendly.com/your-link', '_blank')}
                className="border-slate-700 hover:border-slate-600 text-slate-300"
              >
                Book a Strategy Call
              </Button>
              <p className="text-xs text-slate-500 mt-4">
                30 minutes • No pressure • Just helpful advice
              </p>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={handleReset} variant="secondary" className="flex-1">
                Analyze Another Business
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                  Explore Full Platform
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

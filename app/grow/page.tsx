

"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect, useState } from "react"

type WorkflowType =
  | 'full-marketing-strategy'
  | 'seo-strategy'
  | 'content-strategy'
  | 'social-media-strategy'
  | 'brand-analysis'
  | 'competitor-analysis'
  | 'quick-analysis'
  // Strategic Frameworks
  | 'blue-ocean-strategy'
  | 'ansoff-matrix'
  | 'bcg-matrix'
  | 'positioning-map'
  | 'customer-journey-map'
  | 'okr-framework'
  | 'comprehensive-strategic-analysis'
  // HBS Frameworks
  | 'jobs-to-be-done-analysis'
  | 'customer-journey-mapping'
  | 'positioning-strategy'
  | 'innovation-strategy'
  | 'ml-optimization-strategy'
  | 'comprehensive-hbs-analysis'

interface MarketingResult {
  workflow: WorkflowType
  intelligence?: any
  brandAnalysis?: any
  marketingStrategy?: any
  seoStrategy?: any
  contentStrategy?: any
  socialStrategy?: any
  competitorAnalysis?: any
  recommendations: string[]
  nextSteps: string[]
  estimatedImpact: string
  timeline: string
  executionTime: number
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function MarketingHubPage() {
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [industry, setIndustry] = useState("")
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType>('full-marketing-strategy')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<MarketingResult | null>(null)

  // Chat state
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)

  useEffect(() => {
    // Check for incoming request from homepage
    const request = sessionStorage.getItem('marketingRequest')
    if (request) {
      try {
        const data = JSON.parse(request)
        setWebsiteUrl(data.website || "")
        setSelectedWorkflow(data.workflow || 'full-marketing-strategy')
        sessionStorage.removeItem('marketingRequest')

        // Auto-trigger analysis
        if (data.website) {
          setTimeout(() => {
            const form = document.querySelector('form')
            if (form) {
              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
            }
          }, 100)
        }
      } catch (e) {
        console.error('Failed to parse marketing request', e)
      }
      return
    }

    // Check for previous analysis results
    const stored = sessionStorage.getItem('marketingAnalysis')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setWebsiteUrl(data.context?.website || "")
        setBusinessName(data.context?.businessName || "")
        setIndustry(data.context?.industry || "")
        setResult(data)
        sessionStorage.removeItem('marketingAnalysis')
      } catch (e) {
        console.error('Failed to parse stored analysis', e)
      }
    }
  }, [])

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!websiteUrl) {
      setError("Please enter a website URL")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      const response = await fetch("/api/marketing-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: websiteUrl,
          businessName: businessName || undefined,
          industry: industry || undefined,
          workflow: selectedWorkflow
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      setResult(data)

      // Store for content creator and AI tools pages  
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('marketingAnalysis', JSON.stringify({
          ...data,
          website: websiteUrl,
          business_name: businessName || data.intelligence?.brandAnalysis?.businessName || websiteUrl,
          industry: industry || data.intelligence?.industry,
          target_audience: data.intelligence?.targetAudience
        }))
      }
    } catch (err) {
      setError("Couldn't complete the analysis. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleChatSend = async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput("")
    setIsChatLoading(true)

    try {
      const response = await fetch("/api/marketing-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: chatInput,
          conversationHistory: chatMessages,
          businessContext: result ? {
            website: websiteUrl,
            businessName: businessName,
            industry: industry,
            previousAnalysis: result
          } : null
        }),
      })

      if (!response.ok) {
        throw new Error("Chat failed")
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp
      }

      setChatMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Chat error:', err)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  const workflows = [
    // Marketing Intelligence Workflows
    { id: 'full-marketing-strategy', name: 'Full Marketing Strategy', icon: '🎯', time: '~2 min', category: 'Marketing' },
    { id: 'quick-analysis', name: 'Quick Analysis', icon: '⚡', time: '~30 sec', category: 'Marketing' },
    { id: 'seo-strategy', name: 'SEO Strategy', icon: '🔍', time: '~1 min', category: 'Marketing' },
    { id: 'content-strategy', name: 'Content Strategy', icon: '📝', time: '~1 min', category: 'Marketing' },
    { id: 'social-media-strategy', name: 'Social Media', icon: '📱', time: '~1 min', category: 'Marketing' },
    { id: 'brand-analysis', name: 'Brand Voice', icon: '🎨', time: '~45 sec', category: 'Marketing' },
    { id: 'competitor-analysis', name: 'Competitor Analysis', icon: '🏆', time: '~1 min', category: 'Marketing' },
    
    // Strategic Framework Workflows
    { id: 'blue-ocean-strategy', name: 'Blue Ocean Strategy', icon: '🌊', time: '~1 min', category: 'Strategic' },
    { id: 'ansoff-matrix', name: 'Ansoff Growth Matrix', icon: '📈', time: '~1 min', category: 'Strategic' },
    { id: 'bcg-matrix', name: 'BCG Portfolio Matrix', icon: '⭐', time: '~1 min', category: 'Strategic' },
    { id: 'positioning-map', name: 'Competitive Positioning', icon: '🎯', time: '~1 min', category: 'Strategic' },
    { id: 'customer-journey-map', name: 'Customer Journey Map', icon: '🗺️', time: '~1 min', category: 'Strategic' },
    { id: 'okr-framework', name: 'OKR Framework', icon: '🎯', time: '~1 min', category: 'Strategic' },
    { id: 'comprehensive-strategic-analysis', name: 'All Strategic Frameworks', icon: '🚀', time: '~3 min', category: 'Strategic' },
    
    // HBS Framework Workflows
    { id: 'jobs-to-be-done-analysis', name: 'Jobs-to-be-Done', icon: '💼', time: '~1 min', category: 'HBS' },
    { id: 'customer-journey-mapping', name: 'HBS Customer Journey', icon: '🛤️', time: '~1 min', category: 'HBS' },
    { id: 'positioning-strategy', name: 'HBS Positioning', icon: '🎪', time: '~1 min', category: 'HBS' },
    { id: 'innovation-strategy', name: 'Disruptive Innovation', icon: '💡', time: '~1 min', category: 'HBS' },
    { id: 'ml-optimization-strategy', name: 'ML Marketing Mix', icon: '🤖', time: '~1 min', category: 'HBS' },
    { id: 'comprehensive-hbs-analysis', name: 'All HBS Frameworks', icon: '🎓', time: '~3 min', category: 'HBS' },
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
              <span className="text-xl font-semibold text-white">Local AI</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/grow" className="text-sm font-medium text-emerald-400">Marketing Hub</Link>
              <Link href="/demo" className="text-sm font-medium text-slate-300 hover:text-white">Strategic Frameworks</Link>
              <Link href="/pricing" className="text-sm font-medium text-slate-300 hover:text-white">Pricing</Link>
              <Link href="/agency" className="text-sm font-medium text-slate-300 hover:text-white">Agency Portal</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {!result && !isAnalyzing ? (
          /* Analysis Form */
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <h1 className="text-5xl font-bold text-white mb-4">
                AI Marketing Strategy Hub
              </h1>
              <p className="text-xl text-slate-400 mb-2">
                Powerful AI-driven marketing intelligence for small businesses
              </p>
              <p className="text-sm text-slate-500">
                Get SEO strategy, content calendars, brand analysis, and more in minutes
              </p>
            </div>

            <Card className="p-8 bg-slate-900/50 border-slate-700 mb-8">
              <form onSubmit={handleAnalyze} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Website URL *
                  </label>
                  <Input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourbusiness.com"
                    className="w-full"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Business Name (optional)
                    </label>
                    <Input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Your Business Name"
                      className="w-full"
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
                      placeholder="e.g., Coffee shop, Plumbing, Consulting"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Choose Analysis Type
                  </label>
                  
                  {/* Marketing Intelligence Category */}
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                      📊 Marketing Intelligence
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {workflows.filter(w => w.category === 'Marketing').map((workflow) => (
                        <button
                          key={workflow.id}
                          type="button"
                          onClick={() => setSelectedWorkflow(workflow.id as WorkflowType)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            selectedWorkflow === workflow.id
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{workflow.icon}</span>
                            <span className="text-xs text-slate-400">{workflow.time}</span>
                          </div>
                          <div className="text-sm font-medium text-white">{workflow.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Strategic Frameworks Category */}
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
                      🎯 Strategic Frameworks
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {workflows.filter(w => w.category === 'Strategic').map((workflow) => (
                        <button
                          key={workflow.id}
                          type="button"
                          onClick={() => setSelectedWorkflow(workflow.id as WorkflowType)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            selectedWorkflow === workflow.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{workflow.icon}</span>
                            <span className="text-xs text-slate-400">{workflow.time}</span>
                          </div>
                          <div className="text-sm font-medium text-white">{workflow.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* HBS Frameworks Category */}
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
                      🎓 Harvard Business School Frameworks
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {workflows.filter(w => w.category === 'HBS').map((workflow) => (
                        <button
                          key={workflow.id}
                          type="button"
                          onClick={() => setSelectedWorkflow(workflow.id as WorkflowType)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            selectedWorkflow === workflow.id
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{workflow.icon}</span>
                            <span className="text-xs text-slate-400">{workflow.time}</span>
                          </div>
                          <div className="text-sm font-medium text-white">{workflow.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

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
                  Generate Marketing Strategy
                </Button>

                <p className="text-sm text-slate-400 text-center">
                  Powered by advanced AI agents • Free analysis
                </p>
              </form>
            </Card>

            {/* Feature highlights */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-slate-900/30 border-slate-700">
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="text-lg font-semibold text-white mb-2">19 AI Workflows</h3>
                <p className="text-sm text-slate-400">
                  Marketing intelligence, strategic frameworks, and HBS methodologies
                </p>
              </Card>

              <Card className="p-6 bg-slate-900/30 border-slate-700">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-white mb-2">Actionable Insights</h3>
                <p className="text-sm text-slate-400">
                  Get specific recommendations tailored to your business, not generic advice
                </p>
              </Card>

              <Card className="p-6 bg-slate-900/30 border-slate-700">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Chat Assistant</h3>
                <p className="text-sm text-slate-400">
                  Ask follow-up questions and get expert marketing guidance instantly
                </p>
              </Card>
            </div>
          </div>
        ) : !result && isAnalyzing ? (
          /* Loading State */
          <div className="mx-auto max-w-2xl text-center">
            <Card className="p-12 bg-slate-900/50 border-slate-700">
              <div className="flex flex-col items-center gap-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    AI Agents Working...
                  </h2>
                  <p className="text-slate-400">
                    Analyzing your website and generating marketing strategy
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    This usually takes 30 seconds to 2 minutes
                  </p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Results */
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Marketing Strategy Results
                </h1>
                <p className="text-slate-400">{websiteUrl}</p>
                <p className="text-sm text-slate-500">
                  Completed in {((result?.executionTime || 0) / 1000).toFixed(1)}s
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowChat(!showChat)}
                  variant={showChat ? "default" : "outline"}
                  className={showChat ? "bg-emerald-500" : ""}
                >
                  💬 AI Chat
                </Button>
                <Button
                  onClick={() => {
                    setResult(null)
                    setWebsiteUrl("")
                    setBusinessName("")
                    setIndustry("")
                    setChatMessages([])
                  }}
                  variant="outline"
                >
                  New Analysis
                </Button>
              </div>
            </div>

            {/* Chat Panel */}
            {showChat && (
              <Card className="p-6 bg-slate-900/50 border-emerald-500/30">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>💬</span>
                  Marketing AI Assistant
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Ask me anything about your marketing strategy, how to use the tools, or get specific advice.
                </p>

                {/* Messages */}
                <div className="bg-slate-950/50 rounded-lg p-4 mb-4 h-96 overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-slate-500 py-12">
                      <div className="text-4xl mb-2">👋</div>
                      <p>Start a conversation! Try asking:</p>
                      <div className="mt-4 space-y-2 text-sm">
                        <p>"How do I improve my SEO?"</p>
                        <p>"What should I post on Instagram?"</p>
                        <p>"Explain my brand analysis"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === 'user'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-800 text-slate-200'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-800 text-slate-400 rounded-lg p-3 text-sm">
                            Thinking...
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isChatLoading && handleChatSend()}
                    placeholder="Ask a marketing question..."
                    disabled={isChatLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleChatSend}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    Send
                  </Button>
                </div>
              </Card>
            )}

            {/* Key Metrics */}
            {result && (
              <>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6 bg-slate-900/50 border-slate-700">
                    <div className="text-sm text-slate-400 mb-1">Estimated Impact</div>
                    <div className="text-lg font-semibold text-white">{result.estimatedImpact}</div>
                  </Card>

                  <Card className="p-6 bg-slate-900/50 border-slate-700">
                    <div className="text-sm text-slate-400 mb-1">Timeline</div>
                    <div className="text-lg font-semibold text-white">{result.timeline}</div>
                  </Card>

                  <Card className="p-6 bg-slate-900/50 border-slate-700">
                    <div className="text-sm text-slate-400 mb-1">Analysis Type</div>
                    <div className="text-lg font-semibold text-white capitalize">
                      {result.workflow.replace(/-/g, ' ')}
                    </div>
                  </Card>
                </div>

                {/* Recommendations */}
                <Card className="p-8 bg-linear-to-br from-emerald-900/20 to-slate-900/50 border-emerald-500/30">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>✨</span>
                    Top Recommendations
                  </h2>
                  <div className="space-y-3">
                    {result.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <span className="text-emerald-400 font-bold mt-1">{idx + 1}.</span>
                        <p className="text-slate-200">{rec}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Next Steps */}
                <Card className="p-8 bg-slate-900/50 border-slate-700">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>🎯</span>
                    Next Steps
                  </h2>
                  <div className="space-y-3">
                    {result.nextSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                          <span className="text-xs text-emerald-400">{idx + 1}</span>
                        </div>
                        <p className="text-slate-300">{step}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Detailed Results (collapsible sections) */}
                {result.intelligence && (
                  <Card className="p-8 bg-slate-900/50 border-slate-700">
                    <h2 className="text-2xl font-bold text-white mb-4">Website Intelligence</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Brand */}
                      {result.intelligence.brandAnalysis && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Brand</h3>
                          <p className="text-sm text-slate-400 mb-2">
                            Tone: {result.intelligence.brandAnalysis.tone}
                          </p>
                          {result.intelligence.brandAnalysis.tagline && (
                            <p className="text-sm text-slate-300 italic">
                              "{result.intelligence.brandAnalysis.tagline}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* SEO */}
                      {result.intelligence.seoData && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">SEO Status</h3>
                          <div className="text-sm text-slate-400 space-y-1">
                            <p>Images: {result.intelligence.seoData.imageCount} ({result.intelligence.seoData.imagesWithAlt} with alt text)</p>
                            <p>Internal Links: {result.intelligence.seoData.internalLinks}</p>
                            <p>Schema: {result.intelligence.seoData.hasSchema ? '✓ Yes' : '✗ No'}</p>
                          </div>
                        </div>
                      )}

                      {/* Social */}
                      {result.intelligence.socialLinks && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Social Presence</h3>
                          <div className="flex gap-2 flex-wrap">
                            {Object.entries(result.intelligence.socialLinks)
                              .filter(([_, url]) => url)
                              .map(([platform]) => (
                                <span key={platform} className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-300">
                                  {platform}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      {result.intelligence.contentAnalysis && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Content</h3>
                          <p className="text-sm text-slate-400">
                            Blog: {result.intelligence.contentAnalysis.hasBlog ? '✓ Yes' : '✗ No'}
                          </p>
                          <p className="text-sm text-slate-400">
                            Media Richness: {result.intelligence.contentAnalysis.mediaRichness}/10
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* CTA */}
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Execute?</h3>
              <p className="text-slate-400 mb-6">Use our AI tools to create content and implement your strategy</p>
              <div className="flex gap-4 justify-center">
                <Link href="/content">
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 px-8">
                    Generate Content
                  </Button>
                </Link>
                <Link href="/tools">
                  <Button size="lg" variant="outline" className="px-8">
                    Browse AI Tools
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

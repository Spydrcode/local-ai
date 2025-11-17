"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { formatToolOutput } from "@/lib/format-tool-output"
import Link from "next/link"
import { useEffect, useState } from "react"

// Unified Tool System powered by specialized agents
const toolCategories = [
  {
    id: "web-scraper",
    title: "🌐 Website Intelligence",
    description: "Analyze any website to extract comprehensive business data",
    color: "emerald",
    tools: [
      {
        id: "analyze-website",
        title: "Website Analyzer",
        description: "Deep-scan any website for business intelligence, competitors, SEO, social, brand analysis",
        icon: "🔍",
        isPrimary: true,
        apiEndpoint: "/api/marketing-strategy",
        agents: ['web-scraper-agent']
      }
    ]
  },
  {
    id: "marketing",
    title: "📢 Marketing & Content Creation",
    description: "AI-powered content for all marketing channels",
    color: "orange",
    tools: [
      {
        id: "social-content",
        title: "Social Media Content Generator",
        description: "Platform-optimized posts for Facebook, Instagram, LinkedIn (all 3 platforms at once!)",
        icon: "📱",
        apiEndpoint: "/api/tools/social-content",
        agents: ['facebook-marketing', 'instagram-marketing', 'linkedin-marketing'],
        requiresWebsiteData: false
      },
      {
        id: "blog-seo-writer",
        title: "Blog & SEO Content Writer",
        description: "SEO-optimized blog posts, service pages, and long-form content",
        icon: "✍️",
        apiEndpoint: "/api/tools/blog-seo-writer",
        agents: ['blog-writer'],
        requiresWebsiteData: false
      },
      {
        id: "email-hub",
        title: "Email Marketing Hub",
        description: "Newsletters, campaigns, and automated email sequences",
        icon: "📧",
        apiEndpoint: "/api/tools/email-hub",
        agents: ['newsletter'],
        requiresWebsiteData: false
      }
    ]
  },
  {
    id: "strategic",
    title: "🎯 Strategic Growth & Analysis",
    description: "Deep business analysis and strategic planning",
    color: "emerald",
    tools: [
      {
        id: "business-audit",
        title: "Complete Business Audit",
        description: "Full business analysis: strengths & weaknesses, competitor comparison, SEO opportunities, and growth strategy",
        icon: "🎯",
        apiEndpoint: "/api/tools/business-audit",
        agents: ['web-scraper-agent', 'strategic-analysis', 'competitive-intelligence', 'marketing-content'],
        requiresWebsiteData: true
      },
      {
        id: "pricing-strategy",
        title: "Pricing Strategy Analyzer",
        description: "Find the right price for your services based on what competitors charge and what customers will pay",
        icon: "💵",
        apiEndpoint: "/api/tools/pricing-strategy",
        agents: ['pricing-intelligence', 'competitive-intelligence'],
        requiresWebsiteData: false
      },
      {
        id: "service-packages",
        title: "Service Package Designer",
        description: "Create Basic, Standard, and Premium service packages that help customers choose and increase your revenue",
        icon: "📦",
        apiEndpoint: "/api/tools/service-packages",
        agents: ['strategic-analysis', 'revenue-intelligence'],
        requiresWebsiteData: false
      }
    ]
  }
]

const colorClasses = {
  emerald: "border-emerald-500/50 hover:border-emerald-500 bg-emerald-500/5",
  blue: "border-blue-500/50 hover:border-blue-500 bg-blue-500/5",
  pink: "border-pink-500/50 hover:border-pink-500 bg-pink-500/5",
  green: "border-green-500/50 hover:border-green-500 bg-green-500/5",
  purple: "border-purple-500/50 hover:border-purple-500 bg-purple-500/5",
  orange: "border-orange-500/50 hover:border-orange-500 bg-orange-500/5",
  yellow: "border-yellow-500/50 hover:border-yellow-500 bg-yellow-500/5",
  red: "border-red-500/50 hover:border-red-500 bg-red-500/5",
  cyan: "border-cyan-500/50 hover:border-cyan-500 bg-cyan-500/5",
  gray: "border-gray-500/50 hover:border-gray-500 bg-gray-500/5"
}

export default function DashboardPage() {
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasWebsiteData, setHasWebsiteData] = useState(false)
  const [error, setError] = useState("")
  const [selectedTool, setSelectedTool] = useState<any>(null)
  const [toolResult, setToolResult] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Check for existing analysis data
  useEffect(() => {
    const marketingAnalysis = sessionStorage.getItem('marketingAnalysis')
    const savedUrl = sessionStorage.getItem('lastAnalyzedUrl')
    
    if (marketingAnalysis) {
      try {
        const analysis = JSON.parse(marketingAnalysis)
        const url = savedUrl || 
                   analysis.metadata?.url || 
                   analysis.website || 
                   ""
        
        // Only set hasWebsiteData if we actually have a URL
        if (url) {
          setHasWebsiteData(true)
          setWebsiteUrl(url)
        }
        
        setBusinessName(analysis.business_name || analysis.business?.name || "")
        setBusinessType(analysis.industry || analysis.business?.industry || "")
      } catch (err) {
        console.error('Failed to parse analysis:', err)
      }
    }
  }, [])

  const handleAnalyzeWebsite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!websiteUrl) {
      setError("Please enter a website URL")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      console.log("[Dashboard] Starting WebScraperAgent analysis for:", websiteUrl)
      
      // Use WebScraperAgent for comprehensive intelligence extraction
      const response = await fetch('/api/web-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: websiteUrl,
          mode: 'comprehensive', // Full intelligence extraction
          paths: ["/", "/about", "/services", "/pricing", "/contact"]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Analysis failed')
      }

      const { data, duration } = await response.json()
      
      console.log(`[Dashboard] Analysis completed in ${duration}ms`)
      console.log("[Dashboard] Data collected:", {
        business: !!data.business,
        competitors: data.competitors?.length || 0,
        seo: !!data.seo,
        social: !!data.social,
        reviews: data.reviews?.totalReviews || 0,
        brandAnalysis: !!data.brandAnalysis,
        contentAnalysis: !!data.contentAnalysis
      })
      
      // Store comprehensive intelligence data for all tools
      const intelligenceData = {
        ...data,
        userProvidedName: businessName || undefined,
        userProvidedIndustry: businessType || undefined,
        scrapedAt: new Date().toISOString(),
        source: 'web-scraper-agent',
        metadata: {
          ...data.metadata,
          url: websiteUrl // Ensure URL is stored
        }
      }

      sessionStorage.setItem('websiteIntelligence', JSON.stringify(intelligenceData))
      // Also store in marketingAnalysis for backward compatibility
      sessionStorage.setItem('marketingAnalysis', JSON.stringify(intelligenceData))
      // Store the URL separately for easy access
      sessionStorage.setItem('lastAnalyzedUrl', websiteUrl)

      setHasWebsiteData(true)
      
      // Update UI with extracted data
      const extractedName = data.business?.name || businessName || ""
      const extractedIndustry = data.business?.industry || businessType || ""
      
      setBusinessName(extractedName)
      setBusinessType(extractedIndustry)
      
      console.log("[Dashboard] Intelligence data stored successfully")
    } catch (err: any) {
      console.error("[Dashboard] Analysis failed:", err)
      setError(err.message || "Failed to analyze website. Please check the URL and try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRunTool = async (tool: any) => {
    if (!hasWebsiteData && !tool.isPrimary) {
      setError("Please analyze a website first to use this tool")
      return
    }

    setSelectedTool(tool)
    setIsGenerating(true)
    setError("")
    setToolResult(null)

    try {
      // Get comprehensive intelligence data from WebScraperAgent
      const intelligenceData = sessionStorage.getItem('websiteIntelligence') || 
                              sessionStorage.getItem('marketingAnalysis')
      const intelligence = intelligenceData ? JSON.parse(intelligenceData) : null

      console.log("[Dashboard] Running tool:", tool.id)
      console.log("[Dashboard] Intelligence data available:", {
        business: !!intelligence?.business,
        competitors: intelligence?.competitors?.length || 0,
        seo: !!intelligence?.seo,
        social: !!intelligence?.social,
        reviews: intelligence?.reviews?.totalReviews || 0,
        brandAnalysis: !!intelligence?.brandAnalysis,
        contentAnalysis: !!intelligence?.contentAnalysis
      })

      // Prepare comprehensive payload for the tool
      const basePayload = {
        // Business details
        business_name: intelligence?.business?.name || 
                      intelligence?.userProvidedName || 
                      businessName,
        business_type: intelligence?.business?.industry || 
                      intelligence?.userProvidedIndustry || 
                      businessType,
        
        // Comprehensive intelligence from WebScraperAgent
        intelligence: {
          business: intelligence?.business,
          competitors: intelligence?.competitors,
          seo: intelligence?.seo,
          social: intelligence?.social,
          reviews: intelligence?.reviews,
          brandAnalysis: intelligence?.brandAnalysis,
          contentAnalysis: intelligence?.contentAnalysis,
          metaAds: intelligence?.metaAds,
          metadata: intelligence?.metadata
        },
        
        // Backward compatibility
        website_analysis: intelligence
      }

      // Add tool-specific required fields
      let payload: any = { ...basePayload }
      
      if (tool.id === 'social-content') {
        // Default to ALL platforms mode
        payload.mode = 'all' // Generates Facebook, Instagram, LinkedIn simultaneously
        payload.tone = 'friendly'
      } else if (tool.id === 'blog-seo-writer') {
        // Use first keyword from intelligence or generate from business type
        payload.primary_keyword = intelligence?.seo?.keywords?.[0] || 
                                  intelligence?.business?.services?.[0] ||
                                  `best ${payload.business_type.toLowerCase()}`
        payload.tone = 'educational'
      } else if (tool.id === 'email-hub') {
        payload.email_type = 'newsletter' // Default email type
        payload.tone = 'professional'
      } else if (tool.id === 'business-audit') {
        // Get URL from multiple sources in priority order
        payload.website_url = websiteUrl || // Current state variable
                             intelligence?.metadata?.url || 
                             sessionStorage.getItem('lastAnalyzedUrl') ||
                             ''
      } else if (tool.id === 'ad-copy') {
        payload.platform = 'facebook'
        payload.campaign_goal = 'awareness'
      } else if (tool.id === 'website-copy') {
        payload.page_type = 'landing-page'
      } else if (tool.id === 'objection-handler') {
        payload.objection_type = 'price'
      }

      const response = await fetch(tool.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Tool execution failed')
      }

      const data = await response.json()
      console.log(`[Dashboard] Tool ${tool.id} completed successfully`)
      setToolResult(data)
    } catch (err: any) {
      console.error(`[Dashboard] Tool ${tool.id} failed:`, err)
      setError(`Failed to run ${tool.title}: ${err.message || 'Please try again.'}`)
    } finally {
      setIsGenerating(false)
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
              <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white">Home</Link>
              <Link href="/dashboard" className="text-sm font-medium text-emerald-400">Dashboard</Link>
              <Link href="/pricing" className="text-sm font-medium text-slate-300 hover:text-white">Pricing</Link>
              <Link href="/agency" className="text-sm font-medium text-slate-300 hover:text-white">Agency Portal</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Tools Dashboard</h1>
          <p className="text-lg text-slate-400">
            {hasWebsiteData ? (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Website analyzed - All tools ready to use
              </span>
            ) : (
              "Analyze a website from the homepage to unlock all AI tools"
            )}
          </p>
        </div>

        {/* All Tool Categories */}
        <div className="space-y-8">
          {toolCategories.slice(1).map((category) => (
            <div key={category.id}>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-1">{category.title}</h2>
                <p className="text-slate-400">{category.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.tools.map((tool) => (
                  <Card
                    key={tool.id}
                    className={`p-6 ${colorClasses[category.color as keyof typeof colorClasses]} border transition-all`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{tool.icon}</span>
                      {'isPrimary' in tool && tool.isPrimary && (
                        <span className="text-xs bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2 py-1 text-emerald-400">
                          Primary
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{tool.title}</h3>
                    <p className="text-sm text-slate-300 mb-4">{tool.description}</p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleRunTool(tool)}
                      disabled={!hasWebsiteData && !('isPrimary' in tool && tool.isPrimary)}
                    >
                      {isGenerating && selectedTool?.id === tool.id ? "Running..." : "Run Tool"}
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tool Result Modal */}
        {toolResult && selectedTool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
            <Card className="max-w-4xl w-full my-8 bg-slate-900 border-slate-700 flex flex-col max-h-[90vh]">
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{selectedTool.icon} {selectedTool.title}</h3>
                    <p className="text-slate-400">{selectedTool.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setToolResult(null)
                      setSelectedTool(null)
                    }}
                    className="text-slate-400 hover:text-white ml-4"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto p-6 flex-1">

              {/* Formatted Output - Ready to Copy/Paste */}
              {selectedTool.id === 'social-content' && toolResult.structured_outputs?.all_platforms ? (
                // Special rendering for multi-platform social content
                <div className="space-y-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-emerald-400">✓ Posts Generated for All Platforms</span>
                    <Button
                      size="sm"
                      onClick={() => handleRunTool(selectedTool)}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      🔄 Regenerate All
                    </Button>
                  </div>

                  {/* Facebook Post */}
                  <div className="bg-slate-950 p-6 rounded-lg border border-blue-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📘</span>
                        <h4 className="text-lg font-bold text-white">Facebook</h4>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(toolResult.structured_outputs.all_platforms.facebook.post);
                        }}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        📋 Copy Facebook Post
                      </Button>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-200 leading-relaxed mb-3">
                      {toolResult.structured_outputs.all_platforms.facebook.post}
                    </pre>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p><strong>Hashtags:</strong> {toolResult.structured_outputs.all_platforms.facebook.hashtags}</p>
                      <p><strong>Best Time:</strong> {toolResult.structured_outputs.all_platforms.facebook.best_time}</p>
                      <p><strong>Characters:</strong> {toolResult.structured_outputs.all_platforms.facebook.character_count}</p>
                    </div>
                  </div>

                  {/* Instagram Post */}
                  <div className="bg-slate-950 p-6 rounded-lg border border-pink-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📸</span>
                        <h4 className="text-lg font-bold text-white">Instagram</h4>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          const fullPost = `${toolResult.structured_outputs.all_platforms.instagram.caption}\n\n${toolResult.structured_outputs.all_platforms.instagram.hashtags}`;
                          navigator.clipboard.writeText(fullPost);
                        }}
                        className="bg-pink-500 hover:bg-pink-600"
                      >
                        📋 Copy Instagram Post
                      </Button>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-200 leading-relaxed mb-3">
                      {toolResult.structured_outputs.all_platforms.instagram.caption}
                    </pre>
                    <div className="text-xs text-slate-400 space-y-1 mb-3">
                      <p><strong>Visual Suggestion:</strong> {toolResult.structured_outputs.all_platforms.instagram.visual_suggestion}</p>
                      <p><strong>Hashtags:</strong> {toolResult.structured_outputs.all_platforms.instagram.hashtags}</p>
                      <p><strong>Best Time:</strong> {toolResult.structured_outputs.all_platforms.instagram.best_time}</p>
                    </div>
                  </div>

                  {/* LinkedIn Post */}
                  <div className="bg-slate-950 p-6 rounded-lg border border-blue-400/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💼</span>
                        <h4 className="text-lg font-bold text-white">LinkedIn</h4>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(toolResult.structured_outputs.all_platforms.linkedin.post);
                        }}
                        className="bg-blue-400 hover:bg-blue-500"
                      >
                        📋 Copy LinkedIn Post
                      </Button>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-200 leading-relaxed mb-3">
                      {toolResult.structured_outputs.all_platforms.linkedin.post}
                    </pre>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p><strong>Hashtags:</strong> {toolResult.structured_outputs.all_platforms.linkedin.hashtags}</p>
                      <p><strong>Best Time:</strong> {toolResult.structured_outputs.all_platforms.linkedin.best_time}</p>
                      <p><strong>Characters:</strong> {toolResult.structured_outputs.all_platforms.linkedin.character_count}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Default rendering for other tools
                <div className="bg-slate-950 p-6 rounded-lg mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-emerald-400">✓ Ready to Copy & Paste</span>
                    <Button
                      size="sm"
                      onClick={() => {
                        const formatted = formatToolOutput(selectedTool.id, toolResult);
                        navigator.clipboard.writeText(formatted);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      📋 Copy Content
                    </Button>
                  </div>
                <pre className="whitespace-pre-wrap text-sm text-slate-200 font-mono leading-relaxed">
                  {formatToolOutput(selectedTool.id, toolResult)}
                </pre>
                </div>
              )}

              {/* Raw JSON (collapsible) */}
              <details>
                <summary className="cursor-pointer text-sm text-slate-400 hover:text-white mb-2">
                  View Raw JSON Data
                </summary>
                <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-xs text-slate-400">
                  {JSON.stringify(toolResult, null, 2)}
                </pre>
              </details>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-10 bg-slate-900 border-t border-slate-700 p-6">
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      const formatted = formatToolOutput(selectedTool.id, toolResult);
                      navigator.clipboard.writeText(formatted);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    📋 Copy Formatted Content
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(toolResult, null, 2));
                    }}
                    variant="outline"
                  >
                    Copy JSON
                  </Button>
                  <Button
                    onClick={() => {
                      setToolResult(null)
                      setSelectedTool(null)
                    }}
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

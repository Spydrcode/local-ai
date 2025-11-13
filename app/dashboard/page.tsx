"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { formatToolOutput } from "@/lib/format-tool-output"
import Link from "next/link"
import { useEffect, useState } from "react"

// All AI Tools organized by category
const toolCategories = [
  {
    id: "web-scraper",
    title: "🌐 Website Intelligence",
    description: "Primary tool: Analyze any website to extract comprehensive business data",
    color: "emerald",
    tools: [
      {
        id: "analyze-website",
        title: "Website Analyzer",
        description: "Deep-scan any website for business intelligence, competitors, SEO, social, brand analysis",
        icon: "🔍",
        isPrimary: true,
        apiEndpoint: "/api/marketing-strategy"
      }
    ]
  },
  {
    id: "content-marketing",
    title: "📝 Content Marketing",
    description: "Create engaging content that attracts customers",
    color: "orange",
    tools: [
      {
        id: "facebook-post",
        title: "Facebook Post",
        description: "Engaging Facebook posts with emojis",
        icon: "📘",
        apiEndpoint: "/api/tools/facebook-post"
      },
      {
        id: "instagram-post",
        title: "Instagram Post",
        description: "Scroll-stopping Instagram captions with hashtags",
        icon: "📸",
        apiEndpoint: "/api/tools/instagram-post"
      },
      {
        id: "linkedin-post",
        title: "LinkedIn Post",
        description: "Professional thought leadership posts",
        icon: "💼",
        apiEndpoint: "/api/tools/linkedin-post"
      },
      {
        id: "blog-writer",
        title: "Blog Post Writer",
        description: "SEO-optimized blog posts for your industry",
        icon: "✍️",
        apiEndpoint: "/api/tools/blog-writer"
      },
      {
        id: "video-script",
        title: "Video Script Writer",
        description: "Scripts for social media and YouTube videos",
        icon: "🎥",
        apiEndpoint: "/api/tools/video-script"
      },
      {
        id: "newsletter",
        title: "Newsletter Creator",
        description: "Monthly newsletters for your email list",
        icon: "📬",
        apiEndpoint: "/api/tools/newsletter"
      },
      {
        id: "faq-builder",
        title: "FAQ Builder",
        description: "Answer common customer questions",
        icon: "❓",
        apiEndpoint: "/api/tools/faq-builder"
      }
    ]
  },
  {
    id: "competitive",
    title: "🏆 Stand Out from Competitors",
    description: "Highlight what makes your business unique",
    color: "purple",
    tools: [
      {
        id: "why-choose-us",
        title: "Why Choose Us Page",
        description: "Showcase your differentiators vs competitors",
        icon: "⭐",
        apiEndpoint: "/api/tools/why-choose-us"
      },
      {
        id: "positioning-statement",
        title: "Positioning Statement",
        description: "Clarify how you're uniquely different",
        icon: "🎪",
        apiEndpoint: "/api/tools/positioning-statement"
      },
      {
        id: "usp-generator",
        title: "USP Generator",
        description: "Unique selling proposition that converts",
        icon: "💎",
        apiEndpoint: "/api/tools/usp-generator"
      },
      {
        id: "case-study",
        title: "Case Study Writer",
        description: "Success stories that build credibility",
        icon: "📊",
        apiEndpoint: "/api/tools/case-study"
      }
    ]
  },
  {
    id: "social-proof",
    title: "⭐ Reviews & Social Proof",
    description: "Build trust and credibility",
    color: "yellow",
    tools: [
      {
        id: "review-responder",
        title: "Review Responder",
        description: "Professional responses to customer reviews",
        icon: "💬",
        apiEndpoint: "/api/tools/review-responder"
      },
      {
        id: "negative-review",
        title: "Negative Review Handler",
        description: "Turn bad reviews into opportunities",
        icon: "🔧",
        apiEndpoint: "/api/tools/negative-review"
      },
      {
        id: "testimonial-request",
        title: "Testimonial Request",
        description: "Email templates to ask for testimonials",
        icon: "🌟",
        apiEndpoint: "/api/tools/testimonial-request"
      },
      {
        id: "social-testimonial",
        title: "Social Testimonial Post",
        description: "Turn reviews into social media posts",
        icon: "📱",
        apiEndpoint: "/api/tools/social-testimonial"
      }
    ]
  },
  {
    id: "local-seo",
    title: "📍 Local SEO Tools",
    description: "Get found by local customers searching for your services",
    color: "blue",
    tools: [
      {
        id: "gmb-post",
        title: "Google Business Post",
        description: "Weekly GMB posts to boost local search rankings",
        icon: "🏪",
        apiEndpoint: "/api/tools/gmb-post"
      },
      {
        id: "local-seo-meta",
        title: "Local SEO Meta Tags",
        description: "Page titles & descriptions that rank in local search",
        icon: "🔍",
        apiEndpoint: "/api/tools/local-seo-meta"
      },
      {
        id: "location-page",
        title: "Location Page Writer",
        description: "SEO-optimized service area pages",
        icon: "🗺️",
        apiEndpoint: "/api/tools/location-page"
      }
    ]
  },
  {
    id: "customer-retention",
    title: "💝 Customer Retention",
    description: "Keep customers coming back and boost lifetime value",
    color: "pink",
    tools: [
      {
        id: "win-back-email",
        title: "Win-Back Email",
        description: "Re-engage customers who haven't bought in 60+ days",
        icon: "🔄",
        apiEndpoint: "/api/tools/win-back-email"
      },
      {
        id: "loyalty-program",
        title: "Loyalty Program Designer",
        description: "Simple reward programs that increase repeat business",
        icon: "🎁",
        apiEndpoint: "/api/tools/loyalty-program"
      },
      {
        id: "referral-request",
        title: "Referral Request Email",
        description: "Ask happy customers for referrals the right way",
        icon: "🤝",
        apiEndpoint: "/api/tools/referral-request"
      }
    ]
  },
  {
    id: "sales-conversion",
    title: "💰 Sales & Conversion",
    description: "Turn more visitors into paying customers",
    color: "green",
    tools: [
      {
        id: "landing-page",
        title: "Landing Page Copy",
        description: "High-converting landing pages for your services",
        icon: "🎯",
        apiEndpoint: "/api/tools/landing-page"
      },
      {
        id: "sales-sequence",
        title: "Sales Email Sequence",
        description: "3-email series to convert leads into customers",
        icon: "📧",
        apiEndpoint: "/api/tools/sales-sequence"
      },
      {
        id: "objection-handler",
        title: "Objection Handler",
        description: "Responses to price, timing, and competitor objections",
        icon: "💬",
        apiEndpoint: "/api/tools/objection-handler"
      },
      {
        id: "pricing-strategy",
        title: "Pricing Strategy",
        description: "Data-driven pricing recommendations",
        icon: "💵",
        apiEndpoint: "/api/tools/pricing-strategy"
      }
    ]
  },
  {
    id: "advertising",
    title: "📣 Advertising & Promotion",
    description: "Paid advertising that drives results",
    color: "red",
    tools: [
      {
        id: "ad-copy",
        title: "Ad Copy Generator",
        description: "Facebook, Google, and Instagram ads",
        icon: "💸",
        apiEndpoint: "/api/tools/ad-copy"
      },
      {
        id: "partnership-pitch",
        title: "Partnership Pitch",
        description: "Proposals for business partnerships",
        icon: "🤝",
        apiEndpoint: "/api/tools/partnership-pitch"
      },
      {
        id: "sponsorship-pitch",
        title: "Sponsorship Pitch",
        description: "Pitch local sponsorship opportunities",
        icon: "🎯",
        apiEndpoint: "/api/tools/sponsorship-pitch"
      }
    ]
  },
  {
    id: "customer-service",
    title: "💼 Customer Service & Operations",
    description: "Streamline communication and operations",
    color: "cyan",
    tools: [
      {
        id: "email-writer",
        title: "Email Writer",
        description: "Professional emails for any situation",
        icon: "📧",
        apiEndpoint: "/api/tools/email-writer"
      },
      {
        id: "auto-response",
        title: "Auto-Response Templates",
        description: "Quick replies to common inquiries",
        icon: "⚡",
        apiEndpoint: "/api/tools/auto-response"
      },
      {
        id: "booking-confirmation",
        title: "Booking Confirmation",
        description: "Appointment confirmation emails",
        icon: "📅",
        apiEndpoint: "/api/tools/booking-confirmation"
      },
      {
        id: "invoice-followup",
        title: "Invoice Follow-up",
        description: "Friendly payment reminder emails",
        icon: "💳",
        apiEndpoint: "/api/tools/invoice-followup"
      },
      {
        id: "apology-email",
        title: "Apology Email",
        description: "Professional apologies that rebuild trust",
        icon: "🙏",
        apiEndpoint: "/api/tools/apology-email"
      },
      {
        id: "crisis-communication",
        title: "Crisis Communication",
        description: "Handle business emergencies professionally",
        icon: "🚨",
        apiEndpoint: "/api/tools/crisis-communication"
      }
    ]
  },
  {
    id: "business-operations",
    title: "⚙️ Business Operations",
    description: "Internal business management tools",
    color: "gray",
    tools: [
      {
        id: "job-description",
        title: "Job Description Writer",
        description: "Attract top talent with clear job posts",
        icon: "👥",
        apiEndpoint: "/api/tools/job-description"
      },
      {
        id: "policy-generator",
        title: "Policy Generator",
        description: "Refund, shipping, and privacy policies",
        icon: "📜",
        apiEndpoint: "/api/tools/policy-generator"
      },
      {
        id: "service-packages",
        title: "Service Package Designer",
        description: "Tiered service offerings that upsell",
        icon: "📦",
        apiEndpoint: "/api/tools/service-packages"
      },
      {
        id: "networking-followup",
        title: "Networking Follow-up",
        description: "Professional follow-up emails",
        icon: "🤝",
        apiEndpoint: "/api/tools/networking-followup"
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
    if (marketingAnalysis) {
      try {
        const analysis = JSON.parse(marketingAnalysis)
        setHasWebsiteData(true)
        setWebsiteUrl(analysis.website || "")
        setBusinessName(analysis.business_name || "")
        setBusinessType(analysis.industry || "")
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
        source: 'web-scraper-agent'
      }

      sessionStorage.setItem('websiteIntelligence', JSON.stringify(intelligenceData))
      // Also store in marketingAnalysis for backward compatibility
      sessionStorage.setItem('marketingAnalysis', JSON.stringify(intelligenceData))

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
      const payload = {
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
              <Link href="/agency/dashboard" className="text-sm font-medium text-slate-300 hover:text-white">Agency Portal</Link>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <Card className="max-w-4xl w-full max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedTool.icon} {selectedTool.title}</h3>
                  <p className="text-slate-400">{selectedTool.description}</p>
                </div>
                <button
                  onClick={() => {
                    setToolResult(null)
                    setSelectedTool(null)
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Formatted Output - Ready to Copy/Paste */}
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

              {/* Raw JSON (collapsible) */}
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-slate-400 hover:text-white mb-2">
                  View Raw JSON Data
                </summary>
                <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-xs text-slate-400">
                  {JSON.stringify(toolResult, null, 2)}
                </pre>
              </details>

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
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

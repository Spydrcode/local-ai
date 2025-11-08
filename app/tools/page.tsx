"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect, useState } from "react"

const toolCategories = [
  {
    id: "local-seo",
    title: "Local SEO Tools",
    icon: "📍",
    description: "Get found by local customers searching for your services",
    tools: [
      {
        id: "gmb-post",
        title: "Google Business Post",
        description: "Weekly GMB posts to boost local search rankings",
        icon: "🏪"
      },
      {
        id: "local-seo-meta",
        title: "Local SEO Meta Tags",
        description: "Page titles & descriptions that rank in local search",
        icon: "🔍"
      },
      {
        id: "location-page",
        title: "Location Page Writer",
        description: "SEO-optimized service area pages",
        icon: "🗺️"
      },
    ]
  },
  {
    id: "customer-retention",
    title: "Customer Retention",
    icon: "💝",
    description: "Keep customers coming back and boost lifetime value",
    tools: [
      {
        id: "win-back-email",
        title: "Win-Back Email",
        description: "Re-engage customers who haven't bought in 60+ days",
        icon: "🔄"
      },
      {
        id: "loyalty-program",
        title: "Loyalty Program Designer",
        description: "Simple reward programs that increase repeat business",
        icon: "🎁"
      },
      {
        id: "referral-request",
        title: "Referral Request Email",
        description: "Ask happy customers for referrals the right way",
        icon: "🤝"
      },
    ]
  },
  {
    id: "sales-conversion",
    title: "Sales & Conversion",
    icon: "💰",
    description: "Turn more visitors into paying customers",
    tools: [
      {
        id: "landing-page",
        title: "Landing Page Copy",
        description: "High-converting landing pages for your services",
        icon: "🎯"
      },
      {
        id: "sales-sequence",
        title: "Sales Email Sequence",
        description: "3-email series to convert leads into customers",
        icon: "📧"
      },
      {
        id: "objection-handler",
        title: "Objection Handler",
        description: "Responses to price, timing, and competitor objections",
        icon: "💬"
      },
    ]
  },
  {
    id: "competitive",
    title: "Stand Out from Competitors",
    icon: "🏆",
    description: "Highlight what makes your business unique",
    tools: [
      {
        id: "why-choose-us",
        title: "Why Choose Us Page",
        description: "Showcase your differentiators vs competitors",
        icon: "⭐"
      },
      {
        id: "positioning-statement",
        title: "Positioning Statement",
        description: "What to say when asked 'Why not [competitor]?'",
        icon: "🎤"
      },
      {
        id: "usp-generator",
        title: "USP Generator",
        description: "Distill your unique value into one powerful line",
        icon: "💡"
      },
    ]
  },
  {
    id: "social-proof",
    title: "Social Proof",
    icon: "⭐",
    description: "Collect and showcase customer success stories",
    tools: [
      {
        id: "testimonial-request",
        title: "Testimonial Request Email",
        description: "Ask customers for reviews at the perfect moment",
        icon: "📝"
      },
      {
        id: "case-study",
        title: "Case Study Outline",
        description: "Turn success stories into compelling case studies",
        icon: "📊"
      },
      {
        id: "social-testimonial",
        title: "Social Testimonial Post",
        description: "Turn customer reviews into shareable posts",
        icon: "📱"
      },
    ]
  },
  {
    id: "marketing",
    title: "Marketing Tools",
    icon: "📢",
    description: "Create professional marketing content quickly",
    tools: [
      {
        id: "email-writer",
        title: "Email Writer",
        description: "Write professional emails to customers in seconds",
        icon: "✉️"
      },
      {
        id: "review-responder",
        title: "Review Responder",
        description: "Perfect responses to Google and Yelp reviews",
        icon: "⭐"
      },
      {
        id: "ad-copy",
        title: "Ad Copy Generator",
        description: "Facebook and Google ads that get clicks",
        icon: "🎯"
      },
    ]
  },
  {
    id: "crisis",
    title: "Crisis Management",
    icon: "🚨",
    description: "Handle problems professionally and rebuild trust",
    tools: [
      {
        id: "negative-review",
        title: "Negative Review Response",
        description: "Turn angry customers around with empathy",
        icon: "😤"
      },
      {
        id: "apology-email",
        title: "Apology Email",
        description: "Sincere apologies that rebuild trust",
        icon: "🙏"
      },
      {
        id: "crisis-communication",
        title: "Crisis Communication",
        description: "What to say when things go wrong",
        icon: "📢"
      },
    ]
  },
  {
    id: "pricing",
    title: "Pricing & Packaging",
    icon: "💵",
    description: "Package and price your services profitably",
    tools: [
      {
        id: "service-packages",
        title: "Service Package Creator",
        description: "Create Good/Better/Best service tiers",
        icon: "📦"
      },
      {
        id: "pricing-strategy",
        title: "Pricing Strategy Guide",
        description: "Pricing recommendations based on your market",
        icon: "💲"
      },
    ]
  },
  {
    id: "partnerships",
    title: "Partnerships & Networking",
    icon: "🤝",
    description: "Build relationships that drive referrals",
    tools: [
      {
        id: "partnership-pitch",
        title: "Partnership Proposal",
        description: "Pitch local businesses on cross-promotion",
        icon: "📄"
      },
      {
        id: "sponsorship-pitch",
        title: "Sponsorship Pitch",
        description: "Get local events/teams to promote you",
        icon: "🎯"
      },
      {
        id: "networking-followup",
        title: "Networking Follow-Up",
        description: "Follow up after meeting potential partners",
        icon: "👋"
      },
    ]
  },
  {
    id: "operations",
    title: "Save Time Tools",
    icon: "⏰",
    description: "Automate repetitive business tasks",
    tools: [
      {
        id: "auto-response",
        title: "Auto-Response Templates",
        description: "Out of office, holidays, after-hours messages",
        icon: "🤖"
      },
      {
        id: "booking-confirmation",
        title: "Booking Confirmation",
        description: "Professional confirmations that reduce no-shows",
        icon: "📅"
      },
      {
        id: "invoice-followup",
        title: "Invoice Follow-Up",
        description: "Polite reminders for overdue payments",
        icon: "💳"
      },
      {
        id: "job-description",
        title: "Job Description Writer",
        description: "Create hiring posts that attract great people",
        icon: "👥"
      },
      {
        id: "policy-generator",
        title: "Policy Generator",
        description: "Return policies, terms of service, etc.",
        icon: "📋"
      },
      {
        id: "faq-builder",
        title: "FAQ Builder",
        description: "Answer common customer questions automatically",
        icon: "❓"
      },
    ]
  },
  {
    id: "content",
    title: "Content Tools",
    icon: "✍️",
    description: "Create engaging content for your audience",
    tools: [
      {
        id: "blog-writer",
        title: "Blog Post Writer",
        description: "SEO-friendly blog posts about your industry",
        icon: "📝"
      },
      {
        id: "video-script",
        title: "Video Script Writer",
        description: "Scripts for TikTok, Reels, and YouTube Shorts",
        icon: "🎬"
      },
      {
        id: "newsletter",
        title: "Newsletter Creator",
        description: "Monthly newsletters for your email list",
        icon: "📬"
      },
    ]
  }
]

export default function ToolsPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [websiteAnalysis, setWebsiteAnalysis] = useState<any>(null)

  // Auto-fill from initial analysis if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAnalysis = sessionStorage.getItem('initialAnalysis')
      if (storedAnalysis) {
        try {
          const analysis = JSON.parse(storedAnalysis)

          // Store the full analysis for use in tool generation
          setWebsiteAnalysis(analysis)

          if (analysis.business_name) {
            setBusinessName(analysis.business_name)
          }
          if (analysis.industry) {
            setBusinessType(analysis.industry)
          }
        } catch (err) {
          console.error('Failed to parse stored analysis:', err)
        }
      }
    }
  }, [])

  const handleGenerateTool = async (toolId: string) => {
    if (!businessName || !businessType) {
      setError("Please enter your business name and type")
      return
    }

    setIsGenerating(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName,
          business_type: businessType,
          website_analysis: websiteAnalysis,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate content")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError("Couldn't generate content. Please try again.")
      console.error(err)
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
              <Link href="/grow" className="text-sm font-medium text-slate-300 hover:text-white">Grow My Business</Link>
              <Link href="/content" className="text-sm font-medium text-slate-300 hover:text-white">Content Creator</Link>
              <Link href="/tools" className="text-sm font-medium text-emerald-400">AI Tools</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">AI Tools</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Save 10+ hours every week with tools that handle the busy work
          </p>
        </div>

        {!selectedTool ? (
          <>
            {/* Business Info Form */}
            <div className="max-w-md mx-auto mb-12">
              <Card className="p-6 bg-slate-900/50 border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">Your Business Info</h2>
                <div className="space-y-4">
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
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Business Type
                    </label>
                    <Input
                      type="text"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      placeholder="Coffee shop"
                      className="w-full"
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    This info is auto-filled from your initial analysis. Choose a tool below to get started.
                  </p>
                </div>
              </Card>
            </div>

            {/* Tool Categories */}
            <div className="grid gap-8 max-w-6xl mx-auto">
          {toolCategories.map((category) => (
            <div key={category.id}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{category.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                  {category.description && (
                    <p className="text-sm text-slate-400 mt-1">{category.description}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {category.tools.map((tool) => (
                  <Card
                    key={tool.id}
                    className="p-6 bg-slate-900/50 border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer"
                    onClick={() => setSelectedTool(tool.id)}
                  >
                    <div className="text-4xl mb-3">{tool.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{tool.title}</h3>
                    <p className="text-sm text-slate-400">{tool.description}</p>
                    <Button
                      size="sm"
                      className="mt-4 w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedTool(tool.id)
                      }}
                    >
                      Try It Free
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
          </>
        ) : (
          // Tool Result View
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={() => {
                setSelectedTool(null)
                setResult(null)
                setError("")
              }}
              variant="outline"
              className="mb-6"
            >
              ← Back to Tools
            </Button>

            <Card className="p-8 bg-slate-900/50 border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">
                {toolCategories
                  .flatMap(c => c.tools)
                  .find(t => t.id === selectedTool)?.title}
              </h2>

              {!result ? (
                <div className="text-center py-12">
                  <Button
                    onClick={() => handleGenerateTool(selectedTool)}
                    disabled={isGenerating || !businessName || !businessType}
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    {isGenerating ? "Generating..." : "Generate Content"}
                  </Button>
                  {(!businessName || !businessType) && (
                    <p className="mt-4 text-sm text-slate-400">
                      Please fill in your business info above first
                    </p>
                  )}
                  {error && (
                    <p className="mt-4 text-sm text-red-400">{error}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Display based on tool type */}
                  {selectedTool === 'faq-builder' && result.faqs ? (
                    <div className="space-y-4">
                      {result.faqs.map((faq: any, idx: number) => (
                        <div key={idx} className="bg-slate-800/50 rounded-lg p-6">
                          <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                          <p className="text-slate-300">{faq.answer}</p>
                        </div>
                      ))}
                      {result.implementation_tips && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                          <p className="text-sm text-emerald-400">💡 {result.implementation_tips}</p>
                        </div>
                      )}
                    </div>
                  ) : selectedTool === 'email-writer' && result.subject ? (
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 rounded-lg p-6">
                        <p className="text-xs text-slate-400 mb-2">Subject Line:</p>
                        <h3 className="font-semibold text-white mb-4">{result.subject}</h3>
                        <p className="text-xs text-slate-400 mb-2">Email Body:</p>
                        <div className="text-slate-300 whitespace-pre-wrap">{result.body}</div>
                      </div>
                      {result.tips && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                          <p className="text-sm text-emerald-400">💡 {result.tips}</p>
                        </div>
                      )}
                    </div>
                  ) : selectedTool === 'review-responder' && result.response ? (
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 rounded-lg p-6">
                        <p className="text-slate-300 whitespace-pre-wrap">{result.response}</p>
                      </div>
                      {result.tone_tips && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                          <p className="text-sm text-emerald-400">💡 {result.tone_tips}</p>
                        </div>
                      )}
                    </div>
                  ) : selectedTool === 'ad-copy' && result.headline ? (
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
                        <div>
                          <p className="text-xs text-slate-400 mb-2">Headline:</p>
                          <h3 className="font-semibold text-white text-lg">{result.headline}</h3>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-2">Ad Body:</p>
                          <p className="text-slate-300 whitespace-pre-wrap">{result.body}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-2">Call to Action:</p>
                          <p className="text-white font-medium">{result.cta}</p>
                        </div>
                      </div>
                      {result.targeting_tips && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                          <p className="text-sm text-emerald-400">💡 {result.targeting_tips}</p>
                        </div>
                      )}
                    </div>
                  ) : selectedTool === 'blog-writer' && result.title ? (
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
                        <div>
                          <p className="text-xs text-slate-400 mb-2">Blog Title:</p>
                          <h3 className="font-semibold text-white text-xl mb-4">{result.title}</h3>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-2">Content:</p>
                          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">{result.content}</div>
                        </div>
                      </div>
                      {result.seo_keywords && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                          <p className="text-sm text-emerald-400">🔑 SEO Keywords: {result.seo_keywords}</p>
                        </div>
                      )}
                    </div>
                  ) : selectedTool === 'video-script' && result.script ? (
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 rounded-lg p-6">
                        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{result.script}</p>
                      </div>
                      {result.platform_tips && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                          <p className="text-sm text-emerald-400">💡 {result.platform_tips}</p>
                        </div>
                      )}
                    </div>
                  ) : selectedTool === 'newsletter' && result.newsletter_content ? (
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 rounded-lg p-6">
                        {result.subject && (
                          <div className="mb-4">
                            <p className="text-xs text-slate-400 mb-2">Subject Line:</p>
                            <h3 className="font-semibold text-white">{result.subject}</h3>
                          </div>
                        )}
                        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">{result.newsletter_content}</div>
                      </div>
                    </div>
                  ) : selectedTool === 'job-description' && result.description ? (
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 rounded-lg p-6">
                        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">{result.description}</div>
                      </div>
                      {result.posting_tips && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                          <p className="text-sm text-emerald-400">💡 {result.posting_tips}</p>
                        </div>
                      )}
                    </div>
                  ) : selectedTool === 'policy-generator' && result.policy_text ? (
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 rounded-lg p-6">
                        {result.policy_title && (
                          <div className="mb-4">
                            <h3 className="font-semibold text-white text-lg">{result.policy_title}</h3>
                          </div>
                        )}
                        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">{result.policy_text}</div>
                      </div>
                      {result.legal_disclaimer && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                          <p className="text-sm text-amber-400">⚠️ {result.legal_disclaimer}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Universal renderer for all other tools
                    <div className="space-y-4">
                      {/* Main content area */}
                      <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
                        {/* Handle structured data with multiple fields */}
                        {Object.entries(result).map(([key, value]) => {
                          // Skip metadata and helper fields
                          if (key.startsWith('_') || key === 'seo_keywords' || key === 'keywords' ||
                              key.includes('tip') || key.includes('suggestion') || key.includes('strategy') ||
                              key.includes('timing') || key.includes('schedule')) {
                            return null;
                          }

                          // Handle arrays (like differentiator_sections, reward_tiers, etc.)
                          if (Array.isArray(value)) {
                            return (
                              <div key={key}>
                                <p className="text-xs text-slate-400 mb-2 uppercase">{key.replace(/_/g, ' ')}:</p>
                                <div className="space-y-2">
                                  {value.map((item: any, idx: number) => (
                                    <div key={idx} className="bg-slate-700/30 rounded p-3">
                                      {typeof item === 'object' ? (
                                        Object.entries(item).map(([k, v]) => (
                                          <div key={k} className="mb-1">
                                            <span className="text-emerald-400 text-sm">{k.replace(/_/g, ' ')}: </span>
                                            <span className="text-slate-200">{String(v)}</span>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-slate-200">• {String(item)}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          // Handle objects (like email_1, good_package, etc.)
                          if (typeof value === 'object' && value !== null) {
                            return (
                              <div key={key} className="border-l-2 border-emerald-500/50 pl-4">
                                <p className="text-xs text-slate-400 mb-2 uppercase font-semibold">{key.replace(/_/g, ' ')}:</p>
                                <div className="space-y-2">
                                  {Object.entries(value as Record<string, any>).map(([k, v]) => (
                                    <div key={k}>
                                      <p className="text-xs text-emerald-400 mb-1">{k.replace(/_/g, ' ')}:</p>
                                      <p className="text-slate-200 whitespace-pre-wrap">{String(v)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          // Handle simple strings
                          return (
                            <div key={key}>
                              <p className="text-xs text-slate-400 mb-2 uppercase">{key.replace(/_/g, ' ')}:</p>
                              <p className="text-slate-200 whitespace-pre-wrap">{String(value)}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Tips and suggestions section */}
                      {Object.entries(result).filter(([key]) =>
                        key.includes('tip') || key.includes('suggestion') || key.includes('strategy') ||
                        key.includes('timing') || key.includes('schedule') || key === 'seo_keywords' || key === 'keywords'
                      ).map(([key, value]) => (
                        <div key={key} className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                          <p className="text-xs text-emerald-400 mb-1 uppercase font-semibold">{key.replace(/_/g, ' ')}:</p>
                          <p className="text-sm text-emerald-400">
                            💡 {Array.isArray(value) ? value.join(', ') : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        let text = '';

                        // Format based on tool type - handles ALL tool formats
                        if (selectedTool === 'faq-builder' && result.faqs) {
                          text = result.faqs.map((faq: any) => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n');
                        } else if (selectedTool === 'ad-copy' && result.headline) {
                          text = `${result.headline}\n\n${result.body}\n\n${result.cta}`;
                        } else if (selectedTool === 'blog-writer' && result.title) {
                          text = `${result.title}\n\n${result.content}`;
                        } else if (selectedTool === 'email-writer' && result.subject) {
                          text = `Subject: ${result.subject}\n\n${result.body}`;
                        } else if (selectedTool === 'newsletter' && result.newsletter_content) {
                          text = result.subject ? `Subject: ${result.subject}\n\n${result.newsletter_content}` : result.newsletter_content;
                        } else if (selectedTool === 'job-description' && result.description) {
                          text = result.description;
                        } else if (selectedTool === 'policy-generator' && result.policy_text) {
                          text = result.policy_title ? `${result.policy_title}\n\n${result.policy_text}` : result.policy_text;
                        } else if (selectedTool === 'video-script' && result.script) {
                          text = result.script;
                        } else if (selectedTool === 'review-responder' && result.response) {
                          text = result.response;
                        } else {
                          // Universal formatter for all other tools
                          const formatValue = (key: string, value: any, indent = ''): string => {
                            if (Array.isArray(value)) {
                              return value.map((item, idx) => {
                                if (typeof item === 'object') {
                                  return Object.entries(item).map(([k, v]) => `${indent}  ${k}: ${v}`).join('\n');
                                }
                                return `${indent}  • ${item}`;
                              }).join('\n');
                            } else if (typeof value === 'object' && value !== null) {
                              return Object.entries(value).map(([k, v]) => `${indent}  ${k.replace(/_/g, ' ')}: ${v}`).join('\n');
                            }
                            return String(value);
                          };

                          text = Object.entries(result)
                            .filter(([key]) => !key.startsWith('_')) // Skip metadata
                            .map(([key, value]) => {
                              const label = key.replace(/_/g, ' ').toUpperCase();
                              return `${label}:\n${formatValue(key, value)}`;
                            })
                            .join('\n\n');
                        }

                        navigator.clipboard.writeText(text);
                      }}
                      variant="outline"
                    >
                      📋 Copy to Clipboard
                    </Button>
                    <Button
                      onClick={() => handleGenerateTool(selectedTool)}
                      disabled={isGenerating}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      Generate Another
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Popular Combinations */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="p-8 bg-linear-to-br from-emerald-900/20 to-slate-900/50 border-emerald-500/30">
            <h2 className="text-2xl font-bold text-white mb-6">Popular Combinations</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span>📱</span>
                  Social Media Package
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Everything you need for social media: 30-day calendar, ad copy, and review responses
                </p>
                <Link href="/content">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                    Get Started
                  </Button>
                </Link>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span>📈</span>
                  Growth Package
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Competitive analysis + content calendar + email campaigns to grow faster
                </p>
                <Link href="/grow">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Time Savings Calculator */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <Card className="p-8 bg-slate-900/30 border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-4">How Much Time Can You Save?</h3>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-4xl font-bold text-emerald-400 mb-2">10+</div>
                <p className="text-slate-400">Hours saved per week</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-emerald-400 mb-2">$500+</div>
                <p className="text-slate-400">Value of time saved</p>
              </div>
            </div>
            <p className="text-slate-300 mb-6">
              Stop spending hours on social media posts, emails, and busy work. Focus on customers instead.
            </p>
            <Link href="/content">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600">
                Start Saving Time
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
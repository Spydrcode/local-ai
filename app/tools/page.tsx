"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect, useState } from "react"

const toolCategories = [
  {
    id: "marketing",
    title: "Marketing Tools",
    icon: "📢",
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
    id: "operations",
    title: "Save Time Tools",
    icon: "⏰",
    tools: [
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

  // Auto-fill from initial analysis if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAnalysis = sessionStorage.getItem('initialAnalysis')
      if (storedAnalysis) {
        try {
          const analysis = JSON.parse(storedAnalysis)
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
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{category.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">{category.title}</h2>
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
                  ) : (
                    <div className="bg-slate-800/50 rounded-lg p-6">
                      <pre className="text-slate-200 whitespace-pre-wrap font-sans">
                        {typeof result === 'string' 
                          ? result 
                          : result.content || result.description || result.policy_text || result.newsletter_content || result.script || JSON.stringify(result, null, 2)
                        }
                      </pre>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        const text = selectedTool === 'faq-builder' && result.faqs
                          ? result.faqs.map((faq: any) => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')
                          : typeof result === 'string' 
                          ? result 
                          : result.content || result.body || result.response || result.description || JSON.stringify(result, null, 2)
                        navigator.clipboard.writeText(text)
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
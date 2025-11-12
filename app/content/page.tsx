"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect, useState } from "react"

interface SocialPost {
  platform: 'facebook' | 'instagram'
  caption: string
  hashtags: string[]
  image_suggestion: string
  best_time_to_post: string
}

interface ContentCalendar {
  week_1: SocialPost[]
  week_2: SocialPost[]
  week_3: SocialPost[]
  week_4: SocialPost[]
}

export default function ContentPage() {
  const [businessName, setBusinessName] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState<'facebook' | 'instagram' | '30-day'>('facebook')
  const [singlePost, setSinglePost] = useState<SocialPost | null>(null)
  const [calendar, setCalendar] = useState<ContentCalendar | null>(null)
  const [websiteAnalysis, setWebsiteAnalysis] = useState<any>(null)

  // Auto-fill from marketing analysis if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAnalysis = sessionStorage.getItem('marketingAnalysis')
      if (storedAnalysis) {
        try {
          const analysis = JSON.parse(storedAnalysis)
          console.log('Loading business info from marketing analysis:', analysis)

          // Store the full analysis for use in content generation
          setWebsiteAnalysis(analysis)

          // Fill business name
          if (analysis.business_name) {
            setBusinessName(analysis.business_name)
          } else if (analysis.intelligence?.brandAnalysis?.businessName) {
            setBusinessName(analysis.intelligence.brandAnalysis.businessName)
          }

          // Fill business type (industry)
          if (analysis.industry) {
            setBusinessType(analysis.industry)
          } else if (analysis.intelligence?.industry) {
            setBusinessType(analysis.intelligence.industry)
          }

          // Fill target audience
          const targetAud = analysis.target_audience || 
                           analysis.targetAudience || 
                           analysis.intelligence?.targetAudience
          if (targetAud) {
            setTargetAudience(targetAud)
          }

          console.log('Auto-filled:', {
            name: analysis.business_name || analysis.intelligence?.brandAnalysis?.businessName,
            type: analysis.industry || analysis.intelligence?.industry,
            audience: targetAud
          })
        } catch (err) {
          console.error('Failed to parse stored analysis:', err)
        }
      } else {
        console.log('No stored analysis found in sessionStorage')
      }
    }
  }, [])

  const handleGenerateSingle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessType) {
      setError("Please fill in your business type (e.g., coffee shop, plumber, dentist)")
      return
    }

    setIsGenerating(true)
    setError("")
    setSinglePost(null)

    try {
      const response = await fetch("/api/generate-social-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName || "Your Business",
          business_type: businessType,
          target_audience: targetAudience || "local community",
          platform: selectedPlatform,
          website_analysis: websiteAnalysis
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate post")
      }

      const data = await response.json()
      console.log('Received social post data:', data)
      setSinglePost(data)
    } catch (err) {
      console.error('Error generating post:', err)
      setError("Couldn't generate the post. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerate30Day = async () => {
    if (!businessType) {
      setError("Please fill in your business type (e.g., coffee shop, plumber, dentist)")
      return
    }

    setIsGenerating(true)
    setError("")
    setCalendar(null)

    try {
      const response = await fetch("/api/generate-content-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName || "Your Business",
          business_type: businessType,
          target_audience: targetAudience || "local community",
          website_analysis: websiteAnalysis
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate calendar")
      }

      const data = await response.json()
      console.log('Received calendar data:', data)
      setCalendar(data)
    } catch (err) {
      console.error('Error generating calendar:', err)
      setError("Couldn't generate the calendar. Please try again.")
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
              <Link href="/content" className="text-sm font-medium text-emerald-400">Content Creator</Link>
              <Link href="/tools" className="text-sm font-medium text-slate-300 hover:text-white">AI Tools</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Content Creator</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Professional Facebook and Instagram posts created by AI. Stop staring at a blank screen.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-slate-900/50 border-slate-700 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4">Your Business Info</h2>
              <form onSubmit={handleGenerateSingle} className="space-y-4">
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
                    Business Type
                  </label>
                  <Input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="Coffee shop"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Target Audience (optional)
                  </label>
                  <Input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Busy professionals, families"
                    className="w-full"
                  />
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    What do you want to create?
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlatform('facebook')}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedPlatform === 'facebook'
                          ? 'bg-emerald-500/20 border-2 border-emerald-500'
                          : 'bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-medium text-white">📘 Facebook Post</div>
                      <div className="text-xs text-slate-400">Professional post ready to share</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPlatform('instagram')}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedPlatform === 'instagram'
                          ? 'bg-emerald-500/20 border-2 border-emerald-500'
                          : 'bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-medium text-white">📸 Instagram Post</div>
                      <div className="text-xs text-slate-400">Caption + hashtags + image ideas</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPlatform('30-day')}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedPlatform === '30-day'
                          ? 'bg-emerald-500/20 border-2 border-emerald-500'
                          : 'bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-medium text-white">📅 30-Day Calendar</div>
                      <div className="text-xs text-slate-400">Complete month of content</div>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {selectedPlatform !== '30-day' ? (
                  <Button 
                    type="submit" 
                    disabled={isGenerating}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {isGenerating ? "Creating..." : "Create Post"}
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    onClick={handleGenerate30Day}
                    disabled={isGenerating}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {isGenerating ? "Creating Calendar..." : "Create 30-Day Calendar"}
                  </Button>
                )}

                <p className="text-xs text-slate-400 text-center">
                  Takes about 10 seconds
                </p>
              </form>
            </Card>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2">
            {!singlePost && !calendar && (
              <Card className="p-12 bg-slate-900/30 border-slate-700 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">✨</div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready to Create?</h3>
                  <p className="text-slate-400">
                    Fill in your business details and click create. Your content will appear here.
                  </p>
                </div>
              </Card>
            )}

            {singlePost && (
              <div className="space-y-6">
                <Card className="p-6 bg-slate-900/50 border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {singlePost.platform === 'facebook' ? '📘' : '📸'}
                      {singlePost.platform === 'facebook' ? 'Facebook' : 'Instagram'} Post
                    </h2>
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(singlePost.caption + '\n\n' + singlePost.hashtags.join(' '))
                      }}
                      variant="outline"
                    >
                      Copy Text
                    </Button>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-6 mb-4">
                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {singlePost.caption}
                    </p>
                    {singlePost.hashtags.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <p className="text-emerald-400 text-sm">
                          {singlePost.hashtags.join(' ')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 rounded-lg p-4">
                      <p className="text-xs text-slate-400 mb-1">Image Suggestion</p>
                      <p className="text-sm text-slate-200">{singlePost.image_suggestion}</p>
                    </div>
                    <div className="bg-slate-800/30 rounded-lg p-4">
                      <p className="text-xs text-slate-400 mb-1">Best Time to Post</p>
                      <p className="text-sm text-slate-200">{singlePost.best_time_to_post}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button
                      onClick={handleGenerateSingle}
                      disabled={isGenerating}
                      variant="outline"
                      className="flex-1"
                    >
                      Generate Another
                    </Button>
                    <Button
                      onClick={handleGenerate30Day}
                      disabled={isGenerating}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                    >
                      Get Full 30-Day Calendar
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {calendar && (
              <div className="space-y-6">
                <Card className="p-6 bg-linear-to-br from-emerald-900/20 to-slate-900/50 border-emerald-500/30">
                  <h2 className="text-2xl font-bold text-white mb-2">Your 30-Day Content Calendar</h2>
                  <p className="text-slate-400 mb-4">Copy and schedule these posts throughout the month</p>
                  <Button
                    onClick={() => {
                      // Export all posts as text
                      const allPosts = [
                        ...calendar.week_1,
                        ...calendar.week_2,
                        ...calendar.week_3,
                        ...calendar.week_4
                      ]
                      const text = allPosts.map((post, idx) => 
                        `POST ${idx + 1} (${post.platform})\n${post.caption}\n${post.hashtags.join(' ')}\n\n`
                      ).join('---\n\n')
                      navigator.clipboard.writeText(text)
                    }}
                    variant="outline"
                  >
                    📋 Copy All Posts
                  </Button>
                </Card>

                {[
                  { week: 'week_1', title: 'Week 1', posts: calendar.week_1 },
                  { week: 'week_2', title: 'Week 2', posts: calendar.week_2 },
                  { week: 'week_3', title: 'Week 3', posts: calendar.week_3 },
                  { week: 'week_4', title: 'Week 4', posts: calendar.week_4 },
                ].map(({ week, title, posts }) => (
                  <div key={week}>
                    <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                    <div className="grid gap-4">
                      {posts.map((post, idx) => (
                        <Card key={idx} className="p-4 bg-slate-900/50 border-slate-700 hover:border-emerald-500/50 transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-2xl">
                              {post.platform === 'facebook' ? '📘' : '📸'}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(post.caption + '\n\n' + post.hashtags.join(' '))
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                          <p className="text-sm text-slate-300 mb-2 line-clamp-3">
                            {post.caption}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{post.best_time_to_post}</span>
                            <span>•</span>
                            <span>{post.hashtags.length} hashtags</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        {!isGenerating && (singlePost || calendar) && (
          <div className="mt-12 text-center">
            <Card className="p-8 bg-slate-900/30 border-slate-700 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-3">Need Help Growing Your Business?</h3>
              <p className="text-slate-400 mb-6">
                Find out why customers choose competitors and what to do about it
              </p>
              <Link href="/grow">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600">
                  Analyze My Business
                </Button>
              </Link>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
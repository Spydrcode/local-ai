"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

// ALL AVAILABLE TOOLS FOR AGENCY
const allTools = [
  // Strategic Growth & Analysis
  {
    category: "Strategic Growth & Analysis",
    categoryColor: "emerald",
    tools: [
      { id: "business-audit", title: "Complete Business Audit", icon: "🎯", endpoint: "/api/tools/business-audit", description: "Full strategic analysis with SWOT, Porter's 5 Forces" },
      { id: "pricing-strategy", title: "Pricing Strategy Analyzer", icon: "💵", endpoint: "/api/tools/pricing-strategy", description: "Data-driven pricing optimization" },
      { id: "service-packages", title: "Service Package Designer", icon: "📦", endpoint: "/api/tools/service-packages", description: "Good/Better/Best service tiers" },
    ]
  },
  // Marketing & Content
  {
    category: "Marketing & Content Creation",
    categoryColor: "orange",
    tools: [
      { id: "social-content", title: "Social Media Content", icon: "📱", endpoint: "/api/tools/social-content", description: "All platforms at once" },
      { id: "blog-seo-writer", title: "Blog & SEO Writer", icon: "✍️", endpoint: "/api/tools/blog-seo-writer", description: "SEO-optimized content" },
      { id: "blog-writer", title: "Blog Writer", icon: "📝", endpoint: "/api/tools/blog-writer", description: "Long-form blog posts" },
      { id: "email-hub", title: "Email Marketing Hub", icon: "📧", endpoint: "/api/tools/email-hub", description: "Newsletters and campaigns" },
      { id: "newsletter", title: "Newsletter Generator", icon: "📨", endpoint: "/api/tools/newsletter", description: "Professional newsletters" },
      { id: "email-writer", title: "Email Writer", icon: "✉️", endpoint: "/api/tools/email-writer", description: "Email templates" },
      { id: "ad-copy", title: "Ad Copy Generator", icon: "📢", endpoint: "/api/tools/ad-copy", description: "Facebook, Google, Instagram ads" },
      { id: "video-script", title: "Video Script Writer", icon: "🎬", endpoint: "/api/tools/video-script", description: "Video content scripts" },
    ]
  },
  // Social Media
  {
    category: "Social Media",
    categoryColor: "pink",
    tools: [
      { id: "facebook-post", title: "Facebook Post", icon: "📘", endpoint: "/api/tools/facebook-post", description: "Facebook-optimized posts" },
      { id: "instagram-post", title: "Instagram Post", icon: "📸", endpoint: "/api/tools/instagram-post", description: "Instagram captions & hashtags" },
      { id: "linkedin-post", title: "LinkedIn Post", icon: "💼", endpoint: "/api/tools/linkedin-post", description: "Professional LinkedIn content" },
      { id: "gmb-post", title: "Google My Business Post", icon: "🏢", endpoint: "/api/tools/gmb-post", description: "GMB posts & updates" },
      { id: "social-testimonial", title: "Social Testimonial", icon: "⭐", endpoint: "/api/tools/social-testimonial", description: "Turn reviews into posts" },
    ]
  },
  // Website & Brand
  {
    category: "Website & Brand Copy",
    categoryColor: "blue",
    tools: [
      { id: "landing-page", title: "Landing Page Copy", icon: "🌐", endpoint: "/api/tools/landing-page", description: "High-converting landing pages" },
      { id: "location-page", title: "Location Page", icon: "📍", endpoint: "/api/tools/location-page", description: "Local service area pages" },
      { id: "why-choose-us", title: "Why Choose Us", icon: "🏆", endpoint: "/api/tools/why-choose-us", description: "Value propositions" },
      { id: "usp-generator", title: "USP Generator", icon: "💎", endpoint: "/api/tools/usp-generator", description: "Unique selling points" },
      { id: "positioning-statement", title: "Positioning Statement", icon: "🎯", endpoint: "/api/tools/positioning-statement", description: "Brand positioning" },
      { id: "faq-builder", title: "FAQ Builder", icon: "❓", endpoint: "/api/tools/faq-builder", description: "Comprehensive FAQs" },
      { id: "case-study", title: "Case Study Writer", icon: "📊", endpoint: "/api/tools/case-study", description: "Client success stories" },
    ]
  },
  // SEO & Local
  {
    category: "SEO & Local Marketing",
    categoryColor: "green",
    tools: [
      { id: "local-seo-meta", title: "Local SEO Meta Tags", icon: "🔍", endpoint: "/api/tools/local-seo-meta", description: "Optimized meta tags" },
    ]
  },
  // Reviews & Reputation
  {
    category: "Reviews & Reputation",
    categoryColor: "yellow",
    tools: [
      { id: "review-responder", title: "Review Responder", icon: "⭐", endpoint: "/api/tools/review-responder", description: "Respond to reviews" },
      { id: "negative-review", title: "Negative Review Handler", icon: "😔", endpoint: "/api/tools/negative-review", description: "Handle negative feedback" },
      { id: "testimonial-request", title: "Testimonial Request", icon: "💬", endpoint: "/api/tools/testimonial-request", description: "Request testimonials" },
    ]
  },
  // Sales & Conversion
  {
    category: "Sales & Conversion",
    categoryColor: "purple",
    tools: [
      { id: "objection-handler", title: "Objection Handler", icon: "💬", endpoint: "/api/tools/objection-handler", description: "Handle sales objections" },
      { id: "sales-sequence", title: "Sales Sequence", icon: "📈", endpoint: "/api/tools/sales-sequence", description: "Multi-touch sales emails" },
      { id: "referral-request", title: "Referral Request", icon: "🤝", endpoint: "/api/tools/referral-request", description: "Ask for referrals" },
      { id: "win-back-email", title: "Win-Back Email", icon: "🔄", endpoint: "/api/tools/win-back-email", description: "Re-engage lost customers" },
      { id: "loyalty-program", title: "Loyalty Program", icon: "🎁", endpoint: "/api/tools/loyalty-program", description: "Customer loyalty content" },
    ]
  },
  // Business Operations
  {
    category: "Business Operations",
    categoryColor: "cyan",
    tools: [
      { id: "booking-confirmation", title: "Booking Confirmation", icon: "✅", endpoint: "/api/tools/booking-confirmation", description: "Appointment confirmations" },
      { id: "invoice-followup", title: "Invoice Follow-up", icon: "💰", endpoint: "/api/tools/invoice-followup", description: "Payment reminders" },
      { id: "auto-response", title: "Auto-Response", icon: "🤖", endpoint: "/api/tools/auto-response", description: "Automated responses" },
      { id: "apology-email", title: "Apology Email", icon: "🙏", endpoint: "/api/tools/apology-email", description: "Service recovery emails" },
      { id: "crisis-communication", title: "Crisis Communication", icon: "🚨", endpoint: "/api/tools/crisis-communication", description: "Handle PR crises" },
      { id: "job-description", title: "Job Description", icon: "👥", endpoint: "/api/tools/job-description", description: "Hiring content" },
      { id: "policy-generator", title: "Policy Generator", icon: "📋", endpoint: "/api/tools/policy-generator", description: "Business policies" },
    ]
  },
  // Partnerships & Networking
  {
    category: "Partnerships & Networking",
    categoryColor: "red",
    tools: [
      { id: "partnership-pitch", title: "Partnership Pitch", icon: "🤝", endpoint: "/api/tools/partnership-pitch", description: "B2B partnerships" },
      { id: "sponsorship-pitch", title: "Sponsorship Pitch", icon: "🎯", endpoint: "/api/tools/sponsorship-pitch", description: "Sponsorship proposals" },
      { id: "networking-followup", title: "Networking Follow-up", icon: "👋", endpoint: "/api/tools/networking-followup", description: "Post-event emails" },
    ]
  },
]

export default function AgencyToolsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTools = allTools.map(category => ({
    ...category,
    tools: category.tools.filter(tool =>
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.tools.length > 0)

  const totalTools = allTools.reduce((sum, cat) => sum + cat.tools.length, 0)

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Agency Tools Dashboard</h1>
              <p className="text-slate-400 mt-1">All {totalTools} marketing and business tools at your fingertips</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/agency">
                <Button variant="outline" className="text-slate-400">
                  ← Back to Portal
                </Button>
              </Link>
              <Link href="/agency/clients">
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  👥 Manage Clients
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <Card className="p-6 bg-slate-900/50 border-slate-700 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tools by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery('')}
                variant="outline"
                className="text-slate-400"
              >
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* Tools Grid by Category */}
        <div className="space-y-12">
          {filteredTools.map((category) => (
            <div key={category.category}>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-white">{category.category}</h2>
                <span className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-400">
                  {category.tools.length} {category.tools.length === 1 ? 'tool' : 'tools'}
                </span>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.tools.map((tool) => (
                  <Card
                    key={tool.id}
                    className="p-6 bg-slate-900/50 border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer group"
                    onClick={() => {
                      // Store tool context and redirect to main dashboard
                      sessionStorage.setItem('selectedTool', tool.id)
                      router.push('/dashboard')
                    }}
                  >
                    <div className="text-4xl mb-3">{tool.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                      {tool.description}
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                    >
                      Use Tool →
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <Card className="p-12 bg-slate-900/50 border-slate-700 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No tools found</h3>
            <p className="text-slate-400 mb-6">
              Try a different search term
            </p>
            <Button
              onClick={() => setSearchQuery('')}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Clear Search
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Client {
  id: string
  business_name?: string  // Optional since column might not exist
  website_url?: string
  site_summary?: string   // Alternative name used in some places
  industry?: string | null
  created_at: string
  created_by_email?: string
}

// ALL AVAILABLE TOOLS FOR AGENCY PORTAL
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

export default function AgencyDashboardPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'clients' | 'tools'>('clients')

  // For demo purposes, we'll load all demos instead of filtering by agency
  // TODO: Implement proper auth and agency-specific filtering

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredClients(
        clients.filter(
          c =>
            (c.business_name || '').toLowerCase().includes(query) ||
            (c.website_url || '').toLowerCase().includes(query) ||
            (c.industry || '').toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, clients])

  const loadClients = async () => {
    try {
      // Load all demos for now (no agency filtering)
      const response = await fetch('/api/demos')
      if (!response.ok) throw new Error('Failed to load clients')
      const data = await response.json()
      setClients(data)
      setFilteredClients(data)
    } catch (error) {
      console.error('Failed to load clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading clients...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Client Dashboard</h1>
              <p className="text-slate-400 mt-1">Manage your client reports and analyses</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/agency/settings">
                <Button className="bg-slate-700 hover:bg-slate-600">
                  ⚙️ Settings
                </Button>
              </Link>
              <Link href="/agency/team">
                <Button className="bg-slate-700 hover:bg-slate-600">
                  👥 Team
                </Button>
              </Link>
              <Button
                onClick={() => setShowNewClientModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                + New Client Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <div className="text-sm text-slate-400">Total Clients</div>
            <div className="text-3xl font-bold text-white mt-1">{clients.length}</div>
          </Card>
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <div className="text-sm text-slate-400">This Month</div>
            <div className="text-3xl font-bold text-emerald-400 mt-1">
              {clients.filter(c => {
                const created = new Date(c.created_at)
                const now = new Date()
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
              }).length}
            </div>
          </Card>
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <div className="text-sm text-slate-400">Active Reports</div>
            <div className="text-3xl font-bold text-blue-400 mt-1">{clients.length}</div>
          </Card>
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <div className="text-sm text-slate-400">Team Members</div>
            <div className="text-3xl font-bold text-purple-400 mt-1">-</div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex items-center gap-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'clients'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 Clients
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'tools'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🛠️ All Tools
          </button>
        </div>

        {/* Clients View */}
        {activeTab === 'clients' && (
          <>
            {/* Search & Filters */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search clients by name, website, or industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button className="bg-slate-700 hover:bg-slate-600">
                🔍 Filter
              </Button>
            </div>

            {/* Clients Table */}
        {filteredClients.length === 0 ? (
          <Card className="p-12 bg-slate-900/50 border-slate-700 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">No clients yet</h3>
            <p className="text-slate-400 mb-6">
              {searchQuery ? 'No clients match your search' : 'Create your first client analysis to get started'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowNewClientModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                + New Client Analysis
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="p-6 bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {client.business_name || client.site_summary || 'Unnamed Business'}
                      </h3>
                      {client.industry && (
                        <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                          {client.industry}
                        </span>
                      )}
                    </div>
                    {client.website_url && (
                      <div className="text-sm text-slate-400 mb-3">
                        <a
                          href={client.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-emerald-400 transition-colors"
                        >
                          {client.website_url}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Created {formatDate(client.created_at)}</span>
                      {client.created_by_email && (
                        <>
                          <span>•</span>
                          <span>By {client.created_by_email}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/analysis/${client.id}`}>
                      <Button className="bg-slate-700 hover:bg-slate-600">
                        📊 View Reports
                      </Button>
                    </Link>
                    <Button className="bg-emerald-500 hover:bg-emerald-600">
                      📄 Export
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
          </>
        )}

        {/* Tools View */}
        {activeTab === 'tools' && (
          <div className="space-y-8">
            {allTools.map((category) => (
              <div key={category.category}>
                <h2 className="text-2xl font-bold text-white mb-4">{category.category}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.tools.map((tool) => (
                    <Card
                      key={tool.id}
                      className="p-6 bg-slate-900/50 border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer"
                      onClick={() => router.push('/dashboard')}
                    >
                      <div className="text-3xl mb-3">{tool.icon}</div>
                      <h3 className="text-lg font-bold text-white mb-2">{tool.title}</h3>
                      <p className="text-sm text-slate-400 mb-4">{tool.description}</p>
                      <Button size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600">
                        Use Tool
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Client Modal */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 p-8 bg-slate-900 border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">New Client Analysis</h2>
              <button
                onClick={() => setShowNewClientModal(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-slate-400 mb-6">
              This will redirect you to create a new analysis. The client will be automatically associated with your agency.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowNewClientModal(false)}
                className="bg-slate-700 hover:bg-slate-600"
              >
                Cancel
              </Button>
              <Link href="/">
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  Continue to Analysis
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

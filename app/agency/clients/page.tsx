"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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

  // New client form state
  const [newClientUrl, setNewClientUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzedWebsite, setAnalyzedWebsite] = useState<any>(null)
  const [analysisError, setAnalysisError] = useState('')
  const [isAddingClient, setIsAddingClient] = useState(false)

  // Cleanup state
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false)
  const [isCleaningUp, setIsCleaningUp] = useState(false)

  // Success message state
  const [successMessage, setSuccessMessage] = useState('')

  // For demo purposes, we'll load all demos instead of filtering by agency
  // TODO: Implement proper auth and agency-specific filtering

  useEffect(() => {
    loadClients()
    checkForAnalyzedWebsite()
  }, [])

  // Auto-open modal if website was analyzed
  useEffect(() => {
    if (analyzedWebsite && !isLoading) {
      setShowNewClientModal(true)
    }
  }, [analyzedWebsite, isLoading])

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

  const checkForAnalyzedWebsite = () => {
    const intelligence = sessionStorage.getItem('websiteIntelligence') || sessionStorage.getItem('marketingAnalysis')
    if (intelligence) {
      try {
        const data = JSON.parse(intelligence)
        setAnalyzedWebsite(data)
      } catch (err) {
        console.error('Failed to parse analyzed website:', err)
      }
    }
  }

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

  const handleAnalyzeWebsite = async () => {
    if (!newClientUrl.trim()) {
      setAnalysisError('Please enter a website URL')
      return
    }

    // Add https:// if missing
    let url = newClientUrl.trim()
    if (!url.match(/^https?:\/\//)) {
      url = 'https://' + url
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      setAnalysisError('Please enter a valid website URL')
      return
    }

    setIsAnalyzing(true)
    setAnalysisError('')

    try {
      const response = await fetch('/api/web-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url,
          mode: 'comprehensive',
          paths: ["/", "/about", "/services", "/pricing", "/contact"]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to analyze website')
      }

      const { data } = await response.json()

      // Store intelligence data
      const intelligenceData = {
        ...data,
        scrapedAt: new Date().toISOString(),
        source: 'web-scraper-agent',
        metadata: {
          ...data.metadata,
          url: url
        }
      }

      sessionStorage.setItem('websiteIntelligence', JSON.stringify(intelligenceData))
      setAnalyzedWebsite(intelligenceData)
      setNewClientUrl('')
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to analyze website')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAddAsClient = async () => {
    if (!analyzedWebsite) {
      console.error('[Agency Dashboard] No analyzed website data')
      return
    }

    try {
      setAnalysisError('')
      setIsAddingClient(true)

      // Create demo/client entry
      const url = analyzedWebsite.metadata?.url || analyzedWebsite.website || ''
      const businessName = analyzedWebsite.business?.name || 'Unnamed Business'
      const industry = analyzedWebsite.business?.industry || null

      console.log('[Agency Dashboard] Adding client:', { url, businessName, industry })
      console.log('[Agency Dashboard] Full analyzed website data:', analyzedWebsite)

      const response = await fetch('/api/demos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website_url: url,
          business_name: businessName,
          industry: industry,
          intelligence_data: analyzedWebsite,
          created_by_email: 'agency-user@local.ai' // TODO: Replace with actual user email from auth
        })
      })

      console.log('[Agency Dashboard] Response status:', response.status)
      console.log('[Agency Dashboard] Response ok:', response.ok)
      console.log('[Agency Dashboard] Response statusText:', response.statusText)

      let responseData
      try {
        responseData = await response.json()
        console.log('[Agency Dashboard] API Response:', responseData)
      } catch (parseError) {
        console.error('[Agency Dashboard] Failed to parse response:', parseError)
        throw new Error('Server returned invalid response')
      }

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Database not configured. Please set up Supabase to save clients.')
        }
        throw new Error(responseData.error || responseData.details || 'Failed to add client')
      }

      // Check if client already existed
      if (responseData.existing) {
        console.log('[Agency Dashboard] Client already exists')
        setSuccessMessage(`Client "${businessName}" was already in your list`)
      } else {
        setSuccessMessage(`✓ Client "${businessName}" has been successfully added!`)
      }

      // Reload clients list
      await loadClients()

      // Clear analyzed website and close modal
      setAnalyzedWebsite(null)
      sessionStorage.removeItem('websiteIntelligence')
      sessionStorage.removeItem('marketingAnalysis')
      setShowNewClientModal(false)
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (err: any) {
      console.error('[Agency Dashboard] Failed to add client:', err)
      setAnalysisError(err.message || 'Failed to add client')
    } finally {
      setIsAddingClient(false)
    }
  }

  const handleDeleteClient = async (clientId: string, clientName?: string) => {
    if (!confirm(`Are you sure you want to remove ${clientName || 'this client'}?`)) return

    try {
      const response = await fetch(`/api/demos?id=${clientId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete client')
      }

      setSuccessMessage(`✓ Client "${clientName || 'Client'}" has been removed`)
      
      // Reload clients list
      await loadClients()
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (err: any) {
      console.error('Failed to delete client:', err)
      alert(err.message || 'Failed to delete client')
    }
  }

  const handleCleanupUnnamed = async () => {
    setIsCleaningUp(true)

    try {
      const response = await fetch('/api/demos?cleanup=unnamed', {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cleanup')
      }

      alert(`Successfully deleted ${result.count} unnamed clients`)

      // Reload clients list
      await loadClients()
      setShowCleanupConfirm(false)
    } catch (err: any) {
      console.error('Failed to cleanup:', err)
      alert(err.message || 'Failed to cleanup clients')
    } finally {
      setIsCleaningUp(false)
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
              <h1 className="text-3xl font-bold text-white">Client Management</h1>
              <p className="text-slate-400 mt-1">Manage your client reports and analyses</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/agency">
                <Button variant="outline" className="text-slate-400">
                  ← Agency Portal
                </Button>
              </Link>
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
              {clients.filter(c => c.business_name === 'Unnamed Business').length > 0 && (
                <Button
                  onClick={() => setShowCleanupConfirm(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  🗑️ Clean Up ({clients.filter(c => c.business_name === 'Unnamed Business').length})
                </Button>
              )}
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
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 flex items-center gap-3">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}
        
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
            <div className="text-sm text-slate-400">Active Clients</div>
            <div className="text-3xl font-bold text-blue-400 mt-1">
              {clients.filter(c => c.business_name !== 'Unnamed Business').length}
            </div>
          </Card>
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <div className="text-sm text-slate-400">Tools Available</div>
            <div className="text-3xl font-bold text-purple-400 mt-1">42</div>
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
              {clients.filter(c => c.business_name === 'Unnamed Business').length > 0 && (
                <Button
                  onClick={() => setShowCleanupConfirm(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  🗑️ Clean Up Test Data ({clients.filter(c => c.business_name === 'Unnamed Business').length})
                </Button>
              )}
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
                    <Link href={`/agency/client/${client.id}`}>
                      <Button className="bg-emerald-500 hover:bg-emerald-600">
                        Open Client Dashboard →
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleDeleteClient(client.id, client.business_name || client.site_summary)}
                      className="bg-red-600 hover:bg-red-700 px-4"
                      title="Remove this client"
                    >
                      🗑️ Remove
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add New Client</h2>
                <button
                  onClick={() => {
                    setShowNewClientModal(false)
                    setAnalysisError('')
                    setNewClientUrl('')
                  }}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Show analyzed website if available */}
              {analyzedWebsite ? (
                <div className="space-y-6">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">ℹ️</span>
                      <div>
                        <p className="text-sm text-amber-200 font-medium mb-1">Ready to Add Client</p>
                        <p className="text-xs text-amber-300/80">Review the details below and click "Add as Client" to save this business to your client list. This will NOT be saved automatically.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white">Website Analysis Complete</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 w-24">Business:</span>
                        <span className="text-white font-medium">{analyzedWebsite.business?.name || 'Not detected'}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 w-24">Website:</span>
                        <span className="text-emerald-400">{analyzedWebsite.metadata?.url || 'N/A'}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 w-24">Industry:</span>
                        <span className="text-white">{analyzedWebsite.business?.industry || 'Not detected'}</span>
                      </div>
                      {analyzedWebsite.business?.description && (
                        <div className="flex items-start gap-2 mt-3">
                          <span className="text-slate-400 w-24">Description:</span>
                          <span className="text-slate-300 text-xs">{analyzedWebsite.business.description.substring(0, 200)}...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {analysisError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400">
                      {analysisError}
                    </div>
                  )}

                  <div className="flex justify-between gap-3">
                    <Button
                      onClick={() => {
                        setAnalyzedWebsite(null)
                        sessionStorage.removeItem('websiteIntelligence')
                        sessionStorage.removeItem('marketingAnalysis')
                      }}
                      variant="outline"
                      className="text-slate-400"
                      disabled={isAddingClient}
                    >
                      ← Analyze Different Website
                    </Button>
                    <Button
                      onClick={handleAddAsClient}
                      className="bg-emerald-500 hover:bg-emerald-600 px-6"
                      disabled={isAddingClient}
                    >
                      {isAddingClient ? '⏳ Adding Client...' : '✓ Confirm & Add as Client'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-slate-400">
                    Enter a client's website URL to analyze and add them to your agency dashboard.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Client Website URL
                      </label>
                      <Input
                        type="url"
                        value={newClientUrl}
                        onChange={(e) => {
                          setNewClientUrl(e.target.value)
                          setAnalysisError('')
                        }}
                        placeholder="e.g., clientbusiness.com"
                        className="w-full"
                        disabled={isAnalyzing}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAnalyzeWebsite()
                          }
                        }}
                      />
                    </div>

                    {analysisError && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400">
                        {analysisError}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={() => {
                        setShowNewClientModal(false)
                        setAnalysisError('')
                        setNewClientUrl('')
                      }}
                      variant="outline"
                      disabled={isAnalyzing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAnalyzeWebsite}
                      className="bg-emerald-500 hover:bg-emerald-600"
                      disabled={isAnalyzing || !newClientUrl.trim()}
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Website'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Cleanup Confirmation Modal */}
      {showCleanupConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-slate-900 border-slate-700 p-8">
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-4">Clean Up Test Data?</h2>
              <p className="text-slate-400 mb-6">
                This will permanently delete all {clients.filter(c => c.business_name === 'Unnamed Business').length} clients named "Unnamed Business".
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setShowCleanupConfirm(false)}
                  variant="outline"
                  disabled={isCleaningUp}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCleanupUnnamed}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isCleaningUp}
                >
                  {isCleaningUp ? 'Deleting...' : 'Delete All Unnamed'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

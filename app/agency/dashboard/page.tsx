"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
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

export default function AgencyDashboardPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showNewClientModal, setShowNewClientModal] = useState(false)

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
              <Link href="/demo">
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

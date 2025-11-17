"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Client {
  id: string
  business_name?: string
  website_url?: string
  industry?: string | null
  created_at: string
}

export default function AgencyPortalPage() {
  const [stats, setStats] = useState({
    totalClients: 0,
    thisMonth: 0,
    activeClients: 0,
    recentClients: [] as Client[]
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/demos')
      if (!response.ok) throw new Error('Failed to load stats')
      
      const clients: Client[] = await response.json()
      
      const now = new Date()
      const thisMonth = clients.filter(c => {
        const created = new Date(c.created_at)
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      }).length

      const activeClients = clients.filter(c => c.business_name !== 'Unnamed Business').length
      const recentClients = clients
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      setStats({
        totalClients: clients.length,
        thisMonth,
        activeClients,
        recentClients
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Agency Portal</h1>
              <p className="text-slate-400 mt-1">Manage your agency and client analyses</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" className="text-slate-400">
                  ← Home
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
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-400">Loading agency data...</div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 bg-slate-900/50 border-slate-700">
                <div className="text-sm text-slate-400 mb-2">Total Clients</div>
                <div className="text-4xl font-bold text-white mb-1">{stats.totalClients}</div>
                <div className="text-xs text-slate-500">All time</div>
              </Card>
              
              <Card className="p-6 bg-slate-900/50 border-slate-700">
                <div className="text-sm text-slate-400 mb-2">New This Month</div>
                <div className="text-4xl font-bold text-emerald-400 mb-1">{stats.thisMonth}</div>
                <div className="text-xs text-slate-500">Last 30 days</div>
              </Card>
              
              <Card className="p-6 bg-slate-900/50 border-slate-700">
                <div className="text-sm text-slate-400 mb-2">Active Clients</div>
                <div className="text-4xl font-bold text-blue-400 mb-1">{stats.activeClients}</div>
                <div className="text-xs text-slate-500">With business data</div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-8 bg-linear-to-br from-emerald-500/10 to-slate-900/50 border-emerald-500/30 hover:border-emerald-500/50 transition-all cursor-pointer group">
                <Link href="/agency/clients">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-4xl mb-4">👥</div>
                      <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                        Manage Clients
                      </h2>
                      <p className="text-slate-400 mb-4">
                        View all clients, add new analyses, and manage client data
                      </p>
                      <div className="text-emerald-400 font-medium">
                        {stats.totalClients} clients →
                      </div>
                    </div>
                    <div className="text-emerald-500 text-2xl group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </Link>
              </Card>

              <Card className="p-8 bg-linear-to-br from-blue-500/10 to-slate-900/50 border-blue-500/30 hover:border-blue-500/50 transition-all cursor-pointer group">
                <Link href="/dashboard">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-4xl mb-4">🛠️</div>
                      <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        All Tools
                      </h2>
                      <p className="text-slate-400 mb-4">
                        Access all 42 marketing and business tools
                      </p>
                      <div className="text-blue-400 font-medium">
                        View tools →
                      </div>
                    </div>
                    <div className="text-blue-500 text-2xl group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </Link>
              </Card>
            </div>

            {/* Recent Clients */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Clients</h2>
                <Link href="/agency/clients">
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    View All Clients →
                  </Button>
                </Link>
              </div>

              {stats.recentClients.length === 0 ? (
                <Card className="p-12 bg-slate-900/50 border-slate-700 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No clients yet</h3>
                  <p className="text-slate-400 mb-6">
                    Add your first client to get started with agency management
                  </p>
                  <Link href="/agency/clients">
                    <Button className="bg-emerald-500 hover:bg-emerald-600">
                      + Add Client
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {stats.recentClients.map((client) => (
                    <Card key={client.id} className="p-6 bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {client.business_name || 'Unnamed Business'}
                            </h3>
                            {client.industry && (
                              <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                                {client.industry}
                              </span>
                            )}
                          </div>
                          {client.website_url && (
                            <div className="text-sm text-slate-400 mb-2">
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
                          <div className="text-xs text-slate-500">
                            Created {formatDate(client.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/agency/client/${client.id}`}>
                            <Button className="bg-emerald-500 hover:bg-emerald-600">
                              View Dashboard →
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Client CTA */}
            {stats.recentClients.length > 0 && (
              <Card className="mt-8 p-8 bg-linear-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Add a New Client</h3>
                <p className="text-slate-400 mb-4">
                  Analyze a new business website and add them to your client portfolio
                </p>
                <Link href="/agency/clients">
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    + New Client Analysis
                  </Button>
                </Link>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}

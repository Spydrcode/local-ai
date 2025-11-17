"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Client {
  id: string
  business_name?: string
  website_url?: string
  industry?: string | null
  created_at: string
  intelligence_data?: any
}

export default function ClientDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params?.clientId as string

  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    loadClient()
  }, [clientId])

  const loadClient = async () => {
    try {
      // Load client details
      const response = await fetch('/api/demos')
      const clients = await response.json()
      const foundClient = clients.find((c: Client) => c.id === clientId)

      if (foundClient) {
        setClient(foundClient)
      }
    } catch (error) {
      console.error('Failed to load client:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading client...</div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Card className="p-12 bg-slate-900/50 border-slate-700 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-4">Client Not Found</h2>
          <p className="text-slate-400 mb-6">This client may have been deleted</p>
          <Link href="/agency/dashboard">
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              ← Back to Clients
            </Button>
          </Link>
        </Card>
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
              <Link
                href="/agency/dashboard"
                className="text-sm text-slate-400 hover:text-emerald-400 mb-2 inline-flex items-center gap-2"
              >
                ← Back to Clients
              </Link>
              <h1 className="text-3xl font-bold text-white">
                {client.business_name || 'Unnamed Business'}
              </h1>
              {client.website_url && (
                <a
                  href={client.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-emerald-400 mt-1 inline-block"
                >
                  {client.website_url}
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              {client.industry && (
                <span className="px-3 py-1 bg-slate-700 rounded text-sm text-slate-300">
                  {client.industry}
                </span>
              )}
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                + New Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Client Info Card */}
        <Card className="p-6 bg-slate-900/50 border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-slate-400 mb-1">Business Name</div>
              <div className="text-white font-medium">{client.business_name || 'Not provided'}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Industry</div>
              <div className="text-white font-medium">{client.industry || 'Not provided'}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Added On</div>
              <div className="text-white font-medium">{formatDate(client.created_at)}</div>
            </div>
          </div>
        </Card>

        {/* Reports Section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Reports & Analyses</h2>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            + Create Report
          </Button>
        </div>

        {reports.length === 0 ? (
          <Card className="p-12 bg-slate-900/50 border-slate-700 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Reports Yet</h3>
            <p className="text-slate-400 mb-6">
              Create your first report for {client.business_name || 'this client'}
            </p>
            <Button
              onClick={() => {
                // Store client intelligence and redirect to dashboard
                if (client.intelligence_data) {
                  sessionStorage.setItem('websiteIntelligence', JSON.stringify(client.intelligence_data))
                  sessionStorage.setItem('lastAnalyzedUrl', client.website_url || '')
                }
                router.push('/dashboard')
              }}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Create First Report
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="p-6 bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{report.title}</h3>
                    <p className="text-sm text-slate-400 mb-3">{report.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Created {formatDate(report.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button className="bg-slate-700 hover:bg-slate-600">
                      View Report
                    </Button>
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
    </div>
  )
}

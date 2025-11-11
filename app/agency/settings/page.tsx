"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"

interface AgencySettings {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  footer_text: string
  website_url: string | null
  plan: string
  reports_used_this_month: number
  monthly_report_limit: number
}

export default function AgencySettingsPage() {
  const [settings, setSettings] = useState<AgencySettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // TODO: Replace with actual agency ID from auth/context
  const agencyId = 'YOUR_AGENCY_ID'

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/agency/${agencyId}`)
      if (!response.ok) throw new Error('Failed to load settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/agency/${agencyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settings.name,
          primary_color: settings.primary_color,
          secondary_color: settings.secondary_color,
          footer_text: settings.footer_text,
          website_url: settings.website_url,
        }),
      })

      if (!response.ok) throw new Error('Failed to save settings')

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      setMessage({ type: 'error', text: 'Only PNG, JPG, and SVG files are allowed' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' })
      return
    }

    setUploadingLogo(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('logo', file)
      formData.append('agencyId', agencyId)

      const response = await fetch('/api/agency/upload-logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload logo')

      const { logoUrl } = await response.json()
      setSettings(prev => prev ? { ...prev, logo_url: logoUrl } : null)
      setMessage({ type: 'success', text: 'Logo uploaded successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload logo' })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId }),
      })

      if (!response.ok) throw new Error('Failed to create portal session')

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to open billing portal' })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading settings...</div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-red-400">Failed to load settings</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Agency Settings</h1>
          <p className="text-slate-400">Customize your white-label branding and manage your account</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Plan & Usage */}
        <Card className="p-6 bg-slate-900/50 border-slate-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Subscription Plan</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-emerald-400 capitalize">{settings.plan}</div>
              <div className="text-sm text-slate-400 mt-1">
                {settings.reports_used_this_month} / {settings.monthly_report_limit === -1 ? '∞' : settings.monthly_report_limit} reports used this month
              </div>
            </div>
            <Button onClick={handleManageBilling} className="bg-slate-700 hover:bg-slate-600">
              Manage Billing
            </Button>
          </div>
          {settings.monthly_report_limit !== -1 && (
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((settings.reports_used_this_month / settings.monthly_report_limit) * 100, 100)}%`
                }}
              />
            </div>
          )}
        </Card>

        {/* Branding */}
        <Card className="p-6 bg-slate-900/50 border-slate-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">White-Label Branding</h2>

          <div className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Agency Logo</label>
              <div className="flex items-center gap-4">
                {settings.logo_url && (
                  <img
                    src={settings.logo_url}
                    alt="Agency logo"
                    className="h-16 w-16 object-contain rounded-lg bg-white p-2"
                  />
                )}
                <div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <div
                      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 ${
                        uploadingLogo
                          ? 'bg-slate-600 cursor-not-allowed opacity-50'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </div>
                  </label>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, or SVG (max 5MB)</p>
                </div>
              </div>
            </div>

            {/* Agency Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Agency Name</label>
              <Input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="Your Agency Name"
              />
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Website URL (optional)</label>
              <Input
                type="url"
                value={settings.website_url || ''}
                onChange={(e) => setSettings({ ...settings, website_url: e.target.value })}
                placeholder="https://youragency.com"
              />
            </div>

            {/* Brand Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    placeholder="#10b981"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Secondary Color</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Report Footer Text</label>
              <Input
                type="text"
                value={settings.footer_text}
                onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                placeholder="Strategic Analysis Report"
              />
            </div>

            {/* Preview */}
            <div className="border border-slate-700 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-2">Preview</div>
              <div className="bg-white p-6 rounded">
                <div className="flex items-center justify-between mb-4">
                  {settings.logo_url ? (
                    <img src={settings.logo_url} alt="Logo" className="h-12" />
                  ) : (
                    <div className="h-12 w-32 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-500">
                      Your Logo
                    </div>
                  )}
                  <div
                    className="px-4 py-2 rounded text-white font-medium"
                    style={{ backgroundColor: settings.primary_color }}
                  >
                    Sample Button
                  </div>
                </div>
                <div className="text-sm text-slate-600 border-t border-slate-200 pt-4 text-center">
                  {settings.footer_text}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

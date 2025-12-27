"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { useState } from "react"
import type {
  ClaritySnapshotRequest,
  ClaritySnapshotResponse,
  PresenceChannel,
  TeamShape,
  SchedulingMethod,
  InvoicingMethod,
  CallHandling,
  BusinessFeeling
} from "@/lib/types/clarity-snapshot"
import Link from "next/link"

export default function ClaritySnapshotPage() {
  const [step, setStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ClaritySnapshotResponse | null>(null)
  const [error, setError] = useState("")

  // Form state
  const [presenceChannels, setPresenceChannels] = useState<PresenceChannel[]>([])
  const [teamShape, setTeamShape] = useState<TeamShape | "">("")
  const [scheduling, setScheduling] = useState<SchedulingMethod | "">("")
  const [invoicing, setInvoicing] = useState<InvoicingMethod | "">("")
  const [callHandling, setCallHandling] = useState<CallHandling | "">("")
  const [businessFeeling, setBusinessFeeling] = useState<BusinessFeeling | "">("")
  
  // Optional fields
  const [businessName, setBusinessName] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")

  const handlePresenceToggle = (channel: PresenceChannel) => {
    setPresenceChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    )
  }

  const handleAnalyze = async () => {
    // Validation
    if (presenceChannels.length === 0) {
      setError("Please select at least one presence channel")
      return
    }
    if (!teamShape || !scheduling || !invoicing || !callHandling || !businessFeeling) {
      setError("Please complete all selections")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      const request: ClaritySnapshotRequest = {
        selections: {
          presenceChannels,
          teamShape: teamShape as TeamShape,
          scheduling: scheduling as SchedulingMethod,
          invoicing: invoicing as InvoicingMethod,
          callHandling: callHandling as CallHandling,
          businessFeeling: businessFeeling as BusinessFeeling
        },
        businessName: businessName || undefined,
        websiteUrl: websiteUrl || undefined
      }

      const response = await fetch('/api/clarity-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data: ClaritySnapshotResponse = await response.json()
      setResult(data)
      setStep(5) // Jump to results

    } catch (err) {
      console.error('Clarity Snapshot error:', err)
      setError('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setStep(1)
    setResult(null)
    setError("")
    setPresenceChannels([])
    setTeamShape("")
    setScheduling("")
    setInvoicing("")
    setCallHandling("")
    setBusinessFeeling("")
    setBusinessName("")
    setWebsiteUrl("")
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block text-slate-400 hover:text-white mb-4">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            ✨ Clarity Snapshot
          </h1>
          <p className="text-xl text-slate-400">
            Get instant recognition of what's happening in your business
          </p>
          <p className="text-sm text-slate-500 mt-2">
            No long forms • No website required • 2 minutes
          </p>
        </div>

        {!result ? (
          <>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4].map(s => (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all ${
                      s <= step ? 'w-16 bg-emerald-500' : 'w-8 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-center text-slate-400 mt-3 text-sm">
                Step {step} of 4
              </p>
            </div>

            {error && (
              <Card className="mb-6 p-4 bg-red-500/10 border-red-500/30">
                <p className="text-red-400 text-sm">{error}</p>
              </Card>
            )}

            {/* Step 1: Presence */}
            {step === 1 && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Where do customers find you?
                </h2>
                <p className="text-slate-400 mb-6">Select all that apply</p>

                <div className="space-y-3">
                  {[
                    { value: 'website' as const, label: '🌐 Website', desc: 'You have a website' },
                    { value: 'google_reviews' as const, label: '⭐ Google Reviews', desc: 'Listed on Google Business' },
                    { value: 'social' as const, label: '📱 Social Media', desc: 'Active on Facebook, Instagram, etc.' },
                    { value: 'word_of_mouth' as const, label: '💬 Word of Mouth', desc: 'Referrals and recommendations' },
                    { value: 'messy_unsure' as const, label: '🤷 Messy/Unsure', desc: "Not sure what's working" }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handlePresenceToggle(option.value)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        presenceChannels.includes(option.value)
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-semibold text-white mb-1">{option.label}</div>
                      <div className="text-sm text-slate-400">{option.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => presenceChannels.length > 0 ? setStep(2) : setError("Select at least one")}
                    disabled={presenceChannels.length === 0}
                  >
                    Next →
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Team */}
            {step === 2 && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  What does your team look like?
                </h2>
                <p className="text-slate-400 mb-6">Select one</p>

                <div className="space-y-3">
                  {[
                    { value: 'solo_or_one_helper' as const, label: 'Just me (or me + 1 helper)' },
                    { value: 'small_crew_2_5' as const, label: 'Small crew (2-5 people)' },
                    { value: 'growing_6_15' as const, label: 'Growing team (6-15 people)' },
                    { value: 'office_plus_field' as const, label: 'Office + field teams' },
                    { value: 'fluctuates' as const, label: 'Team size fluctuates' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setTeamShape(option.value)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        teamShape === option.value
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-semibold text-white">{option.label}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(1)}>
                    ← Back
                  </Button>
                  <Button
                    onClick={() => teamShape ? setStep(3) : setError("Please select one")}
                    disabled={!teamShape}
                  >
                    Next →
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 3: Operations */}
            {step === 3 && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  How do you handle operations?
                </h2>

                {/* Scheduling */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Scheduling/Jobs</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'head_notebook' as const, label: 'In my head or notebook' },
                      { value: 'texts_calls' as const, label: 'Texts and calls' },
                      { value: 'calendar_app' as const, label: 'Calendar app (Google, Apple)' },
                      { value: 'job_software' as const, label: 'Job management software' },
                      { value: 'someone_else' as const, label: 'Someone else handles it' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setScheduling(option.value)}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                          scheduling === option.value
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-white">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Invoicing */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Invoicing/Payments</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'paper_verbal' as const, label: 'Paper or verbal' },
                      { value: 'quickbooks_invoicing_app' as const, label: 'QuickBooks or invoicing app' },
                      { value: 'job_software' as const, label: 'Job management software' },
                      { value: 'inconsistent' as const, label: 'Inconsistent' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setInvoicing(option.value)}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                          invoicing === option.value
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-white">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calls */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Calls/Leads</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'personal_phone' as const, label: 'My personal phone' },
                      { value: 'business_phone' as const, label: 'Business phone line' },
                      { value: 'missed_calls_often' as const, label: 'Miss calls often' },
                      { value: 'someone_screens' as const, label: 'Someone screens calls' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setCallHandling(option.value)}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                          callHandling === option.value
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-white">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(2)}>
                    ← Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (scheduling && invoicing && callHandling) {
                        setStep(4)
                      } else {
                        setError("Please complete all fields")
                      }
                    }}
                    disabled={!scheduling || !invoicing || !callHandling}
                  >
                    Next →
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 4: Feeling + Optional */}
            {step === 4 && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  What's most true for you lately?
                </h2>
                <p className="text-slate-400 mb-6">Select one</p>

                <div className="space-y-3 mb-8">
                  {[
                    { value: 'busy_no_progress' as const, label: 'Busy but not making progress' },
                    { value: 'stuck_in_day_to_day' as const, label: 'Stuck in day-to-day tasks' },
                    { value: 'dont_trust_numbers' as const, label: "Don't trust my numbers" },
                    { value: 'reactive_all_the_time' as const, label: 'Reactive all the time' },
                    { value: 'something_off_cant_name' as const, label: "Something's off, can't name it" }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setBusinessFeeling(option.value)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        businessFeeling === option.value
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-semibold text-white">{option.label}</div>
                    </button>
                  ))}
                </div>

                {/* Optional fields */}
                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-sm font-semibold text-slate-400 mb-4">
                    Optional (helps personalize results)
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Business Name</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                        placeholder="ABC Plumbing"
                        className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Website (if you have one)</label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={e => setWebsiteUrl(e.target.value)}
                        placeholder="https://yoursite.com"
                        className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(3)}>
                    ← Back
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!businessFeeling || isAnalyzing}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Get My Clarity Snapshot →'}
                  </Button>
                </div>
              </Card>
            )}
          </>
        ) : (
          /* Results */
          <div className="space-y-6">
            {/* Classification */}
            <Card className="p-6 bg-linear-to-br from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    {result.classification.topArchetype.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {result.classification.stage.charAt(0).toUpperCase() + result.classification.stage.slice(1)} Stage • {result.classification.confidence}% confidence
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">{result.classification.confidence}%</div>
                  <div className="text-xs text-slate-400">Match</div>
                </div>
              </div>
            </Card>

            {/* Pane A */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                💡 What's Actually Happening
              </h3>
              <ul className="space-y-3">
                {result.panes.whatsHappening.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1">•</span>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Pane B */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                💸 What This Is Costing
              </h3>
              <ul className="space-y-3">
                {result.panes.whatItCosts.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">•</span>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Pane C */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                🎯 What to Fix First
              </h3>
              <ul className="space-y-3">
                {result.panes.whatToFixFirst.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">→</span>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Correction Prompt */}
            {result.panes.correctionPrompt && (
              <Card className="p-6 bg-yellow-500/10 border-yellow-500/30">
                <h3 className="text-lg font-bold text-white mb-3">
                  🤔 {result.panes.correctionPrompt.question}
                </h3>
                <div className="space-y-3">
                  <button className="w-full p-4 rounded-lg border-2 border-slate-700 bg-slate-800/30 hover:border-yellow-500 text-left text-slate-300">
                    A) {result.panes.correctionPrompt.optionA}
                  </button>
                  <button className="w-full p-4 rounded-lg border-2 border-slate-700 bg-slate-800/30 hover:border-yellow-500 text-left text-slate-300">
                    B) {result.panes.correctionPrompt.optionB}
                  </button>
                </div>
              </Card>
            )}

            {/* Metadata */}
            <Card className="p-4 bg-slate-800/30">
              <div className="text-xs text-slate-400 text-center">
                Analysis completed in {result.metadata.executionTimeMs}ms
                {result.evidenceNuggets && result.evidenceNuggets.length > 0 && (
                  <> • {result.evidenceNuggets.length} evidence nuggets</>
                )}
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={handleReset} variant="secondary" className="flex-1">
                Start Over
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">
                  Explore Full Dashboard →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

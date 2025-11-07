"use client"

import QuickWinsCard from '@/components/QuickWinsCard'
import SummaryCard from '@/components/SummaryCard'
import TabLayout from '@/components/TabLayout'
import { Button } from '@/components/ui/Button'
import type { AnalysisResult } from '@/lib/types'
import { useState } from 'react'

// Import sample data (in production, this would come from API)
import sampleAnalysis from '@/data/sampleBusiness.json'

export default function DashboardPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis] = useState<AnalysisResult>(sampleAnalysis as AnalysisResult)

  const tabs = [
    {
      id: 'grow',
      label: 'Grow My Business',
      description: 'Simple steps to get more customers'
    },
    {
      id: 'visibility',
      label: 'Boost Online Presence',
      description: 'Get found by more customers online'
    },
    {
      id: 'automate',
      label: 'Save Time with AI',
      description: 'Automate repetitive tasks'
    }
  ]

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true)
    // In production, call the API here
    // await fetch('/api/analyze', { method: 'POST', ... })
    setTimeout(() => setIsAnalyzing(false), 2000)
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-12 text-slate-100">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Your Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Welcome Back!</h1>
          <p className="mt-2 text-slate-300">
            Here's what you can do to grow your business this week
          </p>
        </div>
        <Button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {isAnalyzing ? 'Analyzing...' : '🔄 Refresh Analysis'}
        </Button>
      </header>

      {/* Tab Navigation */}
      <TabLayout tabs={tabs} defaultTab="grow">
        {(activeTab) => (
          <>
            {/* Grow My Business Tab */}
            {activeTab === 'grow' && (
              <div className="space-y-6">
                {/* Summary Card */}
                <SummaryCard analysis={analysis} />

                {/* Quick Wins */}
                <QuickWinsCard
                  wins={analysis.top_quick_wins}
                  title="This Week's Action Plan"
                  subtitle="Pick 1-2 of these to tackle this week. Small steps lead to big results!"
                />

                {/* Encouragement */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💪</span>
                    <div>
                      <h3 className="font-semibold text-emerald-400">You've Got This!</h3>
                      <p className="mt-1 text-sm text-slate-300">
                        Every successful business started exactly where you are. These small improvements add up fast.
                        Pick one action above and do it today. You'll be surprised how much momentum you build.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Boost Online Presence Tab */}
            {activeTab === 'visibility' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                  <span className="text-5xl">👁️</span>
                  <h2 className="mt-4 text-2xl font-bold text-white">Get Found by More Customers</h2>
                  <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
                    This is where we'll analyze your online visibility and show you exactly how to appear when 
                    customers search for businesses like yours. Coming soon!
                  </p>
                  <div className="mt-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm text-emerald-400 font-medium">💡 What You'll Get:</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-300 text-left max-w-md mx-auto">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>Google Business Profile optimization checklist</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>Social media presence audit</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>Local SEO quick wins</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>Review generation strategy</span>
                      </li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleRunAnalysis}
                    className="mt-6 bg-emerald-500 hover:bg-emerald-600"
                  >
                    Run Visibility Analysis
                  </Button>
                </div>
              </div>
            )}

            {/* Save Time with AI Tab */}
            {activeTab === 'automate' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                  <span className="text-5xl">⏰</span>
                  <h2 className="mt-4 text-2xl font-bold text-white">Automate the Boring Stuff</h2>
                  <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
                    Imagine getting back 5-10 hours per week. We'll find every task you're doing manually that 
                    could be automated, then show you exactly how to set it up.
                  </p>
                  <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-blue-400 font-medium">⚡ Time-Savers We'll Find:</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-300 text-left max-w-md mx-auto">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">✓</span>
                        <span>Social media scheduling (save 2-3 hours/week)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">✓</span>
                        <span>Automated appointment reminders</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">✓</span>
                        <span>Email marketing automation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">✓</span>
                        <span>Invoice and payment reminders</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">✓</span>
                        <span>Customer follow-up sequences</span>
                      </li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleRunAnalysis}
                    className="mt-6 bg-blue-500 hover:bg-blue-600"
                  >
                    Find My Time-Savers
                  </Button>
                </div>

                {/* Preview of time savers */}
                {analysis.time_savers && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Preview</h3>
                    <p className="text-sm text-slate-300 mb-4">
                      Based on your business, you could save approximately{' '}
                      <span className="font-bold text-emerald-400">
                        {analysis.time_savers.total_hours_per_week} hours per week
                      </span>{' '}
                      with simple automation. That's{' '}
                      <span className="font-bold text-white">
                        {(analysis.time_savers.total_hours_per_week || 0) * 52} hours per year!
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </TabLayout>

      {/* Footer Tip */}
      <div className="mt-8 rounded-xl border border-white/5 bg-white/5 p-4">
        <p className="text-xs text-slate-400 text-center">
          💡 <span className="font-semibold">Pro Tip:</span> Start with the easy wins marked with a green "easy" badge. 
          You can knock out 2-3 of these in an afternoon and see results within a week.
        </p>
      </div>
    </div>
  )
}

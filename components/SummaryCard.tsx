"use client"

import type { AnalysisResult } from '@/lib/types'

interface SummaryCardProps {
  analysis: AnalysisResult
}

export default function SummaryCard({ analysis }: SummaryCardProps) {
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-slate-400'
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getScoreLabel = (score?: number) => {
    if (!score) return 'Not analyzed'
    if (score >= 80) return 'Great!'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Room to improve'
    return 'Needs attention'
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      {/* Business Name */}
      {analysis.business_name && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">Your Business</p>
          <h2 className="mt-1 text-2xl font-bold text-white">{analysis.business_name}</h2>
        </div>
      )}

      {/* Summary */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-300">Quick Summary</h3>
        <p className="mt-2 text-white leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Scores Grid */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {/* Visibility Score */}
        {analysis.visibility_score !== undefined && (
          <div className="rounded-lg border border-white/5 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👁️</span>
              <div>
                <p className="text-xs text-slate-400">Online Visibility</p>
                <p className={`text-2xl font-bold ${getScoreColor(analysis.visibility_score)}`}>
                  {analysis.visibility_score}
                </p>
                <p className="text-xs text-slate-500">{getScoreLabel(analysis.visibility_score)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reputation Score */}
        {analysis.reputation_score !== undefined && (
          <div className="rounded-lg border border-white/5 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="text-xs text-slate-400">Reputation</p>
                <p className={`text-2xl font-bold ${getScoreColor(analysis.reputation_score)}`}>
                  {analysis.reputation_score}
                </p>
                <p className="text-xs text-slate-500">{getScoreLabel(analysis.reputation_score)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Growth Potential */}
        {analysis.growth_potential_score !== undefined && (
          <div className="rounded-lg border border-white/5 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              <div>
                <p className="text-xs text-slate-400">Growth Potential</p>
                <p className={`text-2xl font-bold ${getScoreColor(analysis.growth_potential_score)}`}>
                  {analysis.growth_potential_score}
                </p>
                <p className="text-xs text-slate-500">{getScoreLabel(analysis.growth_potential_score)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time Savers */}
      {analysis.time_savers && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-start gap-2">
            <span className="text-xl">⏰</span>
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-400">Time You Could Save</h4>
              {analysis.time_savers.total_hours_per_week && (
                <p className="mt-1 text-2xl font-bold text-white">
                  ~{analysis.time_savers.total_hours_per_week} hours/week
                </p>
              )}
              {analysis.time_savers.top_automation_opportunities && 
               analysis.time_savers.top_automation_opportunities.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-emerald-300">Top Opportunities:</p>
                  <ul className="mt-2 space-y-1">
                    {analysis.time_savers.top_automation_opportunities.slice(0, 3).map((opp, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {analysis.last_updated && (
        <p className="mt-4 text-xs text-slate-500">
          Last updated: {new Date(analysis.last_updated).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}

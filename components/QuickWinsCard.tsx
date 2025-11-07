"use client"

import { Badge } from '@/components/ui/Badge'
import type { QuickWin } from '@/lib/types'

interface QuickWinsCardProps {
  wins: QuickWin[]
  title?: string
  subtitle?: string
}

export default function QuickWinsCard({ wins, title = "This Week's AI Tips", subtitle }: QuickWinsCardProps) {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'advanced': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'growth': return '📈'
      case 'visibility': return '👁️'
      case 'time-saver': return '⏰'
      case 'money-saver': return '💰'
      default: return '💡'
    }
  }

  if (!wins || wins.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        <p className="mt-4 text-sm text-slate-400">No quick wins available yet. Run an analysis to get started!</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>

      <div className="space-y-4">
        {wins.map((win, index) => (
          <div
            key={win.id}
            className="rounded-xl border border-white/5 bg-white/5 p-4 transition hover:border-emerald-500/30"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <span className="text-lg">{getCategoryIcon(win.category)}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{win.title}</h4>
                </div>
              </div>
              {win.difficulty && (
                <Badge className={getDifficultyColor(win.difficulty)}>
                  {win.difficulty}
                </Badge>
              )}
            </div>

            {/* Why it matters */}
            <p className="mt-2 text-sm text-slate-300">{win.why}</p>

            {/* Action step */}
            <div className="mt-3 rounded-lg bg-emerald-500/5 p-3 border border-emerald-500/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">Action</p>
              <p className="mt-1 text-sm text-white">{win.action}</p>
            </div>

            {/* Impact metrics */}
            {(win.estimated_impact || win.est_hours_saved_per_week) && (
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                {win.estimated_impact && (
                  <div className="flex items-center gap-1">
                    <span>📊</span>
                    <span>{win.estimated_impact}</span>
                  </div>
                )}
                {win.est_hours_saved_per_week && (
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>Saves ~{win.est_hours_saved_per_week}h/week</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

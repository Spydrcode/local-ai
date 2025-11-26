"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { WeeklyPulse, RecommendedAction } from '@/lib/types/contractor-leads';

interface WeeklyPulseWidgetProps {
  demoId: string;
  initialPulse?: WeeklyPulse;
}

export function WeeklyPulseWidget({ demoId, initialPulse }: WeeklyPulseWidgetProps) {
  const [pulse, setPulse] = useState<WeeklyPulse | null>(initialPulse || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedAction, setExpandedAction] = useState<number | null>(null);

  const generatePulse = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/contractor/lead-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo_id: demoId, force_refresh: forceRefresh })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate pulse');
      }

      setPulse(data.pulse);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyActionToClipboard = (action: RecommendedAction) => {
    let text = `${action.title}\n\n${action.description}\n\n`;

    // Add action-specific details
    if (action.action_type === 'ad_campaign' && action.details) {
      const details = action.details as any;
      text += `FACEBOOK AD COPY:\n`;
      text += `Headline: ${details.headline}\n`;
      text += `Text: ${details.primary_text}\n`;
      text += `CTA: ${details.cta}\n`;
      text += `Budget: $${details.suggested_budget_weekly}/week\n`;
      text += `\nTargeting:\n`;
      text += `- Location: ${details.targeting.location}\n`;
      text += `- Radius: ${details.targeting.radius_miles} miles\n`;
      text += `- Age: ${details.targeting.age_range}\n`;
    } else if (action.action_type === 'social_post' && action.details) {
      const details = action.details as any;
      text += `SOCIAL POSTS:\n\n`;
      details.post_templates.forEach((template: any, i: number) => {
        text += `Post ${i + 1}:\n${template.copy}\n\n`;
        if (template.hashtags) {
          text += `Hashtags: ${template.hashtags.join(' ')}\n\n`;
        }
      });
    } else if (action.action_type === 'email_campaign' && action.details) {
      const details = action.details as any;
      text += `EMAIL CAMPAIGN:\n`;
      text += `Subject: ${details.subject_line}\n`;
      text += `Preview: ${details.preview_text}\n\n`;
      text += `Body:\n${details.email_body}\n`;
    }

    navigator.clipboard.writeText(text);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-slate-900/50 border-slate-800">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-slate-400">Generating weekly pulse...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-slate-900/50 border-red-800">
        <h3 className="text-lg font-bold text-red-400 mb-2">Error</h3>
        <p className="text-slate-300 mb-4">{error}</p>
        <Button onClick={() => generatePulse(false)} variant="secondary">
          Try Again
        </Button>
      </Card>
    );
  }

  if (!pulse) {
    return (
      <Card className="p-6 bg-slate-900/50 border-slate-800">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-white mb-2">Weekly Lead Pulse</h3>
          <p className="text-slate-400 mb-6">
            Get predictions for next week's leads + 3 actionable tasks
          </p>
          <Button onClick={() => generatePulse(false)}>
            Generate This Week's Pulse
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Prediction Card */}
      <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-slate-900/50 border-emerald-500/30">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Weekly Lead Pulse</h3>
            <p className="text-sm text-slate-400">
              Week of {new Date(pulse.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(pulse.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className={getConfidenceColor(pulse.prediction.confidence)}>
              {pulse.prediction.confidence} confidence
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => generatePulse(true)}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Expected Leads */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Low</div>
            <div className="text-2xl font-bold text-white">
              {pulse.prediction.expected_leads_low}
            </div>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4">
            <div className="text-sm text-emerald-400 mb-1">Expected</div>
            <div className="text-3xl font-bold text-emerald-400">
              {pulse.prediction.expected_leads_midpoint}
            </div>
            <div className="text-xs text-emerald-300 mt-1">leads</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">High</div>
            <div className="text-2xl font-bold text-white">
              {pulse.prediction.expected_leads_high}
            </div>
          </div>
        </div>

        {/* Context Row */}
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Last week:</span>
            <span className="font-semibold text-white">
              {pulse.historical_context.last_week_leads}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Trend:</span>
            <span className="font-semibold text-white">
              {getTrendIcon(pulse.historical_context.trend)}
              {pulse.historical_context.trend === 'stable' ? 'Stable' :
               pulse.historical_context.trend === 'up' ? `Up ${Math.abs(pulse.historical_context.trend_percentage).toFixed(0)}%` :
               `Down ${Math.abs(pulse.historical_context.trend_percentage).toFixed(0)}%`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Demand:</span>
            <span className="font-semibold text-white">
              {pulse.market_context.local_demand_score}/100
            </span>
          </div>
        </div>

        {/* Reasoning */}
        <details className="mt-4">
          <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
            Why this prediction?
          </summary>
          <div className="mt-3 text-sm text-slate-300 whitespace-pre-line bg-slate-800/30 p-3 rounded">
            {pulse.reasoning}
          </div>
        </details>
      </Card>

      {/* Top 3 Actions */}
      <Card className="p-6 bg-slate-900/50 border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4">
          Top 3 Actions This Week
        </h3>

        <div className="space-y-3">
          {pulse.top_actions.map((action, index) => (
            <div
              key={index}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {action.priority}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{action.title}</h4>
                    <p className="text-sm text-slate-400 mb-2">{action.description}</p>

                    {/* Action-specific preview */}
                    {action.action_type === 'ad_campaign' && (
                      <div className="bg-slate-900/50 p-3 rounded mt-2 text-sm">
                        <div className="font-semibold text-emerald-400 mb-1">
                          {(action.details as any).headline}
                        </div>
                        <div className="text-slate-300 mb-2">
                          {(action.details as any).primary_text}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>Budget: ${(action.details as any).suggested_budget_weekly}/week</span>
                          <span>•</span>
                          <span>CTA: {(action.details as any).cta}</span>
                        </div>
                      </div>
                    )}

                    {expandedAction === index && (
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        {action.action_type === 'ad_campaign' && (
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-slate-400">Targeting: </span>
                              <span className="text-white">
                                {(action.details as any).targeting.location}, {(action.details as any).targeting.radius_miles}mi radius
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400">Age: </span>
                              <span className="text-white">{(action.details as any).targeting.age_range}</span>
                            </div>
                            {(action.details as any).image_suggestions && (
                              <div>
                                <span className="text-slate-400">Image ideas: </span>
                                <span className="text-white">
                                  {(action.details as any).image_suggestions.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {action.action_type === 'social_post' && (
                          <div className="space-y-3">
                            {(action.details as any).post_templates.map((template: any, i: number) => (
                              <div key={i} className="bg-slate-900/50 p-3 rounded">
                                <div className="text-xs text-slate-500 mb-1">Post {i + 1}</div>
                                <div className="text-sm text-slate-300 whitespace-pre-line mb-2">
                                  {template.copy}
                                </div>
                                {template.hashtags && (
                                  <div className="text-xs text-emerald-400">
                                    {template.hashtags.join(' ')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {action.action_type === 'email_campaign' && (
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-slate-400">Subject: </span>
                              <span className="text-white">{(action.details as any).subject_line}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Target: </span>
                              <span className="text-white">{(action.details as any).target_segment}</span>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded mt-2 whitespace-pre-line text-slate-300">
                              {(action.details as any).email_body}
                            </div>
                          </div>
                        )}

                        {action.action_type === 'pricing_test' && (
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-slate-900/50 p-3 rounded">
                                <div className="font-semibold text-white mb-1">
                                  Variant A: {(action.details as any).variant_a.name}
                                </div>
                                <div className="text-slate-400">
                                  {(action.details as any).variant_a.description}
                                </div>
                                {(action.details as any).variant_a.price !== undefined && (
                                  <div className="text-emerald-400 font-semibold mt-2">
                                    ${(action.details as any).variant_a.price}
                                  </div>
                                )}
                              </div>
                              <div className="bg-slate-900/50 p-3 rounded">
                                <div className="font-semibold text-white mb-1">
                                  Variant B: {(action.details as any).variant_b.name}
                                </div>
                                <div className="text-slate-400">
                                  {(action.details as any).variant_b.description}
                                </div>
                                {(action.details as any).variant_b.price !== undefined && (
                                  <div className="text-emerald-400 font-semibold mt-2">
                                    ${(action.details as any).variant_b.price}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-slate-400">
                              Test duration: {(action.details as any).test_duration_days} days
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {action.estimated_impact && (
                    <Badge variant="secondary" className="text-xs">
                      {action.estimated_impact}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setExpandedAction(expandedAction === index ? null : index)}
                >
                  {expandedAction === index ? 'Hide Details' : 'Show Details'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyActionToClipboard(action)}
                >
                  Copy
                </Button>
              </div>

              <div className="text-xs text-slate-500 mt-2">
                {action.confidence} confidence • {action.source}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

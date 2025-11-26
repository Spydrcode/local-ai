"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WeeklyPulseWidget } from '@/components/contractor/WeeklyPulseWidget';
import AlertsWidget from '@/components/contractor/AlertsWidget';
import type { ContractorProfile, FilteredCompetitor } from '@/lib/types/contractor';

function ContractorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demo_id = searchParams?.get('demo_id');

  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [completeness, setCompleteness] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [competitors, setCompetitors] = useState<FilteredCompetitor[]>([]);
  const [competitorSummary, setCompetitorSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilteringCompetitors, setIsFilteringCompetitors] = useState(false);

  useEffect(() => {
    if (demo_id) {
      loadProfile();
    }
  }, [demo_id]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/contractor/profile?demo_id=${demo_id}`);
      const data = await response.json();

      if (data.profile) {
        setProfile(data.profile);
        setCompleteness(data.completeness || 0);
        setSuggestions(data.suggestions || []);
      } else {
        // No profile yet - redirect to onboarding
        router.push(`/contractor/onboard?demo_id=${demo_id}`);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCompetitors = async () => {
    setIsFilteringCompetitors(true);
    try {
      const response = await fetch('/api/contractor/competitors/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo_id })
      });

      const data = await response.json();

      if (data.success) {
        setCompetitors(data.filtered_competitors || []);
        setCompetitorSummary(data.summary);
      }
    } catch (error) {
      console.error('Error filtering competitors:', error);
    } finally {
      setIsFilteringCompetitors(false);
    }
  };

  if (!demo_id) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Missing Demo ID</h2>
          <p className="text-slate-400 mb-4">Please start from the homepage.</p>
          <Button onClick={() => router.push('/')}>Go to Homepage</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return null; // Will redirect to onboarding
  }

  const relevantCompetitors = competitors.filter(c => !c.should_exclude);

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Contractor Copilot Dashboard
          </h1>
          <p className="text-slate-400">
            Operational intelligence for {profile.primary_industry} contractors
          </p>
        </div>

        {/* Profile Overview */}
        <Card className="p-6 bg-slate-900/50 border-slate-800 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Business Profile</h2>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>Industry: <strong className="text-white">{profile.primary_industry}</strong></span>
                <span>•</span>
                <span>Services: <strong className="text-white">{profile.service_types.length}</strong></span>
                <span>•</span>
                <span>Crew: <strong className="text-white">{profile.crew_size}</strong></span>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => router.push(`/contractor/onboard?demo_id=${demo_id}`)}
            >
              Edit Profile
            </Button>
          </div>

          {/* Completeness Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Profile Completeness</span>
              <span className="text-sm font-medium text-emerald-400">
                {Math.round(completeness * 100)}%
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${completeness * 100}%` }}
              />
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">
                Improve Your Profile:
              </h3>
              <ul className="space-y-1">
                {suggestions.map((suggestion, i) => (
                  <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">→</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Business Alerts */}
        <div className="mb-6">
          <AlertsWidget demoId={demo_id!} />
        </div>

        {/* Weekly Lead Pulse */}
        <WeeklyPulseWidget demoId={demo_id!} />

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-6 mt-6">

          <Card
            className="p-6 bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-colors cursor-pointer"
            onClick={() => router.push(`/contractor/hiring?demo_id=${demo_id}`)}
          >
            <div className="text-3xl mb-3">👷</div>
            <h3 className="text-lg font-bold text-white mb-2">Hire & Onboard</h3>
            <p className="text-sm text-slate-400 mb-4">
              Generate job ads and onboarding checklists
            </p>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Open Tool</Badge>
          </Card>

          <Card
            className="p-6 bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-colors cursor-pointer"
            onClick={() => router.push(`/contractor/qc-checker?demo_id=${demo_id}`)}
          >
            <div className="text-3xl mb-3">📸</div>
            <h3 className="text-lg font-bold text-white mb-2">QC Photo Checker</h3>
            <p className="text-sm text-slate-400 mb-4">
              AI quality control with punch lists
            </p>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Open Tool</Badge>
          </Card>

          <Card
            className="p-6 bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-colors cursor-pointer"
            onClick={() => router.push(`/contractor/monthly-report?demo_id=${demo_id}`)}
          >
            <div className="text-3xl mb-3">📄</div>
            <h3 className="text-lg font-bold text-white mb-2">Monthly Report</h3>
            <p className="text-sm text-slate-400 mb-4">
              Executive summary & investor reports
            </p>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Open Tool</Badge>
          </Card>
        </div>

        {/* Competitor Analysis */}
        <Card className="p-6 bg-slate-900/50 border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Competitor Intelligence</h2>
              <p className="text-sm text-slate-400">
                Filtered using your business profile
              </p>
            </div>
            <Button
              onClick={filterCompetitors}
              disabled={isFilteringCompetitors}
            >
              {isFilteringCompetitors ? 'Filtering...' : 'Run Filter'}
            </Button>
          </div>

          {competitorSummary && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-white mb-1">
                  {competitorSummary.total}
                </div>
                <div className="text-sm text-slate-400">Total Found</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {competitorSummary.relevant}
                </div>
                <div className="text-sm text-emerald-300">Relevant</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-400 mb-1">
                  {competitorSummary.excluded}
                </div>
                <div className="text-sm text-slate-500">Excluded</div>
              </div>
            </div>
          )}

          {competitors.length > 0 ? (
            <>
              {/* Relevant Competitors */}
              {relevantCompetitors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Relevant Competitors ({relevantCompetitors.length})
                  </h3>
                  <div className="space-y-3">
                    {relevantCompetitors.map((comp, i) => (
                      <div
                        key={i}
                        className="bg-slate-800/50 border border-emerald-500/30 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-white font-semibold">{comp.name}</h4>
                            {comp.url && (
                              <a
                                href={comp.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-emerald-400 hover:underline"
                              >
                                {comp.url}
                              </a>
                            )}
                          </div>
                          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                            {Math.round(comp.relevance_score * 100)}% match
                          </Badge>
                        </div>
                        {comp.relevance_reasons.length > 0 && (
                          <ul className="space-y-1">
                            {comp.relevance_reasons.map((reason, j) => (
                              <li key={j} className="text-sm text-slate-400 flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5">✓</span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        )}
                        {comp.distance_miles !== undefined && (
                          <div className="mt-2 text-sm text-slate-500">
                            {comp.distance_miles} miles away
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Excluded Competitors (collapsed) */}
              {competitorSummary && competitorSummary.excluded > 0 && (
                <details className="mt-4">
                  <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
                    Show {competitorSummary.excluded} excluded competitors
                  </summary>
                  <div className="mt-3 space-y-2">
                    {competitors
                      .filter(c => c.should_exclude)
                      .map((comp, i) => (
                        <div
                          key={i}
                          className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 opacity-60"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-white font-medium text-sm">{comp.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              Excluded
                            </Badge>
                          </div>
                          {comp.exclusion_reasons.length > 0 && (
                            <ul className="space-y-0.5">
                              {comp.exclusion_reasons.map((reason, j) => (
                                <li key={j} className="text-xs text-slate-500 flex items-start gap-2">
                                  <span className="mt-0.5">×</span>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                  </div>
                </details>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="mb-2">No competitors analyzed yet.</p>
              <p className="text-sm">Run competitor discovery on your website first, then filter here.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ContractorDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ContractorDashboardContent />
    </Suspense>
  );
}

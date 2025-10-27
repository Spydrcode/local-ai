'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface EconomicIndicator {
  rate?: number;
  index?: number;
  current?: number;
  trend: 'rising' | 'falling' | 'stable';
  impact: string;
}

interface RegulatoryChange {
  policy: string;
  status: 'proposed' | 'enacted' | 'threatened';
  timeline: string;
  industryImpact: string;
  severity: 'critical' | 'major' | 'moderate' | 'minor';
}

interface Scenario {
  description: string;
  revenueImpact: string;
  recommendedActions?: string[];
  survivalActions?: string[];
  growthActions?: string[];
  probability: string;
}

interface EconomicIntelligence {
  demoId: string;
  industry: string;
  generatedAt: string;
  economicContext: {
    inflation: EconomicIndicator;
    unemployment: EconomicIndicator;
    consumerConfidence: EconomicIndicator;
    interestRates: EconomicIndicator;
    regulatoryChanges: RegulatoryChange[];
  };
  industryImpact: {
    overallRisk: 'critical' | 'high' | 'moderate' | 'low';
    threats: Array<{
      threat: string;
      probability: 'high' | 'medium' | 'low';
      severity: 'critical' | 'major' | 'moderate' | 'minor';
      mitigation: string;
    }>;
    opportunities: Array<{
      opportunity: string;
      probability: 'high' | 'medium' | 'low';
      potentialGain: string;
      actionRequired: string;
    }>;
    scenarios: {
      worstCase: Scenario;
      likelyCase: Scenario;
      bestCase: Scenario;
    };
    immediateActions: Array<{
      action: string;
      priority: 'urgent' | 'high' | 'medium';
      expectedImpact: string;
      implementation: string;
    }>;
  };
  profitPrediction: {
    baselineForecast: Record<string, any>;
    adjustedForecast: Record<string, any>;
    sensitivities: Array<{
      variable: string;
      baseCase: string;
      optimistic: string;
      pessimistic: string;
      revenueImpact: string;
    }>;
  };
}

export default function EconomicIntelligencePage() {
  const params = useParams();
  const demoId = (params?.demoId as string) || '';
  const [intelligence, setIntelligence] = useState<EconomicIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [businessName, setBusinessName] = useState('Business');

  useEffect(() => {
    // Fetch existing economic intelligence and demo info
    const fetchData = async () => {
      try {
        // Fetch demo with economic intelligence
        const demoResponse = await fetch(`/api/demos/${demoId}`);
        if (demoResponse.ok) {
          const demoData = await demoResponse.json();
          setBusinessName(demoData.client_id || 'Business');
          
          // Load existing economic intelligence if it exists
          if (demoData.economic_intelligence) {
            setIntelligence(demoData.economic_intelligence);
          }
        }
      } catch (error) {
        console.error('Failed to fetch demo data:', error);
      }
    };

    if (demoId) {
      fetchData();
    }
  }, [demoId]);

  const runEconomicAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/economic-intelligence/${demoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoId }),
      });

      if (response.ok) {
        const result = await response.json();
        setIntelligence(result.data);
      } else {
        const error = await response.json();
        alert(`Analysis failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to run economic analysis:', error);
      alert('Failed to run economic analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'falling': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300 mb-1">
                Economic Intelligence Dashboard
              </p>
              <h1 className="text-2xl font-bold text-white mb-1">
                <span className="text-emerald-400">Macro Analysis</span> - {businessName}
              </h1>
              <p className="text-slate-400 text-sm">
                Economic trends, profit predictions, and strategic scenario planning
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href={`/analysis/${demoId}`}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ← Back to Analysis
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {!intelligence ? (
          <div className="max-w-3xl mx-auto text-center py-12">
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-12">
              <span className="text-6xl mb-6 block">📊</span>
              <h2 className="text-2xl font-bold text-white mb-4">
                Economic Intelligence & Profit Prediction
              </h2>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Analyze current macro-economic trends, regulatory changes (like SNAP benefit cuts, government shutdowns), 
                and predict their specific impact on this business's profitability. Get scenario-based strategic recommendations 
                for maximum profit or survival in uncertain times.
              </p>
              <button
                onClick={runEconomicAnalysis}
                disabled={isLoading}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Analyzing Economic Environment...
                  </>
                ) : (
                  <>
                    <span>🔮</span>
                    Generate Economic Intelligence
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Banner */}
            <div className={`rounded-xl border p-6 ${getRiskColor(intelligence.industryImpact.overallRisk)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-2">
                    {intelligence.industry} - Overall Economic Risk Assessment
                  </h2>
                  <p className="text-sm opacity-90">
                    Generated: {new Date(intelligence.generatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold uppercase">{intelligence.industryImpact.overallRisk}</div>
                  <div className="text-xs opacity-75">Risk Level</div>
                </div>
              </div>
            </div>

            {/* Economic Indicators */}
            {intelligence.economicContext && (
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>📊</span>
                  Current Economic Indicators (October 2025)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {intelligence.economicContext.inflation && (
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="text-xs text-slate-400 mb-1">Inflation Rate</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {intelligence.economicContext.inflation.rate ?? 'N/A'}% {getTrendIcon(intelligence.economicContext.inflation.trend)}
                      </div>
                      <div className="text-xs text-slate-400">{intelligence.economicContext.inflation.impact ?? 'No data'}</div>
                    </div>
                  )}

                  {intelligence.economicContext.unemployment && (
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="text-xs text-slate-400 mb-1">Unemployment</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {intelligence.economicContext.unemployment.rate ?? 'N/A'}% {getTrendIcon(intelligence.economicContext.unemployment.trend)}
                      </div>
                      <div className="text-xs text-slate-400">{intelligence.economicContext.unemployment.impact ?? 'No data'}</div>
                    </div>
                  )}

                  {intelligence.economicContext.consumerConfidence && (
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="text-xs text-slate-400 mb-1">Consumer Confidence</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {intelligence.economicContext.consumerConfidence.index ?? 'N/A'} {getTrendIcon(intelligence.economicContext.consumerConfidence.trend)}
                      </div>
                      <div className="text-xs text-slate-400">{intelligence.economicContext.consumerConfidence.impact ?? 'No data'}</div>
                    </div>
                  )}

                  {intelligence.economicContext.interestRates && (
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="text-xs text-slate-400 mb-1">Interest Rates</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {intelligence.economicContext.interestRates.current ?? 'N/A'}% {getTrendIcon(intelligence.economicContext.interestRates.trend)}
                      </div>
                      <div className="text-xs text-slate-400">{intelligence.economicContext.interestRates.impact ?? 'No data'}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Regulatory Changes */}
            {intelligence.economicContext?.regulatoryChanges && intelligence.economicContext.regulatoryChanges.length > 0 && (
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>⚠️</span>
                  Active Regulatory & Policy Threats
                </h3>
                <div className="space-y-3">
                  {intelligence.economicContext.regulatoryChanges.map((change, idx) => (
                    <div key={idx} className={`rounded-lg border p-4 ${getRiskColor(change.severity)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{change.policy}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-black/20">
                          {change.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm mb-2 opacity-90">{change.industryImpact}</p>
                      <div className="text-xs opacity-75">Timeline: {change.timeline}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scenario Planning */}
            {intelligence.industryImpact?.scenarios && (
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  Strategic Scenario Planning
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Worst Case */}
                  {intelligence.industryImpact?.scenarios?.worstCase && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-red-400">😰 Worst Case</h4>
                        <span className="text-xs text-red-400">{intelligence.industryImpact.scenarios.worstCase.probability}</span>
                      </div>
                      <p className="text-sm text-white/90 mb-3">{intelligence.industryImpact.scenarios.worstCase.description}</p>
                      <div className="text-lg font-bold text-red-400 mb-3">
                        {intelligence.industryImpact.scenarios.worstCase.revenueImpact}
                      </div>
                      {intelligence.industryImpact.scenarios.worstCase.survivalActions && intelligence.industryImpact.scenarios.worstCase.survivalActions.length > 0 && (
                        <>
                          <div className="text-xs font-semibold text-red-400 mb-2">SURVIVAL ACTIONS:</div>
                          <ul className="space-y-1">
                            {intelligence.industryImpact.scenarios.worstCase.survivalActions.map((action, idx) => (
                              <li key={idx} className="text-xs text-white/80 flex gap-2">
                                <span>•</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}

                  {/* Likely Case */}
                  {intelligence.industryImpact?.scenarios?.likelyCase && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-yellow-400">😐 Likely Case</h4>
                        <span className="text-xs text-yellow-400">{intelligence.industryImpact.scenarios.likelyCase.probability}</span>
                      </div>
                      <p className="text-sm text-white/90 mb-3">{intelligence.industryImpact.scenarios.likelyCase.description}</p>
                      <div className="text-lg font-bold text-yellow-400 mb-3">
                        {intelligence.industryImpact.scenarios.likelyCase.revenueImpact}
                      </div>
                      {intelligence.industryImpact.scenarios.likelyCase.recommendedActions && intelligence.industryImpact.scenarios.likelyCase.recommendedActions.length > 0 && (
                        <>
                          <div className="text-xs font-semibold text-yellow-400 mb-2">RECOMMENDED ACTIONS:</div>
                          <ul className="space-y-1">
                            {intelligence.industryImpact.scenarios.likelyCase.recommendedActions.map((action, idx) => (
                              <li key={idx} className="text-xs text-white/80 flex gap-2">
                                <span>•</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}

                {/* Best Case */}
                  {intelligence.industryImpact?.scenarios?.bestCase && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-emerald-400">🚀 Best Case</h4>
                        <span className="text-xs text-emerald-400">{intelligence.industryImpact.scenarios.bestCase.probability}</span>
                      </div>
                      <p className="text-sm text-white/90 mb-3">{intelligence.industryImpact.scenarios.bestCase.description}</p>
                      <div className="text-lg font-bold text-emerald-400 mb-3">
                        {intelligence.industryImpact.scenarios.bestCase.revenueImpact}
                      </div>
                      {intelligence.industryImpact.scenarios.bestCase.growthActions && intelligence.industryImpact.scenarios.bestCase.growthActions.length > 0 && (
                        <>
                          <div className="text-xs font-semibold text-emerald-400 mb-2">GROWTH ACTIONS:</div>
                          <ul className="space-y-1">
                            {intelligence.industryImpact.scenarios.bestCase.growthActions.map((action, idx) => (
                              <li key={idx} className="text-xs text-white/80 flex gap-2">
                                <span>•</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Immediate Actions */}
            {intelligence.industryImpact?.immediateActions && intelligence.industryImpact.immediateActions.length > 0 && (
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>⚡</span>
                  Immediate Actions Required
                </h3>
                <div className="space-y-3">
                  {intelligence.industryImpact.immediateActions.map((action, idx) => (
                    <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border-l-4 border-emerald-500">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">{action.action}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          action.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                          action.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {action.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">Expected Impact: {action.expectedImpact}</p>
                      <p className="text-xs text-slate-400">Implementation: {action.implementation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Threats & Opportunities */}
            {intelligence.industryImpact && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Threats */}
                {intelligence.industryImpact.threats && intelligence.industryImpact.threats.length > 0 && (
                  <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span>⚠️</span>
                      Key Threats
                    </h3>
                    <div className="space-y-3">
                      {intelligence.industryImpact.threats.map((threat, idx) => (
                        <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-white">{threat.threat}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(threat.severity)}`}>
                              {threat.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">Probability: {threat.probability}</p>
                          <p className="text-xs text-emerald-400">Mitigation: {threat.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Opportunities */}
                {intelligence.industryImpact.opportunities && intelligence.industryImpact.opportunities.length > 0 && (
                  <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span>💡</span>
                      Opportunities
                    </h3>
                    <div className="space-y-3">
                      {intelligence.industryImpact.opportunities.map((opp, idx) => (
                        <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-white">{opp.opportunity}</h4>
                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                              {opp.probability}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">Potential Gain: {opp.potentialGain}</p>
                          <p className="text-xs text-blue-400">Action: {opp.actionRequired}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profit Predictions */}
            {intelligence.profitPrediction && (
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>💰</span>
                  Revenue & Profit Predictions (With Economic Adjustments)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 px-3 text-slate-400">Year</th>
                        <th className="text-right py-2 px-3 text-slate-400">Baseline Forecast</th>
                        <th className="text-right py-2 px-3 text-slate-400">Adjusted Forecast</th>
                        <th className="text-right py-2 px-3 text-slate-400">Economic Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['year1', 'year2', 'year3'].map((year, idx) => {
                        const yearKey = year as 'year1' | 'year2' | 'year3';
                        const baseline = intelligence.profitPrediction?.baselineForecast?.[yearKey];
                        const adjusted = intelligence.profitPrediction?.adjustedForecast?.[yearKey];
                        
                        return (
                          <tr key={year} className="border-b border-slate-800">
                            <td className="py-3 px-3 text-white font-medium">Year {idx + 1}</td>
                            <td className="text-right py-3 px-3 text-slate-300">
                              {baseline?.revenue || 'N/A'}
                            </td>
                            <td className="text-right py-3 px-3 text-emerald-400 font-semibold">
                              {adjusted?.revenue || 'N/A'}
                            </td>
                            <td className="text-right py-3 px-3 text-slate-400 text-xs">
                              {adjusted?.adjustment || 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Sensitivity Analysis */}
                {intelligence.profitPrediction.sensitivities && intelligence.profitPrediction.sensitivities.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-white mb-3">Sensitivity Analysis - Key Variables</h4>
                    <div className="space-y-2">
                      {intelligence.profitPrediction.sensitivities.map((sens, idx) => (
                        <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                          <div className="font-medium text-white mb-2">{sens.variable}</div>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <div className="text-red-400">Pessimistic</div>
                              <div className="text-white">{sens.pessimistic}</div>
                            </div>
                            <div>
                              <div className="text-yellow-400">Base Case</div>
                              <div className="text-white">{sens.baseCase}</div>
                            </div>
                            <div>
                              <div className="text-emerald-400">Optimistic</div>
                              <div className="text-white">{sens.optimistic}</div>
                            </div>
                          </div>
                          <div className="text-xs text-slate-400 mt-2">
                            Revenue Impact: {sens.revenueImpact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Regenerate Button */}
            <div className="text-center pt-6">
              <button
                onClick={runEconomicAnalysis}
                disabled={isLoading}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Regenerating Analysis...
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    Regenerate Economic Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

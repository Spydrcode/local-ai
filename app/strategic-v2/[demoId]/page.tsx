/**
 * Strategic Dashboard - Porter Intelligence Stack
 * 
 * Comprehensive strategic intelligence platform powered by 9 specialized AI agents
 * with real-time synthesis and actionable recommendations
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ActionItem, AgentResult, OrchestratorResult, StrategySynthesis } from '../../../lib/agents/orchestrator';

export default function StrategicDashboard() {
  const params = useParams();
  const router = useRouter();
  const demoId = params?.demoId as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OrchestratorResult | null>(null);
  const [activeAgent, setActiveAgent] = useState<string>('synthesis');
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());

  // All agent names
  const allAgents = [
    'strategy-architect',
    'value-chain',
    'market-forces',
    'differentiation-designer',
    'profit-pool',
    'operational-effectiveness-optimizer',
    'local-strategy',
    'executive-advisor',
    'shared-value'
  ];

  // Load existing analysis or trigger new run
  useEffect(() => {
    async function loadOrRunAnalysis() {
      if (!demoId) return;

      try {
        // Try to load existing Porter analysis from demo
        const res = await fetch(`/api/analyze-site-data/${demoId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.porter_analysis) {
            setResult(JSON.parse(data.porter_analysis));
            return;
          }
        }

        // No existing analysis - user needs to click "Run Analysis"
        setLoading(false);
      } catch (err) {
        console.error('Error loading analysis:', err);
      }
    }

    loadOrRunAnalysis();
  }, [demoId]);

  const runPorterAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/porter-intelligence-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const runSingleAgent = async (agentName: string) => {
    setRunningAgents(prev => new Set(prev).add(agentName));
    setError(null);

    try {
      const res = await fetch('/api/porter-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoId, agentName })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Agent execution failed');
      }

      // Update result with new agent data
      setResult(prev => {
        if (!prev) {
          // First agent result
          return {
            demoId,
            agents: [data.result],
            synthesis: { 
              strategicPriorities: [],
              quickWins: [],
              strategicInitiatives: [],
              competitivePosition: '',
              keyInsights: [],
              nextSteps: [],
              estimatedImpact: { revenue: '', margin: '', timeline: '' }
            },
            executionTime: data.result.executionTime || 0,
            timestamp: new Date().toISOString(),
          };
        }

        // Update existing agent or add new one
        const agentIndex = prev.agents.findIndex(a => a.agentName === agentName);
        const updatedAgents = [...prev.agents];
        
        if (agentIndex >= 0) {
          updatedAgents[agentIndex] = data.result;
        } else {
          updatedAgents.push(data.result);
        }

        return {
          ...prev,
          agents: updatedAgents,
          timestamp: new Date().toISOString(),
        };
      });

      // Switch to the agent that just completed
      setActiveAgent(agentName);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRunningAgents(prev => {
        const next = new Set(prev);
        next.delete(agentName);
        return next;
      });
    }
  };

  if (!demoId) {
    return <div className="p-8 text-slate-400">Invalid demo ID</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push(`/analysis/${demoId}`)}
                className="text-slate-400 hover:text-emerald-400 mb-2 flex items-center gap-2"
              >
                ← Back to Analysis
              </button>
              <h1 className="text-3xl font-bold text-emerald-400">Porter Intelligence Stack</h1>
              <p className="text-slate-400 mt-2">Comprehensive Strategic Intelligence Platform</p>
            </div>
            
            {!result && (
              <button
                onClick={runPorterAnalysis}
                disabled={loading}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Running Analysis...' : 'Run Porter Analysis'}
              </button>
            )}
            
            {result && (
              <button
                onClick={runPorterAnalysis}
                disabled={loading}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Re-running...' : '🔄 Refresh Analysis'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="container mx-auto px-6 py-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="container mx-auto px-6 py-12">
          <div className="bg-slate-900 rounded-xl p-12 border border-slate-800 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-emerald-400 mb-2">Running 9 Specialized Agents...</h3>
            <p className="text-slate-400">
              Executing Strategy Architect, Value Chain Analyst, Market Forces Monitor, 
              Differentiation Designer, Profit Pool Mapper, Operational Effectiveness Optimizer, Local Strategy Agent, 
              Executive Advisor, and Shared Value Innovator
            </p>
            <p className="text-slate-500 mt-4 text-sm">This may take 30-60 seconds</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !result && !error && (
        <div className="container mx-auto px-6 py-12">
          <div className="bg-slate-900 rounded-xl p-12 border border-slate-800">
            <div className="text-center mb-8">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-2xl font-bold text-emerald-400 mb-4">Porter Intelligence Stack</h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                Run all 9 agents together for comprehensive analysis, or execute individual agents on-demand
              </p>
              
              <div className="flex gap-4 justify-center mb-8">
                <button
                  onClick={runPorterAnalysis}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors text-lg"
                >
                  🚀 Run All Agents (Full Analysis)
                </button>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-8">
              <h4 className="text-lg font-semibold text-slate-300 mb-4 text-center">Or Run Individual Agents</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {allAgents.map((agentName) => {
                  const isRunning = runningAgents.has(agentName);
                  const agentData = getAgentMetadata(agentName);
                  
                  return (
                    <div key={agentName} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-2xl">{agentData.icon}</div>
                        <button
                          onClick={() => runSingleAgent(agentName)}
                          disabled={isRunning}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            isRunning
                              ? 'bg-amber-500/20 text-amber-400 cursor-wait'
                              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          }`}
                        >
                          {isRunning ? '⏳ Running...' : '▶️ Run'}
                        </button>
                      </div>
                      <h4 className={`font-semibold ${agentData.color} mb-1`}>{agentData.title}</h4>
                      <p className="text-sm text-slate-400">{agentData.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Dashboard */}
      {result && !loading && (
        <div className="container mx-auto px-6 py-8">
          {/* Execution Summary */}
          <div className="mb-8 bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-emerald-400">Analysis Complete</h2>
              <span className="text-slate-400 text-sm">
                Executed in {(result.executionTime / 1000).toFixed(2)}s | {new Date(result.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-400">{result.agents.filter(a => a.status === 'success').length}</div>
                <div className="text-sm text-slate-400">Agents Successful</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-400">{result.agents.filter(a => a.status === 'error').length}</div>
                <div className="text-sm text-slate-400">Agents Failed</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">{result.synthesis.quickWins.length}</div>
                <div className="text-sm text-slate-400">Quick Wins Identified</div>
              </div>
            </div>
          </div>

          {/* Agent Navigation Tabs with Run Buttons */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-300">Individual Agents</h3>
              <div className="text-sm text-slate-400">
                Click agent tabs to view results, or use "Run" buttons to execute individually
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap mb-4">
              <button
                onClick={() => setActiveAgent('synthesis')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeAgent === 'synthesis'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                📋 Strategic Synthesis
              </button>
              
              {allAgents.map((agentName) => {
                const agentResult = result.agents.find(a => a.agentName === agentName);
                const isRunning = runningAgents.has(agentName);
                const hasRun = !!agentResult;
                
                return (
                  <div key={agentName} className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveAgent(agentName)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeAgent === agentName
                          ? 'bg-blue-500 text-white'
                          : hasRun
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      {getAgentIcon(agentName)} {formatAgentName(agentName)}
                      {hasRun && agentResult.status === 'success' && ' ✓'}
                      {hasRun && agentResult.status === 'error' && ' ⚠️'}
                    </button>
                    
                    <button
                      onClick={() => runSingleAgent(agentName)}
                      disabled={isRunning}
                      className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isRunning
                          ? 'bg-amber-500/20 text-amber-400 cursor-wait'
                          : hasRun
                          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                      }`}
                      title={hasRun ? 'Re-run agent' : 'Run agent'}
                    >
                      {isRunning ? '⏳' : hasRun ? '🔄' : '▶️'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent Navigation Tabs */}
          <div className="mb-6 hidden">
            <button
              onClick={() => setActiveAgent('synthesis')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeAgent === 'synthesis'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              📋 Strategic Synthesis
            </button>
            {result.agents.map((agent) => (
              <button
                key={agent.agentName}
                onClick={() => setActiveAgent(agent.agentName)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeAgent === agent.agentName
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {getAgentIcon(agent.agentName)} {formatAgentName(agent.agentName)}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-slate-900 rounded-xl p-8 border border-slate-800">
            {activeAgent === 'synthesis' && <SynthesisView synthesis={result.synthesis} />}
            {activeAgent !== 'synthesis' && (
              <AgentView agent={result.agents.find(a => a.agentName === activeAgent)!} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Synthesis View Component
function SynthesisView({ synthesis }: { synthesis: StrategySynthesis }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-emerald-400 mb-4">Strategic Synthesis</h2>
        <p className="text-slate-300">Consolidated insights from all 9 Porter Intelligence agents</p>
      </div>

      {/* Strategic Priorities */}
      <div>
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">🎯 Top Strategic Priorities</h3>
        <div className="space-y-2">
          {synthesis.strategicPriorities.map((priority, idx) => (
            <div key={idx} className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl font-bold text-emerald-400">{idx + 1}</span>
                <p className="text-slate-200 flex-1">{priority}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Wins */}
      <div>
        <h3 className="text-xl font-semibold text-blue-400 mb-4">⚡ Quick Wins (High Impact, Low Effort)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {synthesis.quickWins.map((item, idx) => (
            <ActionItemCard key={idx} item={item} />
          ))}
        </div>
      </div>

      {/* Strategic Initiatives */}
      <div>
        <h3 className="text-xl font-semibold text-purple-400 mb-4">🚀 Strategic Initiatives</h3>
        <div className="space-y-4">
          {synthesis.strategicInitiatives.map((item, idx) => (
            <ActionItemCard key={idx} item={item} expanded />
          ))}
        </div>
      </div>

      {/* Competitive Position */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-amber-400 mb-3">🏆 Competitive Position</h3>
        <p className="text-slate-300 leading-relaxed">{synthesis.competitivePosition}</p>
      </div>

      {/* Key Insights */}
      <div>
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">💡 Key Insights</h3>
        <ul className="space-y-2">
          {synthesis.keyInsights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-3 text-slate-300">
              <span className="text-emerald-400 mt-1">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Estimated Impact */}
      <div className="bg-linear-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">📊 Estimated Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-slate-400 mb-1">Revenue Growth</div>
            <div className="text-2xl font-bold text-emerald-400">{synthesis.estimatedImpact.revenue}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Margin Improvement</div>
            <div className="text-2xl font-bold text-blue-400">{synthesis.estimatedImpact.margin}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Implementation Timeline</div>
            <div className="text-2xl font-bold text-purple-400">{synthesis.estimatedImpact.timeline}</div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div>
        <h3 className="text-xl font-semibold text-blue-400 mb-4">✅ Next Steps</h3>
        <ol className="space-y-3">
          {synthesis.nextSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-semibold shrink-0">
                {idx + 1}
              </span>
              <span className="text-slate-300 pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// Agent View Component
function AgentView({ agent }: { agent: AgentResult }) {
  if (agent.status === 'error') {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-red-400 mb-2">Agent Failed</h3>
        <p className="text-slate-300">{agent.error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  if (agent.status === 'skipped') {
    return (
      <div className="bg-slate-800/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-slate-400 mb-2">Agent Skipped</h3>
        <p className="text-slate-400">This agent was not executed in this analysis run.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-emerald-400">
          {getAgentIcon(agent.agentName)} {formatAgentName(agent.agentName)}
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-400">
            Executed in {agent.executionTime?.toFixed(0)}ms
          </span>
          {agent.confidence && (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
              {(agent.confidence * 100).toFixed(0)}% confidence
            </span>
          )}
        </div>
      </div>

      {/* Render agent-specific UI based on agent name */}
      {renderAgentSpecificView(agent)}
    </div>
  );
}

// Render agent-specific beautiful UI
function renderAgentSpecificView(agent: AgentResult) {
  const data = agent.data;
  
  switch (agent.agentName) {
    case 'market-forces':
      return <MarketForcesView data={data} />;
    case 'strategy-architect':
      return <StrategyArchitectView data={data} />;
    case 'value-chain':
      return <ValueChainView data={data} />;
    case 'differentiation-designer':
      return <DifferentiationView data={data} />;
    case 'profit-pool':
      return <ProfitPoolView data={data} />;
    case 'operational-effectiveness-optimizer':
      return <OperationsView data={data} />;
    case 'local-strategy':
      return <LocalStrategyView data={data} />;
    case 'executive-advisor':
      return <ExecutiveAdvisorView data={data} />;
    case 'shared-value':
      return <SharedValueView data={data} />;
    default:
      // Fallback to JSON view for unknown agents
      return (
        <div className="bg-slate-800/50 rounded-lg p-6">
          <pre className="text-slate-300 whitespace-pre-wrap font-mono text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
  }
}

// Market Forces Monitor View
function MarketForcesView({ data }: { data: any }) {
  const threatColors = {
    high: 'bg-red-500/20 border-red-500/40 text-red-400',
    medium: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    low: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
  };

  return (
    <div className="space-y-6">
      {/* Competitors Analysis */}
      <div>
        <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
          🏢 Competitive Landscape
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.competitors?.map((comp: any, idx: number) => (
            <div key={idx} className={`rounded-lg border p-5 ${threatColors[comp.threatLevel as keyof typeof threatColors]}`}>
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-lg">{comp.name}</h4>
                <span className="px-2 py-1 rounded text-xs font-medium bg-black/20">
                  {comp.threatLevel?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              <p className="text-sm opacity-90">{comp.recentMoves}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Trends */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
          📊 Market Dynamics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Demand Trend</div>
            <div className={`text-2xl font-bold capitalize ${
              data.marketTrends?.demand === 'growing' ? 'text-emerald-400' :
              data.marketTrends?.demand === 'declining' ? 'text-red-400' : 'text-slate-300'
            }`}>
              {data.marketTrends?.demand || 'Unknown'}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Price Pressure</div>
            <div className={`text-2xl font-bold capitalize ${
              data.marketTrends?.pricePressure === 'high' ? 'text-red-400' :
              data.marketTrends?.pricePressure === 'medium' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {data.marketTrends?.pricePressure || 'Unknown'}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">New Entrant Risk</div>
            <div className={`text-2xl font-bold capitalize ${
              data.newEntrantRisk === 'high' ? 'text-red-400' :
              data.newEntrantRisk === 'medium' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {data.newEntrantRisk || 'Unknown'}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Key Trend Drivers</h4>
          <div className="flex flex-wrap gap-2">
            {data.marketTrends?.trendDrivers?.map((driver: string, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                {driver}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
          💡 Recommended Actions
        </h3>
        <ul className="space-y-2">
          {data.recommendedActions?.map((action: string, idx: number) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">✓</span>
              <span className="text-slate-200">{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Strategy Architect View (Five Forces)
function StrategyArchitectView({ data }: { data: any }) {
  const threatColors = {
    high: 'bg-red-500/20 border-red-500/40',
    medium: 'bg-amber-500/20 border-amber-500/40',
    low: 'bg-emerald-500/20 border-emerald-500/40'
  };

  const forces = [
    { key: 'threatOfNewEntrants', icon: '🚪', label: 'New Entrants' },
    { key: 'bargainingPowerSuppliers', icon: '🏭', label: 'Supplier Power' },
    { key: 'bargainingPowerBuyers', icon: '🛍️', label: 'Buyer Power' },
    { key: 'threatOfSubstitutes', icon: '🔄', label: 'Substitutes' },
    { key: 'competitiveRivalry', icon: '⚔️', label: 'Rivalry' }
  ];

  return (
    <div className="space-y-6">
      {/* Five Forces Analysis */}
      <div>
        <h3 className="text-xl font-semibold text-blue-400 mb-4">⚡ Five Forces Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forces.map(force => {
            const forceData = data.fiveForces?.[force.key];
            const level = forceData?.level || 'medium';
            return (
              <div key={force.key} className={`rounded-lg border-2 p-5 ${threatColors[level as keyof typeof threatColors]}`}>
                <div className="text-3xl mb-2">{force.icon}</div>
                <h4 className="font-semibold text-lg mb-2 text-slate-200">{force.label}</h4>
                <div className="mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    level === 'high' ? 'bg-red-500 text-white' :
                    level === 'medium' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {level} Threat
                  </span>
                </div>
                <p className="text-sm text-slate-300">{forceData?.rationale || 'No analysis available'}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Strategy */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">🎯 Recommended Generic Strategy</h3>
        <div className="mb-4">
          <span className="px-4 py-2 bg-purple-500 text-white rounded-lg text-lg font-bold capitalize inline-block">
            {data.recommendedStrategy?.replace('_', ' ') || 'Not determined'}
          </span>
        </div>
        <p className="text-slate-200 mb-4">{data.strategyRationale}</p>
        
        {data.tradeoffs && data.tradeoffs.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-300 mb-2">Strategic Trade-offs:</h4>
            <ul className="space-y-1">
              {data.tradeoffs.map((tradeoff: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="text-purple-400">→</span>
                  <span>{tradeoff}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Strategic Priorities */}
      <div>
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">🎯 Top Strategic Priorities</h3>
        <div className="space-y-3">
          {data.strategicPriorities?.map((priority: string, idx: number) => (
            <div key={idx} className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-4">
              <span className="text-2xl font-bold text-emerald-400">{idx + 1}</span>
              <span className="text-slate-200 pt-1">{priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Value Chain View
function ValueChainView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Primary Activities */}
      <div>
        <h3 className="text-xl font-semibold text-blue-400 mb-4">🔗 Primary Activities</h3>
        <div className="space-y-3">
          {Object.entries(data.primaryActivities || {}).map(([key, value]: [string, any]) => (
            <div key={key} className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
              <h4 className="font-semibold text-lg text-slate-200 mb-3 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-slate-400 mb-1">Current State</div>
                  <div className="text-slate-200">{value.current || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">Cost Driver</div>
                  <div className="text-amber-400">{value.costDriver || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">Opportunity</div>
                  <div className="text-emerald-400">{value.opportunity || 'Not specified'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Activities */}
      <div>
        <h3 className="text-xl font-semibold text-purple-400 mb-4">⚙️ Support Activities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data.supportActivities || {}).map(([key, value]: [string, any]) => (
            <div key={key} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-purple-300 mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-400">Current: </span>
                  <span className="text-slate-200">{value.current || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Improvement: </span>
                  <span className="text-emerald-400">{value.improvement || 'Not specified'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Advantages & Quick Wins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-emerald-400 mb-3">💪 Competitive Advantages</h3>
          <ul className="space-y-2">
            {data.competitiveAdvantages?.map((adv: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-slate-200">
                <span className="text-emerald-400">✓</span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">⚡ Quick Wins</h3>
          <ul className="space-y-2">
            {data.quickWins?.map((win: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-slate-200">
                <span className="text-blue-400">→</span>
                <span>{win}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Differentiation Designer View
function DifferentiationView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Value Proposition */}
      <div className="bg-linear-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/40 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-purple-400 mb-3">💎 Unique Value Proposition</h3>
        <p className="text-xl text-slate-100 font-medium">{data.valueProposition}</p>
      </div>

      {/* Positioning Statement */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-blue-400 mb-3">🎯 Positioning Statement</h3>
        <p className="text-lg text-slate-200">{data.positioningStatement}</p>
      </div>

      {/* Messaging Framework */}
      <div>
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">💬 Messaging Framework</h3>
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5">
            <h4 className="font-semibold text-emerald-300 mb-2">Primary Message</h4>
            <p className="text-slate-200">{data.messagingFramework?.primary}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className="font-semibold text-slate-300 mb-2">Secondary Messages</h4>
              <ul className="space-y-1">
                {data.messagingFramework?.secondary?.map((msg: string, idx: number) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className="font-semibold text-slate-300 mb-2">Proof Points</h4>
              <ul className="space-y-1">
                {data.messagingFramework?.proofPoints?.map((point: string, idx: number) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Features */}
      <div>
        <h3 className="text-xl font-semibold text-amber-400 mb-4">⭐ Premium Feature Opportunities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.premiumFeatures?.map((feature: any, idx: number) => (
            <div key={idx} className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-5">
              <h4 className="font-semibold text-amber-300 mb-2">{feature.feature}</h4>
              <p className="text-sm text-slate-300 mb-3">{feature.justification}</p>
              <div className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded inline-block">
                Impact: {feature.priceImpact}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Personality */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-5">
        <h3 className="text-lg font-semibold text-purple-400 mb-3">✨ Brand Personality</h3>
        <div className="flex flex-wrap gap-2">
          {data.brandPersonality?.map((trait: string, idx: number) => (
            <span key={idx} className="px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-medium">
              {trait}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Profit Pool View
function ProfitPoolView({ data }: { data: any }) {
  const marginColors = {
    high: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    medium: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    low: 'bg-slate-500/20 border-slate-500/40 text-slate-400'
  };

  return (
    <div className="space-y-6">
      {/* Current Product Mix */}
      <div>
        <h3 className="text-xl font-semibold text-blue-400 mb-4">📊 Current Product/Service Mix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.currentMix?.map((item: any, idx: number) => (
            <div key={idx} className={`rounded-lg border p-5 ${marginColors[item.margin as keyof typeof marginColors]}`}>
              <h4 className="font-semibold text-lg mb-2">{item.offering}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-80">Margin:</span>
                  <span className="font-semibold capitalize">{item.margin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Volume:</span>
                  <span className="font-semibold capitalize">{item.volume}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High-Margin Opportunities */}
      <div>
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">💰 High-Margin Opportunities</h3>
        <div className="space-y-3">
          {data.highMarginOpportunities?.map((opp: any, idx: number) => (
            <div key={idx} className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-lg text-emerald-300">{opp.segment}</h4>
                <span className="px-3 py-1 bg-emerald-500 text-white rounded text-sm font-medium">
                  {opp.estimatedMargin}
                </span>
              </div>
              <p className="text-slate-200">{opp.rationale}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Product Mix Recommendations */}
      <div>
        <h3 className="text-xl font-semibold text-purple-400 mb-4">🎯 Product Mix Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['grow', 'maintain', 'shrink', 'add'].map(action => (
            <div key={action} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className={`font-semibold mb-2 capitalize ${
                action === 'grow' ? 'text-emerald-400' :
                action === 'add' ? 'text-blue-400' :
                action === 'maintain' ? 'text-slate-300' : 'text-red-400'
              }`}>
                {action === 'grow' ? '📈' : action === 'add' ? '➕' : action === 'maintain' ? '➡️' : '📉'} {action}
              </h4>
              <ul className="space-y-1">
                {data.productMixRecommendations?.[action]?.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-slate-300">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Strategy & Revenue Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">💵 Pricing Strategy</h3>
          <p className="text-slate-200">{data.pricingStrategy}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-emerald-400 mb-3">📈 Revenue Impact</h3>
          <p className="text-xl font-bold text-emerald-300">{data.revenueImpact}</p>
        </div>
      </div>
    </div>
  );
}

// Operations View
function OperationsView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Benchmark Analysis */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">📊 Operational Benchmark</h3>
        <div className="mb-4">
          <span className={`px-4 py-2 rounded-lg text-lg font-bold ${
            data.benchmarkAnalysis?.currentState?.includes('above') ? 'bg-emerald-500 text-white' :
            data.benchmarkAnalysis?.currentState?.includes('below') ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {data.benchmarkAnalysis?.currentState || 'Not assessed'}
          </span>
        </div>
        {data.benchmarkAnalysis?.gaps && data.benchmarkAnalysis.gaps.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-300 mb-2">Key Gaps:</h4>
            <ul className="space-y-1">
              {data.benchmarkAnalysis.gaps.map((gap: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-slate-200">
                  <span className="text-amber-400">⚠</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Technology Stack */}
      <div>
        <h3 className="text-xl font-semibold text-purple-400 mb-4">💻 Technology Recommendations</h3>
        <div className="space-y-3">
          {data.technologyStack?.recommended?.map((tech: any, idx: number) => (
            <div key={idx} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-5">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-lg text-purple-300">{tech.tool}</h4>
                <span className="px-3 py-1 bg-purple-500/30 text-purple-300 rounded text-sm">
                  ROI: {tech.estimatedROI}
                </span>
              </div>
              <p className="text-slate-200">{tech.purpose}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Inefficiencies */}
      <div>
        <h3 className="text-xl font-semibold text-red-400 mb-4">🚨 Process Inefficiencies</h3>
        <div className="space-y-3">
          {data.inefficiencies?.map((item: any, idx: number) => (
            <div key={idx} className={`rounded-lg border p-5 ${
              item.impact === 'high' ? 'bg-red-500/10 border-red-500/30' :
              item.impact === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
              'bg-slate-500/10 border-slate-500/30'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-lg text-slate-200">{item.process}</h4>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                  item.impact === 'high' ? 'bg-red-500 text-white' :
                  item.impact === 'medium' ? 'bg-amber-500 text-white' :
                  'bg-slate-500 text-white'
                }`}>
                  {item.impact} Impact
                </span>
              </div>
              <p className="text-emerald-400">💡 {item.solution}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Automation Opportunities */}
      <div>
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">🤖 Automation Opportunities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.automationOpportunities?.map((auto: any, idx: number) => (
            <div key={idx} className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5">
              <h4 className="font-semibold text-emerald-300 mb-2">{auto.task}</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-slate-400">Tool:</span> <span className="text-slate-200">{auto.tool}</span></div>
                <div><span className="text-slate-400">Time Savings:</span> <span className="text-emerald-400">{auto.timeSavings}</span></div>
                <div><span className="text-slate-400">Cost Savings:</span> <span className="text-emerald-400">{auto.costSavings}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Local Strategy View
function LocalStrategyView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Market Characteristics */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">🌍 Local Market Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Population</div>
            <div className="text-2xl font-bold text-slate-200">{data.marketCharacteristics?.population || 'Unknown'}</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Competition Density</div>
            <div className={`text-2xl font-bold capitalize ${
              data.marketCharacteristics?.competitionDensity === 'high' ? 'text-red-400' :
              data.marketCharacteristics?.competitionDensity === 'medium' ? 'text-amber-400' :
              'text-emerald-400'
            }`}>
              {data.marketCharacteristics?.competitionDensity || 'Unknown'}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Opportunity Areas</div>
            <div className="text-lg font-bold text-emerald-400">
              {data.marketCharacteristics?.opportunityAreas?.length || 0}
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Opportunity Areas:</h4>
          <div className="flex flex-wrap gap-2">
            {data.marketCharacteristics?.opportunityAreas?.map((area: string, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Local SEO */}
      <div>
        <h3 className="text-xl font-semibold text-purple-400 mb-4">🔍 Local SEO Strategy</h3>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-300">Current Optimization:</span>
            <span className={`px-3 py-1 rounded font-semibold ${
              data.localSEO?.currentOptimization === 'strong' ? 'bg-emerald-500 text-white' :
              data.localSEO?.currentOptimization === 'moderate' ? 'bg-amber-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {data.localSEO?.currentOptimization || 'Unknown'}
            </span>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold text-purple-300 mb-2">Recommended Tactics:</h4>
            <ul className="space-y-2">
              {data.localSEO?.tactics?.map((tactic: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-slate-200">
                  <span className="text-purple-400">→</span>
                  <span>{tactic}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">Target Keywords:</h4>
            <div className="flex flex-wrap gap-2">
              {data.localSEO?.keywords?.map((keyword: string, idx: number) => (
                <span key={idx} className="px-2 py-1 bg-purple-500/30 text-purple-200 rounded text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Community Engagement */}
      <div>
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">🤝 Community Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.communityEngagement?.map((opp: any, idx: number) => (
            <div key={idx} className={`rounded-lg border p-5 ${
              opp.impact === 'high' ? 'bg-emerald-500/10 border-emerald-500/30' :
              opp.impact === 'medium' ? 'bg-blue-500/10 border-blue-500/30' :
              'bg-slate-500/10 border-slate-500/30'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-slate-200">{opp.opportunity}</h4>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  opp.impact === 'high' ? 'bg-emerald-500 text-white' :
                  opp.impact === 'medium' ? 'bg-blue-500 text-white' :
                  'bg-slate-500 text-white'
                }`}>
                  {opp.impact} Impact
                </span>
              </div>
              <p className="text-sm text-slate-300">Cost: {opp.cost}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Partnerships */}
      <div>
        <h3 className="text-xl font-semibold text-blue-400 mb-4">🤜🤛 Strategic Partnerships</h3>
        <div className="space-y-3">
          {data.partnerships?.map((partner: any, idx: number) => (
            <div key={idx} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5">
              <h4 className="font-semibold text-lg text-blue-300 mb-2">{partner.partner}</h4>
              <p className="text-slate-200 mb-3">{partner.benefit}</p>
              <div className="text-sm">
                <span className="text-slate-400">Approach: </span>
                <span className="text-emerald-400">{partner.approachStrategy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expansion Opportunities */}
      {data.expansionOpportunities && data.expansionOpportunities.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-amber-400 mb-3">🚀 Geographic Expansion</h3>
          <ul className="space-y-2">
            {data.expansionOpportunities.map((opp: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-slate-200">
                <span className="text-amber-400">→</span>
                <span>{opp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Executive Advisor View
function ExecutiveAdvisorView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Key Decisions */}
      <div>
        <h3 className="text-xl font-semibold text-purple-400 mb-4">🎯 Strategic Decisions</h3>
        <div className="space-y-4">
          {data.keyDecisions?.map((decision: any, idx: number) => (
            <div key={idx} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-5">
              <h4 className="font-semibold text-lg text-purple-300 mb-3">{decision.decision}</h4>
              <div className="mb-3">
                <div className="text-sm text-slate-400 mb-2">Options:</div>
                <div className="flex flex-wrap gap-2">
                  {decision.options?.map((option: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-slate-700 text-slate-200 rounded text-sm">
                      {option}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-purple-500/20 rounded p-3">
                <div className="text-sm text-purple-300 font-semibold mb-1">Recommendation:</div>
                <div className="text-slate-200">{decision.recommendation}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trade-offs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data.tradeoffs || {}).map(([key, value]: [string, any]) => (
          <div key={key} className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
            <h4 className="font-semibold text-lg text-blue-400 mb-3 capitalize">{key} Focus</h4>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-emerald-400 font-semibold mb-1">Gains:</div>
                <ul className="space-y-1">
                  {value.gains?.map((gain: string, idx: number) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400">+</span>
                      <span>{gain}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-sm text-red-400 font-semibold mb-1">Sacrifices:</div>
                <ul className="space-y-1">
                  {value.sacrifices?.map((sacrifice: string, idx: number) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-red-400">-</span>
                      <span>{sacrifice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Assessment */}
      <div>
        <h3 className="text-xl font-semibold text-red-400 mb-4">⚠️ Risk Assessment</h3>
        <div className="space-y-3">
          {data.riskAssessment?.map((risk: any, idx: number) => (
            <div key={idx} className={`rounded-lg border p-5 ${
              risk.impact === 'high' && risk.probability === 'high' ? 'bg-red-500/10 border-red-500/30' :
              risk.impact === 'high' || risk.probability === 'high' ? 'bg-amber-500/10 border-amber-500/30' :
              'bg-slate-500/10 border-slate-500/30'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-lg text-slate-200">{risk.risk}</h4>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    risk.probability === 'high' ? 'bg-red-500 text-white' :
                    risk.probability === 'medium' ? 'bg-amber-500 text-white' :
                    'bg-emerald-500 text-white'
                  }`}>
                    P: {risk.probability}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    risk.impact === 'high' ? 'bg-red-500 text-white' :
                    risk.impact === 'medium' ? 'bg-amber-500 text-white' :
                    'bg-emerald-500 text-white'
                  }`}>
                    I: {risk.impact}
                  </span>
                </div>
              </div>
              <div className="bg-black/20 rounded p-3">
                <div className="text-sm text-emerald-400 font-semibold mb-1">Mitigation:</div>
                <div className="text-slate-200">{risk.mitigation}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Plan */}
      <div>
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">📅 30/60/90 Day Action Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['30days', '60days', '90days'].map((period, periodIdx) => (
            <div key={period} className={`rounded-lg p-5 ${
              periodIdx === 0 ? 'bg-emerald-500/10 border border-emerald-500/30' :
              periodIdx === 1 ? 'bg-blue-500/10 border border-blue-500/30' :
              'bg-purple-500/10 border border-purple-500/30'
            }`}>
              <h4 className={`font-semibold mb-3 ${
                periodIdx === 0 ? 'text-emerald-400' :
                periodIdx === 1 ? 'text-blue-400' : 'text-purple-400'
              }`}>
                {period === '30days' ? '🎯 First 30 Days' :
                 period === '60days' ? '📈 30-60 Days' : '🚀 60-90 Days'}
              </h4>
              <ul className="space-y-2">
                {data.actionPlan?.[period]?.map((action: string, idx: number) => (
                  <li key={idx} className="text-sm text-slate-200 flex items-start gap-2">
                    <span className={periodIdx === 0 ? 'text-emerald-400' : periodIdx === 1 ? 'text-blue-400' : 'text-purple-400'}>
                      {idx + 1}.
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Coaching Questions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">💭 Coaching Questions</h3>
        <p className="text-sm text-slate-400 mb-3">Thought-provoking questions to guide strategic thinking:</p>
        <ul className="space-y-3">
          {data.coachingQuestions?.map((question: string, idx: number) => (
            <li key={idx} className="flex items-start gap-3 text-slate-200">
              <span className="text-blue-400 font-bold">{idx + 1}.</span>
              <span className="italic">{question}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Shared Value View
function SharedValueView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Community Needs */}
      <div>
        <h3 className="text-xl font-semibold text-blue-400 mb-4">🤝 Community Alignment</h3>
        <div className="space-y-3">
          {data.communityNeeds?.map((need: any, idx: number) => (
            <div key={idx} className={`rounded-lg border p-5 ${
              need.alignmentScore === 'high' ? 'bg-emerald-500/10 border-emerald-500/30' :
              need.alignmentScore === 'medium' ? 'bg-blue-500/10 border-blue-500/30' :
              'bg-slate-500/10 border-slate-500/30'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-lg text-slate-200">{need.need}</h4>
                <span className={`px-3 py-1 rounded font-semibold ${
                  need.alignmentScore === 'high' ? 'bg-emerald-500 text-white' :
                  need.alignmentScore === 'medium' ? 'bg-blue-500 text-white' :
                  'bg-slate-500 text-white'
                }`}>
                  {need.alignmentScore} Fit
                </span>
              </div>
              <p className="text-slate-300">{need.businessCapability}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CSR Initiatives */}
      <div>
        <h3 className="text-xl font-semibold text-purple-400 mb-4">🌟 CSR Initiatives</h3>
        <div className="space-y-3">
          {data.csrInitiatives?.map((initiative: any, idx: number) => (
            <div key={idx} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-5">
              <h4 className="font-semibold text-lg text-purple-300 mb-2">{initiative.initiative}</h4>
              <div className="mb-3">
                <div className="text-sm text-slate-400 mb-1">Competitive Advantage:</div>
                <p className="text-slate-200">{initiative.competitiveAdvantage}</p>
              </div>
              <div className="bg-purple-500/20 rounded p-3">
                <div className="text-sm text-purple-300 font-semibold mb-1">Implementation:</div>
                <p className="text-slate-200 text-sm">{initiative.implementation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sustainability */}
      <div>
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">♻️ Sustainability Opportunities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.sustainabilityOpportunities?.map((opp: any, idx: number) => (
            <div key={idx} className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5">
              <h4 className="font-semibold text-emerald-300 mb-3">{opp.opportunity}</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-400">Environmental Impact: </span>
                  <span className="text-emerald-400">{opp.environmentalImpact}</span>
                </div>
                <div>
                  <span className="text-slate-400">Cost Savings: </span>
                  <span className="text-emerald-400 font-semibold">{opp.costSavings}</span>
                </div>
                <div>
                  <span className="text-slate-400">Timeline: </span>
                  <span className="text-slate-300">{opp.timeline}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Impact Programs */}
      <div>
        <h3 className="text-xl font-semibold text-blue-400 mb-4">❤️ Social Impact Programs</h3>
        <div className="space-y-3">
          {data.socialImpactPrograms?.map((program: any, idx: number) => (
            <div key={idx} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5">
              <h4 className="font-semibold text-lg text-blue-300 mb-2">{program.program}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-400 mb-1">Customer Appeal:</div>
                  <p className="text-slate-200">{program.customerAppeal}</p>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">Brand Benefit:</div>
                  <p className="text-blue-300">{program.brandBenefit}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cause Marketing */}
      <div>
        <h3 className="text-xl font-semibold text-amber-400 mb-4">📢 Cause Marketing Ideas</h3>
        <div className="space-y-3">
          {data.causeMarketing?.map((cause: any, idx: number) => (
            <div key={idx} className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-lg text-amber-300">{cause.cause}</h4>
                <span className="px-3 py-1 bg-amber-500/30 text-amber-200 rounded text-sm">
                  Impact: {cause.expectedImpact}
                </span>
              </div>
              <p className="text-slate-200">{cause.campaign}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Action Item Card Component
function ActionItemCard({ item, expanded = false }: { item: ActionItem; expanded?: boolean }) {
  const impactColors = {
    high: 'text-emerald-400 bg-emerald-500/20',
    medium: 'text-blue-400 bg-blue-500/20',
    low: 'text-slate-400 bg-slate-500/20'
  };

  const effortColors = {
    high: 'text-red-400 bg-red-500/20',
    medium: 'text-amber-400 bg-amber-500/20',
    low: 'text-emerald-400 bg-emerald-500/20'
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-slate-200 flex-1">{item.title}</h4>
        <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300 ml-2">
          {item.category}
        </span>
      </div>
      
      <p className="text-slate-400 text-sm mb-4">{item.description}</p>
      
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-2 py-1 rounded ${impactColors[item.impact]}`}>
          Impact: {item.impact}
        </span>
        <span className={`text-xs px-2 py-1 rounded ${effortColors[item.effort]}`}>
          Effort: {item.effort}
        </span>
        <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">
          {item.timeline}
        </span>
        {item.estimatedROI && (
          <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">
            ROI: {item.estimatedROI}
          </span>
        )}
      </div>
    </div>
  );
}

// Helper functions
function formatAgentName(agentName: string): string {
  const names: Record<string, string> = {
    'strategy-architect': 'Strategy Architect',
    'value-chain': 'Value Chain Analyst',
    'market-forces': 'Market Forces Monitor',
    'differentiation-designer': 'Differentiation Designer',
    'profit-pool': 'Profit Pool Mapper',
    'operational-effectiveness-optimizer': 'Operational Effectiveness Optimizer',
    'local-strategy': 'Local Strategy Agent',
    'executive-advisor': 'Executive Advisor',
    'shared-value': 'Shared Value Innovator'
  };
  return names[agentName] || agentName;
}

function getAgentIcon(agentName: string): string {
  const icons: Record<string, string> = {
    'strategy-architect': '🏰',
    'value-chain': '⚙️',
    'market-forces': '📈',
    'differentiation-designer': '💎',
    'profit-pool': '💰',
    'operational-effectiveness-optimizer': '📊',
    'local-strategy': '🌍',
    'executive-advisor': '🎓',
    'shared-value': '🤝'
  };
  return icons[agentName] || '🤖';
}

function getAgentMetadata(agentName: string) {
  const metadata: Record<string, { icon: string; title: string; description: string; color: string }> = {
    'strategy-architect': {
      icon: '🏰',
      title: 'Strategy Architect',
      description: 'Five Forces analysis and competitive positioning',
      color: 'text-emerald-400'
    },
    'value-chain': {
      icon: '⚙️',
      title: 'Value Chain Analyst',
      description: 'Activity optimization and cost drivers',
      color: 'text-blue-400'
    },
    'market-forces': {
      icon: '📈',
      title: 'Market Forces Monitor',
      description: 'Real-time competitor tracking and trends',
      color: 'text-purple-400'
    },
    'differentiation-designer': {
      icon: '💎',
      title: 'Differentiation Designer',
      description: 'Unique positioning and premium features',
      color: 'text-purple-400'
    },
    'profit-pool': {
      icon: '💰',
      title: 'Profit Pool Mapper',
      description: 'High-margin opportunities and pricing',
      color: 'text-amber-400'
    },
    'operational-effectiveness-optimizer': {
      icon: '📊',
      title: 'Operational Effectiveness Optimizer',
      description: 'Efficiency gains and automation',
      color: 'text-emerald-400'
    },
    'local-strategy': {
      icon: '🌍',
      title: 'Local Strategy Agent',
      description: 'Hyperlocal tactics and partnerships',
      color: 'text-blue-400'
    },
    'executive-advisor': {
      icon: '🎓',
      title: 'Executive Advisor',
      description: 'Decision frameworks and trade-offs',
      color: 'text-purple-400'
    },
    'shared-value': {
      icon: '🤝',
      title: 'Shared Value Innovator',
      description: 'CSR and community opportunities',
      color: 'text-amber-400'
    }
  };
  return metadata[agentName] || {
    icon: '🤖',
    title: agentName,
    description: 'Strategic analysis',
    color: 'text-slate-400'
  };
}

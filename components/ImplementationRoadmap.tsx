'use client';

import { AlertCircle, Calendar, CheckCircle2, ChevronDown, ChevronUp, Clock, DollarSign, Loader2, Target, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface RoadmapItem {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedCost: string;
  expectedOutcome: string;
  dependencies: string[];
  kpis: string[];
}

interface MonthlyRoadmap {
  month: string;
  focus: string;
  items: RoadmapItem[];
  keyMilestones: string[];
}

interface ImplementationRoadmapProps {
  demoId: string;
}

const ImplementationRoadmap: React.FC<ImplementationRoadmapProps> = ({ demoId }) => {
  const [roadmap, setRoadmap] = useState<MonthlyRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/implementation-roadmap/${demoId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch implementation roadmap');
        }

        const data = await response.json();
        setRoadmap(data.roadmap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [demoId]);

  const toggleItem = (monthIndex: number, itemIndex: number) => {
    const key = `${monthIndex}-${itemIndex}`;
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Hard': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Easy': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMonthColor = (index: number) => {
    const colors = [
      'bg-linear-to-r from-blue-500 to-cyan-500',
      'bg-linear-to-r from-purple-500 to-pink-500',
      'bg-linear-to-r from-emerald-500 to-teal-500'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Generating your 90-day implementation roadmap...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`${getMonthColor(0)} text-white rounded-lg p-6`}>
        <div className="flex items-center mb-2">
          <Calendar className="h-6 w-6 mr-2" />
          <h2 className="text-2xl font-bold">90-Day Implementation Roadmap</h2>
        </div>
        <p className="text-white/90">
          A strategic, phased approach to transform insights into measurable results
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {roadmap.map((month, monthIndex) => (
          <div key={monthIndex} className="relative">
            {/* Timeline connector */}
            {monthIndex < roadmap.length - 1 && (
              <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200 -mb-8" />
            )}

            {/* Month Card */}
            <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden">
              {/* Month Header */}
              <div className={`${getMonthColor(monthIndex)} text-white p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-white/20 rounded-full p-3 mr-4">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{month.month}</h3>
                      <p className="text-white/90 mt-1">{month.focus}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/80">Action Items</div>
                    <div className="text-2xl font-bold">{month.items.length}</div>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="p-6 space-y-4">
                {month.items.map((item, itemIndex) => {
                  const itemKey = `${monthIndex}-${itemIndex}`;
                  const isExpanded = expandedItems.has(itemKey);

                  return (
                    <div key={itemIndex} className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                      {/* Item Header - Always Visible */}
                      <div 
                        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleItem(monthIndex, itemIndex)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{item.title}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(item.difficulty)}`}>
                                {item.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                          <button className="ml-4 text-gray-400 hover:text-gray-600">
                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Item Details - Expandable */}
                      {isExpanded && (
                        <div className="p-4 bg-white space-y-4">
                          {/* Cost & Outcome */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start">
                              <DollarSign className="h-5 w-5 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase">Estimated Cost</div>
                                <div className="text-sm text-gray-900 mt-1">{item.estimatedCost}</div>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <TrendingUp className="h-5 w-5 text-blue-600 mr-2 shrink-0 mt-0.5" />
                              <div>
                                <div className="text-xs font-medium text-gray-500 uppercase">Expected Outcome</div>
                                <div className="text-sm text-gray-900 mt-1">{item.expectedOutcome}</div>
                              </div>
                            </div>
                          </div>

                          {/* Dependencies */}
                          <div className="flex items-start">
                            <Clock className="h-5 w-5 text-purple-600 mr-2 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-500 uppercase mb-1">Dependencies</div>
                              <div className="flex flex-wrap gap-2">
                                {item.dependencies.length > 0 && item.dependencies[0] !== 'None' ? (
                                  item.dependencies.map((dep, i) => (
                                    <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200">
                                      {dep}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-500 italic">No dependencies</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* KPIs */}
                          <div className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-500 uppercase mb-2">Key Performance Indicators</div>
                              <ul className="space-y-1">
                                {item.kpis.map((kpi, i) => (
                                  <li key={i} className="text-sm text-gray-700 flex items-center">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
                                    {kpi}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Key Milestones */}
              <div className="bg-gray-50 border-t border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-gray-600" />
                  Key Milestones
                </h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {month.keyMilestones.map((milestone, i) => (
                    <div key={i} className="flex items-start text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                      <span>{milestone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold mb-2">Ready to Execute Your Roadmap?</h3>
        <p className="text-white/90 mb-4">
          We Build Apps can help you implement every phase of this strategic plan
        </p>
        <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Schedule Strategy Session
        </button>
      </div>
    </div>
  );
};

export default ImplementationRoadmap;

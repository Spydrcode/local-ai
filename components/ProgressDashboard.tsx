'use client';

import {
    AlertCircle,
    BarChart3,
    CheckCircle2,
    Clock,
    Loader2,
    Plus,
    Target,
    TrendingUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ActionItem {
  id: string;
  action_title: string;
  action_category: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  priority?: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
}

interface MetricSnapshot {
  id: string;
  snapshot_date: string;
  website_grade?: number;
  monthly_revenue?: number;
  conversion_rate?: number;
  social_engagement_rate?: number;
  email_list_size?: number;
}

interface ProgressStats {
  totalActions: number;
  completedActions: number;
  inProgressActions: number;
  blockedActions: number;
  completionRate: number;
}

interface ProgressDashboardProps {
  demoId: string;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ demoId }) => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [metrics, setMetrics] = useState<MetricSnapshot[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItemForm, setNewItemForm] = useState(false);

  useEffect(() => {
    fetchProgressData();
  }, [demoId]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/progress/${demoId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch progress data');
      }

      const data = await response.json();
      setActionItems(data.actionItems);
      setMetrics(data.metrics);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateActionStatus = async (itemId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/progress/${demoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_action_item',
          id: itemId,
          status: newStatus,
          notes
        })
      });

      if (!response.ok) throw new Error('Failed to update status');

      await fetchProgressData();
      setEditingItem(null);
    } catch (err) {
      alert('Failed to update action item');
    }
  };

  const createActionItem = async (title: string, category: string, priority: string) => {
    try {
      const response = await fetch(`/api/progress/${demoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_action_item',
          actionTitle: title,
          actionCategory: category,
          priority
        })
      });

      if (!response.ok) throw new Error('Failed to create action item');

      await fetchProgressData();
      setNewItemForm(false);
    } catch (err) {
      alert('Failed to create action item');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'blocked': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'blocked': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  const calculateMetricImprovement = (metricName: keyof MetricSnapshot) => {
    if (metrics.length < 2) return null;
    
    const latest = metrics[metrics.length - 1];
    const earliest = metrics[0];
    
    const latestValue = latest[metricName] as number;
    const earliestValue = earliest[metricName] as number;
    
    if (!latestValue || !earliestValue) return null;
    
    const improvement = ((latestValue - earliestValue) / earliestValue) * 100;
    return improvement;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading progress dashboard...</span>
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
      <div className="bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6">
        <div className="flex items-center mb-2">
          <BarChart3 className="h-6 w-6 mr-2" />
          <h2 className="text-2xl font-bold">Progress Tracking Dashboard</h2>
        </div>
        <p className="text-white/90">
          Monitor implementation progress and track business metric improvements over time
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Actions</span>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalActions}</div>
          </div>

          <div className="bg-white border border-emerald-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-emerald-600">Completed</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-600">{stats.completedActions}</div>
          </div>

          <div className="bg-white border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">In Progress</span>
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgressActions}</div>
          </div>

          <div className="bg-white border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-600">Completion Rate</span>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600">{stats.completionRate}%</div>
          </div>
        </div>
      )}

      {/* Metric Improvements */}
      {metrics.length >= 2 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
            Metric Improvements
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {['website_grade', 'conversion_rate', 'monthly_revenue'].map((metric) => {
              const improvement = calculateMetricImprovement(metric as keyof MetricSnapshot);
              if (improvement === null) return null;
              
              return (
                <div key={metric} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">
                    {metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className={`text-2xl font-bold ${improvement >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Items List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-gray-600" />
            Action Items ({actionItems.length})
          </h3>
          <button
            onClick={() => setNewItemForm(!newItemForm)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Action Item
          </button>
        </div>

        {/* New Item Form */}
        {newItemForm && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Create New Action Item</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createActionItem(
                formData.get('title') as string,
                formData.get('category') as string,
                formData.get('priority') as string
              );
            }}>
              <div className="space-y-3">
                <input
                  name="title"
                  placeholder="Action item title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <select
                  name="category"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="roadmap">Roadmap</option>
                  <option value="profit_insight">Profit Insight</option>
                  <option value="competitor">Competitor Analysis</option>
                  <option value="conversion">Conversion Optimization</option>
                  <option value="content">Content Strategy</option>
                  <option value="other">Other</option>
                </select>
                <select
                  name="priority"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItemForm(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Action Items */}
        <div className="space-y-3">
          {actionItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No action items tracked yet. Add your first item to start tracking progress!</p>
            </div>
          ) : (
            actionItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.action_title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{item.action_category}</span>
                        {item.priority && (
                          <span className={`text-xs px-2 py-0.5 rounded border ${
                            item.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                            item.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {item.priority}
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                      )}
                      {item.completed_at && (
                        <p className="text-xs text-emerald-600 mt-2">
                          ✓ Completed {new Date(item.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) => updateActionStatus(item.id, e.target.value)}
                      className={`px-3 py-1 rounded border text-sm font-medium ${getStatusColor(item.status)}`}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold mb-2">Track Your Strategic Progress</h3>
        <p className="text-white/90 mb-4">
          Regular progress tracking ensures you stay on course to achieve your business goals
        </p>
        <button className="bg-white text-emerald-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Schedule Progress Review
        </button>
      </div>
    </div>
  );
};

export default ProgressDashboard;

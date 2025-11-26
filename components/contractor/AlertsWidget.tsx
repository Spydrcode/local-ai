'use client';

import React, { useEffect, useState } from 'react';
import { ContractorAlert, AlertSeverity } from '@/lib/types/contractor-monitoring';

interface AlertsWidgetProps {
  demoId: string;
}

export default function AlertsWidget({ demoId }: AlertsWidgetProps) {
  const [alerts, setAlerts] = useState<ContractorAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'critical'>('new');

  useEffect(() => {
    fetchAlerts();
  }, [demoId, filter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? '' : filter === 'new' ? 'new' : '';
      const severity = filter === 'critical' ? 'critical' : '';
      const query = new URLSearchParams({ demoId, status, severity }).toString();
      const res = await fetch(`/api/contractor/alerts?${query}`);
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (alertId: string, action: 'acknowledge' | 'resolve' | 'dismiss') => {
    try {
      await fetch('/api/contractor/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action }),
      });
      fetchAlerts(); // Refresh
    } catch (error) {
      console.error('Error updating alert:', error);
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Business Alerts</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('new')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'new'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'critical'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Alerts list */}
      <div className="divide-y divide-gray-200">
        {alerts.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-medium">No alerts</p>
            <p className="text-sm mt-1">Your business is running smoothly</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start gap-4">
                {/* Severity badge */}
                <div
                  className={`flex-shrink-0 px-3 py-1 rounded-md border text-sm font-medium ${getSeverityColor(
                    alert.severity
                  )}`}
                >
                  {getSeverityIcon(alert.severity)} {alert.severity.toUpperCase()}
                </div>

                {/* Alert content */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{alert.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{alert.message}</p>

                  {/* Top 2 actions */}
                  {alert.recommended_actions.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                      <p className="text-xs font-semibold text-blue-900 mb-2">TOP ACTIONS:</p>
                      {alert.recommended_actions.slice(0, 2).map((action, idx) => (
                        <div key={idx} className="text-sm text-blue-900 mb-1">
                          <span className="font-medium">{idx + 1}.</span> {action.action}
                          {action.estimated_time && (
                            <span className="text-xs text-blue-700 ml-2">
                              ⏱️ {action.estimated_time}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {alert.status === 'new' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(alert.id, 'acknowledge')}
                        className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => handleAction(alert.id, 'resolve')}
                        className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleAction(alert.id, 'dismiss')}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {alert.status !== 'new' && (
                    <div className="text-xs text-gray-500">
                      Status: {alert.status === 'acknowledged' && '✓ Acknowledged'}
                      {alert.status === 'resolved' && '✅ Resolved'}
                      {alert.status === 'dismissed' && '🚫 Dismissed'}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex-shrink-0 text-xs text-gray-500">
                  {new Date(alert.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

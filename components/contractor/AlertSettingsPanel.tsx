'use client';

import React, { useEffect, useState } from 'react';
import { AlertConfig, AlertType, CheckFrequency, NotificationChannel } from '@/lib/types/contractor-monitoring';

interface AlertSettingsPanelProps {
  demoId: string;
}

const ALERT_DESCRIPTIONS: Record<AlertType, string> = {
  ranking_drop: 'Alert when Google Maps ranking drops by 5+ positions for key services',
  negative_review: 'Alert on any review 2 stars or below on major platforms',
  new_competitor: 'Alert when new competitor appears in service area with similar services',
  lead_volume_lag: 'Alert when lead volume is 20%+ below Weekly Pulse prediction',
  qc_failure_spike: 'Alert when QC failure rate exceeds 15% (with at least 5 jobs analyzed)',
  crew_turnover: 'Alert when 2+ crew members leave within 30 days',
};

export default function AlertSettingsPanel({ demoId }: AlertSettingsPanelProps) {
  const [configs, setConfigs] = useState<AlertConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfigs();
  }, [demoId]);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contractor/alerts/configs?demoId=${demoId}`);
      const data = await res.json();
      setConfigs(data.configs || []);
    } catch (error) {
      console.error('Error fetching alert configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (config: AlertConfig) => {
    try {
      await fetch('/api/contractor/alerts/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: config.id,
          demoId: config.demo_id,
          alert_type: config.alert_type,
          is_enabled: !config.is_enabled,
          check_frequency: config.check_frequency,
          threshold_config: config.threshold_config,
          notification_channels: config.notification_channels,
        }),
      });
      fetchConfigs(); // Refresh
    } catch (error) {
      console.error('Error updating alert config:', error);
    }
  };

  const handleFrequencyChange = async (config: AlertConfig, frequency: CheckFrequency) => {
    try {
      await fetch('/api/contractor/alerts/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: config.id,
          demoId: config.demo_id,
          alert_type: config.alert_type,
          is_enabled: config.is_enabled,
          check_frequency: frequency,
          threshold_config: config.threshold_config,
          notification_channels: config.notification_channels,
        }),
      });
      fetchConfigs();
    } catch (error) {
      console.error('Error updating frequency:', error);
    }
  };

  const handleChannelToggle = async (config: AlertConfig, channel: NotificationChannel) => {
    const channels = config.notification_channels.includes(channel)
      ? config.notification_channels.filter((c) => c !== channel)
      : [...config.notification_channels, channel];

    if (channels.length === 0) return; // Must have at least one channel

    try {
      await fetch('/api/contractor/alerts/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: config.id,
          demoId: config.demo_id,
          alert_type: config.alert_type,
          is_enabled: config.is_enabled,
          check_frequency: config.check_frequency,
          threshold_config: config.threshold_config,
          notification_channels: channels,
        }),
      });
      fetchConfigs();
    } catch (error) {
      console.error('Error updating channels:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Alert Settings</h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure which alerts you want to receive and how often
        </p>
      </div>

      {/* Alert configs */}
      <div className="divide-y divide-gray-200">
        {configs.map((config) => (
          <div key={config.id} className="px-6 py-4">
            <div className="flex items-start justify-between">
              {/* Left: Alert info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.is_enabled}
                      onChange={() => handleToggle(config)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="font-semibold text-gray-900 capitalize">
                    {config.alert_type.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {ALERT_DESCRIPTIONS[config.alert_type]}
                </p>

                {/* Frequency */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-gray-700">Check frequency:</span>
                  <select
                    value={config.check_frequency}
                    onChange={(e) => handleFrequencyChange(config, e.target.value as CheckFrequency)}
                    disabled={!config.is_enabled}
                    className="text-xs border border-gray-300 rounded-md px-2 py-1 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                {/* Notification channels */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-700">Notify via:</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.notification_channels.includes('in_app')}
                      onChange={() => handleChannelToggle(config, 'in_app')}
                      disabled={!config.is_enabled}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <span className="text-xs text-gray-700">In-App</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.notification_channels.includes('email')}
                      onChange={() => handleChannelToggle(config, 'email')}
                      disabled={!config.is_enabled}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <span className="text-xs text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.notification_channels.includes('sms')}
                      onChange={() => handleChannelToggle(config, 'sms')}
                      disabled={!config.is_enabled}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <span className="text-xs text-gray-700">SMS</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Start with daily checks for critical alerts (rankings, reviews),
          and weekly checks for trends (competitors, lead lag, QC). You can adjust thresholds later.
        </p>
      </div>
    </div>
  );
}

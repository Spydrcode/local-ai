'use client';

import React, { useEffect, useState } from 'react';
import {
  ContractorIntegration,
  ContractorIntegrationTemplate,
  IntegrationType,
  IntegrationStatus,
} from '@/lib/types/contractor-integrations';

interface IntegrationsPanelProps {
  demoId: string;
}

export default function IntegrationsPanel({ demoId }: IntegrationsPanelProps) {
  const [templates, setTemplates] = useState<ContractorIntegrationTemplate[]>([]);
  const [integrations, setIntegrations] = useState<ContractorIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [demoId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [templatesRes, integrationsRes] = await Promise.all([
        fetch('/api/contractor/integrations/templates'),
        fetch(`/api/contractor/integrations?demoId=${demoId}`),
      ]);

      const templatesData = await templatesRes.json();
      const integrationsData = await integrationsRes.json();

      setTemplates(templatesData.templates || []);
      setIntegrations(integrationsData.integrations || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (type: IntegrationType) => {
    // Would trigger OAuth flow or API key setup
    alert(`Connecting to ${type}... (OAuth flow would start here)`);
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;

    try {
      await fetch('/api/contractor/integrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId }),
      });
      fetchData();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId);
    try {
      await fetch('/api/contractor/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoId, integrationId }),
      });
      fetchData();
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setSyncing(null);
    }
  };

  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-300';
    }
  };

  const getStatusIcon = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected':
        return '✓';
      case 'error':
        return '✕';
      case 'pending':
        return '⏳';
      case 'disconnected':
        return '○';
      case 'expired':
        return '⚠';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Group templates by connected status
  const connectedTypes = new Set(integrations.map((i) => i.integration_type));

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Integrations</h2>
        <p className="text-sm text-gray-600 mt-1">
          Connect your business systems to automatically sync data
        </p>
      </div>

      {/* Connected integrations */}
      {integrations.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Connected</h3>
          <div className="space-y-3">
            {integrations.map((integration) => {
              const template = templates.find((t) => t.integration_type === integration.integration_type);
              return (
                <div
                  key={integration.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    {/* Left: Integration info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {template?.display_name || integration.integration_type}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-md border text-xs font-medium ${getStatusColor(
                            integration.status
                          )}`}
                        >
                          {getStatusIcon(integration.status)} {integration.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template?.description}</p>

                      {/* Last synced */}
                      {integration.last_synced_at && (
                        <p className="text-xs text-gray-500">
                          Last synced:{' '}
                          {new Date(integration.last_synced_at).toLocaleString()}
                        </p>
                      )}

                      {/* Error message */}
                      {integration.status === 'error' && integration.last_error && (
                        <p className="text-xs text-red-600 mt-2">
                          ⚠ Error: {integration.last_error}
                        </p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSync(integration.id)}
                        disabled={syncing === integration.id || integration.status !== 'connected'}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {syncing === integration.id ? 'Syncing...' : 'Sync Now'}
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>

                  {/* Sync config */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>
                        <strong>Frequency:</strong> {integration.sync_frequency}
                      </span>
                      <span>
                        <strong>Auto-sync:</strong> {integration.auto_sync ? 'On' : 'Off'}
                      </span>
                      {integration.next_sync_at && (
                        <span>
                          <strong>Next sync:</strong>{' '}
                          {new Date(integration.next_sync_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available integrations */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Available</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {templates
            .filter((t) => !connectedTypes.has(t.integration_type))
            .map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{template.display_name}</h4>
                  {template.auth_type === 'oauth2' && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      OAuth
                    </span>
                  )}
                  {template.auth_type === 'api_key' && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      API Key
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {Object.entries(template.capabilities)
                    .filter(([_, enabled]) => enabled)
                    .map(([capability]) => (
                      <span
                        key={capability}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                      >
                        {capability}
                      </span>
                    ))}
                </div>

                <button
                  onClick={() => handleConnect(template.integration_type)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Connect
                </button>

                {template.help_url && (
                  <a
                    href={template.help_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs text-blue-600 hover:underline mt-2"
                  >
                    Learn more →
                  </a>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Start with ServiceTitan or Jobber to sync your jobs
          automatically. Then add Google Business Profile to monitor reviews in real-time.
        </p>
      </div>
    </div>
  );
}

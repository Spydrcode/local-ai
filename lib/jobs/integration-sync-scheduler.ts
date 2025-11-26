/**
 * IntegrationSyncScheduler: Background jobs for data synchronization
 *
 * Schedules:
 * - Hourly: ServiceTitan jobs, Google reviews
 * - Daily: QuickBooks invoices, Jobber schedules
 * - Manual: On-demand sync triggered by user
 *
 * Uses BullMQ for job scheduling
 */

import { Queue, Worker } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import { ContractorIntegration, IntegrationType } from '@/lib/types/contractor-integrations';
import { ServiceTitanConnector } from '@/lib/integrations/servicetitan-connector';
import { GoogleBusinessProfileConnector } from '@/lib/integrations/google-business-profile-connector';

// Redis connection
const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
};

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Create queues
export const integrationSyncQueue = new Queue('contractor-integration-sync', {
  connection: REDIS_CONNECTION,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

// Queue scheduler (QueueScheduler removed in bullmq v5+)
// const queueScheduler = new QueueScheduler('contractor-integration-sync', {
//   connection: REDIS_CONNECTION,
// });

/**
 * Initialize integration sync schedule
 */
export async function initializeIntegrationSync() {
  console.log('[IntegrationSyncScheduler] Initializing sync schedule...');

  // Hourly sync (realtime + hourly integrations)
  await integrationSyncQueue.add(
    'hourly-sync',
    { frequency: 'hourly' },
    {
      repeat: {
        every: 60 * 60 * 1000, // 1 hour
      },
    }
  );

  // Daily sync (daily integrations)
  await integrationSyncQueue.add(
    'daily-sync',
    { frequency: 'daily' },
    {
      repeat: {
        pattern: '0 6 * * *', // 6 AM daily
      },
    }
  );

  console.log('[IntegrationSyncScheduler] Sync schedule initialized');
}

/**
 * Process integration sync jobs
 */
export const integrationSyncWorker = new Worker(
  'contractor-integration-sync',
  async (job) => {
    console.log(`[IntegrationSyncScheduler] Processing job: ${job.name}`);
    const { frequency, demo_id, integration_id } = job.data;

    // If demo_id specified, sync only that demo
    if (demo_id && integration_id) {
      await syncIntegration(integration_id);
      return;
    }

    // Otherwise, sync all active integrations matching frequency
    const { data: integrations, error } = await supabase
      .from('contractor_integrations')
      .select('*')
      .eq('status', 'connected')
      .eq('auto_sync', true)
      .or(`sync_frequency.eq.${frequency},sync_frequency.eq.realtime`);

    if (error) {
      console.error('[IntegrationSyncScheduler] Error fetching integrations:', error);
      throw error;
    }

    console.log(`[IntegrationSyncScheduler] Found ${integrations?.length || 0} integrations to sync`);

    // Process each integration
    for (const integration of integrations || []) {
      try {
        await syncIntegration(integration.id);
      } catch (err: any) {
        console.error(`[IntegrationSyncScheduler] Error syncing integration ${integration.id}:`, err.message);
      }
    }
  },
  {
    connection: REDIS_CONNECTION,
    concurrency: 3, // Process 3 integrations concurrently
  }
);

/**
 * Sync a single integration
 */
async function syncIntegration(integration_id: string) {
  console.log(`[IntegrationSyncScheduler] Syncing integration ${integration_id}`);

  // Fetch integration
  const { data: integration, error } = await supabase
    .from('contractor_integrations')
    .select('*')
    .eq('id', integration_id)
    .single();

  if (error || !integration) {
    console.error(`[IntegrationSyncScheduler] Integration ${integration_id} not found`);
    return;
  }

  const typedIntegration = integration as unknown as ContractorIntegration;

  // Create connector
  const connector = createConnector(typedIntegration);
  if (!connector) {
    console.error(`[IntegrationSyncScheduler] No connector for ${typedIntegration.integration_type}`);
    return;
  }

  try {
    // Test connection first
    const isConnected = await connector.testConnection();
    if (!isConnected) {
      console.error(`[IntegrationSyncScheduler] Connection test failed for ${integration_id}`);
      await supabase
        .from('contractor_integrations')
        .update({
          status: 'error',
          last_error: 'Connection test failed',
          last_error_at: new Date().toISOString(),
        })
        .eq('id', integration_id);
      return;
    }

    // Sync based on integration type and config
    const config = typedIntegration.config;
    const since = typedIntegration.last_synced_at ? new Date(typedIntegration.last_synced_at) : undefined;

    if (typedIntegration.integration_type === 'servicetitan') {
      if (config.sync_jobs && connector.syncJobs) {
        await connector.syncJobs(since);
      }
      if (config.sync_customers && connector.syncCustomers) {
        await connector.syncCustomers(since);
      }
    }

    if (typedIntegration.integration_type === 'google_business_profile') {
      if (config.sync_reviews && connector.syncReviews) {
        await connector.syncReviews(since);
      }
    }

    // Update next sync time
    const next_sync_at = calculateNextSyncTime(typedIntegration.sync_frequency);
    await supabase
      .from('contractor_integrations')
      .update({
        last_synced_at: new Date().toISOString(),
        next_sync_at,
        status: 'connected',
        last_error: null,
        error_count: 0,
      })
      .eq('id', integration_id);

    // Refresh materialized view
    await supabase.rpc('refresh_contractor_integration_summary');

    console.log(`[IntegrationSyncScheduler] Completed sync for ${integration_id}`);
  } catch (error: any) {
    console.error(`[IntegrationSyncScheduler] Sync failed for ${integration_id}:`, error.message);

    await supabase
      .from('contractor_integrations')
      .update({
        status: 'error',
        last_error: error.message,
        error_count: typedIntegration.error_count + 1,
        last_error_at: new Date().toISOString(),
      })
      .eq('id', integration_id);
  }
}

/**
 * Create connector instance based on integration type
 */
function createConnector(integration: ContractorIntegration): any {
  switch (integration.integration_type) {
    case 'servicetitan':
      return new ServiceTitanConnector(integration);
    case 'google_business_profile':
      return new GoogleBusinessProfileConnector(integration);
    case 'jobber':
      // return new JobberConnector(integration);
      console.log('[IntegrationSyncScheduler] Jobber connector not yet implemented');
      return null;
    case 'quickbooks':
      // return new QuickBooksConnector(integration);
      console.log('[IntegrationSyncScheduler] QuickBooks connector not yet implemented');
      return null;
    default:
      console.log(`[IntegrationSyncScheduler] No connector for ${integration.integration_type}`);
      return null;
  }
}

/**
 * Calculate next sync time based on frequency
 */
function calculateNextSyncTime(frequency: string): string {
  const now = Date.now();
  let next_sync: number;

  switch (frequency) {
    case 'realtime':
      next_sync = now + 15 * 60 * 1000; // 15 minutes
      break;
    case 'hourly':
      next_sync = now + 60 * 60 * 1000; // 1 hour
      break;
    case 'daily':
      next_sync = now + 24 * 60 * 60 * 1000; // 1 day
      break;
    default:
      next_sync = now + 60 * 60 * 1000; // Default 1 hour
  }

  return new Date(next_sync).toISOString();
}

/**
 * Trigger manual sync for a specific integration
 */
export async function triggerManualSync(demo_id: string, integration_id: string) {
  console.log(`[IntegrationSyncScheduler] Triggering manual sync for ${integration_id}`);

  await integrationSyncQueue.add('manual-sync', {
    demo_id,
    integration_id,
    frequency: 'manual',
  });
}

/**
 * Get sync status for an integration
 */
export async function getSyncStatus(integration_id: string) {
  const { data: logs } = await supabase
    .from('contractor_sync_logs')
    .select('*')
    .eq('integration_id', integration_id)
    .order('started_at', { ascending: false })
    .limit(10);

  const { data: integration } = await supabase
    .from('contractor_integrations')
    .select('last_synced_at, next_sync_at, status, last_error')
    .eq('id', integration_id)
    .single();

  return {
    integration,
    recent_syncs: logs || [],
  };
}

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  console.log('[IntegrationSyncScheduler] Shutting down...');
  await integrationSyncWorker.close();
  // await queueScheduler.close(); // QueueScheduler removed in bullmq v5+
  await integrationSyncQueue.close();
  process.exit(0);
});

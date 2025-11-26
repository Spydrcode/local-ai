/**
 * MonitoringScheduler: Background jobs for alert monitoring
 *
 * Schedules:
 * - Daily: ranking_drop, negative_review checks
 * - Weekly: new_competitor, lead_volume_lag, qc_failure_spike checks
 * - Hourly: (optional for critical monitoring)
 *
 * Uses BullMQ for job scheduling
 */

import { Queue, Worker } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import { MonitoringAgent } from '@/lib/agents/contractor/monitoring-agent';
import { NotificationService } from '@/lib/services/notification-service';
import {
  AlertConfig,
  MonitoringAgentInput,
  MonitoringSnapshot,
} from '@/lib/types/contractor-monitoring';

// Redis connection (required for BullMQ)
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
export const monitoringQueue = new Queue('contractor-monitoring', {
  connection: REDIS_CONNECTION,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Queue scheduler (manages delayed/repeated jobs)
// QueueScheduler removed in bullmq v5+
// const queueScheduler = new QueueScheduler('contractor-monitoring', {
//   connection: REDIS_CONNECTION,
// });

/**
 * Initialize monitoring jobs for all contractor demos
 */
export async function initializeMonitoringSchedule() {
  console.log('[MonitoringScheduler] Initializing monitoring schedule...');

  // Hourly monitoring (critical alerts)
  await monitoringQueue.add(
    'hourly-monitoring',
    { frequency: 'hourly' },
    {
      repeat: {
        every: 60 * 60 * 1000, // 1 hour
      },
    }
  );

  // Daily monitoring (rankings, reviews)
  await monitoringQueue.add(
    'daily-monitoring',
    { frequency: 'daily' },
    {
      repeat: {
        pattern: '0 8 * * *', // 8 AM daily
      },
    }
  );

  // Weekly monitoring (competitors, lead lag, QC)
  await monitoringQueue.add(
    'weekly-monitoring',
    { frequency: 'weekly' },
    {
      repeat: {
        pattern: '0 9 * * 1', // 9 AM Monday
      },
    }
  );

  console.log('[MonitoringScheduler] Monitoring schedule initialized');
}

/**
 * Process monitoring jobs
 */
export const monitoringWorker = new Worker(
  'contractor-monitoring',
  async (job) => {
    console.log(`[MonitoringScheduler] Processing job: ${job.name}`);
    const { frequency } = job.data;

    // Fetch all contractor demos with monitoring enabled
    const { data: demos, error } = await supabase
      .from('demos')
      .select('id, contractor_profile')
      .eq('contractor_mode', true)
      .not('contractor_profile', 'is', null);

    if (error) {
      console.error('[MonitoringScheduler] Error fetching demos:', error);
      throw error;
    }

    console.log(`[MonitoringScheduler] Found ${demos?.length || 0} contractor demos`);

    // Process each demo
    for (const demo of demos || []) {
      try {
        await runMonitoringForDemo(demo.id, frequency);
      } catch (err: any) {
        console.error(`[MonitoringScheduler] Error monitoring demo ${demo.id}:`, err.message);
      }
    }
  },
  {
    connection: REDIS_CONNECTION,
    concurrency: 5, // Process 5 demos concurrently
  }
);

/**
 * Run monitoring for a single demo
 */
async function runMonitoringForDemo(demo_id: string, frequency: string) {
  console.log(`[MonitoringScheduler] Running ${frequency} monitoring for demo ${demo_id}`);

  // Fetch alert configs
  const { data: configs, error: configError } = await supabase
    .from('contractor_alert_configs')
    .select('*')
    .eq('demo_id', demo_id)
    .eq('is_enabled', true)
    .eq('check_frequency', frequency);

  if (configError || !configs || configs.length === 0) {
    console.log(`[MonitoringScheduler] No ${frequency} alerts configured for demo ${demo_id}`);
    return;
  }

  // Fetch contractor profile
  const { data: demo, error: demoError } = await supabase
    .from('demos')
    .select('contractor_profile')
    .eq('id', demo_id)
    .single();

  if (demoError || !demo) {
    console.error(`[MonitoringScheduler] Error fetching demo ${demo_id}:`, demoError);
    return;
  }

  const profile = demo.contractor_profile;

  // Fetch recent snapshots (for trend comparison)
  const { data: snapshots, error: snapshotsError } = await supabase
    .from('contractor_monitoring_snapshots')
    .select('*')
    .eq('demo_id', demo_id)
    .order('captured_at', { ascending: false })
    .limit(10);

  if (snapshotsError) {
    console.error('[MonitoringScheduler] Error fetching snapshots:', snapshotsError);
  }

  // Gather current data (this would call external APIs in production)
  const current_data = await gatherCurrentData(demo_id, profile);

  // Run monitoring agent
  const input: MonitoringAgentInput = {
    demo_id,
    profile,
    alert_configs: configs as AlertConfig[],
    recent_snapshots: (snapshots as MonitoringSnapshot[]) || [],
    current_data,
  };

  const output = await MonitoringAgent.runMonitoring(input);

  // Save snapshots
  if (output.snapshots_to_save.length > 0) {
    const { error: snapshotInsertError } = await supabase
      .from('contractor_monitoring_snapshots')
      .insert(output.snapshots_to_save);

    if (snapshotInsertError) {
      console.error('[MonitoringScheduler] Error saving snapshots:', snapshotInsertError);
    }
  }

  // Save alerts
  if (output.alerts_triggered.length > 0) {
    console.log(
      `[MonitoringScheduler] Triggered ${output.alerts_triggered.length} alerts for demo ${demo_id}`
    );

    const { error: alertInsertError } = await supabase
      .from('contractor_alerts')
      .insert(output.alerts_triggered);

    if (alertInsertError) {
      console.error('[MonitoringScheduler] Error saving alerts:', alertInsertError);
    }

    // Send notifications
    for (const notification of output.notifications_to_send) {
      const alert = output.alerts_triggered.find((a) => a.id === notification.alert_id);
      if (!alert) continue;

      const notifications_sent = await NotificationService.sendAlertNotification(
        alert,
        notification.channels,
        notification.recipients
      );

      // Update alert with notifications sent
      await supabase
        .from('contractor_alerts')
        .update({ notifications_sent })
        .eq('id', alert.id);
    }
  }

  // Refresh materialized view
  await supabase.rpc('refresh_contractor_alert_summary');

  console.log(`[MonitoringScheduler] Completed ${frequency} monitoring for demo ${demo_id}`);
}

/**
 * Gather current data for monitoring
 * NOTE: In production, this would call external APIs (Google Maps, Yelp, etc.)
 */
async function gatherCurrentData(demo_id: string, profile: any) {
  // Fetch rankings (would call Google Maps API)
  const rankings = await fetchGoogleRankings(demo_id, profile);

  // Fetch reviews (would call Google/Yelp APIs)
  const reviews = await fetchReviewsAggregate(demo_id, profile);

  // Fetch competitors (would call Google Maps API)
  const competitors = await fetchCompetitors(demo_id, profile);

  // Fetch lead volume (from internal DB)
  const lead_volume = await fetchLeadVolume(demo_id);

  // Fetch QC stats (from internal DB)
  const qc_stats = await fetchQCStats(demo_id);

  return {
    rankings,
    reviews,
    competitors,
    lead_volume,
    qc_stats,
  };
}

/**
 * Fetch Google Maps rankings
 * NOTE: Placeholder — would use SerpAPI or similar
 */
async function fetchGoogleRankings(demo_id: string, profile: any) {
  // Simulated data
  const keywords = profile.service_types || ['hvac repair', 'ac installation'];
  const rankings: any = {};

  for (const keyword of keywords.slice(0, 3)) {
    rankings[keyword] = Math.floor(Math.random() * 15) + 1; // Random rank 1-15
  }

  return rankings;
}

/**
 * Fetch reviews aggregate
 * NOTE: Placeholder — would use Google Business Profile API, Yelp API
 */
async function fetchReviewsAggregate(demo_id: string, profile: any) {
  return {
    google: {
      avg: 4.7 + Math.random() * 0.3,
      count: 120 + Math.floor(Math.random() * 10),
    },
    yelp: {
      avg: 4.5 + Math.random() * 0.3,
      count: 80 + Math.floor(Math.random() * 10),
    },
  };
}

/**
 * Fetch competitors
 * NOTE: Placeholder — would use Google Maps API
 */
async function fetchCompetitors(demo_id: string, profile: any) {
  return {
    competitors: [
      { name: 'ABC HVAC', rank: 1, distance_miles: 3 },
      { name: 'XYZ Heating', rank: 2, distance_miles: 5 },
      { name: 'Local Temp Control', rank: 3, distance_miles: 7 },
    ],
  };
}

/**
 * Fetch lead volume from DB
 */
async function fetchLeadVolume(demo_id: string) {
  const { data } = await supabase
    .from('contractor_leads')
    .select('*')
    .eq('demo_id', demo_id)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const week_leads = data?.length || 0;

  // Get prediction from most recent lead pulse
  const { data: predictions } = await supabase
    .from('contractor_lead_predictions')
    .select('*')
    .eq('demo_id', demo_id)
    .order('prediction_date', { ascending: false })
    .limit(1);

  const prediction = predictions?.[0];

  return {
    week_leads,
    expected_low: prediction?.predicted_leads_low || week_leads,
    expected_high: prediction?.predicted_leads_high || week_leads,
  };
}

/**
 * Fetch QC stats from DB
 */
async function fetchQCStats(demo_id: string) {
  const { data: qc_analyses } = await supabase
    .from('contractor_qc_analyses')
    .select('overall_assessment')
    .eq('demo_id', demo_id)
    .gte('analyzed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const jobs_analyzed = qc_analyses?.length || 0;
  const failed_jobs = qc_analyses?.filter((a) => a.overall_assessment === 'fail').length || 0;
  const failure_rate = jobs_analyzed > 0 ? failed_jobs / jobs_analyzed : 0;

  return {
    jobs_analyzed,
    failed_jobs,
    failure_rate,
  };
}

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  console.log('[MonitoringScheduler] Shutting down...');
  await monitoringWorker.close();
  // await queueScheduler.close(); // QueueScheduler removed in bullmq v5+
  await monitoringQueue.close();
  process.exit(0);
});

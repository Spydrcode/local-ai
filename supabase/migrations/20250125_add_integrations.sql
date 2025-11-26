-- =====================================================
-- Phase 7: Integration Layer
-- =====================================================
-- Connect to external systems: ServiceTitan, Jobber, QuickBooks, Google Business Profile

-- Integration connections table
CREATE TABLE IF NOT EXISTS contractor_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demo_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,

  -- Integration type
  integration_type TEXT NOT NULL CHECK (integration_type IN (
    'servicetitan',
    'jobber',
    'quickbooks',
    'google_business_profile',
    'indeed',
    'facebook_jobs',
    'yelp',
    'serp_api'
  )),

  -- Connection status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',        -- Not yet connected
    'connected',      -- Active and working
    'error',          -- Connection failed
    'disconnected',   -- Manually disconnected
    'expired'         -- Auth token expired
  )),

  -- Credentials (encrypted)
  credentials JSONB NOT NULL DEFAULT '{}',
  -- Examples:
  -- servicetitan: { tenant_id, client_id, client_secret, access_token, refresh_token }
  -- google_business_profile: { location_id, access_token, refresh_token }
  -- quickbooks: { realm_id, access_token, refresh_token }

  -- Configuration
  config JSONB DEFAULT '{}',
  -- Examples:
  -- servicetitan: { sync_jobs: true, sync_customers: true, sync_estimates: true }
  -- google_business_profile: { sync_reviews: true, sync_rankings: true }

  -- Sync settings
  auto_sync BOOLEAN DEFAULT true,
  sync_frequency TEXT DEFAULT 'hourly' CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'manual')),
  last_synced_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,

  -- Error tracking
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  last_error_at TIMESTAMPTZ,

  -- Metadata
  connected_at TIMESTAMPTZ,
  connected_by TEXT, -- user email
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_integrations_demo ON contractor_integrations(demo_id);
CREATE INDEX idx_integrations_type ON contractor_integrations(demo_id, integration_type);
CREATE INDEX idx_integrations_status ON contractor_integrations(status) WHERE status = 'connected';
CREATE INDEX idx_integrations_next_sync ON contractor_integrations(next_sync_at) WHERE auto_sync = true AND status = 'connected';

-- Sync logs (audit trail)
CREATE TABLE IF NOT EXISTS contractor_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demo_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES contractor_integrations(id) ON DELETE CASCADE,

  -- Sync details
  sync_type TEXT NOT NULL, -- 'full' | 'incremental' | 'manual'
  entity_type TEXT NOT NULL, -- 'jobs' | 'customers' | 'reviews' | 'rankings'

  -- Results
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  records_fetched INTEGER DEFAULT 0,
  records_inserted INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,

  -- Error details
  error_message TEXT,
  error_details JSONB,

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- Metadata
  triggered_by TEXT, -- 'scheduler' | 'user' | 'webhook'
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_sync_logs_demo ON contractor_sync_logs(demo_id);
CREATE INDEX idx_sync_logs_integration ON contractor_sync_logs(integration_id);
CREATE INDEX idx_sync_logs_started ON contractor_sync_logs(started_at DESC);
CREATE INDEX idx_sync_logs_status ON contractor_sync_logs(status);

-- Synced data mappings (map external IDs to internal IDs)
CREATE TABLE IF NOT EXISTS contractor_data_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demo_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES contractor_integrations(id) ON DELETE CASCADE,

  -- Mapping
  entity_type TEXT NOT NULL, -- 'job' | 'customer' | 'lead' | 'employee'
  external_id TEXT NOT NULL, -- ServiceTitan job ID, etc.
  internal_id UUID NOT NULL, -- contractor_jobs.id, etc.

  -- Metadata
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE UNIQUE INDEX idx_data_mappings_external ON contractor_data_mappings(integration_id, entity_type, external_id);
CREATE INDEX idx_data_mappings_internal ON contractor_data_mappings(internal_id);

-- Integration templates (pre-configured settings)
CREATE TABLE IF NOT EXISTS contractor_integration_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_type TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT,

  -- Auth details
  auth_type TEXT NOT NULL CHECK (auth_type IN ('oauth2', 'api_key', 'basic_auth', 'custom')),
  auth_url TEXT,
  token_url TEXT,
  scopes TEXT[],

  -- Capabilities
  capabilities JSONB NOT NULL DEFAULT '{}',
  -- Examples:
  -- servicetitan: { jobs: true, customers: true, estimates: true, invoices: true }
  -- google_business_profile: { reviews: true, rankings: false, posts: true }

  -- Default config
  default_config JSONB DEFAULT '{}',

  -- Documentation
  setup_instructions TEXT,
  help_url TEXT,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO contractor_integration_templates (integration_type, display_name, description, auth_type, capabilities, setup_instructions, help_url) VALUES
(
  'servicetitan',
  'ServiceTitan',
  'Sync jobs, customers, estimates, and revenue from ServiceTitan',
  'oauth2',
  '{"jobs": true, "customers": true, "estimates": true, "invoices": true, "technicians": true}',
  'Connect your ServiceTitan account to automatically sync job data, customer information, and revenue metrics.',
  'https://developer.servicetitan.io/docs'
),
(
  'jobber',
  'Jobber',
  'Sync jobs, clients, quotes, and team from Jobber',
  'oauth2',
  '{"jobs": true, "clients": true, "quotes": true, "team": true, "schedule": true}',
  'Connect your Jobber account to sync scheduling, job tracking, and team management.',
  'https://developer.getjobber.com/docs'
),
(
  'quickbooks',
  'QuickBooks Online',
  'Sync invoices, payments, and financial data from QuickBooks',
  'oauth2',
  '{"invoices": true, "payments": true, "customers": true, "revenue": true}',
  'Connect QuickBooks to track revenue, outstanding invoices, and cash flow.',
  'https://developer.intuit.com/app/developer/qbo/docs/get-started'
),
(
  'google_business_profile',
  'Google Business Profile',
  'Sync reviews, rankings, and posts from Google Business Profile',
  'oauth2',
  '{"reviews": true, "posts": true, "insights": true, "rankings": false}',
  'Connect your Google Business Profile to monitor reviews and customer engagement.',
  'https://developers.google.com/my-business/content/overview'
),
(
  'indeed',
  'Indeed',
  'Post jobs and sync applicants from Indeed',
  'api_key',
  '{"job_postings": true, "applicants": true, "messages": false}',
  'Connect Indeed to post jobs and track applicant pipeline.',
  'https://indeed.com/hire'
),
(
  'facebook_jobs',
  'Facebook Jobs',
  'Post jobs and sync applicants from Facebook',
  'oauth2',
  '{"job_postings": true, "applicants": true}',
  'Connect Facebook to post jobs and reach local talent.',
  'https://developers.facebook.com/docs/pages/jobs'
),
(
  'yelp',
  'Yelp',
  'Sync reviews and ratings from Yelp',
  'api_key',
  '{"reviews": true, "ratings": true}',
  'Connect Yelp to monitor reviews and respond quickly.',
  'https://www.yelp.com/developers/documentation/v3'
),
(
  'serp_api',
  'SerpAPI (Rankings)',
  'Track Google Maps rankings for key services',
  'api_key',
  '{"rankings": true, "competitors": true, "local_pack": true}',
  'Connect SerpAPI to monitor Google Maps rankings and competitor positions.',
  'https://serpapi.com/google-maps-api'
);

-- RLS Policies
ALTER TABLE contractor_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_data_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their integrations"
  ON contractor_integrations FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their integrations"
  ON contractor_integrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their integrations"
  ON contractor_integrations FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their integrations"
  ON contractor_integrations FOR DELETE
  USING (true);

CREATE POLICY "Users can view their sync logs"
  ON contractor_sync_logs FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their sync logs"
  ON contractor_sync_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their data mappings"
  ON contractor_data_mappings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their data mappings"
  ON contractor_data_mappings FOR INSERT
  WITH CHECK (true);

-- Materialized view for integration summary
CREATE MATERIALIZED VIEW contractor_integration_summary AS
SELECT
  demo_id,
  COUNT(*) AS total_integrations,
  COUNT(*) FILTER (WHERE status = 'connected') AS connected_integrations,
  COUNT(*) FILTER (WHERE status = 'error') AS error_integrations,
  MAX(last_synced_at) AS latest_sync_at,
  jsonb_object_agg(
    integration_type,
    jsonb_build_object('status', status, 'last_synced', last_synced_at)
  ) AS integrations_by_type
FROM contractor_integrations
GROUP BY demo_id;

CREATE UNIQUE INDEX idx_integration_summary_demo ON contractor_integration_summary(demo_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_contractor_integration_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY contractor_integration_summary;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE contractor_integrations IS 'Connected external systems (ServiceTitan, Jobber, QuickBooks, etc.)';
COMMENT ON TABLE contractor_sync_logs IS 'Audit trail of data sync operations';
COMMENT ON TABLE contractor_data_mappings IS 'Map external IDs to internal IDs for synced entities';
COMMENT ON TABLE contractor_integration_templates IS 'Pre-configured integration settings and capabilities';

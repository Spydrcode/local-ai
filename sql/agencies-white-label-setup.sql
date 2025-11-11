-- White-Label Agency System Setup
-- Run this in Supabase SQL Editor

-- 1. Create agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#10b981',
  secondary_color TEXT DEFAULT '#6366f1',
  footer_text TEXT DEFAULT 'Strategic Analysis Report',
  website_url TEXT,

  -- Billing
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  plan TEXT CHECK (plan IN ('solo', 'starter', 'pro', 'enterprise')) DEFAULT 'solo',
  monthly_report_limit INTEGER DEFAULT 10,
  reports_used_this_month INTEGER DEFAULT 0,
  billing_cycle_start DATE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add agency relationship to demos table
ALTER TABLE demos ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id);
ALTER TABLE demos ADD COLUMN IF NOT EXISTS created_by_email TEXT;

-- 3. Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',

  -- Invitation tracking
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by_email TEXT,
  accepted_at TIMESTAMPTZ,

  -- Permissions
  can_export BOOLEAN DEFAULT true,
  can_invite BOOLEAN DEFAULT false,

  UNIQUE(agency_id, email)
);

-- 4. Create activity_log table for usage tracking
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  demo_id VARCHAR(15) REFERENCES demos(id),
  user_email TEXT NOT NULL,
  action TEXT NOT NULL, -- 'created', 'analyzed', 'exported_pdf', 'exported_excel', etc.
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create pricing_plans table for reference
CREATE TABLE IF NOT EXISTS pricing_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_price INTEGER, -- in cents, null for custom pricing
  annual_price INTEGER, -- in cents, null if not available
  report_limit INTEGER, -- -1 for unlimited
  team_member_limit INTEGER, -- -1 for unlimited
  features JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Insert default pricing plans
INSERT INTO pricing_plans (id, name, monthly_price, annual_price, report_limit, team_member_limit, features) VALUES
('solo', 'Solo Consultant', 9900, 99000, 10, 1,
  '{"exports": ["pdf"], "white_label": "logo_only", "api_access": false, "priority_support": false, "custom_templates": false}'::jsonb),
('starter', 'Agency Starter', 29900, 299000, 50, 3,
  '{"exports": ["pdf", "pptx", "excel"], "white_label": "full", "api_access": "limited", "priority_support": true, "custom_templates": false}'::jsonb),
('pro', 'Agency Pro', 69900, 699000, -1, 10,
  '{"exports": ["pdf", "pptx", "excel"], "white_label": "full_plus_templates", "api_access": "unlimited", "priority_support": true, "custom_templates": true, "dedicated_manager": true}'::jsonb),
('enterprise', 'Enterprise', NULL, NULL, -1, -1,
  '{"exports": ["pdf", "pptx", "excel"], "white_label": "custom_domain", "api_access": "unlimited", "priority_support": true, "custom_templates": true, "dedicated_manager": true, "sla": true, "reseller_rights": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agencies_stripe_customer ON agencies(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_demos_agency ON demos(agency_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_agency ON team_members(agency_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_agency ON activity_log(agency_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_demo ON activity_log(demo_id);

-- 8. Create function to reset monthly report usage
CREATE OR REPLACE FUNCTION reset_monthly_report_usage()
RETURNS void AS $$
BEGIN
  UPDATE agencies
  SET reports_used_this_month = 0,
      billing_cycle_start = CURRENT_DATE
  WHERE billing_cycle_start IS NULL
     OR billing_cycle_start < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to increment report usage
CREATE OR REPLACE FUNCTION increment_report_usage(p_agency_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_used INTEGER;
BEGIN
  SELECT monthly_report_limit, reports_used_this_month
  INTO v_limit, v_used
  FROM agencies
  WHERE id = p_agency_id;

  -- If unlimited (-1), always allow
  IF v_limit = -1 THEN
    UPDATE agencies
    SET reports_used_this_month = reports_used_this_month + 1
    WHERE id = p_agency_id;
    RETURN TRUE;
  END IF;

  -- Check if under limit
  IF v_used < v_limit THEN
    UPDATE agencies
    SET reports_used_this_month = reports_used_this_month + 1
    WHERE id = p_agency_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 10. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agencies_updated_at
BEFORE UPDATE ON agencies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 11. Create Supabase Storage bucket for agency logos (run in Supabase Storage UI)
-- Bucket name: agency-logos
-- Public: Yes
-- File size limit: 5MB
-- Allowed MIME types: image/png, image/jpeg, image/svg+xml

-- Note: You'll need to create this bucket manually in Supabase Storage UI

-- 12. Grant appropriate permissions (adjust based on your RLS policies)
-- These are examples - adjust based on your security requirements
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Example RLS policy: Team members can view their own agency
CREATE POLICY "Team members can view their agency" ON agencies
  FOR SELECT
  USING (
    id IN (
      SELECT agency_id FROM team_members WHERE email = auth.jwt()->>'email'
    )
  );

-- Example RLS policy: Owners and admins can update their agency
CREATE POLICY "Owners and admins can update agency" ON agencies
  FOR UPDATE
  USING (
    id IN (
      SELECT agency_id FROM team_members
      WHERE email = auth.jwt()->>'email'
      AND role IN ('owner', 'admin')
    )
  );

-- Example RLS policy: Team members can view other team members in their agency
CREATE POLICY "View team members in own agency" ON team_members
  FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM team_members WHERE email = auth.jwt()->>'email'
    )
  );

COMMENT ON TABLE agencies IS 'Stores agency/consultant organization details and white-label branding';
COMMENT ON TABLE team_members IS 'Manages multi-user access to agency accounts';
COMMENT ON TABLE activity_log IS 'Tracks usage for billing and analytics';
COMMENT ON TABLE pricing_plans IS 'Reference table for available subscription tiers';

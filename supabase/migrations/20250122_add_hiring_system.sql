-- Hiring & onboarding system for contractor businesses
-- Enables job ad generation, applicant tracking, and onboarding management

-- Create job postings table
CREATE TABLE IF NOT EXISTS contractor_job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT NOT NULL REFERENCES demos(id) ON DELETE CASCADE,

  -- Job details
  job_title TEXT NOT NULL,
  role_type TEXT NOT NULL, -- 'installer', 'technician', 'foreman', 'office', 'laborer', 'apprentice', 'other'
  employment_type TEXT NOT NULL DEFAULT 'full_time', -- 'full_time', 'part_time', 'contract', 'seasonal'

  -- Compensation
  pay_type TEXT NOT NULL, -- 'hourly', 'salary', 'per_job', 'commission'
  pay_min NUMERIC,
  pay_max NUMERIC,
  pay_currency TEXT DEFAULT 'USD',

  -- Job ad content (AI-generated)
  job_ad_title TEXT NOT NULL,
  job_ad_description TEXT NOT NULL,
  requirements JSONB NOT NULL, -- ["3+ years experience", "Valid driver's license"]
  benefits JSONB, -- ["Health insurance", "401k", "Paid vacation"]

  -- Screening questionnaire
  screening_questions JSONB NOT NULL, -- [{ question, weight, type }]

  -- Posting details
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'paused', 'closed'
  platforms JSONB, -- ["indeed", "facebook", "craigslist"]
  posted_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,

  -- Analytics
  views_count INTEGER DEFAULT 0,
  applicants_count INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create applicants table
CREATE TABLE IF NOT EXISTS contractor_applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  job_posting_id UUID REFERENCES contractor_job_postings(id) ON DELETE SET NULL,

  -- Applicant info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,

  -- Resume/portfolio
  resume_url TEXT,
  portfolio_url TEXT,

  -- Screening responses
  screening_responses JSONB, -- [{ question_id, answer, score }]
  screening_score NUMERIC, -- 0-100

  -- Application status
  status TEXT NOT NULL DEFAULT 'applied', -- 'applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'

  -- Interview tracking
  interview_scheduled_at TIMESTAMPTZ,
  interview_notes TEXT,

  -- Hiring decision
  hired_at TIMESTAMPTZ,
  start_date DATE,
  rejection_reason TEXT,

  -- Metadata
  source TEXT, -- 'indeed', 'facebook', 'referral', 'walk_in'
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create onboarding checklists table
CREATE TABLE IF NOT EXISTS contractor_onboarding_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES contractor_applicants(id) ON DELETE CASCADE,

  -- Checklist details
  role_type TEXT NOT NULL,
  start_date DATE NOT NULL,

  -- Checklist items (7-day plan)
  checklist_items JSONB NOT NULL, -- [{ day, task, owner, completed, completed_at }]

  -- Progress tracking
  total_items INTEGER NOT NULL,
  completed_items INTEGER DEFAULT 0,
  completion_percentage NUMERIC DEFAULT 0,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'abandoned'

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create onboarding templates table (pre-built by role)
CREATE TABLE IF NOT EXISTS contractor_onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT REFERENCES demos(id) ON DELETE CASCADE, -- NULL = system template

  -- Template details
  role_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  industry TEXT, -- 'HVAC', 'Plumbing', etc. (NULL = general)

  -- Template items
  checklist_items JSONB NOT NULL, -- [{ day, task, owner, description }]

  -- Metadata
  is_system_template BOOLEAN DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contractor_job_postings_demo_id ON contractor_job_postings(demo_id);
CREATE INDEX IF NOT EXISTS idx_contractor_job_postings_status ON contractor_job_postings(demo_id, status);
CREATE INDEX IF NOT EXISTS idx_contractor_job_postings_role ON contractor_job_postings(demo_id, role_type);

CREATE INDEX IF NOT EXISTS idx_contractor_applicants_demo_id ON contractor_applicants(demo_id);
CREATE INDEX IF NOT EXISTS idx_contractor_applicants_job_id ON contractor_applicants(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_contractor_applicants_status ON contractor_applicants(demo_id, status);
CREATE INDEX IF NOT EXISTS idx_contractor_applicants_applied_at ON contractor_applicants(demo_id, applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_contractor_onboarding_demo_id ON contractor_onboarding_checklists(demo_id);
CREATE INDEX IF NOT EXISTS idx_contractor_onboarding_applicant_id ON contractor_onboarding_checklists(applicant_id);
CREATE INDEX IF NOT EXISTS idx_contractor_onboarding_status ON contractor_onboarding_checklists(demo_id, status);

CREATE INDEX IF NOT EXISTS idx_contractor_onboarding_templates_role ON contractor_onboarding_templates(role_type, industry);

-- Comments
COMMENT ON TABLE contractor_job_postings IS 'AI-generated job postings for contractor hiring';
COMMENT ON TABLE contractor_applicants IS 'Applicant tracking system for contractor businesses';
COMMENT ON TABLE contractor_onboarding_checklists IS '7-day onboarding checklists for new hires';
COMMENT ON TABLE contractor_onboarding_templates IS 'Reusable onboarding templates by role and industry';

-- Row-level security (RLS)
ALTER TABLE contractor_job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_onboarding_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_onboarding_templates ENABLE ROW LEVEL SECURITY;

-- Policies: Users can manage data for their demos
CREATE POLICY contractor_job_postings_policy ON contractor_job_postings
  FOR ALL
  USING (
    demo_id IN (
      SELECT id FROM demos WHERE created_by_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY contractor_applicants_policy ON contractor_applicants
  FOR ALL
  USING (
    demo_id IN (
      SELECT id FROM demos WHERE created_by_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY contractor_onboarding_checklists_policy ON contractor_onboarding_checklists
  FOR ALL
  USING (
    demo_id IN (
      SELECT id FROM demos WHERE created_by_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- System templates visible to all, custom templates only to owner
CREATE POLICY contractor_onboarding_templates_policy ON contractor_onboarding_templates
  FOR SELECT
  USING (
    is_system_template = true OR
    demo_id IN (
      SELECT id FROM demos WHERE created_by_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Insert system onboarding templates

-- HVAC Installer Template
INSERT INTO contractor_onboarding_templates (role_type, template_name, industry, checklist_items, is_system_template)
VALUES (
  'installer',
  'HVAC Installer - 7 Day Onboarding',
  'HVAC',
  '[
    {"day": 1, "task": "Complete I-9 and tax forms", "owner": "admin", "description": "Ensure all employment paperwork is signed"},
    {"day": 1, "task": "Issue PPE and uniform", "owner": "admin", "description": "Safety glasses, gloves, boots, company shirt"},
    {"day": 1, "task": "Safety training and equipment overview", "owner": "foreman", "description": "OSHA basics, ladder safety, tool safety"},
    {"day": 2, "task": "Shadow senior installer on 2 service calls", "owner": "foreman", "description": "Observe customer interaction and install process"},
    {"day": 3, "task": "Tool and equipment familiarization", "owner": "foreman", "description": "Locate tools in truck, review inventory system"},
    {"day": 3, "task": "Review HVAC system types and troubleshooting", "owner": "foreman", "description": "Gas, electric, heat pump basics"},
    {"day": 4, "task": "Assist with installation under supervision", "owner": "foreman", "description": "First hands-on job with guidance"},
    {"day": 5, "task": "Complete EPA 608 certification (if needed)", "owner": "admin", "description": "Required for refrigerant handling"},
    {"day": 5, "task": "Learn company CRM and job ticketing system", "owner": "admin", "description": "ServiceTitan, Jobber, or internal system"},
    {"day": 6, "task": "Vehicle safety inspection and driving policy review", "owner": "admin", "description": "Company vehicle rules, daily inspection checklist"},
    {"day": 7, "task": "First solo install (with check-in support)", "owner": "foreman", "description": "Foreman checks in at midpoint and end"},
    {"day": 7, "task": "End-of-week review and feedback session", "owner": "foreman", "description": "Address questions, set goals for week 2"}
  ]'::jsonb,
  true
);

-- Plumbing Technician Template
INSERT INTO contractor_onboarding_templates (role_type, template_name, industry, checklist_items, is_system_template)
VALUES (
  'technician',
  'Plumbing Technician - 7 Day Onboarding',
  'Plumbing',
  '[
    {"day": 1, "task": "Complete hiring paperwork and background check", "owner": "admin", "description": "I-9, W-4, emergency contact"},
    {"day": 1, "task": "Issue tools and PPE", "owner": "admin", "description": "Basic tool kit, safety gear, uniform"},
    {"day": 1, "task": "Safety orientation - confined spaces, water hazards", "owner": "foreman", "description": "Plumbing-specific safety training"},
    {"day": 2, "task": "Shadow lead plumber on 3 service calls", "owner": "foreman", "description": "Learn customer service and diagnostic process"},
    {"day": 3, "task": "Hands-on training: common repairs", "owner": "foreman", "description": "Faucets, toilets, drain snaking"},
    {"day": 3, "task": "Review local plumbing codes", "owner": "foreman", "description": "Permit requirements, inspection process"},
    {"day": 4, "task": "Assist with installation project", "owner": "foreman", "description": "Water heater, fixture install, or repipe"},
    {"day": 5, "task": "Learn inventory and parts ordering system", "owner": "admin", "description": "Stock tracking, supplier accounts"},
    {"day": 5, "task": "Emergency service protocol training", "owner": "foreman", "description": "After-hours calls, priority system"},
    {"day": 6, "task": "Customer communication and upselling training", "owner": "foreman", "description": "How to present additional services"},
    {"day": 7, "task": "First supervised service calls (3-5)", "owner": "foreman", "description": "Lead with foreman backup"},
    {"day": 7, "task": "Week 1 performance review", "owner": "foreman", "description": "Discuss strengths and improvement areas"}
  ]'::jsonb,
  true
);

-- Generic Laborer Template
INSERT INTO contractor_onboarding_templates (role_type, template_name, industry, checklist_items, is_system_template)
VALUES (
  'laborer',
  'General Laborer - 7 Day Onboarding',
  NULL,
  '[
    {"day": 1, "task": "Complete employment forms", "owner": "admin", "description": "All hiring paperwork"},
    {"day": 1, "task": "Safety training - PPE, lifting, ladder use", "owner": "foreman", "description": "Basic job site safety"},
    {"day": 1, "task": "Issue safety equipment and uniform", "owner": "admin", "description": "Hard hat, boots, gloves, vest"},
    {"day": 2, "task": "Tool and equipment orientation", "owner": "foreman", "description": "Learn location and care of common tools"},
    {"day": 2, "task": "Shadow experienced crew member", "owner": "foreman", "description": "Observe typical workday routine"},
    {"day": 3, "task": "Assist with material handling and site prep", "owner": "foreman", "description": "Loading, unloading, cleanup"},
    {"day": 4, "task": "Learn material identification and storage", "owner": "foreman", "description": "Know where materials are kept"},
    {"day": 5, "task": "Hands-on task assignments", "owner": "foreman", "description": "Begin performing basic tasks independently"},
    {"day": 6, "task": "Review company policies and procedures", "owner": "admin", "description": "Time tracking, breaks, reporting"},
    {"day": 7, "task": "End-of-week feedback and goal setting", "owner": "foreman", "description": "Performance check-in"}
  ]'::jsonb,
  true
);

-- Quality Control (QC) system for contractor job completion
-- Enables photo-based AI quality inspection with punch lists

-- Create contractor jobs table
CREATE TABLE IF NOT EXISTS contractor_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT NOT NULL REFERENCES demos(id) ON DELETE CASCADE,

  -- Job details
  job_name TEXT NOT NULL,
  job_number TEXT, -- Internal job/work order number
  job_type TEXT NOT NULL, -- 'installation', 'repair', 'maintenance', 'remodel', 'new_construction'
  service_type TEXT, -- Specific service from profile (e.g., "HVAC Installation")

  -- Customer info
  customer_name TEXT,
  customer_address TEXT,
  customer_phone TEXT,
  customer_email TEXT,

  -- Job status
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'qc_pending', 'qc_passed', 'qc_failed', 'completed', 'invoiced'

  -- Dates
  scheduled_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  qc_analyzed_at TIMESTAMPTZ,

  -- Team
  assigned_crew JSONB, -- [{ name, role }]
  lead_technician TEXT,

  -- Financial
  estimated_value NUMERIC,
  final_value NUMERIC,
  invoice_number TEXT,

  -- QC results
  qc_result JSONB, -- Full QCAnalysisResult from agent
  qc_pass_fail TEXT, -- 'pass', 'fail', 'needs_review', null
  qc_confidence NUMERIC, -- 0-1

  -- Photos
  photo_count INTEGER DEFAULT 0,

  -- Notes
  job_notes TEXT,
  customer_notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create job photos table
CREATE TABLE IF NOT EXISTS contractor_job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES contractor_jobs(id) ON DELETE CASCADE,

  -- Photo details
  photo_url TEXT NOT NULL, -- Supabase storage URL
  photo_type TEXT NOT NULL, -- 'before', 'during', 'after', 'defect', 'close_up', 'overview'

  -- Metadata from upload
  file_name TEXT,
  file_size INTEGER, -- bytes
  mime_type TEXT,

  -- Photo context
  description TEXT,
  location_in_job TEXT, -- "Kitchen sink", "Roof northwest corner", etc.

  -- Analysis flags
  analyzed BOOLEAN DEFAULT false,
  defects_detected JSONB, -- [{ defect, severity, confidence }]

  -- Upload info
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Create QC checklists table (templates by job type + industry)
CREATE TABLE IF NOT EXISTS contractor_qc_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT REFERENCES demos(id) ON DELETE CASCADE, -- NULL = system template

  -- Template details
  job_type TEXT NOT NULL,
  service_type TEXT, -- Specific service or NULL for general
  industry TEXT NOT NULL, -- 'HVAC', 'Plumbing', 'Roofing', etc.
  checklist_name TEXT NOT NULL,

  -- Checklist items
  checklist_items JSONB NOT NULL, -- [{ category, item, inspection_method, pass_criteria }]

  -- Common defects to look for
  common_defects JSONB, -- [{ defect_name, severity, visual_indicators }]

  -- Metadata
  is_system_template BOOLEAN DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create QC analysis results table (historical record)
CREATE TABLE IF NOT EXISTS contractor_qc_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES contractor_jobs(id) ON DELETE CASCADE,

  -- Analysis details
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  analyzed_by TEXT, -- user email or 'system'

  -- Photos analyzed
  photo_ids JSONB NOT NULL, -- [photo_id, photo_id, ...]
  photo_count INTEGER NOT NULL,

  -- AI analysis results
  overall_assessment TEXT NOT NULL, -- 'pass', 'fail', 'needs_review'
  confidence_score NUMERIC NOT NULL, -- 0-1

  -- Punch list
  punch_list_items JSONB NOT NULL, -- [{ issue, severity, photo_ref, remediation, confidence }]
  critical_issues_count INTEGER DEFAULT 0,
  minor_issues_count INTEGER DEFAULT 0,

  -- Safety flags
  safety_flags JSONB, -- [{ issue, photo_ref, severity }]

  -- Customer message
  customer_message_template TEXT,

  -- Agent reasoning
  analysis_notes TEXT,

  -- Model used
  ai_model TEXT DEFAULT 'gpt-4o',

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contractor_jobs_demo_id ON contractor_jobs(demo_id);
CREATE INDEX IF NOT EXISTS idx_contractor_jobs_status ON contractor_jobs(demo_id, status);
CREATE INDEX IF NOT EXISTS idx_contractor_jobs_dates ON contractor_jobs(demo_id, scheduled_date, completed_at);
CREATE INDEX IF NOT EXISTS idx_contractor_jobs_qc_pending ON contractor_jobs(demo_id, status) WHERE status = 'qc_pending';

CREATE INDEX IF NOT EXISTS idx_contractor_job_photos_job_id ON contractor_job_photos(job_id);
CREATE INDEX IF NOT EXISTS idx_contractor_job_photos_demo_id ON contractor_job_photos(demo_id);
CREATE INDEX IF NOT EXISTS idx_contractor_job_photos_type ON contractor_job_photos(job_id, photo_type);
CREATE INDEX IF NOT EXISTS idx_contractor_job_photos_analyzed ON contractor_job_photos(analyzed);

CREATE INDEX IF NOT EXISTS idx_contractor_qc_checklists_type ON contractor_qc_checklists(job_type, industry);

CREATE INDEX IF NOT EXISTS idx_contractor_qc_analyses_job_id ON contractor_qc_analyses(job_id);
CREATE INDEX IF NOT EXISTS idx_contractor_qc_analyses_demo_id ON contractor_qc_analyses(demo_id);
CREATE INDEX IF NOT EXISTS idx_contractor_qc_analyses_date ON contractor_qc_analyses(demo_id, analyzed_at DESC);

-- Comments
COMMENT ON TABLE contractor_jobs IS 'Job tracking for contractor businesses - links to QC and photos';
COMMENT ON TABLE contractor_job_photos IS 'Job-site photos for quality control analysis';
COMMENT ON TABLE contractor_qc_checklists IS 'QC inspection checklists by job type and industry';
COMMENT ON TABLE contractor_qc_analyses IS 'Historical QC analysis results with AI-generated punch lists';

-- Row-level security
ALTER TABLE contractor_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_qc_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_qc_analyses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY contractor_jobs_policy ON contractor_jobs
  FOR ALL
  USING (
    demo_id IN (
      SELECT id FROM demos WHERE created_by_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY contractor_job_photos_policy ON contractor_job_photos
  FOR ALL
  USING (
    demo_id IN (
      SELECT id FROM demos WHERE created_by_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY contractor_qc_checklists_policy ON contractor_qc_checklists
  FOR SELECT
  USING (
    is_system_template = true OR
    demo_id IN (
      SELECT id FROM demos WHERE created_by_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY contractor_qc_analyses_policy ON contractor_qc_analyses
  FOR ALL
  USING (
    demo_id IN (
      SELECT id FROM demos WHERE created_by_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Insert system QC checklists

-- HVAC Installation Checklist
INSERT INTO contractor_qc_checklists (job_type, industry, checklist_name, checklist_items, common_defects, is_system_template)
VALUES (
  'installation',
  'HVAC',
  'HVAC Installation Quality Checklist',
  '[
    {"category": "Equipment Placement", "item": "Unit level and properly supported", "inspection_method": "Visual + level check", "pass_criteria": "Unit level within 1/4 inch, secure mounting"},
    {"category": "Equipment Placement", "item": "Adequate clearance for service access", "inspection_method": "Visual measurement", "pass_criteria": "Manufacturer minimum clearances met"},
    {"category": "Refrigerant Lines", "item": "Lines properly insulated", "inspection_method": "Visual inspection", "pass_criteria": "No gaps, tears, or exposed copper"},
    {"category": "Refrigerant Lines", "item": "Line set secured and protected", "inspection_method": "Visual inspection", "pass_criteria": "Strapped every 3-4 feet, no sagging"},
    {"category": "Electrical", "item": "Proper wire gauge and connections", "inspection_method": "Visual + code check", "pass_criteria": "Matches load requirements, tight connections"},
    {"category": "Electrical", "item": "Disconnect installed and accessible", "inspection_method": "Visual inspection", "pass_criteria": "Within sight of unit, properly rated"},
    {"category": "Condensate Drain", "item": "Proper slope and trap installed", "inspection_method": "Visual + water test", "pass_criteria": "1/4 inch per foot slope, trap holds water"},
    {"category": "Condensate Drain", "item": "Termination appropriate", "inspection_method": "Visual inspection", "pass_criteria": "Drains to approved location, no pooling"},
    {"category": "Ductwork", "item": "All joints sealed", "inspection_method": "Visual inspection", "pass_criteria": "Mastic or approved tape on all joints"},
    {"category": "Ductwork", "item": "Proper support and no restrictions", "inspection_method": "Visual inspection", "pass_criteria": "Strapped every 5 feet, no kinks or crimps"},
    {"category": "Thermostat", "item": "Level and properly wired", "inspection_method": "Visual + operational check", "pass_criteria": "Level, correct wire to terminal"},
    {"category": "System Operation", "item": "Refrigerant charge verified", "inspection_method": "Gauge readings", "pass_criteria": "Within manufacturer spec"},
    {"category": "System Operation", "item": "Airflow measured and adequate", "inspection_method": "Measurement", "pass_criteria": "400 CFM per ton ±10%"},
    {"category": "Cleanup", "item": "Work area clean, debris removed", "inspection_method": "Visual inspection", "pass_criteria": "No materials, tools, or trash left"}
  ]'::jsonb,
  '[
    {"defect_name": "Exposed copper refrigerant lines", "severity": "high", "visual_indicators": "Shiny copper visible, missing insulation"},
    {"defect_name": "Sagging or unsecured line set", "severity": "medium", "visual_indicators": "Lines drooping, gaps between straps"},
    {"defect_name": "Improper condensate drain slope", "severity": "high", "visual_indicators": "Drain line level or sloping wrong direction"},
    {"defect_name": "Unit not level", "severity": "medium", "visual_indicators": "Visible tilt, gaps under mounting feet"},
    {"defect_name": "Unsealed duct joints", "severity": "high", "visual_indicators": "Visible gaps at connections, no mastic/tape"},
    {"defect_name": "Inadequate clearances", "severity": "medium", "visual_indicators": "Unit too close to wall/obstruction"},
    {"defect_name": "Loose electrical connections", "severity": "critical", "visual_indicators": "Wires not fully inserted, loose terminals"}
  ]'::jsonb,
  true
);

-- Plumbing Installation Checklist
INSERT INTO contractor_qc_checklists (job_type, industry, checklist_name, checklist_items, common_defects, is_system_template)
VALUES (
  'installation',
  'Plumbing',
  'Plumbing Installation Quality Checklist',
  '[
    {"category": "Fixture Installation", "item": "Fixture level and secure", "inspection_method": "Visual + physical test", "pass_criteria": "Level, no movement when tested"},
    {"category": "Fixture Installation", "item": "Proper mounting and support", "inspection_method": "Visual inspection", "pass_criteria": "Secured to studs or blocking, no flexing"},
    {"category": "Water Supply", "item": "No leaks at connections", "inspection_method": "Water pressure test", "pass_criteria": "No drips or seepage after 15 min"},
    {"category": "Water Supply", "item": "Shutoff valves accessible and functional", "inspection_method": "Visual + operational test", "pass_criteria": "Easy to reach, turns smoothly"},
    {"category": "Drain Lines", "item": "Proper slope maintained", "inspection_method": "Visual inspection", "pass_criteria": "1/4 inch per foot minimum slope"},
    {"category": "Drain Lines", "item": "All joints glued/sealed properly", "inspection_method": "Visual inspection", "pass_criteria": "Even glue coverage, no gaps"},
    {"category": "Drain Lines", "item": "P-trap installed and holding water", "inspection_method": "Water test", "pass_criteria": "Trap full, no sewer gas smell"},
    {"category": "Venting", "item": "Proper vent connection", "inspection_method": "Visual inspection", "pass_criteria": "Vent connected per code"},
    {"category": "Water Heater", "item": "TPR valve with drain line", "inspection_method": "Visual inspection", "pass_criteria": "Installed, drains to safe location"},
    {"category": "Water Heater", "item": "Expansion tank if required", "inspection_method": "Visual inspection", "pass_criteria": "Installed on cold supply if closed system"},
    {"category": "Gas Connections", "item": "Leak test passed", "inspection_method": "Soap bubble or gas sniffer", "pass_criteria": "No leaks detected"},
    {"category": "Cleanup", "item": "Old fixtures removed and area clean", "inspection_method": "Visual inspection", "pass_criteria": "No debris, tools, or old parts left"}
  ]'::jsonb,
  '[
    {"defect_name": "Leaking connection", "severity": "critical", "visual_indicators": "Water dripping, wet surfaces"},
    {"defect_name": "Fixture not level", "severity": "medium", "visual_indicators": "Visible tilt, water pools to one side"},
    {"defect_name": "Improper drain slope", "severity": "high", "visual_indicators": "Standing water in drain line"},
    {"defect_name": "Missing P-trap", "severity": "critical", "visual_indicators": "No trap visible, sewer gas smell"},
    {"defect_name": "Loose fixture mounting", "severity": "high", "visual_indicators": "Fixture moves when tested"},
    {"defect_name": "Missing TPR valve discharge pipe", "severity": "critical", "visual_indicators": "No pipe or pipe too short"}
  ]'::jsonb,
  true
);

-- Roofing Installation Checklist
INSERT INTO contractor_qc_checklists (job_type, industry, checklist_name, checklist_items, common_defects, is_system_template)
VALUES (
  'installation',
  'Roofing',
  'Roofing Installation Quality Checklist',
  '[
    {"category": "Underlayment", "item": "Proper underlayment installed", "inspection_method": "Visual inspection", "pass_criteria": "Full coverage, properly overlapped"},
    {"category": "Shingle Installation", "item": "Proper nail placement and count", "inspection_method": "Visual inspection", "pass_criteria": "4-6 nails per shingle in nailing zone"},
    {"category": "Shingle Installation", "item": "Shingles straight and aligned", "inspection_method": "Visual inspection", "pass_criteria": "Lines straight, consistent exposure"},
    {"category": "Shingle Installation", "item": "Proper overhang at edges", "inspection_method": "Visual measurement", "pass_criteria": "1/2 to 3/4 inch overhang"},
    {"category": "Flashing", "item": "Step flashing at walls/chimneys", "inspection_method": "Visual inspection", "pass_criteria": "Properly overlapped and sealed"},
    {"category": "Flashing", "item": "Drip edge installed", "inspection_method": "Visual inspection", "pass_criteria": "Continuous along eaves and rakes"},
    {"category": "Flashing", "item": "Valley flashing proper", "inspection_method": "Visual inspection", "pass_criteria": "Metal valley or woven/closed cut"},
    {"category": "Ventilation", "item": "Ridge vent continuous", "inspection_method": "Visual inspection", "pass_criteria": "No gaps, properly sealed"},
    {"category": "Ventilation", "item": "Soffit vents clear", "inspection_method": "Visual inspection", "pass_criteria": "Not blocked by insulation"},
    {"category": "Penetrations", "item": "Pipe boots sealed properly", "inspection_method": "Visual inspection", "pass_criteria": "No gaps, proper sealant"},
    {"category": "Cleanup", "item": "Nails and debris removed", "inspection_method": "Visual + magnet sweep", "pass_criteria": "No visible nails or debris"},
    {"category": "Cleanup", "item": "Gutters cleaned", "inspection_method": "Visual inspection", "pass_criteria": "No shingle debris in gutters"}
  ]'::jsonb,
  '[
    {"defect_name": "Missing or improper flashing", "severity": "critical", "visual_indicators": "No flashing visible at chimney/wall"},
    {"defect_name": "Nails exposed or overdriven", "severity": "medium", "visual_indicators": "Nail heads visible, shingles damaged"},
    {"defect_name": "Wavy or crooked shingle lines", "severity": "low", "visual_indicators": "Visible misalignment in rows"},
    {"defect_name": "Inadequate shingle overhang", "severity": "medium", "visual_indicators": "Shingles flush with edge or too long"},
    {"defect_name": "Unsealed pipe boot", "severity": "high", "visual_indicators": "Gaps around pipe penetration"},
    {"defect_name": "No drip edge", "severity": "high", "visual_indicators": "Shingles overhanging without metal edge"}
  ]'::jsonb,
  true
);

-- Create Supabase storage bucket for job photos (via Supabase dashboard or API)
-- This SQL creates a reference, actual bucket created through Supabase UI
COMMENT ON TABLE contractor_job_photos IS 'Photos stored in Supabase storage bucket: contractor-job-photos';

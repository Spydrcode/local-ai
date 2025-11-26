-- Add contractor profile support to demos table
-- This enables the contractor-specific operational copilot features

-- Add contractor_profile column to demos table
ALTER TABLE demos ADD COLUMN IF NOT EXISTS contractor_profile JSONB;

-- Add contractor_mode flag to indicate if this is a contractor business
ALTER TABLE demos ADD COLUMN IF NOT EXISTS contractor_mode BOOLEAN DEFAULT false;

-- Create index for contractor queries
CREATE INDEX IF NOT EXISTS idx_demos_contractor_mode ON demos(contractor_mode) WHERE contractor_mode = true;
CREATE INDEX IF NOT EXISTS idx_demos_contractor_industry ON demos((contractor_profile->>'primary_industry')) WHERE contractor_mode = true;

-- Add comment
COMMENT ON COLUMN demos.contractor_profile IS 'Contractor-specific business profile including industry, services, crew, competitors, KPIs';
COMMENT ON COLUMN demos.contractor_mode IS 'Flag to indicate if this business is using contractor copilot features';

-- contractor_profile structure:
-- {
--   "primary_industry": "HVAC" | "Plumbing" | "Roofing" | "Remodeling" | "Landscaping" | "Propane" | "Other",
--   "service_types": ["Emergency Repair", "Installation", "Maintenance"],
--   "service_area": {
--     "cities": ["Austin", "Round Rock"],
--     "zip_ranges": ["78701-78799"],
--     "radius_miles": 25,
--     "center_location": { "lat": 30.2672, "lng": -97.7431 }
--   },
--   "customer_types": ["residential", "commercial", "industrial", "fleet"],
--   "pricing_model": "flat_rate" | "per_hour" | "estimate_based" | "seasonal",
--   "peak_seasons": ["Summer", "Winter"],
--   "off_seasons": ["Spring", "Fall"],
--   "crew_size": 12,
--   "roles": [
--     { "title": "Installer", "count": 5 },
--     { "title": "Foreman", "count": 2 },
--     { "title": "Technician", "count": 3 }
--   ],
--   "competitors": [
--     { "name": "ABC HVAC", "url": "https://abchvac.com", "excluded": false, "notes": "Main competitor" }
--   ],
--   "lead_sources": ["referrals", "google", "facebook", "nextdoor", "yelp"],
--   "photos": [
--     { "job_id": "job_123", "url": "https://...", "type": "before_after", "uploaded_at": "2025-01-15T10:30:00Z" }
--   ],
--   "kpis": {
--     "leads_per_week": 15,
--     "close_rate": 0.35,
--     "avg_ticket": 850,
--     "time_to_complete_days": 2,
--     "customer_lifetime_value": 2400
--   },
--   "onboarding_completed_at": "2025-01-15T10:30:00Z",
--   "profile_completeness": 0.95
-- }

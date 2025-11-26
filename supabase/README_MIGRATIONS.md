# Supabase Migrations - Contractor Copilot

## Quick Start: Apply All Migrations

**Option 1: Single File (Recommended)**

1. Open Supabase SQL Editor:
   https://supabase.com/dashboard/project/dtegqjoqywlxzsfkurzh/sql/new

2. Copy the entire contents of `APPLY_ALL_CONTRACTOR_MIGRATIONS.sql`

3. Paste into the SQL Editor and click "Run"

4. Verify success - you should see:
   ```
   ✅ All contractor migrations applied successfully!
   📊 Tables created: 16
   🔧 Indexes created: 40+
   ```

**Option 2: Individual Migrations**

Apply migrations one by one in order:

1. `20250120_add_contractor_profile.sql` - Phase 1: Business Profile
2. `20250121_add_lead_tracking.sql` - Phase 2: Lead Pulse
3. `20250122_add_hiring_system.sql` - Phase 3: Hiring
4. `20250123_add_qc_system.sql` - Phase 4: QC Photo Checker
5. `20250124_add_monitoring_alerts.sql` - Phase 6: Monitoring & Alerts
6. `20250125_add_integrations.sql` - Phase 7: Integrations

---

## What Gets Created

### 16 Tables

**Phase 1 (Profile)**
- `demos` (columns: contractor_profile, contractor_mode)

**Phase 2 (Leads)**
- `contractor_leads` - Lead tracking
- `contractor_lead_predictions` - Weekly Lead Pulse predictions
- `contractor_market_signals` - Seasonal/economic signals

**Phase 3 (Hiring)**
- `contractor_job_postings` - Job ads
- `contractor_applicants` - Applicant tracking
- `contractor_onboarding_checklists` - Onboarding templates

**Phase 4 (QC)**
- `contractor_jobs` - Job tracking
- `contractor_job_photos` - Photo uploads
- `contractor_qc_checklists` - Industry-specific QC checklists
- `contractor_qc_analyses` - AI-powered QC results

**Phase 6 (Monitoring)**
- `contractor_alert_configs` - Alert settings per demo
- `contractor_alerts` - Triggered alerts
- `contractor_monitoring_snapshots` - Historical data for trend detection
- `contractor_alert_templates` - Pre-configured alert types

**Phase 7 (Integrations)**
- `contractor_integrations` - Connected systems (ServiceTitan, Jobber, etc.)
- `contractor_sync_logs` - Audit trail of sync operations
- `contractor_data_mappings` - External ID → Internal ID mappings
- `contractor_integration_templates` - Available integrations

---

## Verify Installation

After running migrations, verify in Supabase Table Editor:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'contractor%'
ORDER BY table_name;

-- Should return 16 contractor tables
```

Check templates were inserted:
```sql
SELECT * FROM contractor_alert_templates;
-- Should return 6 alert types

SELECT * FROM contractor_integration_templates;
-- Should return 8 integration types

SELECT * FROM contractor_onboarding_checklists WHERE is_system_template = true;
-- Should return 1+ templates
```

---

## Troubleshooting

### "relation already exists"
Tables are already created. This is safe to ignore if using idempotent SQL (IF NOT EXISTS).

### "permission denied"
Ensure you're using the service role key or running as database admin.

### "function gen_random_uuid() does not exist"
Run: `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`

### RLS errors
Row Level Security policies are permissive by default. Customize them later based on your auth requirements.

---

## Next Steps After Migration

1. **Test Contractor Onboarding**
   - Visit: http://localhost:3000/contractor/onboard?demo_id=YOUR_DEMO_ID
   - Complete 6-step onboarding flow
   - Verify contractor_profile column populated

2. **Configure Integrations**
   - Add OAuth credentials to `.env.local`:
     ```bash
     SERVICETITAN_CLIENT_ID=...
     SERVICETITAN_CLIENT_SECRET=...
     GOOGLE_CLIENT_ID=...
     GOOGLE_CLIENT_SECRET=...
     SERP_API_KEY=...
     ```

3. **Set Up Redis (for BullMQ)**
   ```bash
   # Docker
   docker run -d -p 6379:6379 redis

   # Or install locally
   brew install redis  # macOS
   redis-server
   ```

4. **Start Background Workers**
   ```bash
   # Monitoring alerts (hourly/daily/weekly)
   npm run worker:monitoring

   # Integration sync (hourly/daily)
   npm run worker:integrations
   ```

5. **Test Features**
   - Weekly Lead Pulse
   - QC Photo Checker
   - Alert Settings
   - Integration Panel

---

## Rollback (if needed)

To remove all contractor tables:

```sql
-- WARNING: This deletes all contractor data
DROP TABLE IF EXISTS contractor_data_mappings CASCADE;
DROP TABLE IF EXISTS contractor_sync_logs CASCADE;
DROP TABLE IF EXISTS contractor_integrations CASCADE;
DROP TABLE IF EXISTS contractor_integration_templates CASCADE;
DROP TABLE IF EXISTS contractor_monitoring_snapshots CASCADE;
DROP TABLE IF EXISTS contractor_alerts CASCADE;
DROP TABLE IF EXISTS contractor_alert_configs CASCADE;
DROP TABLE IF EXISTS contractor_alert_templates CASCADE;
DROP TABLE IF EXISTS contractor_qc_analyses CASCADE;
DROP TABLE IF EXISTS contractor_qc_checklists CASCADE;
DROP TABLE IF EXISTS contractor_job_photos CASCADE;
DROP TABLE IF EXISTS contractor_jobs CASCADE;
DROP TABLE IF EXISTS contractor_onboarding_checklists CASCADE;
DROP TABLE IF EXISTS contractor_applicants CASCADE;
DROP TABLE IF EXISTS contractor_job_postings CASCADE;
DROP TABLE IF EXISTS contractor_market_signals CASCADE;
DROP TABLE IF EXISTS contractor_lead_predictions CASCADE;
DROP TABLE IF EXISTS contractor_leads CASCADE;

-- Remove columns from demos
ALTER TABLE demos DROP COLUMN IF EXISTS contractor_profile CASCADE;
ALTER TABLE demos DROP COLUMN IF EXISTS contractor_mode CASCADE;
```

---

## Support

- **Documentation**: See `PHASE_*_SUMMARY.md` files for detailed feature docs
- **Issues**: https://github.com/anthropics/claude-code/issues
- **Supabase Docs**: https://supabase.com/docs

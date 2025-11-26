-- ============================================
-- RUN THIS NOW IN SUPABASE SQL EDITOR
-- ============================================
-- This will remove ALL unnamed/test clients
-- Copy everything below and paste into Supabase SQL Editor
-- ============================================

DELETE FROM demos
WHERE 
    business_name IN ('Unnamed Business', 'Contractor Business')
    OR website_url = 'contractor-setup'
    OR contractor_mode = true;

-- Done! Refresh your agency portal to see the cleanup.

-- Run this in Supabase SQL Editor to see your current data

SELECT 
    id,
    client_id,
    site_url,
    LEFT(summary, 100) as summary_preview,
    contractor_mode,
    created_at
FROM demos
ORDER BY created_at DESC;

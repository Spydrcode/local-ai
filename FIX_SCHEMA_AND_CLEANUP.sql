-- Add business_name column to match API expectations
-- Run this in Supabase SQL Editor

-- Add the missing column
ALTER TABLE demos 
ADD COLUMN IF NOT EXISTS business_name TEXT;

-- Populate it from existing data (extract from summary or use site_url)
UPDATE demos
SET business_name = 
    CASE 
        WHEN client_id LIKE '%diamondback%' THEN 'Diamond Back Propane'
        WHEN client_id LIKE '%contractor%' OR contractor_mode = true THEN 'Contractor Business'
        ELSE 'Unnamed Business'
    END
WHERE business_name IS NULL;

-- Set default and NOT NULL
ALTER TABLE demos ALTER COLUMN business_name SET DEFAULT 'Unnamed Business';
ALTER TABLE demos ALTER COLUMN business_name SET NOT NULL;

-- Now you can delete unnamed/contractor entries:
DELETE FROM demos 
WHERE business_name IN ('Unnamed Business', 'Contractor Business')
   OR client_id = 'contractor-setup'
   OR contractor_mode = true;

-- Check what's left:
SELECT id, business_name, client_id, site_url, created_at
FROM demos
ORDER BY created_at DESC;

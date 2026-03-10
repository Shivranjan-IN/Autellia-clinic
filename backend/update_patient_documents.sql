-- Migration script to update patient_documents table for binary storage
-- Run this script to add new columns for storing files in database

-- Add mime_type column if not exists
ALTER TABLE patient_documents 
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(255);

-- Add file_size column if not exists  
ALTER TABLE patient_documents 
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Drop the old file_url column (no longer needed)
ALTER TABLE patient_documents 
DROP COLUMN IF EXISTS file_url;

-- Make file_data required (you may need to handle existing NULL values first)
-- This will fail if there are existing NULL values - handle those first
-- UPDATE patient_documents SET file_data = '0'::bytea WHERE file_data IS NULL;

ALTER TABLE patient_documents 
ALTER COLUMN file_data SET NOT NULL;

SELECT 'Migration completed successfully' as status;


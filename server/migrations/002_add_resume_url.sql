-- ======================== ADD RESUME URL COLUMN ========================
-- Adds resumeUrl column to job_settings table for storing S3 URLs
-- Run this migration after implementing S3 upload functionality

USE jobautomate;

-- Add resumeUrl column to job_settings table
ALTER TABLE job_settings
ADD COLUMN resume_url TEXT NULL COMMENT 'S3 URL of uploaded resume'
AFTER resume_file_name;

-- Show updated table structure
DESCRIBE job_settings;

-- Verification query
SELECT COUNT(*) as total_records,
       COUNT(resume_url) as records_with_url
FROM job_settings;

COMMIT;

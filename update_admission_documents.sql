-- Update admission_applications table to include new document fields
-- Run this SQL in your MySQL database

USE college_erp_v2;

-- Add new document columns
ALTER TABLE admission_applications
ADD COLUMN document_aadhar VARCHAR(255) AFTER document_path,
ADD COLUMN document_marksheet VARCHAR(255) AFTER document_aadhar,
ADD COLUMN document_leaving VARCHAR(255) AFTER document_marksheet,
ADD COLUMN document_migration VARCHAR(255) AFTER document_leaving,
ADD COLUMN document_entrance_exam VARCHAR(255) AFTER document_migration,
ADD COLUMN document_caste VARCHAR(255) AFTER document_entrance_exam,
ADD COLUMN document_address_proof VARCHAR(255) AFTER document_caste,
ADD COLUMN document_birth_certificate VARCHAR(255) AFTER document_address_proof,
ADD COLUMN document_income_cert VARCHAR(255) AFTER document_birth_certificate,
ADD COLUMN document_gap_cert VARCHAR(255) AFTER document_income_cert;

-- Remove old document_photo column if it exists
-- ALTER TABLE admission_applications DROP COLUMN document_photo;

SELECT 'Migration completed successfully!' as status;

-- Add custom_services column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS custom_services TEXT[] DEFAULT '{}';

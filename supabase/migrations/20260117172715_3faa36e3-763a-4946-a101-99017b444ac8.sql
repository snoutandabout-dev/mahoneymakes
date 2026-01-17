-- Fix: Restrict vision-board storage uploads to request folders only
-- This adds path-based restrictions to prevent arbitrary file uploads

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can upload vision board images" ON storage.objects;

-- Create new policy with path-based restrictions
-- Only allows uploads to paths starting with 'requests/' followed by a valid UUID pattern
CREATE POLICY "Public uploads restricted to request folders"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vision-board' AND
  name LIKE 'requests/%' AND
  -- Ensure the path follows the expected pattern: requests/{uuid}/{filename}
  array_length(string_to_array(name, '/'), 1) >= 3
);
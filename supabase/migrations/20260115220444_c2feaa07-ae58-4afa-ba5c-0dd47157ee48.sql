-- Add image_url column to seasonal_specials table
ALTER TABLE public.seasonal_specials 
ADD COLUMN image_url text;

-- Create storage bucket for seasonal special images
INSERT INTO storage.buckets (id, name, public)
VALUES ('seasonal-specials', 'seasonal-specials', true);

-- Allow public read access to seasonal special images
CREATE POLICY "Anyone can view seasonal special images"
ON storage.objects FOR SELECT
USING (bucket_id = 'seasonal-specials');

-- Allow authenticated users to upload seasonal special images
CREATE POLICY "Authenticated users can upload seasonal special images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'seasonal-specials' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update seasonal special images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'seasonal-specials' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete seasonal special images"
ON storage.objects FOR DELETE
USING (bucket_id = 'seasonal-specials' AND auth.role() = 'authenticated');
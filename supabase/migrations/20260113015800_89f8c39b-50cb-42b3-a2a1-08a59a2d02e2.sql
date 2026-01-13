-- Create storage bucket for vision board images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vision-board', 'vision-board', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to vision-board bucket (for order consultation form)
CREATE POLICY "Anyone can upload vision board images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vision-board');

-- Allow anyone to view vision board images (public bucket)
CREATE POLICY "Anyone can view vision board images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vision-board');

-- Allow authenticated users to delete vision board images they manage
CREATE POLICY "Authenticated users can delete vision board images"
ON storage.objects FOR DELETE
USING (bucket_id = 'vision-board' AND auth.role() = 'authenticated');

-- Update order_vision_images RLS to allow public inserts (for consultation form)
CREATE POLICY "Anyone can insert vision images for orders"
ON public.order_vision_images FOR INSERT
WITH CHECK (true);

-- Allow authenticated users to view all vision images
CREATE POLICY "Authenticated users can view vision images"
ON public.order_vision_images FOR SELECT
USING (auth.role() = 'authenticated');
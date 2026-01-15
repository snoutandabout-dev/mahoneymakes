-- Create table for multiple seasonal special images
CREATE TABLE public.seasonal_special_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  special_id UUID NOT NULL REFERENCES public.seasonal_specials(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.seasonal_special_images ENABLE ROW LEVEL SECURITY;

-- Create policies - images are publicly viewable (for homepage display)
CREATE POLICY "Seasonal special images are publicly viewable"
ON public.seasonal_special_images
FOR SELECT
USING (true);

-- Only authenticated users can insert images
CREATE POLICY "Authenticated users can insert seasonal special images"
ON public.seasonal_special_images
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can update their images
CREATE POLICY "Authenticated users can update seasonal special images"
ON public.seasonal_special_images
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Only authenticated users can delete images
CREATE POLICY "Authenticated users can delete seasonal special images"
ON public.seasonal_special_images
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create index for faster queries
CREATE INDEX idx_seasonal_special_images_special_id ON public.seasonal_special_images(special_id);
CREATE INDEX idx_seasonal_special_images_order ON public.seasonal_special_images(special_id, display_order);
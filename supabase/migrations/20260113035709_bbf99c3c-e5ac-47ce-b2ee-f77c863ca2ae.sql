-- Create order_requests table for public submissions
CREATE TABLE public.order_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  cake_type TEXT NOT NULL,
  event_type TEXT,
  event_date DATE NOT NULL,
  servings INTEGER,
  budget TEXT,
  request_details TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_request_images table for vision board images
CREATE TABLE public.order_request_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.order_requests(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_request_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit order requests (public form)
CREATE POLICY "Anyone can submit order requests"
ON public.order_requests
FOR INSERT
WITH CHECK (true);

-- Allow anyone to insert request images (for the public form)
CREATE POLICY "Anyone can insert request images"
ON public.order_request_images
FOR INSERT
WITH CHECK (true);

-- Allow authenticated users (baker) to view all requests
CREATE POLICY "Authenticated users can view all order requests"
ON public.order_requests
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update request status
CREATE POLICY "Authenticated users can update order requests"
ON public.order_requests
FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to delete requests
CREATE POLICY "Authenticated users can delete order requests"
ON public.order_requests
FOR DELETE
TO authenticated
USING (true);

-- Allow authenticated users to view request images
CREATE POLICY "Authenticated users can view request images"
ON public.order_request_images
FOR SELECT
TO authenticated
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_order_requests_updated_at
BEFORE UPDATE ON public.order_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
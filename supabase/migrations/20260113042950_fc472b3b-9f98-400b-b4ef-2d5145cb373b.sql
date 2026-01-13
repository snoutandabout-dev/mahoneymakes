-- Create rate limit tracking table
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_rate_limits_ip_endpoint ON public.rate_limits (ip_address, endpoint, window_start);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow edge functions to manage rate limits (using service role)
-- No public access policies needed - only accessed via service role in edge function

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_ip_address TEXT,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 3,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
BEGIN
  v_window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get current request count in window
  SELECT COALESCE(SUM(request_count), 0)
  INTO v_current_count
  FROM rate_limits
  WHERE ip_address = p_ip_address
    AND endpoint = p_endpoint
    AND window_start >= v_window_start;
  
  -- Check if limit exceeded
  IF v_current_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Insert new request record
  INSERT INTO rate_limits (ip_address, endpoint, window_start)
  VALUES (p_ip_address, p_endpoint, now());
  
  RETURN TRUE;
END;
$$;

-- Cleanup old rate limit records (call periodically)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < now() - INTERVAL '24 hours';
END;
$$;
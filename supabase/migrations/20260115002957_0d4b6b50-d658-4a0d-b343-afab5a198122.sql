-- Create a settings table for notification configuration
CREATE TABLE public.business_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Create policies - only authenticated users can read/write settings
CREATE POLICY "Authenticated users can view settings" 
ON public.business_settings 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert settings" 
ON public.business_settings 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update settings" 
ON public.business_settings 
FOR UPDATE 
TO authenticated
USING (true);

-- Insert default notification email
INSERT INTO public.business_settings (setting_key, setting_value)
VALUES ('notification_email', 'jhnewsome@gmail.com');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_business_settings_updated_at
BEFORE UPDATE ON public.business_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
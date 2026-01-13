-- Create calendar_events table for reminders and to-dos
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  event_type TEXT NOT NULL DEFAULT 'reminder', -- 'reminder', 'todo', 'note'
  is_completed BOOLEAN DEFAULT false,
  color TEXT DEFAULT 'primary',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policies for team access
CREATE POLICY "Team members can view all calendar events" 
ON public.calendar_events 
FOR SELECT 
USING (true);

CREATE POLICY "Team members can insert calendar events" 
ON public.calendar_events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Team members can update calendar events" 
ON public.calendar_events 
FOR UPDATE 
USING (true);

CREATE POLICY "Team members can delete calendar events" 
ON public.calendar_events 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
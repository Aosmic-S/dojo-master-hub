CREATE TABLE public.academy_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN NOT NULL DEFAULT false,
  audience TEXT NOT NULL DEFAULT 'all',
  location TEXT,
  display_color TEXT NOT NULL DEFAULT 'accent',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_academy_events_event_date ON public.academy_events (event_date);
CREATE INDEX idx_academy_events_audience_event_date ON public.academy_events (audience, event_date);

ALTER TABLE public.academy_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view academy events"
ON public.academy_events
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage academy events"
ON public.academy_events
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_academy_events_updated_at
BEFORE UPDATE ON public.academy_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
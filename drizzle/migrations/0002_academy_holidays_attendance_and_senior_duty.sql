ALTER TABLE public.academy_events
  ADD COLUMN event_type text NOT NULL DEFAULT 'event';

ALTER TABLE public.academy_events
  ADD CONSTRAINT academy_events_event_type_check
  CHECK (event_type IN ('event', 'holiday'));

ALTER TABLE public.announcements
  ADD COLUMN event_id uuid REFERENCES public.academy_events(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX announcements_event_id_unique
  ON public.announcements(event_id)
  WHERE event_id IS NOT NULL;

CREATE UNIQUE INDEX daily_reports_student_date_unique
  ON public.daily_reports(student_id, date);

CREATE TABLE public.senior_duty_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of_month integer NOT NULL CHECK (week_of_month BETWEEN 1 AND 4),
  day_of_week integer NOT NULL CHECK (day_of_week IN (1, 2, 4, 5)),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week_of_month, day_of_week)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.senior_duty_schedule TO authenticated;
GRANT ALL ON public.senior_duty_schedule TO service_role;
ALTER TABLE public.senior_duty_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view senior duty schedule"
ON public.senior_duty_schedule FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage senior duty schedule"
ON public.senior_duty_schedule FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.senior_duties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES public.senior_duty_schedule(id) ON DELETE SET NULL,
  duty_date date NOT NULL,
  assigned_student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  covering_student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cover_requested', 'covered')),
  response_note text,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (duty_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.senior_duties TO authenticated;
GRANT ALL ON public.senior_duties TO service_role;
ALTER TABLE public.senior_duties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage senior duties"
ON public.senior_duties FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Seniors can view relevant duties"
ON public.senior_duties FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = auth.uid()
      AND lower(trim(s.belt_level)) = 'brown 1st kyu'
      AND (s.id = assigned_student_id OR s.id = covering_student_id OR status = 'cover_requested')
  )
);
CREATE POLICY "Assigned seniors can respond"
ON public.senior_duties FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = auth.uid()
      AND lower(trim(s.belt_level)) = 'brown 1st kyu'
      AND s.id = assigned_student_id
      AND status = 'pending'
  )
)
WITH CHECK (
  assigned_student_id = (SELECT s.id FROM public.students s WHERE s.user_id = auth.uid() LIMIT 1)
  AND status IN ('accepted', 'cover_requested')
  AND covering_student_id IS NULL
);
CREATE POLICY "Eligible seniors can cover open duties"
ON public.senior_duties FOR UPDATE TO authenticated
USING (
  status = 'cover_requested'
  AND EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = auth.uid()
      AND lower(trim(s.belt_level)) = 'brown 1st kyu'
      AND s.id <> assigned_student_id
  )
)
WITH CHECK (
  status = 'covered'
  AND covering_student_id = (SELECT s.id FROM public.students s WHERE s.user_id = auth.uid() AND lower(trim(s.belt_level)) = 'brown 1st kyu' LIMIT 1)
);

CREATE OR REPLACE FUNCTION public.validate_senior_duty_student()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.students
    WHERE id = NEW.student_id AND lower(trim(belt_level)) = 'brown 1st kyu'
  ) THEN
    RAISE EXCEPTION 'Senior duty can only be assigned to Brown 1st Kyu students';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_senior_duty_schedule_student
BEFORE INSERT OR UPDATE OF student_id ON public.senior_duty_schedule
FOR EACH ROW EXECUTE FUNCTION public.validate_senior_duty_student();

CREATE OR REPLACE FUNCTION public.validate_senior_duty_members()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.students
    WHERE id = NEW.assigned_student_id AND lower(trim(belt_level)) = 'brown 1st kyu'
  ) THEN
    RAISE EXCEPTION 'Assigned senior must be a Brown 1st Kyu student';
  END IF;
  IF NEW.covering_student_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.students
    WHERE id = NEW.covering_student_id AND lower(trim(belt_level)) = 'brown 1st kyu'
  ) THEN
    RAISE EXCEPTION 'Covering senior must be a Brown 1st Kyu student';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_senior_duty_members
BEFORE INSERT OR UPDATE OF assigned_student_id, covering_student_id ON public.senior_duties
FOR EACH ROW EXECUTE FUNCTION public.validate_senior_duty_members();

CREATE TRIGGER update_senior_duty_schedule_updated_at
BEFORE UPDATE ON public.senior_duty_schedule
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_senior_duties_updated_at
BEFORE UPDATE ON public.senior_duties
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.materialize_senior_duties(_month date DEFAULT CURRENT_DATE)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;
  INSERT INTO public.senior_duties (schedule_id, duty_date, assigned_student_id)
  SELECT schedule.id,
         days.day::date,
         schedule.student_id
  FROM generate_series(
    date_trunc('month', _month)::date,
    (date_trunc('month', _month) + interval '1 month - 1 day')::date,
    interval '1 day'
  ) AS days(day)
  JOIN public.senior_duty_schedule schedule
    ON schedule.day_of_week = extract(isodow FROM days.day)::integer
   AND schedule.week_of_month = ((extract(day FROM days.day)::integer - 1) / 7) + 1
  WHERE ((extract(day FROM days.day)::integer - 1) / 7) + 1 <= 4
  ON CONFLICT (duty_date) DO NOTHING;
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;
GRANT EXECUTE ON FUNCTION public.materialize_senior_duties(date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.materialize_senior_duties(date) TO service_role;
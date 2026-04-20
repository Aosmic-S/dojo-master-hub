-- 1. Add roll_no to students
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS roll_no TEXT UNIQUE;

-- Backfill existing students with BJKA### roll numbers
DO $$
DECLARE
  r RECORD;
  i INT := 1;
BEGIN
  FOR r IN SELECT id FROM public.students WHERE roll_no IS NULL ORDER BY created_at LOOP
    UPDATE public.students SET roll_no = 'BJKA' || LPAD(i::text, 3, '0') WHERE id = r.id;
    i := i + 1;
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_students_roll_no ON public.students(roll_no);

-- 2. student_notes (training journal)
CREATE TABLE public.student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own notes" ON public.student_notes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = student_notes.student_id AND students.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.students WHERE students.id = student_notes.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Admins manage all notes" ON public.student_notes FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_student_notes_updated BEFORE UPDATE ON public.student_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. student_goals
CREATE TABLE public.student_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own goals" ON public.student_goals FOR ALL
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = student_goals.student_id AND students.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.students WHERE students.id = student_goals.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Admins manage all goals" ON public.student_goals FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 4. belt_curriculum (public roadmap)
CREATE TABLE public.belt_curriculum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  belt_level TEXT NOT NULL,
  requirement TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.belt_curriculum ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view curriculum" ON public.belt_curriculum FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "Admins manage curriculum" ON public.belt_curriculum FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 5. technique_library
CREATE TABLE public.technique_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Kata',
  description TEXT,
  video_url TEXT,
  belt_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.technique_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view techniques" ON public.technique_library FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "Admins manage techniques" ON public.technique_library FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 6. event_rsvps
CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  student_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'going',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, student_id)
);
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own rsvps" ON public.event_rsvps FOR ALL
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = event_rsvps.student_id AND students.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.students WHERE students.id = event_rsvps.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Admins view all rsvps" ON public.event_rsvps FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 7. student_messages
CREATE TABLE public.student_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  sender_role TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students see own messages" ON public.student_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = student_messages.student_id AND students.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.students WHERE students.id = student_messages.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Admins manage messages" ON public.student_messages FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 8. student_badges
CREATE TABLE public.student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT DEFAULT 'award',
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own badges" ON public.student_badges FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.students WHERE students.id = student_badges.student_id AND students.user_id = auth.uid()));
CREATE POLICY "Admins manage badges" ON public.student_badges FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
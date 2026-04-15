
-- Gallery photos table
CREATE TABLE public.gallery_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Training',
  alt_text TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view gallery" ON public.gallery_photos FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery" ON public.gallery_photos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Timings table
CREATE TABLE public.timings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_name TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  days TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.timings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view timings" ON public.timings FOR SELECT USING (true);
CREATE POLICY "Admins can manage timings" ON public.timings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fees table
CREATE TABLE public.fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL,
  price TEXT NOT NULL,
  note TEXT DEFAULT '',
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view fees" ON public.fees FOR SELECT USING (true);
CREATE POLICY "Admins can manage fees" ON public.fees FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Academy achievements (public page, not student-specific)
CREATE TABLE public.academy_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  year TEXT NOT NULL,
  icon_type TEXT DEFAULT 'trophy',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.academy_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view academy achievements" ON public.academy_achievements FOR SELECT USING (true);
CREATE POLICY "Admins can manage academy achievements" ON public.academy_achievements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_batch TEXT DEFAULT 'all',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

-- Storage policies for profile-photos
CREATE POLICY "Anyone can view profile photos" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Admins can upload profile photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update profile photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete profile photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-photos' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for gallery
CREATE POLICY "Anyone can view gallery images" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Admins can upload gallery images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update gallery images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete gallery images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

-- Seed default timings
INSERT INTO public.timings (batch_name, time_slot, days, display_order) VALUES
  ('Juniors', '4:00 PM - 5:00 PM', 'Mon - Fri (Wed and Sat OFF)', 1),
  ('Seniors', '5:10 PM - 6:10 PM', 'Mon - Fri (Wed and Sat OFF)', 2);

-- Seed default fees
INSERT INTO public.fees (plan_name, price, note, display_order) VALUES
  ('Registration Fee', '100', 'one time', 1),
  ('Monthly', '500', '', 2);

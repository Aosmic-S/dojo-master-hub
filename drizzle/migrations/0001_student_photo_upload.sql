CREATE POLICY "Students upload own profile photo" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-photos' AND EXISTS (SELECT 1 FROM public.students s WHERE s.user_id = auth.uid() AND split_part(name, '.', 1) = s.id::text));
CREATE POLICY "Students update own profile photo" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-photos' AND EXISTS (SELECT 1 FROM public.students s WHERE s.user_id = auth.uid() AND split_part(name, '.', 1) = s.id::text));

CREATE OR REPLACE FUNCTION public.set_my_profile_photo(_url text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.students SET profile_photo_url = _url WHERE user_id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.set_my_profile_photo(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.set_my_profile_photo(text) TO authenticated;
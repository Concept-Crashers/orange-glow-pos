-- Allow admin-only profile deletion (used by remove staff member server function via service role).
-- Service role already has ALL; this adds an authenticated-admin delete path for safety.
CREATE POLICY "Admins delete staff profiles" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
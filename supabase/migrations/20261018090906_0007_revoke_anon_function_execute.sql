-- Restrict SECURITY DEFINER function execution to authenticated only (not anon).
revoke execute on function public.guard_product_update() from anon;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.is_staff(uuid) from anon;
revoke execute on function public.is_manager(uuid) from anon;
revoke execute on function public.has_role(uuid, app_role) from anon;
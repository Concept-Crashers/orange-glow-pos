alter table public.store_settings add column if not exists primary_color text not null default '#E97817';

create policy "Admins edit staff profiles" on public.profiles for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
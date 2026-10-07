drop policy if exists "Test mode open access" on public.store_settings;
drop policy if exists "Test mode open access" on public.products;
drop policy if exists "Test mode open access" on public.sales;
drop policy if exists "Test mode open access" on public.stock_history;
revoke all on public.store_settings, public.products, public.sales, public.stock_history from anon;

create or replace function public.is_staff(_user_id uuid) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id = _user_id) $$;
create or replace function public.is_manager(_user_id uuid) returns boolean language sql stable security definer set search_path = public as $$ select public.has_role(_user_id, 'manager') or public.has_role(_user_id, 'admin') $$;

create policy "Staff read settings" on public.store_settings for select to authenticated using (public.is_staff(auth.uid()));
create policy "Admins edit settings" on public.store_settings for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Staff read products" on public.products for select to authenticated using (public.is_staff(auth.uid()));
create policy "Managers add products" on public.products for insert to authenticated with check (public.is_manager(auth.uid()));
create policy "Staff update products" on public.products for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "Managers delete products" on public.products for delete to authenticated using (public.is_manager(auth.uid()));

-- Cashiers may only reduce stock (checkout); everything else needs a manager.
create or replace function public.guard_product_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_manager(auth.uid()) then return new; end if;
  if new.stock > old.stock or new.name is distinct from old.name or new.price is distinct from old.price or new.cost is distinct from old.cost
     or new.category is distinct from old.category or new.min_stock is distinct from old.min_stock or new.unit is distinct from old.unit
     or new.sku is distinct from old.sku or new.image is distinct from old.image or new.active is distinct from old.active then
    raise exception 'Only managers can change products or add stock';
  end if;
  return new;
end $$;
create trigger guard_product_update before update on public.products for each row execute function public.guard_product_update();

create policy "Staff read sales" on public.sales for select to authenticated using (public.is_staff(auth.uid()));
create policy "Staff record sales" on public.sales for insert to authenticated with check (public.is_staff(auth.uid()) and refunded = false);
create policy "Managers refund sales" on public.sales for update to authenticated using (public.is_manager(auth.uid())) with check (public.is_manager(auth.uid()));

create policy "Staff read stock history" on public.stock_history for select to authenticated using (public.is_staff(auth.uid()));
create policy "Staff log stock changes" on public.stock_history for insert to authenticated with check (public.is_staff(auth.uid()) and (change < 0 or public.is_manager(auth.uid())));
create table public.store_settings (
  id int primary key default 1 check (id = 1),
  shop_name text not null default 'Fresh Market',
  address text not null default '',
  phone text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (1);

create table public.products (
  id int primary key,
  name text not null,
  category text not null,
  price numeric not null default 0,
  cost numeric not null default 0,
  stock int not null default 0,
  min_stock int not null default 0,
  unit text not null default 'piece',
  sku text not null,
  image text not null default '',
  active boolean not null default true
);
insert into public.products (id, name, category, price, cost, stock, min_stock, unit, sku, image) values
(1,'Fresh bananas','Fruits & vegetables',4500,2800,48,10,'bunch','FRU-001','asset:bananas'),
(2,'Red apples','Fruits & vegetables',8000,5000,32,10,'kg','FRU-002','asset:apples'),
(3,'Orange juice','Beverages',6500,4200,24,8,'500 ml','BEV-001','asset:juice'),
(4,'Fresh whole milk','Dairy & eggs',4000,2600,18,6,'1 litre','DAI-001','asset:milk'),
(5,'Sourdough bread','Bakery',12000,7500,8,10,'loaf','BAK-001','asset:bread'),
(6,'Farm fresh eggs','Dairy & eggs',6000,3800,36,10,'6 pack','DAI-002','asset:eggs'),
(7,'Pure natural honey','Pantry',18000,11500,15,5,'250 g','PAN-001','asset:honey'),
(8,'Fresh avocado','Fruits & vegetables',3500,2000,5,10,'piece','FRU-003','asset:avocado'),
(9,'Roasted coffee beans','Beverages',25000,16000,20,5,'250 g','BEV-002','asset:coffee');

create table public.sales (
  id text primary key,
  created_at timestamptz not null default now(),
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  discount numeric not null default 0,
  total numeric not null default 0,
  payment text not null,
  cashier text not null,
  refunded boolean not null default false
);

create table public.stock_history (
  id uuid primary key default gen_random_uuid(),
  product text not null,
  change int not null,
  reason text not null,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.store_settings, public.products, public.sales, public.stock_history to anon, authenticated;
grant all on public.store_settings, public.products, public.sales, public.stock_history to service_role;
alter table public.store_settings enable row level security;
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.stock_history enable row level security;

-- TEST MODE: open access while the owner tests. Replace with role-based policies before going live.
create policy "Test mode open access" on public.store_settings for all to anon, authenticated using (true) with check (true);
create policy "Test mode open access" on public.products for all to anon, authenticated using (true) with check (true);
create policy "Test mode open access" on public.sales for all to anon, authenticated using (true) with check (true);
create policy "Test mode open access" on public.stock_history for all to anon, authenticated using (true) with check (true);
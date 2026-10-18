alter table public.sales add column if not exists payment_provider text;
alter table public.sales add column if not exists payment_phone text;
alter table public.sales add column if not exists customer text;
-- Discount codes + minimal analytics/reporting functions.

create table if not exists public.discount_codes (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10, 2) not null check (discount_value > 0),
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.discount_codes;
create trigger set_updated_at before update on public.discount_codes
  for each row execute procedure public.set_updated_at();

-- No public read/write policy: customers never query this table directly
-- (codes are validated server-side via the service-role client in the
-- checkout API routes). Admins get access the same way they do on every
-- other table, via the is_admin bypass policy below, so the /admin panel's
-- server actions (which use the regular authenticated client) can manage
-- codes through their own session.
alter table public.discount_codes enable row level security;

drop policy if exists "discount_codes_admin_all" on public.discount_codes;
create policy "discount_codes_admin_all" on public.discount_codes
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

alter table public.orders add column if not exists discount_code text;
alter table public.orders add column if not exists discount_amount numeric(10, 2) not null default 0;

-- ---------------------------------------------------------------------------
-- Reporting functions for the admin dashboard. Revoked from anon/authenticated
-- below so only the service-role client (already gated behind the /admin
-- auth check) can call them — they aggregate revenue data that shouldn't be
-- queryable by an ordinary signed-in customer.
-- ---------------------------------------------------------------------------
create or replace function public.get_daily_revenue(days integer default 30)
returns table(day date, revenue numeric, order_count bigint)
language sql
security definer set search_path = public
as $$
  select
    date_trunc('day', created_at)::date as day,
    coalesce(sum(total), 0) as revenue,
    count(*) as order_count
  from public.orders
  where status = 'paid'
    and created_at >= now() - (days || ' days')::interval
  group by 1
  order by 1;
$$;

create or replace function public.get_top_products(limit_count integer default 5)
returns table(product_id uuid, title text, quantity_sold bigint, revenue numeric)
language sql
security definer set search_path = public
as $$
  select
    oi.product_id,
    oi.title,
    sum(oi.quantity) as quantity_sold,
    sum(oi.quantity * oi.unit_price) as revenue
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.status = 'paid' and oi.product_id is not null
  group by oi.product_id, oi.title
  order by quantity_sold desc
  limit limit_count;
$$;

create or replace function public.get_order_status_counts()
returns table(status text, count bigint)
language sql
security definer set search_path = public
as $$
  select status, count(*) from public.orders group by status;
$$;

revoke execute on function public.get_daily_revenue(integer) from public, anon, authenticated;
revoke execute on function public.get_top_products(integer) from public, anon, authenticated;
revoke execute on function public.get_order_status_counts() from public, anon, authenticated;

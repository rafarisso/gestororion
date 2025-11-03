-- Gestor Órion - Esquema inicial
create table if not exists public.categories (
  id bigserial primary key,
  kind text check (kind in ('income','expense')) not null,
  name text not null,
  unique (kind, name)
);
create table if not exists public.transactions (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  occurred_at date not null,
  kind text check (kind in ('income','expense')) not null,
  amount numeric(12,2) not null,
  category_id bigint references public.categories(id),
  description text,
  payment_method text,
  source text,
  source_ref text,
  meta jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id) on delete set null
);
create index if not exists idx_transactions_date on public.transactions(occurred_at);
create index if not exists idx_transactions_kind on public.transactions(kind);
create or replace view public.daily_summary as
select occurred_at as day,
  sum(case when kind='income' then amount else 0 end) as total_incomes,
  sum(case when kind='expense' then amount else 0 end) as total_expenses,
  sum(case when kind='income' then amount else 0 end) - sum(case when kind='expense' then amount else 0 end) as net_result
from public.transactions group by occurred_at order by occurred_at desc;
alter table public.transactions enable row level security;
alter table public.categories enable row level security;
create policy if not exists trans_select on public.transactions for select using (auth.uid() = user_id);
create policy if not exists trans_insert on public.transactions for insert with check (auth.uid() = user_id);
create policy if not exists trans_update on public.transactions for update using (auth.uid() = user_id);
create policy if not exists trans_delete on public.transactions for delete using (auth.uid() = user_id);
create policy if not exists cat_select on public.categories for select using (true);

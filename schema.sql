-- Gestor Órion - Esquema inicial
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid unique references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role text not null check (role in ('owner','employee')),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);
create index if not exists idx_user_profiles_org on public.user_profiles(organization_id);
create index if not exists idx_user_profiles_owner on public.user_profiles(owner_id);

create table if not exists public.categories (
  id bigserial primary key,
  kind text check (kind in ('income','expense')) not null,
  name text not null,
  organization_id uuid references public.organizations(id) on delete cascade,
  unique (kind, name, organization_id)
);

create table if not exists public.transactions (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
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
select organization_id,
  occurred_at as day,
  sum(case when kind='income' then amount else 0 end) as total_incomes,
  sum(case when kind='expense' then amount else 0 end) as total_expenses,
  sum(case when kind='income' then amount else 0 end) - sum(case when kind='expense' then amount else 0 end) as net_result
from public.transactions
group by organization_id, occurred_at
order by occurred_at desc;
alter table public.organizations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.categories enable row level security;

create policy if not exists org_owner_select on public.organizations
  for select using (exists (
    select 1 from public.user_profiles p
    where p.organization_id = id and p.user_id = auth.uid() and p.role = 'owner'
  ));

create policy if not exists profiles_self_select on public.user_profiles
  for select using (auth.uid() = user_id);

create policy if not exists profiles_owner_select on public.user_profiles
  for select using (auth.uid() = owner_id);

create policy if not exists trans_select_owner on public.transactions
  for select using (auth.uid() = user_id);

create policy if not exists trans_insert_members on public.transactions
  for insert with check (exists (
    select 1 from public.user_profiles p
    where p.user_id = auth.uid()
      and p.owner_id = user_id
      and p.organization_id = organization_id
  ));

create policy if not exists trans_update_owner on public.transactions
  for update using (auth.uid() = user_id);

create policy if not exists trans_delete_owner on public.transactions
  for delete using (auth.uid() = user_id);

create policy if not exists cat_select_members on public.categories
  for select using (exists (
    select 1 from public.user_profiles p
    where p.user_id = auth.uid()
      and p.organization_id = organization_id
  ));

create policy if not exists cat_owner_manage on public.categories
  for insert with check (exists (
    select 1 from public.user_profiles p
    where p.user_id = auth.uid()
      and p.organization_id = organization_id
      and p.role = 'owner'
  ));

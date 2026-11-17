-- SuksesCPNS platform core: profiles, exam history, learning content and payments.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
grant select, update on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Simulasi SKD',
  category text not null default 'SKD',
  total_questions integer not null default 0,
  correct_answers integer not null default 0,
  score integer not null default 0,
  duration_seconds integer not null default 0,
  answers jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now()
);
create index if not exists exam_attempts_user_date_idx on public.exam_attempts(user_id, completed_at desc);
alter table public.exam_attempts enable row level security;
drop policy if exists "Users can read own exam attempts" on public.exam_attempts;
create policy "Users can read own exam attempts" on public.exam_attempts for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can create own exam attempts" on public.exam_attempts;
create policy "Users can create own exam attempts" on public.exam_attempts for insert to authenticated with check (auth.uid() = user_id);
grant select, insert on public.exam_attempts to authenticated;

create table if not exists public.learning_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('TWK','TIU','TKP','PPPK','STRATEGI')),
  summary text not null default '',
  content text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.learning_materials enable row level security;
drop policy if exists "Published materials are readable" on public.learning_materials;
create policy "Published materials are readable" on public.learning_materials for select using (is_published = true);
drop policy if exists "Admins manage materials" on public.learning_materials;
create policy "Admins manage materials" on public.learning_materials for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
grant select on public.learning_materials to anon, authenticated;
grant insert, update, delete on public.learning_materials to authenticated;

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id text not null unique,
  package_id text not null check (package_id in ('premium_monthly','premium_yearly')),
  amount integer not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending','paid','failed','expired','refunded')),
  payment_url text,
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists payment_orders_user_idx on public.payment_orders(user_id, created_at desc);
alter table public.payment_orders enable row level security;
drop policy if exists "Users can read own orders" on public.payment_orders;
create policy "Users can read own orders" on public.payment_orders for select to authenticated using (auth.uid() = user_id);
grant select on public.payment_orders to authenticated;

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id text not null,
  status text not null default 'active' check (status in ('active','expired','canceled')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.user_subscriptions enable row level security;
drop policy if exists "Users can read own subscriptions" on public.user_subscriptions;
create policy "Users can read own subscriptions" on public.user_subscriptions for select to authenticated using (auth.uid() = user_id);
grant select on public.user_subscriptions to authenticated;

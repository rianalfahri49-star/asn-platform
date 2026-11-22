-- Sukses CPNS Admin: email OTP second-factor gate.
-- Review and apply only after the Edge Function is configured with a real email sender.
-- Existing admin-only RLS policies are tightened below. This will require all admin clients
-- (website and mobile) to complete the OTP flow before using admin-only database operations.

create table if not exists public.admin_email_otp_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null,
  code_hash text not null,
  attempts integer not null default 0 check (attempts between 0 and 5),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz
);

create index if not exists admin_email_otp_challenges_lookup_idx
  on public.admin_email_otp_challenges (user_id, session_id, created_at desc);

alter table public.admin_email_otp_challenges enable row level security;
revoke all on public.admin_email_otp_challenges from public, anon, authenticated;
grant all on public.admin_email_otp_challenges to service_role;

create table if not exists public.admin_verified_sessions (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null,
  verified_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (user_id, session_id)
);

alter table public.admin_verified_sessions enable row level security;
revoke all on public.admin_verified_sessions from public, anon, authenticated;
grant all on public.admin_verified_sessions to service_role;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_admin_email_otp_verified()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
    and exists (
      select 1
      from public.admin_verified_sessions s
      where s.user_id = (select auth.uid())
        and s.session_id = ((select auth.jwt() ->> 'session_id')::uuid)
        and s.expires_at > now()
    );
$$;

revoke all on function private.is_admin_email_otp_verified() from public, anon;
grant execute on function private.is_admin_email_otp_verified() to authenticated;

-- Replace admin-only policies with OTP-gated equivalents.
drop policy if exists "Admins can read all exam attempts" on public.exam_attempts;
create policy "Admins can read all exam attempts"
  on public.exam_attempts for select to authenticated
  using (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and (select private.is_admin_email_otp_verified())
  );

drop policy if exists "Admins manage materials" on public.learning_materials;
create policy "Admins manage materials"
  on public.learning_materials for all to authenticated
  using (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and (select private.is_admin_email_otp_verified())
  )
  with check (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and (select private.is_admin_email_otp_verified())
  );

drop policy if exists "Admins can read payment orders" on public.payment_orders;
create policy "Admins can read payment orders"
  on public.payment_orders for select to authenticated
  using (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and (select private.is_admin_email_otp_verified())
  );

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select to authenticated
  using (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and (select private.is_admin_email_otp_verified())
  );

drop policy if exists "Admins can manage questions" on public.questions;
create policy "Admins can manage questions"
  on public.questions for all to authenticated
  using (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and (select private.is_admin_email_otp_verified())
  )
  with check (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and (select private.is_admin_email_otp_verified())
  );

drop policy if exists "Admins can read subscriptions" on public.user_subscriptions;
create policy "Admins can read subscriptions"
  on public.user_subscriptions for select to authenticated
  using (
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and (select private.is_admin_email_otp_verified())
  );

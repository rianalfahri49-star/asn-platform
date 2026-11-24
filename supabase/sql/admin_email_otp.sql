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

-- Serialize OTP issuance per user/session so concurrent requests cannot bypass limits.
create or replace function public.admin_create_email_otp_challenge(
  p_user_id uuid,
  p_session_id uuid,
  p_code_hash text
)
returns table (challenge_id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_now timestamptz := clock_timestamp();
  v_recent_count integer;
  v_latest_created timestamptz;
  v_challenge_id uuid;
  v_expires_at timestamptz := v_now + interval '5 minutes';
begin
  -- Rate-limit across all sessions for this account, not just one login session.
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  select count(*) into v_recent_count
  from public.admin_email_otp_challenges c
  where c.user_id = p_user_id
    and c.created_at >= v_now - interval '15 minutes';

  if v_recent_count >= 5 then
    raise exception 'OTP_RATE_LIMIT';
  end if;

  select c.created_at into v_latest_created
  from public.admin_email_otp_challenges c
  where c.user_id = p_user_id
  order by c.created_at desc
  limit 1;

  if v_latest_created is not null and v_now - v_latest_created < interval '60 seconds' then
    raise exception 'OTP_COOLDOWN';
  end if;

  update public.admin_email_otp_challenges
  set consumed_at = v_now
  where user_id = p_user_id and consumed_at is null;

  insert into public.admin_email_otp_challenges (
    user_id, session_id, code_hash, expires_at
  ) values (
    p_user_id, p_session_id, p_code_hash, v_expires_at
  )
  returning id into v_challenge_id;

  return query select v_challenge_id, v_expires_at;
end;
$function$;

create or replace function public.admin_increment_email_otp_attempt(p_challenge_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_attempts integer;
begin
  update public.admin_email_otp_challenges
  set attempts = attempts + 1
  where id = p_challenge_id
    and consumed_at is null
    and expires_at > now()
    and attempts < 5
  returning attempts into v_attempts;

  return v_attempts;
end;
$function$;

revoke all on function public.admin_create_email_otp_challenge(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.admin_increment_email_otp_attempt(uuid) from public, anon, authenticated;
grant execute on function public.admin_create_email_otp_challenge(uuid, uuid, text) to service_role;
grant execute on function public.admin_increment_email_otp_attempt(uuid) to service_role;

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

-- SECURITY DEFINER RPCs bypass table RLS, so explicitly enforce the OTP session here too.
create or replace function public.get_admin_questions()
returns table (
  id uuid,
  category text,
  topic text,
  question text,
  options jsonb,
  correct_answer text,
  explanation text,
  is_published boolean,
  is_premium boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
begin
  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if not private.is_admin_email_otp_verified() then
    raise exception 'Verified admin session required' using errcode = '42501';
  end if;

  return query
  select q.id, q.category, q.topic, q.question, q.options, q.correct_answer,
         q.explanation, q.is_published, q.is_premium, q.created_at, q.updated_at
  from public.questions q
  order by q.created_at desc;
end;
$function$;


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

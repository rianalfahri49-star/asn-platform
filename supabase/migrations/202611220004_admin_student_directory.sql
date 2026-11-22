-- Admin-only, read-only student directory. Never expose auth.users directly to clients.
create or replace function public.admin_list_students(
  p_search text default '',
  p_limit integer default 30,
  p_offset integer default 0
)
returns table (
  id uuid,
  email text,
  full_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  banned_until timestamptz,
  total_attempts bigint,
  latest_attempt_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_verified boolean;
  v_session_text text;
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  -- If the custom OTP session table has been installed, enforce it here too.
  if to_regclass('public.admin_verified_sessions') is not null then
    v_session_text := auth.jwt() ->> 'session_id';
    if coalesce(v_session_text, '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'Verified admin session required' using errcode = '42501';
    end if;
    execute
      'select exists (select 1 from public.admin_verified_sessions s where s.user_id = $1 and s.session_id = $2::uuid and s.expires_at > now())'
      into v_verified
      using auth.uid(), v_session_text;
    if not coalesce(v_verified, false) then
      raise exception 'Verified admin session required' using errcode = '42501';
    end if;
  end if;

  return query
  select
    u.id,
    u.email::text,
    coalesce(p.full_name, u.raw_user_meta_data ->> 'full_name', '')::text,
    u.created_at,
    u.last_sign_in_at,
    u.banned_until,
    count(ea.id)::bigint,
    max(ea.completed_at)
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join public.exam_attempts ea on ea.user_id = u.id
  where coalesce(u.raw_app_meta_data ->> 'role', '') <> 'admin'
    and (
      coalesce(p_search, '') = ''
      or coalesce(p.full_name, u.raw_user_meta_data ->> 'full_name', '') ilike '%' || p_search || '%'
      or coalesce(u.email, '') ilike '%' || p_search || '%'
    )
  group by u.id, u.email, p.full_name, u.raw_user_meta_data, u.created_at,
           u.last_sign_in_at, u.banned_until
  order by u.created_at desc
  limit greatest(1, least(coalesce(p_limit, 30), 100))
  offset greatest(0, coalesce(p_offset, 0));
end;
$function$;

revoke all on function public.admin_list_students(text, integer, integer) from public, anon;
grant execute on function public.admin_list_students(text, integer, integer) to authenticated;

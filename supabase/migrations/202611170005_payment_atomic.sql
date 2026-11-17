-- Make payment notification processing idempotent and atomic.
create or replace function public.apply_payment_notification(
  p_order_id text,
  p_status text,
  p_payload jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_package_id text;
  v_duration integer;
  v_existing_end timestamptz;
  v_starts_at timestamptz;
begin
  if p_status not in ('paid', 'failed', 'expired') then
    raise exception 'Invalid payment status';
  end if;

  update public.payment_orders
  set status = p_status,
      paid_at = case when p_status = 'paid' then now() else null end,
      provider_payload = coalesce(p_payload, '{}'::jsonb)
  where order_id = p_order_id and status = 'pending'
  returning user_id, package_id into v_user_id, v_package_id;

  if v_user_id is null then
    return false;
  end if;

  if p_status = 'paid' then
    v_duration := case when v_package_id = 'premium_yearly' then 365 else 30 end;
    select max(ends_at) into v_existing_end
    from public.user_subscriptions
    where user_id = v_user_id and status = 'active' and ends_at > now();

    v_starts_at := greatest(coalesce(v_existing_end, now()), now());
    insert into public.user_subscriptions(user_id, package_id, status, starts_at, ends_at)
    values (v_user_id, v_package_id, 'active', v_starts_at, v_starts_at + make_interval(days => v_duration));
  end if;

  return true;
end;
$$;
revoke all on function public.apply_payment_notification(text, text, jsonb) from public;
grant execute on function public.apply_payment_notification(text, text, jsonb) to service_role;

drop policy if exists "Premium questions for active subscribers" on public.questions;
create policy "Premium questions for active subscribers" on public.questions
for select to authenticated using (
  is_published = true and is_premium = true and exists (
    select 1 from public.user_subscriptions s
    where s.user_id = auth.uid() and s.status = 'active'
      and s.starts_at <= now() and s.ends_at > now()
  )
);

drop policy if exists "Premium materials for active subscribers" on public.learning_materials;
create policy "Premium materials for active subscribers" on public.learning_materials
for select to authenticated using (
  is_published = true and is_premium = true and exists (
    select 1 from public.user_subscriptions s
    where s.user_id = auth.uid() and s.status = 'active'
      and s.starts_at <= now() and s.ends_at > now()
  )
);

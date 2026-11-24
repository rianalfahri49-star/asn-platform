-- Optimize auth helper evaluation in RLS policies without changing access semantics.
-- All authorization continues to use auth.uid() and trusted app_metadata claims.

drop policy if exists "Users can read own exam attempts" on public.exam_attempts;
create policy "Users can read own exam attempts" on public.exam_attempts
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Admins can read all exam attempts" on public.exam_attempts;
create policy "Admins can read all exam attempts" on public.exam_attempts
for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins manage materials" on public.learning_materials;
create policy "Admins manage materials" on public.learning_materials
for all to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Premium materials for active subscribers" on public.learning_materials;
create policy "Premium materials for active subscribers" on public.learning_materials
for select to authenticated
using (
  is_published = true and is_premium = true
  and exists (
    select 1 from public.user_subscriptions s
    where s.user_id = (select auth.uid())
      and s.status = 'active'
      and s.starts_at <= now()
      and s.ends_at > now()
  )
);

drop policy if exists "Admins can read payment orders" on public.payment_orders;
create policy "Admins can read payment orders" on public.payment_orders
for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Users can read own orders" on public.payment_orders;
create policy "Users can read own orders" on public.payment_orders
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles" on public.profiles
for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can manage questions" on public.questions;
create policy "Admins can manage questions" on public.questions
for all to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Premium questions for active subscribers" on public.questions;
create policy "Premium questions for active subscribers" on public.questions
for select to authenticated
using (
  is_published = true and is_premium = true
  and exists (
    select 1 from public.user_subscriptions s
    where s.user_id = (select auth.uid())
      and s.status = 'active'
      and s.starts_at <= now()
      and s.ends_at > now()
  )
);

drop policy if exists "Admins can read subscriptions" on public.user_subscriptions;
create policy "Admins can read subscriptions" on public.user_subscriptions
for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Users can read own subscriptions" on public.user_subscriptions;
create policy "Users can read own subscriptions" on public.user_subscriptions
for select to authenticated using ((select auth.uid()) = user_id);

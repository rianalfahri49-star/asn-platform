-- Allow admin operators to review transactions and subscriptions without exposing them publicly.
drop policy if exists "Admins can read payment orders" on public.payment_orders;
create policy "Admins can read payment orders" on public.payment_orders
for select to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins can read subscriptions" on public.user_subscriptions;
create policy "Admins can read subscriptions" on public.user_subscriptions
for select to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

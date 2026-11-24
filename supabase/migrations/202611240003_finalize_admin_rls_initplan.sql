-- Normalize the scalar-subquery form for admin JWT claims in RLS policies.
-- This is idempotent and preserves the trusted app_metadata role check.
drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles" on public.profiles
for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can read all exam attempts" on public.exam_attempts;
create policy "Admins can read all exam attempts" on public.exam_attempts
for select to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can manage questions" on public.questions;
create policy "Admins can manage questions" on public.questions
for all to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

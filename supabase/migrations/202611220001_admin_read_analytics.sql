-- Give authenticated administrators read-only access to aggregate and operational student data.
-- Authorization uses trusted app_metadata, never user-editable user_metadata.
drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles" on public.profiles
for select to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can read all exam attempts" on public.exam_attempts;
create policy "Admins can read all exam attempts" on public.exam_attempts
for select to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

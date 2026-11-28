-- Restrict question administration to authenticated administrators only.
-- The trusted app_metadata claim remains the authorization source.
drop policy if exists "Admins can manage questions" on public.questions;

create policy "Admins can manage questions"
on public.questions
for all
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- SuksesCPNS: premium content access and opt-in public leaderboard.
alter table public.questions add column if not exists is_premium boolean not null default false;
alter table public.learning_materials add column if not exists is_premium boolean not null default false;
alter table public.learning_materials add column if not exists video_url text;

drop policy if exists "Published questions are readable" on public.questions;
drop policy if exists "Published free questions are readable" on public.questions;
create policy "Published free questions are readable" on public.questions
for select using (is_published = true and is_premium = false);
drop policy if exists "Premium questions for active subscribers" on public.questions;
create policy "Premium questions for active subscribers" on public.questions
for select to authenticated using (
  is_published = true and is_premium = true and exists (
    select 1 from public.user_subscriptions s
    where s.user_id = auth.uid() and s.status = 'active' and s.ends_at > now()
  )
);

drop policy if exists "Published materials are readable" on public.learning_materials;
drop policy if exists "Published free materials are readable" on public.learning_materials;
create policy "Published free materials are readable" on public.learning_materials
for select using (is_published = true and is_premium = false);
drop policy if exists "Premium materials for active subscribers" on public.learning_materials;
create policy "Premium materials for active subscribers" on public.learning_materials
for select to authenticated using (
  is_published = true and is_premium = true and exists (
    select 1 from public.user_subscriptions s
    where s.user_id = auth.uid() and s.status = 'active' and s.ends_at > now()
  )
);

alter table public.profiles add column if not exists show_on_leaderboard boolean not null default false;

create or replace function public.get_leaderboard()
returns table(rank_position bigint, display_name text, total_score bigint, completed_exams bigint)
language sql
stable
security definer
set search_path = public
as $$
  select row_number() over (order by sum(e.score) desc, count(e.id) desc) as rank_position,
         coalesce(nullif(p.full_name, ''), 'Peserta SuksesCPNS') as display_name,
         sum(e.score)::bigint as total_score,
         count(e.id)::bigint as completed_exams
  from public.profiles p
  join public.exam_attempts e on e.user_id = p.id
  where p.show_on_leaderboard = true
  group by p.id, p.full_name
  order by total_score desc, completed_exams desc
  limit 100;
$$;
revoke all on function public.get_leaderboard() from public;
grant execute on function public.get_leaderboard() to anon, authenticated;

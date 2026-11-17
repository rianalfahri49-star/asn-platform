-- SuksesCPNS Phase 2: question bank
create extension if not exists pgcrypto;

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('TWK','TIU','TKP')),
  topic text not null default '',
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  explanation text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint questions_options_array check (jsonb_typeof(options) = 'array'),
  constraint questions_correct_answer check (correct_answer in ('A','B','C','D','E'))
);

create index if not exists questions_category_idx on public.questions(category);
create index if not exists questions_published_idx on public.questions(is_published);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists questions_updated_at on public.questions;
create trigger questions_updated_at before update on public.questions
for each row execute function public.set_updated_at();

alter table public.questions enable row level security;

drop policy if exists "Published questions are readable" on public.questions;
create policy "Published questions are readable" on public.questions
for select using (is_published = true);

drop policy if exists "Admins can manage questions" on public.questions;
create policy "Admins can manage questions" on public.questions
for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant select on public.questions to anon, authenticated;
grant insert, update, delete on public.questions to authenticated;

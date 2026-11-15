-- Session 3 migration: optional case-study copy for projects.
-- Run after 00-setup.sql (and the seeds). Run it before you open Admin > Projects. Safe to run twice.
-- Existing RLS policies on public.projects already cover new columns (row-level, not column-level).

alter table public.projects add column if not exists story_en text;
alter table public.projects add column if not exists story_ur text;
alter table public.projects add column if not exists highlights_en text[] not null default '{}';
alter table public.projects add column if not exists highlights_ur text[] not null default '{}';

comment on column public.projects.story_en is 'Case study: short story about the project (plain text, blank line = new paragraph).';
comment on column public.projects.highlights_en is 'Case study: bullet list "What''s inside" (English).';

-- Admin upgrade (Nov 14 2026): editable site text. Run once in the Supabase SQL editor, AFTER 00-setup.sql. Safe to re-run.
-- Appearance (colours, effects, section order) needs no migration: it uses the existing site_settings table.

create table if not exists public.site_copy (
  key        text primary key check (char_length(key) between 3 and 120),
  value_en   text not null default '' check (char_length(value_en) <= 4000),
  value_ur   text not null default '' check (char_length(value_ur) <= 4000),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_site_copy_updated on public.site_copy;
create trigger trg_site_copy_updated before update on public.site_copy
  for each row execute function public.set_updated_at();

alter table public.site_copy enable row level security;
drop policy if exists "public read copy" on public.site_copy;
create policy "public read copy" on public.site_copy
  for select to anon, authenticated using (true);
drop policy if exists "admin all" on public.site_copy;
create policy "admin all" on public.site_copy
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.site_copy to anon;
grant all on public.site_copy to authenticated;
grant all on public.site_copy to service_role;

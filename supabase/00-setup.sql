-- =====================================================================
-- THE PRISM ARC / ABDULLAH KHAN PORTFOLIO: SUPABASE SETUP (contract v1.0)
-- Supabase Dashboard -> SQL Editor -> New query -> paste ALL -> Run.
-- Safe to run more than once (idempotent).
-- Order: 1 tables, 2 triggers, 3 admin helper, 4 RLS + grants, 5 storage, 6 defaults.
-- Afterwards: create your admin user (Authentication -> Users) and run the
-- "MAKE YOURSELF ADMIN" snippet at the bottom.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 0. helpers
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------

-- admins (managed only from the SQL editor, never from the API)
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- site_settings (key/value; public data only, never put secrets here)
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now()
);

-- profile (single row)
create table if not exists public.profile (
  id           uuid primary key default gen_random_uuid(),
  is_visible   boolean not null default true,
  order_index  int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  name         text not null,
  tagline_en   text not null default '',
  tagline_ur   text not null default '',
  bio_en       text not null default '',
  bio_ur       text not null default '',
  photo_url    text,
  photo_layers jsonb
);
create unique index if not exists profile_single_row on public.profile ((true));

-- achievements
create table if not exists public.achievements (
  id             uuid primary key default gen_random_uuid(),
  is_visible     boolean not null default true,
  order_index    int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  title_en       text not null,
  title_ur       text not null,
  description_en text,
  description_ur text,
  year           int check (year is null or year between 1990 and 2100),
  kind           text not null default 'other'
                 check (kind in ('course','certificate','result','work','other')),
  image_url      text,
  proof_url      text
);

-- core_beliefs
create table if not exists public.core_beliefs (
  id          uuid primary key default gen_random_uuid(),
  is_visible  boolean not null default true,
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  text_en     text not null,
  text_ur     text not null
);

-- projects
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  is_visible  boolean not null default true,
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  slug        text not null unique,
  title       text not null,
  tier        int not null default 1 check (tier in (1,2,3)),
  category    text not null default 'client'
              check (category in ('client','hackathon','tool','design-lab')),
  summary_en  text not null default '',
  summary_ur  text not null default '',
  role_en     text,
  role_ur     text,
  stack       text[] not null default '{}',
  live_url    text,
  repo_url    text,
  cover_url   text,
  status      text not null default 'live'
              check (status in ('live','in-progress','archived')),
  is_featured boolean not null default false,
  accent      text not null default 'violet'
              check (accent in ('violet','azure','mint','amber')),
  metrics     jsonb not null default '[]'::jsonb
);

-- project_media
create table if not exists public.project_media (
  id          uuid primary key default gen_random_uuid(),
  is_visible  boolean not null default true,
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  url         text not null,
  kind        text not null default 'desktop'
              check (kind in ('desktop','mobile','video','other')),
  caption_en  text,
  caption_ur  text
);
create index if not exists project_media_project_idx on public.project_media(project_id);

-- marketing_campaigns
create table if not exists public.marketing_campaigns (
  id           uuid primary key default gen_random_uuid(),
  is_visible   boolean not null default true,
  order_index  int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  title        text not null,
  client_label text,
  platform     text not null default 'meta'
               check (platform in ('meta','tiktok','google','linkedin','other')),
  objective_en text not null default '',
  objective_ur text not null default '',
  start_date   date,
  end_date     date,
  spend        numeric,
  currency     text not null default 'PKR',
  results      jsonb not null default '[]'::jsonb,
  notes_en     text,
  notes_ur     text,
  project_id   uuid references public.projects(id) on delete set null
);
create index if not exists marketing_campaigns_project_idx on public.marketing_campaigns(project_id);

-- systems (Systems Map)
create table if not exists public.systems (
  id             uuid primary key default gen_random_uuid(),
  is_visible     boolean not null default true,
  order_index    int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  slug           text not null unique,
  title_en       text not null,
  title_ur       text not null,
  description_en text not null default '',
  description_ur text not null default ''
);

create table if not exists public.system_nodes (
  id             uuid primary key default gen_random_uuid(),
  is_visible     boolean not null default true,
  order_index    int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  system_id      uuid not null references public.systems(id) on delete cascade,
  key            text not null,
  label_en       text not null,
  label_ur       text not null,
  kind           text not null default 'other'
                 check (kind in ('service','db','ai','queue','client','api','other')),
  description_en text,
  description_ur text,
  x              numeric not null default 50 check (x between 0 and 100),
  y              numeric not null default 50 check (y between 0 and 100),
  unique (system_id, key)
);
create index if not exists system_nodes_system_idx on public.system_nodes(system_id);

create table if not exists public.system_edges (
  id          uuid primary key default gen_random_uuid(),
  is_visible  boolean not null default true,
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  system_id   uuid not null references public.systems(id) on delete cascade,
  from_key    text not null,
  to_key      text not null,
  label_en    text,
  label_ur    text
);
create index if not exists system_edges_system_idx on public.system_edges(system_id);

-- services
create table if not exists public.services (
  id             uuid primary key default gen_random_uuid(),
  is_visible     boolean not null default true,
  order_index    int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  title_en       text not null,
  title_ur       text not null,
  audience_en    text not null default '',
  audience_ur    text not null default '',
  includes_en    text[] not null default '{}',
  includes_ur    text[] not null default '{}',
  cta_label_en   text not null default 'Talk about this',
  cta_label_ur   text not null default 'Is par baat karein'
);

-- process_steps (WhatsApp-style process chat)
create table if not exists public.process_steps (
  id          uuid primary key default gen_random_uuid(),
  is_visible  boolean not null default true,
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  sender      text not null default 'abdullah' check (sender in ('abdullah','client')),
  message_en  text not null,
  message_ur  text not null
);

-- niche_templates ("Try your business")
create table if not exists public.niche_templates (
  id           uuid primary key default gen_random_uuid(),
  is_visible   boolean not null default true,
  order_index  int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  key          text not null unique,
  label_en     text not null,
  label_ur     text not null,
  palette      jsonb not null default '{"bg":"#12163A","fg":"#F2F4FF","accent":"#8A5CFF"}'::jsonb,
  headline_en  text not null default '',
  headline_ur  text not null default '',
  sample_items jsonb not null default '[]'::jsonb
);

-- studio_content (The Prism Arc section, single row)
create table if not exists public.studio_content (
  id             uuid primary key default gen_random_uuid(),
  is_visible     boolean not null default true,
  order_index    int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  heading_en     text not null default '',
  heading_ur     text not null default '',
  tagline_en     text not null default '',
  tagline_ur     text not null default '',
  body_en        text not null default '',
  body_ur        text not null default '',
  offers_en      text[] not null default '{}',
  offers_ur      text[] not null default '{}',
  status_note_en text,
  status_note_ur text
);
create unique index if not exists studio_content_single_row on public.studio_content ((true));

-- inquiries (anon can only INSERT)
create table if not exists public.inquiries (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name       text check (name is null or char_length(name) <= 120),
  contact    text not null check (char_length(contact) between 1 and 200),
  message    text not null check (char_length(message) between 1 and 4000),
  niche      text check (niche is null or char_length(niche) <= 80),
  source     text not null default 'form' check (source in ('form','configurator','sparks')),
  status     text not null default 'new' check (status in ('new','contacted','won','lost','spam')),
  notes      text,
  lang       text not null default 'en' check (lang in ('en','ur'))
);
create index if not exists inquiries_created_idx on public.inquiries(created_at desc);
create index if not exists inquiries_status_idx on public.inquiries(status);

-- events (anon can only INSERT)
create table if not exists public.events (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 1 and 80),
  path       text check (path is null or char_length(path) <= 300),
  meta       jsonb
);
create index if not exists events_created_idx on public.events(created_at desc);
create index if not exists events_name_idx on public.events(name);

-- ---------------------------------------------------------------------
-- 2. updated_at TRIGGERS
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'site_settings','profile','achievements','core_beliefs','projects','project_media',
    'marketing_campaigns','systems','system_nodes','system_edges','services',
    'process_steps','niche_templates','studio_content','inquiries'
  ] loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format(
      'create trigger trg_%1$s_updated before update on public.%1$s
         for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

-- 3a. content tables: public reads visible rows, admin does everything
do $$
declare t text;
begin
  foreach t in array array[
    'profile','achievements','core_beliefs','projects','project_media',
    'marketing_campaigns','systems','system_nodes','system_edges','services',
    'process_steps','niche_templates','studio_content'
  ] loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "public read visible" on public.%I', t);
    execute format(
      'create policy "public read visible" on public.%I
         for select to anon, authenticated using (is_visible = true)', t);

    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format(
      'create policy "admin all" on public.%I
         for all to authenticated
         using ((select public.is_admin()))
         with check ((select public.is_admin()))', t);
  end loop;
end $$;

-- 3b. site_settings: public read (public data only), admin write
alter table public.site_settings enable row level security;
drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings
  for select to anon, authenticated using (true);
drop policy if exists "admin all" on public.site_settings;
create policy "admin all" on public.site_settings
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- 3c. admins: a signed-in user may only see their own row; no writes via API
alter table public.admins enable row level security;
drop policy if exists "read own admin row" on public.admins;
create policy "read own admin row" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- 3d. inquiries: anyone can insert a valid NEW row, only admin can read/manage
alter table public.inquiries enable row level security;
drop policy if exists "anyone can insert inquiry" on public.inquiries;
create policy "anyone can insert inquiry" on public.inquiries
  for insert to anon, authenticated
  with check (status = 'new' and notes is null);
drop policy if exists "admin all" on public.inquiries;
create policy "admin all" on public.inquiries
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- 3e. events: anyone can insert, only admin can read/delete
alter table public.events enable row level security;
drop policy if exists "anyone can insert event" on public.events;
create policy "anyone can insert event" on public.events
  for insert to anon, authenticated with check (true);
drop policy if exists "admin all" on public.events;
create policy "admin all" on public.events
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- 3f. explicit grants (RLS above still decides what is allowed)
grant usage on schema public to anon, authenticated, service_role;

grant select on
  public.profile, public.achievements, public.core_beliefs, public.projects,
  public.project_media, public.marketing_campaigns, public.systems,
  public.system_nodes, public.system_edges, public.services, public.process_steps,
  public.niche_templates, public.studio_content, public.site_settings
to anon;

grant insert on public.inquiries, public.events to anon;

grant all on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
-- anon never gets select on inquiries / events / admins (no grant above).

-- ---------------------------------------------------------------------
-- 4. STORAGE: public bucket "media" (images, short videos, PDFs)
--    Public URLs work for everyone; only the admin can upload/list/delete.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 10485760,
  array['image/png','image/jpeg','image/webp','image/avif','video/mp4','video/webm','application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media admin select" on storage.objects;
create policy "media admin select" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

-- ---------------------------------------------------------------------
-- 5. SAFE DEFAULTS (only inserts if missing; no personal numbers or claims)
--    whatsapp_number / linkedin_url / email are left EMPTY on purpose:
--    Abdullah sets them in the admin Settings page.
-- ---------------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('brand_handle',         '"AbdullahKhan_369"'),
  ('github_url',           '"https://github.com/AbdullahKhan369"'),
  ('sparks_enabled',       'false'),
  ('audit_offer_enabled',  'false'),
  ('cleared_stamp_en',     '"Cleared for launch"'),
  ('cleared_stamp_ur',     '"Launch ke liye tayyar"')
on conflict (key) do nothing;

-- =====================================================================
-- DONE. NEXT STEPS (do these by hand, in this order)
-- 1) Authentication -> Providers -> Email: turn OFF "Allow new users to sign up"
--    (after you create your own user), so nobody else can register.
-- 2) Authentication -> Users -> Add user -> your email + a strong password
--    (tick "Auto confirm user").
-- 3) Run the snippet below with YOUR email.
-- =====================================================================

-- MAKE YOURSELF ADMIN  (replace the email, then run just this part)
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'YOUR_EMAIL_HERE'
-- on conflict (user_id) do nothing;

-- CHECKS (optional, run after setup)
-- select tablename, rowsecurity from pg_tables where schemaname = 'public' order by 1;       -- every row should show true
-- select tablename, policyname, cmd, roles from pg_policies where schemaname = 'public' order by 1, 2;
-- select id, public from storage.buckets where id = 'media';
-- select public.is_admin();   -- run while signed in as your admin user in the app, not here (returns false in the editor)

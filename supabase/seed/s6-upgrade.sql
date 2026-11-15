-- Upgrade seed (Nov 14 2026). Run AFTER 00-setup.sql and s1..s5. Safe to re-run.
-- 1) WhatsApp number (overwrites, so the buttons show up)
insert into public.site_settings (key, value) values ('whatsapp_number', '"923112080173"')
on conflict (key) do update set value = excluded.value;

-- 1b) Turn the 3-6-9 hunt on (needs the WhatsApp number above)
insert into public.site_settings (key, value) values ('sparks_enabled', 'true'), ('audit_offer_enabled', 'true')
on conflict (key) do update set value = excluded.value;

-- 2) Live links you gave
update public.projects set live_url = 'https://alley-artificials.vercel.app/' where slug = 'alley-artificials' and live_url is null;

-- 3) New projects. CONFIRM role, stack and status in Admin > Projects: only what is visible on the live sites is written here.
insert into public.projects
  (slug, title, tier, category, summary_en, summary_ur, role_en, role_ur, stack, live_url, repo_url, status, is_featured, accent, order_index, is_visible)
values
  ('rm-japanese-auto-mart', 'RM Japanese Auto Mart', 1, 'client',
   'A listings site for Japanese cars shipped to Ireland, the UK and Pakistan. Visitors search by keyword, make and model, switch the price currency, and sellers can list their own car.',
   'Japanese cars ka listings site jo Ireland, UK aur Pakistan bheji jati hain. Visitors keyword, make aur model se search karte hain, price ki currency badal sakte hain, aur sellers apni car khud list kar sakte hain.',
   'Website', 'Website',
   '{}'::text[], 'https://rm-japanese-auto-mart.vercel.app/', null,
   'live', true, 'amber', 15, true),
  ('snake-game', 'Snake Game', 2, 'design-lab',
   'A browser snake game with a live score, a high score and a timer, on a dark grid.',
   'Browser mein snake game: live score, high score aur timer, dark grid par.',
   'Design and development', 'Design aur development',
   '{}'::text[], 'https://snake-game-vert-gamma.vercel.app/', null,
   'live', false, 'mint', 90, true)
on conflict (slug) do nothing;

-- 4) New short hero headline. Only replaces the old default text, so a headline you wrote yourself is never touched.
update public.site_settings set value = '"I build the site. I run the ads. You get the messages."'::jsonb where key = 'hero_headline_en' and value = '"I build the website and run the ads that fill your WhatsApp."'::jsonb;
update public.site_settings set value = '"Main site banata hoon. Main ads chalata hoon. Aapko messages milte hain."'::jsonb where key = 'hero_headline_ur' and value = '"Main aapki website banata hoon aur woh ads chalata hoon jo aapke WhatsApp ko inquiries se bhar dein."'::jsonb;

-- =============================================================================
-- The Prism Arc: seed/s1.sql  (profile, achievements, site settings)
-- Only facts Abdullah gave (context.md sections 1 and 2). No numbers, clients or awards invented.
-- Every row is editable in the admin. Re-running never overwrites your edits (ON CONFLICT DO NOTHING).
--
-- NOT seeded on purpose:
--   * Core beliefs: Abdullah chooses his own checkpoints in Admin > Core beliefs.
--   * WhatsApp number, LinkedIn, email, domain: add them in Admin > Settings. Until then the
--     public site hides every WhatsApp button and every empty link.
--   * Photo and certificate scans: upload in Admin > Profile / Achievements.
-- =============================================================================

-- Profile (single row) ---------------------------------------------------------
insert into public.profile (id, name, tagline_en, tagline_ur, bio_en, bio_ur, photo_url, photo_layers, order_index)
values (
  '5a1e0000-0000-4000-8000-000000000001',
  'Abdullah Khan',
  'Web developer, digital marketer, designer and brand strategist.',
  'Web developer, digital marketer, designer aur brand strategist.',
  'I build websites, run the ads that bring enquiries to WhatsApp, and design the creative behind both. I work from Karachi, Pakistan, and take on projects for businesses in Pakistan and abroad.',
  'Main websites banata hoon, woh ads chalata hoon jo WhatsApp par inquiries laate hain, aur dono ke peeche ka creative design karta hoon. Main Karachi, Pakistan se kaam karta hoon aur Pakistan ke saath bahir ke businesses ke projects bhi leta hoon.',
  null,
  null,
  0
)
on conflict do nothing;  -- no target: also skips when the single-row index (profile_single_row) already has a row

-- Achievements -------------------------------------------------------------------
-- Years are left empty because they were not given. Add them in the admin if you want them shown.
-- Two rows start hidden until you confirm them (see the comments next to those two rows).
insert into public.achievements
  (id, order_index, is_visible, kind, year, title_en, title_ur, description_en, description_ur)
values
  ('5a1e0000-0000-4000-8000-0000000a0001', 10, true, 'course', null,
   'Eight years of CIT study',
   '8 saal ka CIT course',
   'Started at a young age and stayed with it for eight years.',
   'Chhoti umar mein shuru kiya aur 8 saal tak jaari rakha.'),

  ('5a1e0000-0000-4000-8000-0000000a0002', 20, true, 'result', null,
   'A+ in 9th and Matric',
   '9th aur Matric dono mein A+',
   null,
   null),

  ('5a1e0000-0000-4000-8000-0000000a0003', 30, true, 'other', null,
   'Hafiz-e-Quran',
   'Hafiz-e-Quran',
   'Memorised the Holy Quran.',
   'Quran-e-Pak hifz kiya.'),

  ('5a1e0000-0000-4000-8000-0000000a0004', 40, true, 'course', null,
   'Two more IT courses',
   '2 aur IT courses',
   'Completed after the CIT course.',
   'CIT course ke baad mukammal kiye.'),

  ('5a1e0000-0000-4000-8000-0000000a0005', 50, true, 'course', null,
   'Digital marketing and graphic design courses',
   'Digital marketing aur graphic designing ke courses',
   null,
   null),

  ('5a1e0000-0000-4000-8000-0000000a0006', 60, true, 'work', null,
   'Sales and quality assurance',
   'Sales aur quality assurance',
   'About 13 months handling US customer calls, monitoring and evaluating calls, and reviewing compliance.',
   'Taqreeban 13 mahine US customers ki calls handle kin, calls ki monitoring aur evaluation ki, aur compliance review kiya.'),

  ('5a1e0000-0000-4000-8000-0000000a0007', 70, true, 'work', null,
   'Node.js development',
   'Node.js development',
   null,
   null),

  -- Hidden until confirmed -------------------------------------------------------
  -- App and web course: Abdullah said it "will be completed". Confirm the status, then edit the
  -- text to match ("In progress" or "Completed") and switch it to visible.
  ('5a1e0000-0000-4000-8000-0000000a0008', 80, false, 'course', null,
   'App and web development course',
   'App aur web development ka course',
   null,
   null),

  -- Certificates: three certificates exist. Upload the scans (image field), then switch to visible.
  ('5a1e0000-0000-4000-8000-0000000a0009', 90, false, 'certificate', null,
   'Three certificates',
   'Teen certificates',
   null,
   null)
on conflict (id) do nothing;

-- Site settings (key/value) -----------------------------------------------------
insert into public.site_settings (key, value) values
  ('hero_headline_en', '"I build the site. I run the ads. You get the messages."'),
  ('hero_headline_ur', '"Main site banata hoon. Main ads chalata hoon. Aapko messages milte hain."'),
  ('whatsapp_default_message_en', '"Hi Abdullah, I found your portfolio. I would like to talk about my business."'),
  ('whatsapp_default_message_ur', '"Assalam o Alaikum Abdullah, maine aapka portfolio dekha hai. Mujhe apne business ke baare mein baat karni hai."'),
  ('whatsapp_number', '"923112080173"'),
  ('github_url', '"https://github.com/AbdullahKhan369"'),
  ('brand_handle', '"AbdullahKhan_369"'),
  ('sparks_enabled', 'true'),
  ('audit_offer_enabled', 'true'),
  ('audit_offer_text_en', '"Free website audit"'),
  ('audit_offer_text_ur', '"Free website audit"'),
  ('cleared_stamp_en', '"Cleared for launch"'),
  ('cleared_stamp_ur', '"Launch ke liye clear"')
on conflict (key) do nothing;

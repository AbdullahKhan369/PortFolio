-- Merge seed: projects (the contract gave no session a projects seed; this fills the gap).
-- Only facts from context.md section 3. No numbers, results, client names or testimonials.
-- Live and repo links exist only for TheBaigArts (the only ones Abdullah gave). Add the rest in Admin > Projects,
-- together with screenshots (Projects > media editor) and, if you want them, results (Results = metrics).
-- Status "Live" is the schema default: change it where it is not true (Admin > Projects > Status).
-- Tier 3 starts hidden (GitHub only). Roman Urdu is written by the merge session: please read it once.
-- Idempotent: ON CONFLICT (slug) DO NOTHING, so your edits are never overwritten.

insert into public.projects
  (slug, title, tier, category, summary_en, summary_ur, role_en, role_ur, stack, live_url, repo_url,
   status, is_featured, accent, order_index, is_visible)
values
  ('alley-artificials', 'Alley Artificials', 1, 'client',
   'A store for artificial flowers, jewellery and hampers. Visitors browse without signing up, the owner manages products, categories and sale prices (with percentage off) in an admin panel, and orders reach the owner on WhatsApp. I also ran its marketing: Meta Ads, TikTok promotion, Instagram and Facebook, creatives, AI-assisted product photo enhancement and promo video editing.',
   'Artificial phoolon, jewellery aur hampers ka store. Visitor bina signup ke browse karte hain, malik admin panel se products, categories aur sale prices (percentage off ke saath) sambhalta hai, aur orders malik ko WhatsApp par milte hain. Marketing bhi maine chalayi: Meta Ads, TikTok promotion, Instagram aur Facebook, creatives, AI ki madad se product photos behtar karna aur promo video editing.',
   'Built the site and ran the marketing', 'Site banayi aur marketing chalayi',
   array['React','Vite','Tailwind CSS','Supabase']::text[], null, null,
   'live', true, 'violet', 10, true),

  ('thebaigarts', 'TheBaigArts', 1, 'client',
   'An art gallery and order-request site for the artist Imran Baig. Visitors browse the artwork and send an order request, the artist manages everything from an admin panel, and each request reaches him as a WhatsApp notification. The site has a premium look with polished motion effects.',
   'Artist Imran Baig ki art gallery aur order-request site. Visitors artwork dekhte hain aur order request bhejte hain, artist sab kuch admin panel se sambhalta hai, aur har request unhein WhatsApp notification ki soorat mein milti hai. Site ka look premium hai aur motion effects saaf suthre hain.',
   'Design and development', 'Design aur development',
   array['React','Vite','Tailwind CSS v4','Supabase']::text[],
   'https://thebaigarts.vercel.app/', 'https://github.com/AbdullahKhan369/TheBaigArts',
   'live', true, 'azure', 20, true),

  ('car-preview', 'Car Preview', 1, 'client',
   'Photo sharing for a car business. Drop in a ZIP of photos and get a public link to share. The ZIP is unpacked in the browser, shared photos are deleted automatically by a scheduled job, views are counted, several admins can use it, and the interface is dark.',
   'Car business ke liye photo sharing. Photos ki ZIP daalein aur share karne ke liye public link payein. ZIP browser mein hi khulti hai, shared photos ek scheduled job khud delete kar deti hai, views ginay jate hain, kai admins use kar sakte hain, aur interface dark hai.',
   'Design and development', 'Design aur development',
   array['Next.js','TypeScript','Tailwind CSS','Supabase','fflate','Vercel Cron']::text[], null, null,
   'live', true, 'mint', 30, true),

  ('maintainiq', 'MaintainIQ', 1, 'hackathon',
   'Asset management built for a hackathon. Assets get QR codes, a QR scanner works in the browser, admins and technicians have separate roles, anyone can report a problem with an asset on a public page, and a rule-based classifier sorts the reported issues.',
   'Hackathon ke liye banaya gaya asset management. Assets ke QR codes bante hain, browser mein hi QR scanner chalta hai, admin aur technician ke roles alag hain, koi bhi public page par asset ka masla report kar sakta hai, aur ek rule-based classifier reported issues ko tarteeb deta hai.',
   'Hackathon project', 'Hackathon project',
   array['React','Vite','Tailwind CSS v4','Supabase','React Router','jsQR']::text[], null, null,
   'live', true, 'amber', 40, true),

  ('sak-learning-school', 'S.A.K Learning School', 2, 'design-lab',
   'A rebrand and an animated redesign for S.A.K Learning School, written in plain HTML, CSS and JavaScript.',
   'S.A.K Learning School ke liye rebrand aur animated redesign, seedhe HTML, CSS aur JavaScript mein likha hua.',
   null, null,
   array['HTML','CSS','JavaScript']::text[], null, null,
   'live', false, 'violet', 50, true),

  ('sheri-landing-page', 'Sheri personal-branding page', 2, 'design-lab',
   'A personal-branding landing page for Sheri, an Instagram creator. Dark theme, an animated cursor, glitch effects and a WhatsApp call to action.',
   'Instagram creator Sheri ke liye personal-branding landing page. Dark theme, animated cursor, glitch effects aur WhatsApp call to action.',
   null, null,
   array[]::text[], null, null,
   'live', false, 'azure', 60, true),

  ('cinematic-website-intro', 'Luxury cinematic website intro', 2, 'design-lab',
   'A luxury, cinematic intro for a website, in a single file: a vault-door animation, particles and glassmorphism.',
   'Website ke liye luxury, cinematic intro, ek hi file mein: vault-door animation, particles aur glassmorphism.',
   null, null,
   array[]::text[], null, null,
   'live', false, 'mint', 70, true),

  ('firebase-blog-site', 'Firebase Firestore blog site', 3, 'tool',
   'A blog site built on Firebase Firestore. Practice project.',
   'Firebase Firestore par bani blog site. Practice project.',
   null, null,
   array['Firebase Firestore']::text[], null, null,
   'archived', false, 'amber', 80, false),

  ('express-practice-backend', 'Express practice backend', 3, 'tool',
   'A practice backend with leads, follow-ups and authentication using JWT.',
   'Practice backend jis mein leads, follow-ups aur JWT se authentication hai.',
   null, null,
   array['Node.js','Express','JWT']::text[], null, null,
   'archived', false, 'amber', 90, false),

  ('react-practice-apps', 'React practice apps', 3, 'tool',
   'Practice apps for React: CRUD, JSONPlaceholder and state management.',
   'React ki practice apps: CRUD, JSONPlaceholder aur state management.',
   null, null,
   array['React']::text[], null, null,
   'archived', false, 'amber', 100, false)
on conflict (slug) do nothing;

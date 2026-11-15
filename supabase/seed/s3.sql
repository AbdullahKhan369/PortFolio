-- Session 3 seed: systems, system_nodes, system_edges, niche_templates.
-- Idempotent: re-running does not duplicate rows. Apply after 00-setup.sql.
-- Flows are drawn from the feature lists in context.md (nothing about internals that context.md does not state);
-- confirm each node and arrow in Admin > Systems.
-- No AI node is seeded: add one (kind = ai) only where AI is genuinely used.

insert into public.systems (slug, title_en, title_ur, description_en, description_ur, order_index)
values
  ('mehfil', 'Mehfil: campaign tool', 'Mehfil: campaign tool', 'An internal campaign-management tool I built for WhatsApp outreach. It keeps message packs and contact clusters organised, cleans numbers and runs a campaign queue. Built with Node, Express, whatsapp-web.js and SQLite.', 'WhatsApp outreach ke liye maine yeh andruni campaign-management tool banaya. Is mein message packs aur contact clusters tarteeb se rehte hain, numbers saaf hote hain aur campaign queue chalti hai. Node, Express, whatsapp-web.js aur SQLite se bana hai.', 0),
  ('car-quote', 'Car quote flow', 'Car quote flow', 'A tool that turns a lot number into a ready quote. It fetches the car details and photos, adds my profit margin and sends the quote on WhatsApp. Built with Node, Express and Puppeteer.', 'Yeh tool lot number ko tayyar quote mein badal deta hai. Gaari ki tafseel aur photos laata hai, meri profit margin jorta hai aur quote WhatsApp par bhejta hai. Node, Express aur Puppeteer se bana hai.', 1),
  ('car-preview', 'Car Preview', 'Car Preview', 'Photo sharing for a car business. Photos are dropped in as a ZIP, unzipped in the browser, shared through a public link and deleted automatically by a scheduled job. Built with Next.js, TypeScript, Supabase and fflate.', 'Car business ke liye photo sharing. Photos ZIP ki soorat mein daali jati hain, browser mein khulti hain, public link se share hoti hain aur ek scheduled job unhein khud delete kar deti hai. Next.js, TypeScript, Supabase aur fflate se bana hai.', 2),
  ('order-flows', 'Order flows', 'Order flows', 'How orders reach the owner on the store and gallery sites I built (Alley Artificials and TheBaigArts): customers browse, send an order request, and the owner gets it on WhatsApp. Built with React, Vite and Supabase.', 'Maine jo store aur gallery sites banayi (Alley Artificials aur TheBaigArts) un mein order malik tak kaise pohnchta hai: customer browse karta hai, order request bhejta hai aur malik ko woh WhatsApp par milti hai. React, Vite aur Supabase se bani hain.', 3)
on conflict (slug) do nothing;

insert into public.system_nodes (system_id, key, label_en, label_ur, kind, description_en, description_ur, x, y, order_index)
select s.id, v.key, v.label_en, v.label_ur, v.kind, v.description_en, v.description_ur, v.x, v.y, v.order_index
from (values
  ('mehfil', 'contacts', 'Contact lists', 'Contact lists', 'client', 'The contact numbers that go into the tool.', 'Woh contact numbers jo tool mein jate hain.', 10, 20, 0),
  ('mehfil', 'cleaning', 'Number cleaning', 'Numbers ki safai', 'service', 'Numbers are cleaned before they go into a cluster.', 'Cluster mein jaane se pehle numbers saaf kiye jate hain.', 36, 20, 1),
  ('mehfil', 'clusters', 'Contact clusters', 'Contact clusters', 'db', 'Contacts are grouped into clusters so a campaign reaches the right group.', 'Contacts clusters mein baante jate hain taake campaign sahi group tak pohnche.', 62, 20, 2),
  ('mehfil', 'packs', 'Message packs', 'Message packs', 'db', 'Reusable sets of messages that a campaign can use.', 'Messages ke dobara istemal hone wale set jo campaign use kar sakti hai.', 62, 82, 3),
  ('mehfil', 'queue', 'Campaign queue', 'Campaign queue', 'queue', 'The queue decides what goes out next and keeps a campaign in order.', 'Queue tay karti hai ke agla kya jaye aur campaign ko tarteeb mein rakhti hai.', 62, 51, 4),
  ('mehfil', 'session', 'WhatsApp Web session', 'WhatsApp Web session', 'api', 'whatsapp-web.js connects the tool to a WhatsApp Web session.', 'whatsapp-web.js tool ko WhatsApp Web session se jorta hai.', 90, 51, 5),
  ('mehfil', 'progress', 'Live progress view', 'Live progress view', 'service', 'Server-sent events (SSE) push live updates to the page.', 'Server-sent events (SSE) page ko live updates bhejte hain.', 34, 82, 6),
  ('car-quote', 'lot', 'Lot number', 'Lot number', 'client', 'The only thing typed in: the lot number.', 'Sirf ek cheez likhi jati hai: lot number.', 9, 52, 0),
  ('car-quote', 'listing', 'Auction listing page', 'Auction listing page', 'other', 'The public listing the car details and photos are read from.', 'Woh public listing jahan se gaari ki tafseel aur photos parhi jati hain.', 38, 16, 1),
  ('car-quote', 'fetch', 'Fetch details and photos', 'Tafseel aur photos hasil karna', 'service', 'Puppeteer opens the listing and collects the car details and photos.', 'Puppeteer listing kholta hai aur gaari ki tafseel aur photos jama karta hai.', 38, 60, 2),
  ('car-quote', 'margin', 'Add profit margin', 'Profit margin jorna', 'service', 'My profit margin is added to the price to make the quote.', 'Quote banane ke liye qeemat mein meri profit margin jori jati hai.', 64, 60, 3),
  ('car-quote', 'quote', 'Quote on WhatsApp', 'WhatsApp par quote', 'api', 'The finished quote is sent on WhatsApp.', 'Tayyar quote WhatsApp par bheji jati hai.', 90, 60, 4),
  ('car-preview', 'dealer', 'Car business', 'Car business', 'client', 'Drops a ZIP of car photos into the page.', 'Page par car photos ki ZIP daalta hai.', 9, 25, 0),
  ('car-preview', 'unzip', 'Unzip in the browser', 'Browser mein unzip', 'service', 'fflate unzips the photos on the device, before upload.', 'fflate upload se pehle device par hi photos kholta hai.', 35, 25, 1),
  ('car-preview', 'storage', 'Supabase storage', 'Supabase storage', 'db', 'The photos are stored here.', 'Photos yahan mehfooz hoti hain.', 61, 25, 2),
  ('car-preview', 'link', 'Public share link', 'Public share link', 'service', 'Anyone with the link can view the photos.', 'Link rakhne wala koi bhi photos dekh sakta hai.', 88, 25, 3),
  ('car-preview', 'viewer', 'Viewer', 'Dekhne wala', 'client', 'Opens the link on any device.', 'Link kisi bhi device par kholta hai.', 88, 72, 4),
  ('car-preview', 'counter', 'View counter', 'View counter', 'db', 'Counts how many times a link was viewed.', 'Gintay hai ke link kitni baar dekha gaya.', 61, 72, 5),
  ('car-preview', 'cron', 'Auto-delete job', 'Auto-delete job', 'queue', 'A Vercel cron job removes shared photos automatically.', 'Vercel cron job shared photos khud hata deti hai.', 35, 72, 6),
  ('order-flows', 'visitor', 'Customer', 'Customer', 'client', 'Browses the site without signing up.', 'Bina signup kiye site dekhta hai.', 9, 50, 0),
  ('order-flows', 'catalogue', 'Catalogue', 'Catalogue', 'db', 'Products, categories and prices, stored in Supabase.', 'Products, categories aur qeematein, Supabase mein mehfooz.', 38, 18, 1),
  ('order-flows', 'admin', 'Admin panel', 'Admin panel', 'service', 'The owner manages products, categories and sale prices here.', 'Malik yahan products, categories aur sale prices sambhalta hai.', 68, 18, 2),
  ('order-flows', 'request', 'Order request', 'Order request', 'service', 'The customer sends an order request from the site.', 'Customer site se order request bhejta hai.', 38, 82, 3),
  ('order-flows', 'whatsapp', 'WhatsApp message', 'WhatsApp message', 'api', 'The request reaches the owner as a WhatsApp message.', 'Request malik tak WhatsApp message ki soorat mein pohnchti hai.', 66, 82, 4),
  ('order-flows', 'owner', 'Store owner', 'Store owner', 'client', 'Receives the order and replies to the customer.', 'Order wasool karta hai aur customer ko jawab deta hai.', 91, 50, 5)
) as v(slug, key, label_en, label_ur, kind, description_en, description_ur, x, y, order_index)
join public.systems s on s.slug = v.slug
where not exists (select 1 from public.system_nodes n where n.system_id = s.id and n.key = v.key);

insert into public.system_edges (system_id, from_key, to_key, label_en, label_ur, order_index)
select s.id, v.from_key, v.to_key, v.label_en, v.label_ur, v.order_index
from (values
  ('mehfil', 'contacts', 'cleaning', NULL, NULL, 0),
  ('mehfil', 'cleaning', 'clusters', NULL, NULL, 1),
  ('mehfil', 'clusters', 'queue', NULL, NULL, 2),
  ('mehfil', 'packs', 'queue', NULL, NULL, 3),
  ('mehfil', 'queue', 'session', NULL, NULL, 4),
  ('mehfil', 'queue', 'progress', NULL, NULL, 5),
  ('car-quote', 'lot', 'fetch', NULL, NULL, 0),
  ('car-quote', 'listing', 'fetch', 'details and photos', 'tafseel aur photos', 1),
  ('car-quote', 'fetch', 'margin', NULL, NULL, 2),
  ('car-quote', 'margin', 'quote', NULL, NULL, 3),
  ('car-preview', 'dealer', 'unzip', 'drops ZIP', 'ZIP daalta hai', 0),
  ('car-preview', 'unzip', 'storage', 'uploads', 'upload karta hai', 1),
  ('car-preview', 'storage', 'link', NULL, NULL, 2),
  ('car-preview', 'link', 'viewer', NULL, NULL, 3),
  ('car-preview', 'viewer', 'counter', 'adds a view', 'view jorta hai', 4),
  ('car-preview', 'cron', 'storage', 'deletes', 'delete karti hai', 5),
  ('order-flows', 'visitor', 'catalogue', 'browses', 'dekhta hai', 0),
  ('order-flows', 'admin', 'catalogue', 'manages', 'sambhalta hai', 1),
  ('order-flows', 'visitor', 'request', 'orders', 'order deta hai', 2),
  ('order-flows', 'request', 'whatsapp', NULL, NULL, 3),
  ('order-flows', 'whatsapp', 'owner', NULL, NULL, 4)
) as v(slug, from_key, to_key, label_en, label_ur, order_index)
join public.systems s on s.slug = v.slug
where not exists (select 1 from public.system_edges e where e.system_id = s.id and e.from_key = v.from_key and e.to_key = v.to_key);

-- Sample items have names only. Prices are left out on purpose: add them in Admin > Niche templates if you want them shown.
insert into public.niche_templates (key, label_en, label_ur, palette, headline_en, headline_ur, sample_items, order_index)
values
  ('jewellery', 'Jewellery', 'Jewellery', '{"bg": "#241833", "fg": "#F6EEFF", "accent": "#E3B04B"}'::jsonb, 'Handpicked jewellery, ordered in one tap', 'Chuni hui jewellery, ek tap mein order', '[{"name_en": "Necklace sets", "name_ur": "Necklace sets"}, {"name_en": "Earrings", "name_ur": "Earrings"}, {"name_en": "Bangles", "name_ur": "Churiyan"}, {"name_en": "Bridal sets", "name_ur": "Dulhan sets"}]'::jsonb, 0),
  ('restaurant', 'Restaurant', 'Restaurant', '{"bg": "#FFF1DC", "fg": "#3B1B10", "accent": "#B72C18"}'::jsonb, 'See the menu, order on WhatsApp', 'Menu dekhein, WhatsApp par order karein', '[{"name_en": "Karahi", "name_ur": "Karahi"}, {"name_en": "Biryani", "name_ur": "Biryani"}, {"name_en": "BBQ platters", "name_ur": "BBQ platters"}, {"name_en": "Cold drinks", "name_ur": "Thande mashroobat"}]'::jsonb, 1),
  ('car-dealer', 'Car dealer', 'Car dealer', '{"bg": "#0F1D33", "fg": "#EAF2FF", "accent": "#4DB0FF"}'::jsonb, 'Every car with photos, ready to ask about', 'Har gaari photos ke saath, poochne ke liye tayyar', '[{"name_en": "Sedans", "name_ur": "Sedans"}, {"name_en": "SUVs", "name_ur": "SUVs"}, {"name_en": "Hatchbacks", "name_ur": "Hatchbacks"}, {"name_en": "Imported cars", "name_ur": "Imported gaarian"}]'::jsonb, 2),
  ('real-estate', 'Real estate', 'Real estate', '{"bg": "#EAF2EA", "fg": "#10281B", "accent": "#1F7A52"}'::jsonb, 'Listings you can browse and enquire about', 'Listings dekhein aur maloomat karein', '[{"name_en": "Houses", "name_ur": "Makanat"}, {"name_en": "Apartments", "name_ur": "Apartments"}, {"name_en": "Plots", "name_ur": "Plots"}, {"name_en": "Commercial", "name_ur": "Commercial"}]'::jsonb, 3),
  ('fashion', 'Fashion', 'Fashion', '{"bg": "#F8EAF2", "fg": "#2A1230", "accent": "#A62C73"}'::jsonb, 'The new collection, one tap from your phone', 'Nayi collection, phone se sirf ek tap door', '[{"name_en": "Lawn suits", "name_ur": "Lawn suits"}, {"name_en": "Kurtas", "name_ur": "Kurtas"}, {"name_en": "Abayas", "name_ur": "Abayas"}, {"name_en": "Accessories", "name_ur": "Accessories"}]'::jsonb, 4),
  ('other', 'Something else', 'Kuch aur', '{"bg": "#F2F4FF", "fg": "#12163A", "accent": "#7A4AF0"}'::jsonb, 'Your business, clear and easy to message', 'Aap ka business, saaf aur rabta karna aasan', '[{"name_en": "Your first offer", "name_ur": "Aap ki pehli offer"}, {"name_en": "Your second offer", "name_ur": "Aap ki doosri offer"}, {"name_en": "Your third offer", "name_ur": "Aap ki teesri offer"}]'::jsonb, 5)
on conflict (key) do nothing;

-- Session 2 seed: services + studio_content. Real content only (no prices, no clients, no team).
-- Safe to re-run: each insert only runs when its table is empty. Everything is editable in admin.

insert into public.services
  (title_en, title_ur, audience_en, audience_ur, includes_en, includes_ur, cta_label_en, cta_label_ur, order_index)
select * from (values
  (
    'Business website',
    'Business website',
    'Shops, restaurants, workshops, dealers and personal brands that want customers to find them and message them.',
    'Dukaan, restaurant, workshop, dealer aur personal brands jo chahte hain ke customer unhein dhoondh kar seedha message karein.',
    array['Design and build in React or Next.js, mobile first','WhatsApp buttons for orders and inquiries','An admin panel so you can edit your own content','Supabase backend when the site needs data']::text[],
    array['React ya Next.js mein design aur build, pehle mobile ke liye','Orders aur inquiries ke liye WhatsApp buttons','Admin panel, taake aap apna content khud badal saken','Jahan site ko data chahiye wahan Supabase backend']::text[],
    'Ask about a website',
    'Website ke baare mein poochein',
    1
  ),
  (
    'Online store with WhatsApp orders',
    'WhatsApp orders wala online store',
    'Jewellery, gift, flower, fashion and art sellers who take their orders on WhatsApp.',
    'Jewellery, gift, phool, fashion aur art bechne wale jo orders WhatsApp par lete hain.',
    array['Product pages, categories and sale pricing with percentage off','Public browsing with no signup','Orders sent straight to your WhatsApp','Admin panel for products, categories and prices']::text[],
    array['Product pages, categories aur percentage off wali sale pricing','Bina signup ke sab browse kar saken','Orders seedha aapke WhatsApp par','Products, categories aur prices ke liye admin panel']::text[],
    'Ask about a store',
    'Store ke baare mein poochein',
    2
  ),
  (
    'Ad campaigns',
    'Ad campaigns',
    'Businesses that want more inquiries from Facebook, Instagram and TikTok.',
    'Woh businesses jo Facebook, Instagram aur TikTok se zyada inquiries chahte hain.',
    array['Meta Ads and TikTok Promote setup and management','Ad creatives and short promo videos','Lead generation aimed at WhatsApp messages','Reporting on what the campaign did']::text[],
    array['Meta Ads aur TikTok Promote ka setup aur management','Ad creatives aur chhoti promo videos','Lead generation jiska nishana WhatsApp messages hon','Campaign ne kya kiya, us ki reporting']::text[],
    'Ask about ads',
    'Ads ke baare mein poochein',
    3
  ),
  (
    'Brand and creative',
    'Brand aur creative',
    'New and growing businesses that need to look consistent online.',
    'Naye aur barhte hue businesses jo online ek jaise nazar aana chahte hain.',
    array['Logo and brand visuals','Social media graphics and short video editing in CapCut','AI-assisted product photo enhancement','UI and UX design for your site or app']::text[],
    array['Logo aur brand visuals','Social media graphics aur CapCut mein chhoti video editing','AI ki madad se product photos behtar karna','Aapki site ya app ka UI aur UX design']::text[],
    'Ask about branding',
    'Branding ke baare mein poochein',
    4
  ),
  (
    'Custom tools',
    'Custom tools',
    'Teams that repeat the same manual work every week.',
    'Woh teams jo har hafte wahi haath ka kaam dohrati hain.',
    array['Node and Express tools built around your process','Campaign and contact management, like Mehfil, my own internal tool','Quote and lead handling that ends in a WhatsApp message','Admin screens with separate roles']::text[],
    array['Aapke tareeqe ke mutabiq Node aur Express tools','Campaign aur contact management, jaise Mehfil, meri apni internal tool','Quote aur lead handling jo WhatsApp message par khatam ho','Alag alag roles ke saath admin screens']::text[],
    'Ask about a tool',
    'Tool ke baare mein poochein',
    5
  )
) as v(title_en, title_ur, audience_en, audience_ur, includes_en, includes_ur, cta_label_en, cta_label_ur, order_index)
where not exists (select 1 from public.services);

insert into public.studio_content
  (heading_en, heading_ur, tagline_en, tagline_ur, body_en, body_ur, offers_en, offers_ur, status_note_en, status_note_ur)
select
  'The Prism Arc',
  'The Prism Arc',
  'Where Businesses Evolve',
  'Where Businesses Evolve',
  E'The Prism Arc is my company. It puts three jobs that usually sit with three different people under one roof: building the website, running the ads and designing the visuals.\n\nYou talk to me directly. The person who plans your site is the person who writes the ad, so nothing is lost in a handoff.',
  E'The Prism Arc meri apni company hai. Jo teen kaam aam tor par teen alag logon ke paas hote hain, yaani website banana, ads chalana aur visuals design karna, woh yahan ek hi chhat ke neeche hote hain.\n\nAap seedha mujh se baat karte hain. Jo aapki website plan karta hai wahi ad likhta hai, is liye baat kisi handoff mein kho nahi jaati.',
  array['Websites and web apps','Meta and TikTok ad campaigns','Brand and creative design','Custom tools and automation']::text[],
  array['Websites aur web apps','Meta aur TikTok ad campaigns','Brand aur creative design','Custom tools aur automation']::text[],
  null,
  null
where not exists (select 1 from public.studio_content);

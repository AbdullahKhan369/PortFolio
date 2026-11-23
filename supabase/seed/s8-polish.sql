-- Polish seed (Nov 22 2026). Run in the Supabase SQL editor. Safe to re-run.
-- Every statement only changes a row that still has the OLD wording, so anything you edited yourself is never overwritten.
-- If a line below changes nothing, that text is already different in your database: fix it in Admin instead.

-- 1) Hero headline: the stray full stop after "to" made the headline break in the wrong place.
update public.site_settings
   set value = to_jsonb('From stunning websites. To high-converting ads. I turn attention into action.'::text)
 where key = 'hero_headline_en'
   and (value #>> '{}') ilike 'From Stunning Websites to.%';

-- 2) Achievements: typos (English text only).
update public.achievements
   set title_en = 'Started CIT at the age of eight'
 where title_en = 'Studied CIT at The Age of Eight years';

update public.achievements
   set description_en = 'Started young, and it became my passion.'
 where description_en = 'Started at a young age and Its become my Passion';

update public.achievements
   set description_en = 'Completed after the graphic design and digital marketing courses.'
 where description_en = 'Completed after the GFX and DigiMaketeting course.';

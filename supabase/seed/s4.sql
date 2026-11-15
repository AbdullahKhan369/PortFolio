-- Session 4 seed: process_steps (the WhatsApp-style "How I work" chat).
-- Written as a starting point from the process described in the brief. Edit every line in
-- Admin > Process. Runs only when the table is empty, so re-running it never duplicates rows.
-- Client lines are a written example, not real client messages (the site says so under the chat).

do $seed$
begin
  if not exists (select 1 from public.process_steps) then
    insert into public.process_steps (sender, message_en, message_ur, order_index, is_visible) values
    ('client',
      $q$Hi, I have a business and I want customers to find me on WhatsApp. Where do we start?$q$,
      $q$Assalam o Alaikum, mera ek business hai aur main chahta hoon ke customers mujhe WhatsApp par dhoondein. Shuru kahan se karein?$q$,
      10, true),
    ('abdullah',
      $q$First I want to understand the business: what you sell, who buys it and where your customers are today. A short WhatsApp chat or a voice note is enough.$q$,
      $q$Sab se pehle main aapka business samajhna chahunga: aap kya bechte hain, kaun khareedta hai aur aapke customers aaj kahan hain. Chhoti si WhatsApp chat ya voice note kafi hai.$q$,
      20, true),
    ('client',
      $q$And then?$q$,
      $q$Phir?$q$,
      30, true),
    ('abdullah',
      $q$I write down a simple plan: the pages the website needs, what the ads should say and what I need from you, like photos and prices. You approve it before I start.$q$,
      $q$Main ek seedha sa plan likhta hoon: website ko kaun se pages chahiye, ads mein kya kehna hai aur mujhe aap se kya chahiye, jaise photos aur prices. Kaam shuru karne se pehle aap use manzoor karte hain.$q$,
      40, true),
    ('abdullah',
      $q$Then I build the website. You see a working version early, on your phone, so you can react while it is still easy to change.$q$,
      $q$Phir main website banata hoon. Aap shuru mein hi apne phone par chalta hua version dekhte hain, taake badlav abhi aasani se ho sake.$q$,
      50, true),
    ('client',
      $q$What about the ads?$q$,
      $q$Aur ads ka kya?$q$,
      60, true),
    ('abdullah',
      $q$I set up the ads on Meta or TikTok so people land in your WhatsApp, with the creatives made for them. I report in plain words what the platforms show, for example how many WhatsApp messages came in.$q$,
      $q$Main Meta ya TikTok par ads lagata hoon taake log seedha aapke WhatsApp par aayen, aur unke liye creatives bhi banata hoon. Platforms jo dikhate hain woh saaf alfaaz mein batata hoon, jaise kitne WhatsApp messages aaye.$q$,
      70, true),
    ('abdullah',
      $q$After launch I stay around. I fix what breaks, adjust the ads and keep you updated on WhatsApp.$q$,
      $q$Launch ke baad bhi saath rehta hoon. Jo kharab ho use theek karta hoon, ads mein badlav karta hoon aur WhatsApp par aapko batata rehta hoon.$q$,
      80, true),
    ('client',
      $q$Okay, I'd like to talk about my project.$q$,
      $q$Theek hai, main apne project ke baare mein baat karna chahta hoon.$q$,
      90, true);
  end if;
end
$seed$;

# Prism Arc upgrade v2: final (Nov 14 2026)

## 1. Public site
- **Hero:** glass prism splits white light into 4 rays (violet, azure, mint, amber); scene and rays follow the mouse on desktop. Big gradient headline, 3 role cards (Development, Ads, Creative). No portrait in the hero.
- **Light Spine:** scroll-drawn beam on the left edge, colour shifts through the spectrum (reads your theme colours). Desktop: a tick per section, hover = name, click = glide.
- **Depth:** colour mesh + film grain background, outlined section numbers 01, 02..., scroll reveals below the first screen.
- **Live previews:** every project with a live link shows the real site inside the laptop and phone frames (loads only near the viewport, only on capable devices). Hover a laptop, click "Click to explore" to use the site inside the frame. Screenshots, if added, become the poster.
- **Three Lenses (Dev / Ads / Creative):** Dev always; Ads when a campaign is linked to the project (Admin > Campaigns > Related project); Creative when a project has screens in its media. A lens without data is never shown.
- **3-6-9 hunt:** pulsing sparks, switched on by s6-upgrade.sql.
- **About:** your photo in a spectrum ring (public/abdullah.webp until you upload one in Admin > Profile).
- **Motion:** only 2-core / 2 GB devices get the light version (4-core laptops get full motion).

## 2. Admin panel (new, in addition to the existing 16 pages)
- **Site text** (/abdullah/admin/site-text): every built-in sentence of the site (hero cards, About facts, headings, buttons, footer, errors, legal) in English + Roman Urdu. Search, filter by part of the site, "Use built-in text" to undo one. Empty = built-in text stays.
- **Appearance** (/abdullah/admin/appearance): 5 colours (background + 4 accents), 4 effect switches (Light Spine, grain, cursor prism, intro), home section order + show/hide.
- Already existing and still there: Profile (photo), Achievements, Core beliefs, Services, Studio, Projects (+ live link, screens), Campaigns, Systems, Niche templates, Process chat, Inquiries, Events, SEO, Settings (WhatsApp, headline, links), Media, Backup (now includes site text).

## 3. Contact
WhatsApp +923112080173 (fallback + seed). New projects in the seed: RM Japanese Auto Mart, Snake Game; Alley live link.

## 4. Run it (in this order)
1. `npm install && npm run typecheck && npm run build`
2. Supabase SQL editor: `supabase/seed/s6-upgrade.sql`, then `supabase/seed/s7-admin.sql` (Site text table).
3. Admin > Projects: confirm role, stack and status of RM Japanese Auto Mart and Snake Game.
4. Admin > Appearance / Site text: make it yours. Press "Publish changes" if a save says the public site was not refreshed.

## 5. What was and was not verified
- Checked here: syntax and import resolution of all 209 TS/TSX files, English/Roman Urdu key parity, CSS-module class usage, every admin page is in the menu and every menu item has a page, desktop + mobile screenshots of the new hero and About.
- NOT run (no network in my sandbox): npm install, typecheck against the real libraries, next build, Supabase, the live iframes. Send me any error text from step 1 and I will fix it.
- A cross-origin iframe cannot be scrolled by the page, so a live preview shows the site's first screen and becomes usable after a click. A site that forbids framing would show blank in its frame (your four Vercel sites do not).
- Roman Urdu text was written by me, not read by a native reader: review it in Admin > Site text.

---
# V3: award pass (Nov 14 2026, later), MOBILE FIRST

Everything below was designed for a 390px phone first, then widened, and checked in English and Roman Urdu at 320, 360, 390, 430, 600, 768, 1024, 1280 and 1440px (no horizontal overflow at any of them).

## New
- **Real-time WebGL prism (hero).** White light enters a glass prism and splits into a 16-wavelength spectrum, computed with real refraction (Snell's law) and drawn by a small shader (no library, lib/gl/prism-gl.ts). Phone: drag a finger to tilt the prism; desktop: the mouse does it; scrolling fans the spectrum wider. Runs only while the hero is on screen; phones render at lower resolution. Without WebGL, on low-end devices, with reduced motion or when switched off (Admin > Appearance) the simple SVG prism stays.
- **3-6-9 opening** (Tesla's numbers): 3, 6, 9 flash while a beam crosses, light floods, the page is revealed. About 1.9 s, once per session, skippable (button or Esc).
- **Kinetic headline**: three short lines, each word rises into place. The text is yours to change (Admin > Site text or Settings).
- **Chapters**: the page glow glides to a new colour for each section.
- **Light-orb cursor** (desktop mouse only, never on touch) that swells over links and buttons.
- **Spectrum curtain** when you switch language (replaces the old letter scramble).
- **Marquee** of big outlined words between the hero and the first section.

## Roman Urdu layout fix
- Cause 1: switching language ran a letter-by-letter scramble that changed the text width on every frame, so headings re-wrapped and the whole page jumped. Removed (Morph is plain text now; the curtain hides the change).
- Cause 2: the default Roman Urdu hero sentence was 7 lines on a phone. The default headline is now three short sentences in both languages.
- Hardening: long words break instead of overflowing, grid and flex children can shrink, buttons wrap their text on small screens, display sizes and font stretch are reduced for Roman Urdu, and two small clipping bugs in the Process chat at 320px were fixed.
- I could not reproduce the exact break you saw on a real device. If anything still jumps, send me a screenshot and the width of your phone.

## Admin
- Appearance has two new switches: real-time WebGL prism, and the light-orb cursor / mouse-following prism. The 3-6-9 intro switch already existed.
- s6-upgrade.sql now also replaces the OLD default hero headline with the new short one (it never overwrites a headline you wrote yourself).

## Not verified here
- Real devices, real fonts (my tests used a stand-in font that is wider than yours), npm install, typecheck and next build. WebGL was rendered in headless Chrome (software rendering), so frame rate on real phones is not measured. Real phones with weak GPUs get the SVG fallback only if they report low memory or few cores: if the hero feels heavy, switch the WebGL prism off in Admin > Appearance and tell me the phone model.

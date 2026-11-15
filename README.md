# Abdullah Khan | The Prism Arc: portfolio site

Next.js 15 (App Router, TypeScript), Tailwind CSS v4, framer-motion, Supabase (database, auth, storage), deployed on Vercel.
Everything you see on the public site is edited from the admin panel at `/abdullah/admin`. Nothing (no number, client, result or testimonial) is hard-coded.

Public routes: `/en`, `/ur` (Roman Urdu), `/[lang]/work/[slug]`, `/[lang]/legal`. Admin: `/abdullah/admin`.

---

## 1. Supabase setup (about 20 minutes, free tier)

Run these **in this order**.

1. **Create the project.** supabase.com > New project. Save the database password. Then Project Settings > API: copy the **Project URL**, the **anon public key** and the **service_role key**.
2. **Run the database setup.** SQL Editor > New query > paste the whole file `supabase/00-setup.sql` > Run. It creates every table, the security rules (Row Level Security), the public `media` storage bucket and safe defaults. It is safe to run again.
3. **Create your admin user.** Authentication > Users > Add user > Create new user. Use your email and a strong password (12+ characters) and tick "Auto confirm user".
4. **Turn off sign-ups.** Authentication > Sign In / Providers > Email: switch **off** "Allow new users to sign up". (Nobody can enter the admin without a row in `admins`, but turn it off anyway.) Keep the sign-in rate limits on (Authentication > Rate Limits).
5. **Make yourself admin.** SQL Editor > run, with **your** email:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'YOUR_EMAIL_HERE'
   on conflict (user_id) do nothing;
   ```
6. **Run the seeds**, one file at a time, in this order: `supabase/seed/s1.sql`, `s2.sql`, `s3.sql`, `s4.sql`, `s5.sql` (s5 adds your projects). They only insert when a row is missing, so running them again never overwrites what you edited.
7. **Run the migrations**: every file in `supabase/migrations/` in name order (today: `s3_project_story.sql`, which adds the case-study text fields to projects). Do this **before** you open Admin > Projects.

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the four values:

| Name | Where it is used |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (also needed at build time so images from Supabase load) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only**. Never put it in a `NEXT_PUBLIC_` variable and never commit it |
| `NEXT_PUBLIC_SITE_URL` | your public address with no trailing slash (`http://localhost:3000` while developing) |

## 3. Run it on your computer

```bash
npm install
npm run dev          # http://localhost:3000  (redirects to /en)
npm run typecheck
npm run build        # production build: run this once before deploying
```

Node 20.9 or newer is required.

## 4. Deploy on Vercel

1. Push the project to a GitHub repository (`.env.local` is ignored by git).
2. vercel.com > Add New > Project > import the repository. Framework: Next.js (detected automatically).
3. Settings > Environment Variables: add the same four variables for Production (and Preview if you use it). Set `NEXT_PUBLIC_SITE_URL` to your real address.
4. Deploy. After the first deploy, open `DEPLOY.md` (domain, checks) and `SECURITY-CHECKLIST.md` and tick every box yourself.

## 5. First login

1. Open `https://YOUR-SITE/abdullah/admin`. You are sent to the login page.
2. Sign in with the email and password from step 1.3.
3. The Dashboard lists what is still missing. The address is not linked anywhere and is not in the sitemap or robots.txt. It is only a curtain: the real locks are Supabase Auth, the `admins` table, Row Level Security and the server guard.

Optional: Admin > Settings > **Two-step verification** (authenticator app). Once it is on, the admin pages ask for the 6-digit code at sign-in.

## 6. What you fill in from the admin

Press **Publish changes** (top of the admin) after a long editing session so visitors see it at once.

- **Settings:** WhatsApp number (country code, digits only), LinkedIn link, professional email (leave empty and none is shown), site address, availability text, SEO title and description.
  Until the WhatsApp number is set, every WhatsApp button is hidden. The 3-6-9 sparks game starts **off**: after you add the number, switch on `sparks_enabled` and `audit_offer_enabled` in Settings and write the audit offer text.
- **Profile:** your transparent-background PNG photo. Optional: three separate layer images (Development, Ads, Creative) for the hero split.
- **Achievements:** two rows start hidden until you confirm them: the app and web course (confirm its status first) and the three certificates (upload the scans, then show the row). Add years only where you are sure.
- **Core beliefs:** write your own pre-flight checkpoints (English and Roman Urdu). Until you add some, the button stays hidden.
- **Projects:** upload screenshots (desktop and mobile) in the media editor of each project, set the **Live link** and repo link, and write the case-study text. Set tiers and which projects are featured. Add the real project rows here (Alley Artificials, TheBaigArts, Car Preview, MaintainIQ and the Design Lab items).
- **Campaigns:** add each campaign with its real spend and results. Empty numbers are never shown on the site.
- **Numbers:** every number and metric (project metrics, campaign spend and results) comes only from here. An empty value is not shown at all.
- **Systems, Niche templates, Services, Process, The Prism Arc (studio):** the starting text is a draft written from your project notes. Read every line (including the Roman Urdu) and correct whatever is not exactly true.
- **Inquiries:** messages from the contact form, the "Try your business" tool and the sparks offer arrive here. Change the status, add notes and export CSV.
- **Backup:** download a JSON backup of your content now and then.

## 7. Using the admin from your phone

Bottom bar: Dashboard, two shortcuts, Menu (every page). Lists become cards. Drag the handle to reorder, or use More > Move up / Move down. Photos are shrunk to 2400 px before upload. Files up to 10 MB: PNG, JPG, WebP, AVIF, PDF, MP4, WebM.

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| Login says "not connected to Supabase" | The two `NEXT_PUBLIC_SUPABASE_*` variables are missing. Add them and redeploy. |
| "Email or password is not correct" with the right password | The user is not in `public.admins` (step 1.5), or the email is not confirmed. |
| Admin > Projects fails to save | Run `supabase/migrations/s3_project_story.sql` (step 1.7). |
| Upload refused | Run `00-setup.sql`, and check you are in `admins`. Files must be under 10 MB. |
| Public site shows old content | Press **Publish changes**. |
| Images do not load on the public site | `NEXT_PUBLIC_SUPABASE_URL` must be set at build time. |
| Build complains about `global-not-found` | Delete `globalNotFound: true` from `next.config.ts` and rename `app/global-not-found.tsx` to `app/not-found.tsx`. |

## 9. Project layout

```
app/[lang]/(site)/page.tsx   home: Hero, Achievements, Projects, Marketing, Systems, Services, Process, Try, Studio, About, Contact
app/[lang]/work/[slug]       case studies          app/[lang]/legal   privacy page
app/abdullah/admin/**        private admin         app/api/**         inquiries, events, revalidate
components/                  sections, ui, admin kit, sparks, work, systems, tryit ...
lib/                         content (data layer), i18n, supabase, seo, api
supabase/                    00-setup.sql, seed/s1..s4.sql, migrations/
```
Other documents: `DEPLOY.md`, `SECURITY-CHECKLIST.md`, `OUTREACH.md`, `MERGE-REPORT.md`.

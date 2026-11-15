# Deploy guide: Vercel + Supabase (production)

Follow the steps in order. Total time: about 45 minutes. Nothing here needs a paid plan.

## 1. Before you start

- A GitHub account (`AbdullahKhan369`), a Vercel account, a Supabase account.
- The project builds locally: `npm install && npm run build` finishes without errors.
- Your contact details ready (WhatsApp number with country code, LinkedIn URL, email if you have one).
- Optional: a domain name.

## 2. Create the Supabase project

1. supabase.com, New project. Pick the region closest to your visitors (for Pakistan and UAE, a Singapore or Frankfurt region is usually fastest; choose one and keep it).
2. Save the database password in a password manager.
3. Settings, API: copy **Project URL**, **anon public key** and **service_role key**. The service_role key is a secret: it never goes into the browser or into Git.

## 3. Run the SQL in order

SQL Editor, new query, paste and run each file **in this order**:

1. `supabase/00-setup.sql` (tables, security rules, storage bucket, safe defaults)
2. `supabase/seed/s1.sql`, `s2.sql`, `s3.sql`, `s4.sql`, `s5.sql`
3. Everything in `supabase/migrations/` in file-name order

If a file errors, stop and fix it before the next one. Seed files only fill empty tables, so re-running them is safe.

## 4. Create the admin user

1. Authentication, Users, Add user: your email and a long unique password (16+ characters). Tick "Auto confirm".
2. Copy the user's UUID.
3. SQL Editor:
   ```sql
   insert into public.admins (user_id) values ('PASTE-UUID-HERE');
   ```
4. Authentication, Providers, Email: **turn off "Allow new users to sign up"**. This is the single most important setting: it stops anyone else from creating an account.
5. Authentication, URL Configuration: Site URL is your final address, for example `https://yourdomain.com`. Add `http://localhost:3000` only while developing, and remove it later.
6. Optional but recommended: enrol TOTP two-factor in the admin area once it is available.

## 5. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/AbdullahKhan369/prismarc-site.git
git push -u origin main
```

Make the repository **private**. `.env.local` must be in `.gitignore` (it is). Never commit keys.

## 6. Deploy on Vercel

1. Vercel, Add New, Project, import the repository. Framework: Next.js (detected).
2. Environment Variables (Production **and** Preview):

   | Name | Value | Visible to browser? |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL | yes |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | yes |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key | **no, server only** |
   | `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` (no trailing slash) | yes |

3. Deploy. If the build fails, read the first red error; it is almost always a missing variable or a type error.

## 7. Domain

1. Vercel, Settings, Domains, add your domain and follow the DNS instructions at your registrar.
2. Wait for the certificate (usually minutes). Then set `NEXT_PUBLIC_SITE_URL` to the final address and **redeploy**, so canonical links, the sitemap and social previews use it.
3. Update Supabase Authentication, URL Configuration to the same address.

## 8. First login and content

1. Open `/abdullah/admin` (the address is private; do not link it anywhere). Log in.
2. **Settings**: WhatsApp number with country code and no spaces or plus sign problems (for example `923001234567`), LinkedIn, GitHub, email (leave empty if none), availability text, sparks on or off, audit offer text.
3. **Profile**: upload the transparent-background photo.
4. **Achievements**: add your real milestones and certificate scans.
5. **Projects, Campaigns, Systems, Services, Process**: review every seeded line. Fill numbers only if they are real; empty numbers are never shown.
6. **SEO**: set title and description for English and Roman Urdu.
7. Press **Publish changes** so the public site refreshes.

## 9. Check production

- Open `/en` and `/ur`. Switch language. Check the hero on a real phone.
- Send a test message through Contact, then open Admin, Inquiries and confirm it arrived. Delete the test.
- Click each WhatsApp button: it must open WhatsApp with your message prefilled.
- Every "Live link" opens in a new tab.
- `/sitemap.xml` lists only `/en`, `/ur`, legal and case studies. `/robots.txt` does **not** mention the admin path.
- View source of the home page: `<html lang="en">` on `/en`, `lang="ur-Latn"` on `/ur`; `hreflang` links present.
- Paste your link into the WhatsApp or LinkedIn link preview to see the social card.
- Run Lighthouse in Chrome (mobile). Aim for LCP under 2.5 s.
- Run every query in `SECURITY-CHECKLIST.md`.

## 10. Search engines

- Google Search Console: add the domain property, verify through DNS, submit `https://yourdomain.com/sitemap.xml`.
- Bing Webmaster Tools: import from Search Console.
- Google Business Profile is a separate, free listing that helps local searches; set it up if clients search for you by name and city.

## 11. Updating later

- Content changes: Admin, then **Publish changes**. No redeploy needed.
- Code changes: push to `main`; Vercel deploys. Test on the Preview URL of a branch first.
- Take a **Backup** download (Admin, Backup) before any big edit or SQL change.

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Admin login loops back | Site URL in Supabase differs from the real address | Fix Authentication, URL Configuration |
| "Could not save" in admin | Your user is not in `admins` | Run the insert in step 4 |
| Contact form says not saved | `SUPABASE_SERVICE_ROLE_KEY` missing, or `00-setup.sql` not run | Check variables, re-run `00-setup.sql` |
| Links point to localhost | `NEXT_PUBLIC_SITE_URL` not set | Set it and redeploy |
| Images 404 | `00-setup.sql` not run or file not uploaded | Run it; upload through Admin, Media |
| Public site shows old content | Cache not refreshed | Press **Publish changes** |
| Sparks bar never appears | Settings: sparks off, or no WhatsApp number | Turn on, add the number |

## 13. Costs

Vercel Hobby and Supabase Free are enough to start. Free Supabase projects pause after a week without activity; a visit or a scheduled ping wakes them, but check the dashboard before sending the link to a client. Move to a paid plan when the portfolio matters for income.

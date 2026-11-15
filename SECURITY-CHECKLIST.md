# Security checklist and test queries

Run this after the first deploy and after every change to `supabase/00-setup.sql`. Mark each box only when you saw the expected result yourself.

## How to test

You need two ways to talk to the database:

- **As a visitor (anon).** Use the REST API with only the anon key. Replace `URL` and `ANON` with your values.
  ```bash
  URL=https://YOUR-PROJECT.supabase.co
  ANON=your-anon-key
  curl -s "$URL/rest/v1/TABLE?select=*" -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
  ```
- **As admin.** Log in to the site, or use the SQL Editor (it runs as the owner and bypasses RLS, so do **not** use it for anon tests).

Expected for a blocked read: an empty list `[]` or an error such as `permission denied`. Expected for a blocked write: HTTP 401/403 or `new row violates row-level security policy`.

Insert test shape:
```bash
curl -s -X POST "$URL/rest/v1/TABLE" -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" -H "Prefer: return=minimal" -d '{"...":"..."}'
```

## 1. RLS is on everywhere

SQL Editor:
```sql
select tablename, rowsecurity from pg_tables where schemaname = 'public' order by 1;
```
- [ ] `rowsecurity` is `true` for every row.

```sql
select tablename, policyname, cmd, roles from pg_policies where schemaname = 'public' order by 1, 2;
```
- [ ] Anonymous (`anon` or `public`) policies exist only for `select` on content tables and `insert` on `inquiries` and `events`.

## 2. Public content tables: visible rows only, no writes

Applies to: `profile`, `achievements`, `core_beliefs`, `projects`, `project_media`, `marketing_campaigns`, `systems`, `system_nodes`, `system_edges`, `services`, `process_steps`, `niche_templates`, `studio_content`.

For each table:

- [ ] **Hidden rows are not readable.** In admin, hide one row. Then:
  `curl "$URL/rest/v1/TABLE?select=id&is_visible=eq.false"` returns `[]`.
- [ ] **Visible rows are readable.** `curl "$URL/rest/v1/TABLE?select=id&limit=1"` returns data.
- [ ] **Anon cannot insert.** POST `{}` (or a minimal valid row): blocked.
- [ ] **Anon cannot update.** `curl -X PATCH "$URL/rest/v1/TABLE?id=eq.<any id>" -d '{"is_visible":false}'` changes nothing. Check in admin that the row is unchanged.
- [ ] **Anon cannot delete.** `curl -X DELETE "$URL/rest/v1/TABLE?id=eq.<any id>"` deletes nothing.

Table-specific extras:

| Table | Extra check |
|---|---|
| `projects` | Tier 3 rows with `is_visible=false` are not returned. |
| `project_media` | Media of a hidden project is not exposed through a direct query by `project_id`. If it is, tighten the policy to check the parent. |
| `marketing_campaigns` | A campaign with `spend` null returns null (the site then hides it). |
| `system_nodes`, `system_edges` | Rows of a hidden system are not exposed the same way as `project_media`. |
| `profile`, `studio_content` | Single-row tables: only one row is returned, and anon cannot create a second. |

## 3. `site_settings`

- [ ] Anon `select` works **only if** you intend the settings public. The site reads the WhatsApp number, links, SEO text and sparks flags from it, so these keys are public by design. **Never store a secret in `site_settings`.**
- [ ] Anon cannot insert, update or delete a key: `curl -X POST "$URL/rest/v1/site_settings" -d '{"key":"x","value":"y"}'` is blocked.

## 4. `inquiries`

- [ ] **Anon cannot read.** `curl "$URL/rest/v1/inquiries?select=*"` returns `[]` or an error. This is the most important check: it holds visitors' phone numbers and emails.
- [ ] **Anon cannot update or delete.** PATCH and DELETE change nothing.
- [ ] **Direct insert is limited.** A POST straight to the table with a valid row may succeed (that is the "insert only" policy). It must **fail** when: `contact` or `message` is empty, `source` is not one of `form`, `configurator`, `sparks`, `status` is set to anything but `new`, or `message` is longer than 4000 characters (the site API stops earlier, at 2000). The length and `source` limits are table constraints and the `status` rule is in the insert policy, all in `00-setup.sql`. If any of these succeed, re-run `00-setup.sql` and test again.
- [ ] **API validation.** Through the site API:
  ```bash
  curl -s -X POST https://yourdomain.com/api/inquiries -H "Content-Type: application/json" \
    -d '{"contact":"","message":"hi","source":"form","lang":"en"}'
  ```
  returns `{"ok":false,...}` with HTTP 400.
- [ ] **Honeypot.** Same call with a valid body plus `"website":"http://spam.test"` returns `{"ok":true}` but **no row** appears in admin.
- [ ] **Rate limit.** Send 3 valid requests within one minute from one connection: the third returns HTTP 429 with a `Retry-After` header.
- [ ] **Cross-site blocked.** `curl -H "Origin: https://evil.example" ...` returns HTTP 403.
- [ ] **Oversized body.** A body over 8 KB returns HTTP 413.

## 5. `events`

- [ ] Anon cannot read: `curl "$URL/rest/v1/events?select=*"` returns `[]` or an error.
- [ ] Anon cannot update or delete.
- [ ] API: `POST /api/events` with `{"name":"Bad Name!"}` returns HTTP 400. With `{"name":"cta_click"}` returns `{"ok":true}`.
- [ ] More than 60 events in a minute from one connection returns HTTP 429.
- [ ] No IP address, user agent or name is stored: `select * from events order by created_at desc limit 5;` shows only name, path, meta, time.

## 6. `admins`

- [ ] Anon cannot read: `curl "$URL/rest/v1/admins?select=*"` returns `[]` or an error.
- [ ] Anon cannot insert: you cannot make yourself admin.
- [ ] A logged-in user who is **not** in `admins` cannot read `inquiries`. Test with a second throwaway user (then delete it).
- [ ] `select * from public.admins;` lists only your UUID.
- [ ] `select public.is_admin();` in a non-admin session is `false`.

## 7. Auth settings

- [ ] "Allow new users to sign up" is **off**.
- [ ] Only one user exists under Authentication, Users.
- [ ] Password is long and unique; email is not used elsewhere.
- [ ] TOTP two-factor enabled (when offered).
- [ ] Site URL and redirect URLs list only your real address (and `localhost` only while developing).

## 8. Storage bucket `media`

- [ ] Public read works: open an uploaded image URL in a private window.
- [ ] Anon cannot upload: `curl -X POST "$URL/storage/v1/object/media/test.txt" -H "apikey: $ANON" -H "Authorization: Bearer $ANON" -d x` is blocked.
- [ ] Anon cannot delete an object.
- [ ] The bucket does not allow listing everyone's files if you do not want that (Storage, Policies).
- [ ] Do not upload ID documents. Certificate scans: black out numbers, addresses and anything private before upload. They become public.

## 9. Admin area

- [ ] `/abdullah/admin` without login redirects to the login page.
- [ ] `/abdullah/admin/inquiries/export` and `/abdullah/admin/backup/export` without login do **not** return data (they redirect).
- [ ] The admin path is **not** in `/sitemap.xml` and **not** in `/robots.txt`.
- [ ] Response headers on admin pages include `X-Robots-Tag: noindex` and the page has `noindex` meta.
- [ ] Login error says only "Email or password is wrong", never which one.
- [ ] Repeated wrong passwords get slowed or blocked.
- [ ] Logout works and the back button does not show private pages.
- [ ] The admin address is not linked from any public page or from the repository README.

## 10. Secrets and headers

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is not in the repository, not in client bundles: in the browser dev tools, search all loaded JS for the first 10 characters of the key. No match.
- [ ] `.env.local` is ignored by Git: `git check-ignore .env.local` prints the path.
- [ ] `git log -p | grep -i "service_role"` finds nothing. If it does, **rotate the key** in Supabase.
- [ ] Check headers at securityheaders.com. Reasonable targets: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` or a `frame-ancestors` rule for admin.
- [ ] External links use `rel="noopener noreferrer"` (open the page, inspect a Live link).

## 11. Privacy

- [ ] `/en/legal` and `/ur/legal` match what the site really stores (no analytics beyond the anonymous `events`, no IP in the database).
- [ ] Delete test inquiries and test events before sharing the link.
- [ ] Take a Backup download (Admin, Backup) and store it somewhere private. It does not contain inquiries unless you tick the box.

## 12. Known limits (be honest with yourself)

- The in-memory rate limiter is per server instance on Vercel. The database check in `/api/inquiries` adds a second layer (3 per contact per 10 minutes, 100 per hour overall), but a determined attacker can still send spam. If spam appears, add Cloudflare Turnstile or Vercel's firewall rules.
- Anyone can insert into `inquiries` directly with the public anon key, which is how a public form works. Validation in RLS (item 4) limits the damage.
- Free Supabase projects have no automatic point-in-time recovery: your JSON backups are your recovery plan.

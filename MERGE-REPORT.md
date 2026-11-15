# MERGE-REPORT: The Prism Arc / Abdullah Khan portfolio

Merge of `prismarc-s1.zip` to `prismarc-s4.zip` (contract v1.0) into one project. Canonical database: `supabase-setup.sql` (now `supabase/00-setup.sql`).

## Read this first: what was NOT verified

**`npm install`, `tsc` with the real React/Next types, `npm run build`, `npm run lint` and a browser run of the merged site were NOT done.** The sandbox has no network, so nobody has seen `next build` pass on this project. Treat it as "merged and statically checked", not "build passes". The first thing to do on your machine:

```bash
npm install && npm run typecheck && npm run build
```
and send me any error text for a fix round.

Also not run: the SQL against a real Postgres (only structural checks, see below), the admin Tailwind entry compile, real fonts (Anybody width axis), Safari/iOS/Firefox, a real low-end phone, screen readers, framer-motion scroll effects with the real library, the OG image, the sitemap output.

## 1. What was merged

| Zip | Files | Ownership check | Notes |
|---|---|---|---|
| S1 Foundation | 77 | 0 files outside its owned paths | its `nav/s2..s4.ts` stubs were replaced by the real ones |
| S2 Identity | 56 | 0 | |
| S3 Work and proof | 58 | 0 | one extra migration (see 4) |
| S4 Conversion | 67 | 0 | |

No zip contained `node_modules`, `.next` or `_stubs`. The only path collisions were the three S1 stub files (`lib/admin/nav/s2.ts`, `s3.ts`, `s4.ts`); the real file won each time. No two real files collided, so no "better of two" decision was needed. All four zips were present and complete, so no replacement code had to be invented.

Result: 259 files in `prismarc-site-final.zip` (the four zips plus the files added at merge: `00-setup.sql`, `seed/s5.sql`, the home page, the `(root)` group, `global-not-found.tsx`, `admin-tailwind.css`, `README.md`, this report).

## 2. Mismatches found and fixed

1. **Language cookie.** S1's middleware reads `pa_lang`; S2's toggle wrote `NEXT_LOCALE`. The remembered language would never have been used. Fixed: the toggle uses `LANG_COOKIE` and `LANG_COOKIE_MAX_AGE` from `lib/i18n/config.ts`.
2. **No root layout / 404.** The public layout (S2) and both admin layouts (S1) are separate root layouts, but S4's `app/not-found.tsx` rendered no `<html>`, and `app/page.tsx` cannot exist without a root layout. Fixed: `app/(root)/layout.tsx` + `app/(root)/page.tsx` (redirect `/` to `/en`; middleware already does it first) and `app/global-not-found.tsx` (S4's root 404 plus its own `<html>`/`<body>`), enabled with `experimental.globalNotFound` in `next.config.ts`. `next` and `eslint-config-next` were raised to `^15.4.0` (the version that introduced this). **Deviation:** the redirect page lives at `app/(root)/page.tsx`, not `app/page.tsx` (same URL). Risk: if `next build` rejects this, README section 8 says how to revert in two steps.
3. **Admin had no Tailwind.** S3's nested editors and S4's admin pages (inbox, events, SEO, backup) are written with Tailwind classes, but the admin layouts only loaded S1's `admin.css`. They would have rendered unstyled. Fixed: new `components/admin/shell/admin-tailwind.css` (theme + utilities only, no preflight, so S1's admin look is untouched), imported by both admin layouts. Not compiled here (see top).
4. **Case-study story never reached the page.** S3's page reads `story_*` / `highlights_*`, but S1's `toProject` dropped every column it did not know. Fixed: optional fields added to the `Project` type and mapped in `toProject`.
5. **Storage limits.** The canonical bucket allows 10 MB and no GIF; S1's uploader allowed GIF and told you 50 MB. Fixed in `components/admin/kit/storage.ts` and the media library text (10 MB for every type, no GIF, clear error messages).
6. **Achievement year.** Canonical SQL allows 1990 to 2100; the admin field allowed 1950. Fixed to 1990.
7. **Case-study metadata.** S3 built its own metadata (relative canonical). Now uses S4's `buildMetadata` like every other page (absolute canonical, hreflang `en` / `ur-Latn`, Open Graph, Twitter).
8. **Campaigns "Related project" list** came from the public cache (hidden or new projects missing). Now read with the admin's own session.
9. **Sticky stack offset** (S3, a guess of 76 px) now follows S2's real `--header-h`.
10. **Wrong security claim.** S1's UI and README said two-step verification makes the database refuse writes without the code. That depended on an AAL2 check in S1's `is_admin()`, which the canonical SQL does not have. Text corrected: with 2-step on, the admin pages ask for the code (middleware); the database itself is protected by the `admins` table and RLS.
11. **Stale docs.** `DEPLOY.md` and `SECURITY-CHECKLIST.md` pointed to `schema.sql` / `rls.sql` / `storage.sql` and a 2000-character DB limit; now `00-setup.sql` and 4000 (the API stops at 2000).
12. **Home page and merge markers** composed: `app/[lang]/(site)/page.tsx` (order and ids from contract section 2, plus `HomeJsonLd`), `buildMetadata` at `MERGE:METADATA`, `SparksLayer` at `MERGE:SPARKS`. Admin nav is composed from `nav/s1..s4.ts` by `lib/admin/nav.ts` (all 16 slugs present, each with a page).

## 3. Database

- `supabase/00-setup.sql` is the canonical file, copied unchanged from your `supabase-setup.sql` (it came as chat text, so I recreated the file from it). S1's `schema.sql`, `rls.sql`, `storage.sql` were removed.
- Compared S1's schema with the canonical one table by table (17 tables). Differences were only S1 being stricter (URL and slug patterns, `jsonb_typeof` checks, spend >= 0, date order, `year >= 1950`, `is_admin()` with AAL2, 50 MB / GIF) or defaults (`_ur` columns had `default ''`; `services.cta_label_*`; `projects.tier` default 2). I did not change the SQL. What this means for the app: the admin forms still validate URLs, slugs, colours and ranges themselves, so nothing breaks; the database just no longer double-checks those. `site_settings` now has `updated_at` (S1 had none); no code was affected.
- Every table, column, enum value and range used by the seeds and by the admin CRUD configs was checked against the canonical schema by script (see 6). No code change was needed beyond items 4 to 6 above.
- Seeds, in order: `s1.sql` (profile, achievements, settings), `s2.sql` (services, studio), `s3.sql` (systems, nodes, edges, niche templates), `s4.sql` (process), `s5.sql` (projects), then `migrations/s3_project_story.sql`. All are idempotent (`on conflict ... do nothing` or `where not exists`). Fixed: the S1 profile insert used `on conflict (id)`, which would fail if another profile row existed (single-row index); it now skips on any conflict.
- **`seed/s5.sql` is new.** The contract gave no session a projects seed, so the Projects section would have been empty. It contains only context.md section 3: titles, stacks, summaries, the TheBaigArts live and repo links. No numbers, results, clients or testimonials. Tier 3 starts hidden. Status is the schema default "Live" for visible rows: **change it where that is not true** (the three Tier 1 items without a link, and the design-lab items).
- S3's migration adds `story_en/ur` and `highlights_en/ur` to `projects`. Kept (contract allows migrations). It must be run before using Admin > Projects.
- Canonical defaults win over S1's seed: `sparks_enabled` and `audit_offer_enabled` start **false** (S1's seed said true) and the Roman Urdu cleared stamp is "Launch ke liye tayyar".
- S4's suggested RLS hardening was not applied (canonical already has length checks, a `source` check and `status = 'new' and notes is null` on insert).

## 4. Content decisions (no invented facts)

- S3's seed described Mehfil internals that `context.md` does not state ("stored in SQLite", a dashboard of live campaign progress). Removed. The remaining flows follow the feature lists in `context.md`; the Mehfil arrows (contact lists to cleaning to clusters to queue) are still S3's reading of them. Confirm each node and arrow in Admin > Systems.
- S4's Process chat is a draft of "how I work" (including promises such as "you approve the plan before I start" and "I stay around after launch"), and its client lines are marked as an example on the site. Read every line, in both languages, and edit what is not how you really work.
- Niche template sample items (Karahi, Necklace sets, ...) are generic category examples with no prices. Edit or replace them in Admin > Niche templates.
- All Roman Urdu text was written by the sessions and by me (s5). It has not been read by a native reader.
- Not seeded on purpose: Core Beliefs (the header button stays hidden until you add some), WhatsApp number, LinkedIn, email, photo, certificate scans, screenshots, every number and metric. With no WhatsApp number every WhatsApp button is hidden and the sparks layer renders nothing.

## 5. Small gaps that remain

- Only S2's text morphs on language switch; S3/S4 text swaps instantly (S2 deviation 3, would need a contract change).
- The Hafiz-e-Quran calm treatment is detected by a title pattern (S2). If you retitle that achievement, check it still matches.
- The in-memory rate limiter resets per serverless instance; the database-backed flood check in `/api/inquiries` is the real backstop.
- Optional hardening not applied (SQL is canonical): requiring AAL2 inside `is_admin()` if you turn on 2-step verification.
- The `getProjects`-based dropdown, caching and `Publish changes` behaviour rely on S1's tags (`content:<table>`); project media and system nodes post their child tags as S1 documented.

## 6. What I did run (static, no network)

| Check | Result |
|---|---|
| Ownership script over all four zips (contract section 1) | 0 violations, 0 junk, only the 3 expected stub collisions |
| Import verifier (TypeScript compiler API): every import resolves, every `@/` path exists, every imported named/default export exists, every external package is in `package.json` | 198 files, 689 imports, 0 problems |
| Client/server boundary: no `"use client"` file reaches `next/headers`, `next/cache`, `node:*` or server Supabase clients; no `useSearchParams` without Suspense | 63 client files, 0 problems |
| Rule checks: home order and the 11 section ids (each `position: relative`, default export), en/ur JSON key parity for 16 namespaces used via `getMessages` (plus `errors`, checked separately), admin nav = the 16 frozen slugs with a page each, Live/repo links via `ExternalLink` or `rel="noopener noreferrer"`, metrics behind `hasValue`, middleware guards `/abdullah/admin`, sitemap and robots do not mention it, no TODO/FIXME/STUB/lorem | 38 checks pass, 0 fail |
| Seed checker against `00-setup.sql` + the migration: columns exist, NOT NULL present, enum and range values valid, brackets and `$$` balanced | 94 rows, 0 problems |
| CRUD configs evaluated and compared with the schema (field to column, required vs NOT NULL, select options vs CHECK, number ranges, tags) | 9 kit pages evaluated, 0 problems; the campaigns page read by hand (its config is built inside the page); the other 6 admin pages are custom (settings, media, inquiries, events, seo, backup) |
| Project-wide `tsc --strict` with auto-generated permissive shims for React/Next/Supabase/zod (library types are `any`, project types are real) | 0 errors apart from known shim artefacts (callback params without contextual types, `motion.div`) |
| Scan for invented stats/claims, secrets | none found |

The last check proves the files agree with each other, not that they agree with the real library typings.

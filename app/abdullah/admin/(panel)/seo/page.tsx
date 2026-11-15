import type { Metadata } from "next";
import { requireAdmin } from "@/lib/supabase/guard";
import { getRequestDb } from "@/lib/api/db";
import { HTML_LANG, absoluteUrl, getSiteUrl, langPath } from "@/lib/seo/site";
import { PageHeader } from "../_s4/PageHeader";
import { muted, panel } from "../_s4/styles";
import SeoForm, { type SeoValues } from "./SeoForm";

export const metadata: Metadata = { title: "SEO", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const KEYS = ["seo_title_en", "seo_title_ur", "seo_description_en", "seo_description_ur", "brand_handle", "site_url"] as const;

export default async function SeoPage() {
  await requireAdmin();
  const db = await getRequestDb();
  const { data } = await db.from("site_settings").select("key,value").in("key", [...KEYS]);

  const map = new Map<string, unknown>((data ?? []).map((r: { key: string; value: unknown }) => [r.key, r.value]));
  const values = Object.fromEntries(KEYS.map((k) => [k, typeof map.get(k) === "string" ? (map.get(k) as string) : ""])) as unknown as SeoValues;

  const origin = getSiteUrl({ site_url: values.site_url });
  const usingLocalhost = origin.startsWith("http://localhost");

  return (
    <div>
      <PageHeader
        title="SEO"
        intro="What Google and social apps show for the home page. Each language has its own title and description. Empty fields fall back to a built-in default."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SeoForm values={values} />

        <aside className="flex flex-col gap-4" aria-label="Checks">
          <section className={panel}>
            <h2 className="font-display text-[1.125rem] font-semibold">Checks</h2>
            {usingLocalhost ? (
              <p className="mt-3 font-body text-[15px] leading-relaxed text-amber">
                No site address is set, so links point to localhost. Set the address on this page or the NEXT_PUBLIC_SITE_URL variable before launch.
              </p>
            ) : (
              <p className={`${muted} mt-3`}>
                Canonical origin: <span className="break-all text-text">{origin}</span>
              </p>
            )}
            <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0 font-body text-[14px] leading-relaxed">
              <li className="break-all">
                Sitemap: <a className="underline underline-offset-4" href="/sitemap.xml" target="_blank" rel="noopener noreferrer">{absoluteUrl(origin, "/sitemap.xml")}<span className="sr-only"> (opens in a new tab)</span></a>
              </li>
              <li className="break-all">
                Robots: <a className="underline underline-offset-4" href="/robots.txt" target="_blank" rel="noopener noreferrer">{absoluteUrl(origin, "/robots.txt")}<span className="sr-only"> (opens in a new tab)</span></a>
              </li>
              <li>
                Language tags: {HTML_LANG.en} at {langPath("en")}, {HTML_LANG.ur} at {langPath("ur")}, plus x-default (English).
              </li>
            </ul>
          </section>

          <section className={panel}>
            <h2 className="font-display text-[1.125rem] font-semibold">Social preview</h2>
            <p className={`${muted} mt-2`}>Generated from your profile and hero text. It updates when those change.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/en/opengraph-image" alt="Social preview card, English" width={1200} height={630} loading="lazy" className="mt-3 h-auto w-full rounded-[10px]" />
          </section>
        </aside>
      </div>
    </div>
  );
}

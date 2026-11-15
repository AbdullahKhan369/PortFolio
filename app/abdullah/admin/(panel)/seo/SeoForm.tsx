"use client";

import { useActionState, useState } from "react";
import { btnPrimary, input, label, muted, panel } from "../_s4/styles";
import { saveSeo, type SeoState } from "./actions";

export interface SeoValues {
  seo_title_en: string;
  seo_title_ur: string;
  seo_description_en: string;
  seo_description_ur: string;
  brand_handle: string;
  site_url: string;
}

const initial: SeoState = { ok: false, message: "" };

function Counter({ value, ideal, max }: { value: string; ideal: number; max: number }) {
  const n = value.length;
  const tone = n === 0 ? "" : n > ideal ? "!text-amber" : "";
  return (
    <span className={`${muted} ${tone}`}>
      {n} characters{n > ideal ? `, search results usually cut after about ${ideal}` : ""} (limit {max})
    </span>
  );
}

/** Live counters plus a search-result preview, so the effect of a change is visible before saving. */
export default function SeoForm({ values }: { values: SeoValues }) {
  const [state, action, pending] = useActionState(saveSeo, initial);
  const [v, setV] = useState(values);
  const set = (k: keyof SeoValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((prev) => ({ ...prev, [k]: e.target.value }));
  const err = (k: keyof SeoValues) => state.errors?.[k];

  const preview = (lang: "en" | "ur") => {
    const title = v[`seo_title_${lang}`];
    const desc = v[`seo_description_${lang}`];
    return (
      <div className="rounded-[10px] bg-base p-4">
        <p className={muted}>{v.site_url || "https://your-domain.com"}/{lang}</p>
        <p className="mt-1 break-words font-display text-[18px] font-medium text-azure">
          {title ? (title.length > 60 ? `${title.slice(0, 57)}...` : title) : "Title not set. A built-in default is used."}
        </p>
        <p className="mt-1 break-words font-body text-[14px] leading-relaxed">
          {desc ? (desc.length > 160 ? `${desc.slice(0, 157)}...` : desc) : "Description not set. A built-in default is used."}
        </p>
      </div>
    );
  };

  return (
    <form action={action} className="flex flex-col gap-6">
      <div role="status" aria-live="polite" className="empty:hidden">
        {state.message ? (
          <p className={`${panel} ${state.ok ? "" : "text-amber"}`}>{state.message}</p>
        ) : null}
      </div>

      <section className={panel} aria-labelledby="seo-en">
        <h2 id="seo-en" className="font-display text-[1.125rem] font-semibold">
          English
        </h2>
        <label htmlFor="seo_title_en" className={`${label} mt-4`}>
          Page title
        </label>
        <input id="seo_title_en" name="seo_title_en" value={v.seo_title_en} onChange={set("seo_title_en")} maxLength={120} aria-invalid={!!err("seo_title_en")} className={input} />
        <Counter value={v.seo_title_en} ideal={60} max={120} />
        {err("seo_title_en") ? <p className="mt-1 text-[14px] text-amber">{err("seo_title_en")}</p> : null}

        <label htmlFor="seo_description_en" className={`${label} mt-4`}>
          Description
        </label>
        <textarea id="seo_description_en" name="seo_description_en" value={v.seo_description_en} onChange={set("seo_description_en")} rows={3} maxLength={320} aria-invalid={!!err("seo_description_en")} className={input} />
        <Counter value={v.seo_description_en} ideal={160} max={320} />
        {err("seo_description_en") ? <p className="mt-1 text-[14px] text-amber">{err("seo_description_en")}</p> : null}

        <p className={`${muted} mt-5`}>Search preview</p>
        <div className="mt-2">{preview("en")}</div>
      </section>

      <section className={panel} aria-labelledby="seo-ur">
        <h2 id="seo-ur" className="font-display text-[1.125rem] font-semibold">
          Roman Urdu
        </h2>
        <label htmlFor="seo_title_ur" className={`${label} mt-4`}>
          Page title
        </label>
        <input id="seo_title_ur" name="seo_title_ur" value={v.seo_title_ur} onChange={set("seo_title_ur")} maxLength={120} aria-invalid={!!err("seo_title_ur")} className={input} />
        <Counter value={v.seo_title_ur} ideal={60} max={120} />
        {err("seo_title_ur") ? <p className="mt-1 text-[14px] text-amber">{err("seo_title_ur")}</p> : null}

        <label htmlFor="seo_description_ur" className={`${label} mt-4`}>
          Description
        </label>
        <textarea id="seo_description_ur" name="seo_description_ur" value={v.seo_description_ur} onChange={set("seo_description_ur")} rows={3} maxLength={320} aria-invalid={!!err("seo_description_ur")} className={input} />
        <Counter value={v.seo_description_ur} ideal={160} max={320} />
        {err("seo_description_ur") ? <p className="mt-1 text-[14px] text-amber">{err("seo_description_ur")}</p> : null}

        <p className={`${muted} mt-5`}>Search preview</p>
        <div className="mt-2">{preview("ur")}</div>
      </section>

      <section className={panel} aria-labelledby="seo-site">
        <h2 id="seo-site" className="font-display text-[1.125rem] font-semibold">
          Site address and handle
        </h2>
        <label htmlFor="site_url" className={`${label} mt-4`}>
          Site address
        </label>
        <input id="site_url" name="site_url" type="url" inputMode="url" value={v.site_url} onChange={set("site_url")} placeholder="https://your-domain.com" aria-invalid={!!err("site_url")} className={input} />
        <p className={muted}>Used for canonical links, the sitemap and social previews. The NEXT_PUBLIC_SITE_URL environment variable overrides it.</p>
        {err("site_url") ? <p className="mt-1 text-[14px] text-amber">{err("site_url")}</p> : null}

        <label htmlFor="brand_handle" className={`${label} mt-4`}>
          Brand handle
        </label>
        <input id="brand_handle" name="brand_handle" value={v.brand_handle} onChange={set("brand_handle")} maxLength={60} className={input} />
      </section>

      <div>
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Saving" : "Save and publish"}
        </button>
      </div>
    </form>
  );
}

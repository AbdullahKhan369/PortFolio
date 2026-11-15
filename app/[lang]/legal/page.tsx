import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMessages } from "@/lib/i18n";
import { paragraphs } from "@/lib/api/format";
import { breadcrumbJsonLd, buildMetadata, getSiteUrl, isLang, langPath } from "@/lib/seo";
import { getSiteSettings } from "@/lib/content";
import { JsonLd } from "@/lib/seo/JsonLdScript";

type Params = { params: Promise<{ lang: string }> };

const SECTIONS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const msgs = await getMessages(lang, ["legal"]);
  return buildMetadata({ lang, path: "/legal", title: msgs.legal?.title, description: msgs.legal?.intro });
}

/** Privacy page. Static copy from the `legal` namespace, written to match what the site really stores. */
export default async function LegalPage({ params }: Params) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const [msgs, settings] = await Promise.all([getMessages(lang, ["legal"]), getSiteSettings()]);
  const t = msgs.legal ?? {};
  const origin = getSiteUrl(settings);

  return (
    <div className="bg-base px-4 py-24 sm:px-8 lg:py-32">
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: "Home", path: langPath(lang) },
            { name: t.title ?? "Privacy", path: langPath(lang, "/legal") },
          ],
          origin
        )}
      />
      <article className="mx-auto w-full max-w-[44rem]">
        <h1 className="font-display text-[clamp(2.25rem,7vw,4rem)] font-semibold leading-[1.05] text-text">{t.title}</h1>
        <p className="mt-4 font-body text-[15px] text-muted">{t.updated}</p>
        <p className="mt-8 font-body text-[18px] leading-[1.75] text-text">{t.intro}</p>

        {SECTIONS.map((key) => (
          <section key={key} aria-labelledby={`legal-${key}`} className="mt-12">
            <h2 id={`legal-${key}`} className="font-display text-[1.5rem] font-semibold leading-tight text-text">
              {t[`${key}_title`]}
            </h2>
            {paragraphs(t[`${key}_body`]).map((p, i) => (
              <p key={i} className="mt-4 font-body text-[17px] leading-[1.75] text-muted">
                {p}
              </p>
            ))}
          </section>
        ))}

        <p className="mt-16">
          <Link
            href={langPath(lang)}
            className="inline-flex min-h-[48px] items-center rounded-full bg-text px-7 font-display text-[16px] font-semibold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure"
          >
            {t.back_home}
          </Link>
        </p>
      </article>
    </div>
  );
}

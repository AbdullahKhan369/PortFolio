import type { Lang } from "@/lib/content/types";
import { getProfile, getSiteSettings, getStudioContent } from "@/lib/content";
import { homeJsonLd } from "./jsonld";

/** Renders one JSON-LD script. `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** Drop into the home page composition: <HomeJsonLd lang={lang} />. Person + ProfessionalService. */
export async function HomeJsonLd({ lang }: { lang: Lang }) {
  const [settings, profile, studio] = await Promise.all([getSiteSettings(), getProfile(), getStudioContent()]);
  return <JsonLd data={homeJsonLd({ lang, settings, profile, studio })} />;
}

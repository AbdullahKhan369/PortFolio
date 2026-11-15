import { ImageResponse } from "next/og";
import { getProfile, getSiteSettings } from "@/lib/content";
import { BRAND, SEO_FALLBACK, isLang } from "@/lib/seo/site";

export const alt = "Abdullah Khan, The Prism Arc";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social preview (1200x630). The prism idea only: a white beam enters a triangle and leaves as
 * four spectrum lines. Text comes from the profile and SEO settings, so it is always the real copy.
 * System fonts are used on purpose: fetching web fonts at render time would make previews flaky.
 */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = isLang(raw) ? raw : "en";
  const [settings, profile] = await Promise.all([getSiteSettings(), getProfile()]);

  const name = profile?.name || BRAND.person;
  const headline =
    (lang === "ur" ? settings.hero_headline_ur : settings.hero_headline_en)?.trim() ||
    (lang === "ur" ? profile?.tagline_ur : profile?.tagline_en)?.trim() ||
    SEO_FALLBACK[lang].description.split(".")[0] + ".";

  const spectrum = ["#8A5CFF", "#3AA0FF", "#4FE3B0", "#FFC857"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#12163A",
          color: "#F2F4FF",
          fontFamily: "sans-serif",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
          <div style={{ display: "flex", fontSize: 30, color: "#9096C4" }}>{BRAND.studio}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.02 }}>{name}</div>
            <div style={{ display: "flex", marginTop: 28, fontSize: 36, lineHeight: 1.3, color: "#F2F4FF" }}>
              {headline.length > 110 ? `${headline.slice(0, 107)}...` : headline}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
          <svg width="440" height="440" viewBox="0 0 440 440">
            <line x1="0" y1="250" x2="170" y2="250" stroke="#F2F4FF" strokeWidth="6" />
            <polygon points="220,90 350,320 90,320" fill="#1B2050" stroke="#F2F4FF" strokeWidth="4" strokeLinejoin="round" />
            {spectrum.map((color, i) => (
              <line key={color} x1="268" y1="262" x2="440" y2={170 + i * 62} stroke={color} strokeWidth="6" strokeLinecap="round" />
            ))}
          </svg>
        </div>
      </div>
    ),
    { ...size }
  );
}

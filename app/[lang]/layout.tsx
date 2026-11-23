import "../globals.css";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Serif, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import type { Lang } from "@/lib/content/types";
import { buildMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/content";
import { fxAttributes, themeCss } from "@/lib/content/appearance";
import { SparksLayer } from "@/components/sparks";
import { Ambient } from "@/components/layout/Ambient";
import { LightSpine } from "@/components/layout/LightSpine";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { CursorLight } from "@/components/layout/CursorLight";
import { Chapters } from "@/components/layout/Chapters";
import { LangWipe } from "@/components/layout/LangWipe";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LangProvider } from "@/components/layout/LangProvider";
import { PremiumFX } from "@/components/layout/PremiumFX";

// Display: Bricolage Grotesque (optical-size + width axes, so big headings get the sharp cut automatically).
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
});

// Accent: an italic serif used for one or two words in a heading and for quiet captions.
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-accent",
  display: "swap",
});

// Small labels, section numbers and metadata.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const isLang = (v: string): v is Lang => v === "en" || v === "ur";

export function generateStaticParams(): { lang: Lang }[] {
  return [{ lang: "en" }, { lang: "ur" }];
}

// Per-language title, description, canonical, hreflang, Open Graph and Twitter (S4's buildMetadata).
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return buildMetadata({ lang });
}

/**
 * Runs before first paint. Sets on <html>:
 *   data-perf   "high" | "low"   (low: deviceMemory <= 2, hardwareConcurrency <= 2 or reduced motion; same rule as usePerformanceTier)
 *   data-motion "reduce" | "full"
 *   data-intro  "play" | "seen"  (the intro beam runs once per browser session)
 * Without JavaScript none of these exist and the site falls back to its static version.
 */
const BOOT = `(function(){var d=document.documentElement;try{var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var m=navigator.deviceMemory,c=navigator.hardwareConcurrency;var low=r||(m&&m<=2)||(c&&c<=2);d.setAttribute('data-perf',low?'low':'high');d.setAttribute('data-motion',r?'reduce':'full');var s=null;try{s=sessionStorage.getItem('pa-intro')}catch(e){}d.setAttribute('data-intro',s?'seen':'play');if(!s){try{sessionStorage.setItem('pa-intro','1')}catch(e){}}}catch(e){d.setAttribute('data-perf','low')}})();`;

export default async function LangLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const settings = await getSiteSettings();
  const theme = themeCss(settings);

  return (
    <html lang={lang === "ur" ? "ur-Latn" : "en"} className={`${bricolage.variable} ${instrument.variable} ${mono.variable} ${sourceSerif.variable}`} suppressHydrationWarning {...fxAttributes(settings)}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
        {theme ? <style dangerouslySetInnerHTML={{ __html: theme }} /> : null}
      </head>
      <body>
        <a className="pa-skip" href="#main">
          {lang === "ur" ? "Seedha content par jayein" : "Skip to content"}
        </a>
        <Ambient />
        <LightSpine />
        <ScrollReveal />
        <Chapters />
        <CursorLight />
        <PremiumFX />
        <LangWipe lang={lang} />
        <div id="pa-app">
          <LangProvider lang={lang}>
            <Header lang={lang} />
            <main id="main" className="pa-main">
              {children}
            </main>
            <Footer lang={lang} />
          </LangProvider>
        </div>
        {/* 3-6-9 hunt: renders nothing unless sparks are enabled and a WhatsApp number is set */}
        <SparksLayer lang={lang} />
      </body>
    </html>
  );
}

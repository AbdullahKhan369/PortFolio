import { notFound } from "next/navigation";
import type { Lang } from "@/lib/content/types";
import { HomeJsonLd } from "@/lib/seo/JsonLdScript";
import { getSiteSettings } from "@/lib/content";
import { parseSectionLayout, type HomeSectionId } from "@/lib/content/appearance";
import Marquee from "@/components/layout/Marquee";
import Hero from "@/components/sections/Hero";
import HeroStory from "@/components/hero/HeroStory";
import ProofStrip from "@/components/hero/ProofStrip";
import Achievements from "@/components/sections/Achievements";
import Projects from "@/components/sections/Projects";
import MarketingProjects from "@/components/sections/MarketingProjects";
import SystemsMap from "@/components/sections/SystemsMap";
import Services from "@/components/sections/Services";
import Process from "@/components/sections/Process";
import TryYourBusiness from "@/components/sections/TryYourBusiness";
import Studio from "@/components/sections/Studio";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";

const isLang = (v: string): v is Lang => v === "en" || v === "ur";

/**
 * Home composition (contract section 2). Order and anchor ids:
 * hero, achievements, projects, marketing, systems, services, process, try, studio, about, contact.
 * The order and visibility of everything after the hero come from Admin > Appearance (setting section_layout).
 * Each section is a server component that loads its own data and messages.
 */
function renderSection(id: HomeSectionId, lang: Lang) {
  switch (id) {
    case "achievements": return <Achievements key={id} lang={lang} />;
    case "projects": return <Projects key={id} lang={lang} />;
    case "marketing": return <MarketingProjects key={id} lang={lang} />;
    case "systems": return <SystemsMap key={id} lang={lang} />;
    case "services": return <Services key={id} lang={lang} />;
    case "process": return <Process key={id} lang={lang} />;
    case "try": return <TryYourBusiness key={id} lang={lang} />;
    case "studio": return <Studio key={id} lang={lang} />;
    case "about": return <About key={id} lang={lang} />;
    case "contact": return <Contact key={id} lang={lang} />;
  }
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const settings = await getSiteSettings();
  const layout = parseSectionLayout(settings.section_layout);

  return (
    <>
      <HomeJsonLd lang={lang} />
      <Hero lang={lang} />
      <HeroStory lang={lang} />
      <ProofStrip lang={lang} />
      <Marquee lang={lang} />
      {layout.filter((slot) => slot.visible).map((slot) => renderSection(slot.id, lang))}
    </>
  );
}

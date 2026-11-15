// Used only when Supabase is unreachable or not configured yet.
// Contains ONLY facts Abdullah provided (same as supabase/seed/s1.sql). Lists that need real data
// (projects, campaigns, systems, services, process, niches, studio, core beliefs) are empty on purpose:
// the public site hides empty sections instead of showing invented content.
import type {
  Achievement, CoreBelief, MarketingCampaign, NicheTemplate, ProcessStep, Profile, ProjectWithMedia,
  Service, SiteSettings, StudioContent, SystemWithGraph,
} from "./types";

const STAMP = "2026-11-11T00:00:00.000Z";
const base = (id: string, order: number) => ({
  id, is_visible: true, order_index: order, created_at: STAMP, updated_at: STAMP,
});

export const fallbackSettings: SiteSettings = {
  hero_headline_en: "I build the site. I run the ads. You get the messages.",
  hero_headline_ur: "Main site banata hoon. Main ads chalata hoon. Aapko messages milte hain.",
  github_url: "https://github.com/AbdullahKhan369",
  brand_handle: "AbdullahKhan_369",
  whatsapp_number: "923112080173",
  sparks_enabled: true,
  audit_offer_enabled: true,
  audit_offer_text_en: "Free website audit",
  audit_offer_text_ur: "Free website audit",
  cleared_stamp_en: "Cleared for launch",
  cleared_stamp_ur: "Launch ke liye clear",
};

export const fallbackProfile: Profile = {
  ...base("5a1e0000-0000-4000-8000-000000000001", 0),
  name: "Abdullah Khan",
  tagline_en: "Web developer, digital marketer, designer and brand strategist.",
  tagline_ur: "Web developer, digital marketer, designer aur brand strategist.",
  bio_en:
    "I build websites, run the ads that bring enquiries to WhatsApp, and design the creative behind both. I work from Karachi, Pakistan, and take on projects for businesses in Pakistan and abroad.",
  bio_ur:
    "Main websites banata hoon, woh ads chalata hoon jo WhatsApp par inquiries laate hain, aur dono ke peeche ka creative design karta hoon. Main Karachi, Pakistan se kaam karta hoon aur Pakistan ke saath bahir ke businesses ke projects bhi leta hoon.",
  photo_url: null,
  photo_layers: null,
};

const ach = (
  n: number, order: number, kind: Achievement["kind"], title_en: string, title_ur: string,
  description_en: string | null = null, description_ur: string | null = null,
): Achievement => ({
  ...base(`5a1e0000-0000-4000-8000-0000000a000${n}`, order),
  title_en, title_ur, description_en, description_ur, year: null, kind, image_url: null, proof_url: null,
});

export const fallbackAchievements: Achievement[] = [
  ach(1, 10, "course", "Eight years of CIT study", "8 saal ka CIT course",
    "Started at a young age and stayed with it for eight years.", "Chhoti umar mein shuru kiya aur 8 saal tak jaari rakha."),
  ach(2, 20, "result", "A+ in 9th and Matric", "9th aur Matric dono mein A+"),
  ach(3, 30, "other", "Hafiz-e-Quran", "Hafiz-e-Quran", "Memorised the Holy Quran.", "Quran-e-Pak hifz kiya."),
  ach(4, 40, "course", "Two more IT courses", "2 aur IT courses",
    "Completed after the CIT course.", "CIT course ke baad mukammal kiye."),
  ach(5, 50, "course", "Digital marketing and graphic design courses", "Digital marketing aur graphic designing ke courses"),
  ach(6, 60, "work", "Sales and quality assurance", "Sales aur quality assurance",
    "About 13 months handling US customer calls, monitoring and evaluating calls, and reviewing compliance.",
    "Taqreeban 13 mahine US customers ki calls handle kin, calls ki monitoring aur evaluation ki, aur compliance review kiya."),
  ach(7, 70, "work", "Node.js development", "Node.js development"),
];

export const fallbackCoreBeliefs: CoreBelief[] = [];
export const fallbackProjects: ProjectWithMedia[] = [];
export const fallbackCampaigns: MarketingCampaign[] = [];
export const fallbackSystems: SystemWithGraph[] = [];
export const fallbackServices: Service[] = [];
export const fallbackProcessSteps: ProcessStep[] = [];
export const fallbackNicheTemplates: NicheTemplate[] = [];
export const fallbackStudioContent: StudioContent | null = null;

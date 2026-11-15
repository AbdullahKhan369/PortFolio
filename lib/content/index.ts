// lib/content/index.ts (Session 1). Frozen getters from contract.md section 4.
// Server-side only. Visible rows only, ordered by order_index, cached with tag "content:<table>",
// and falling back to ./fallback when Supabase is unreachable or not configured.
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import {
  CONTENT_REVALIDATE_SECONDS, SETTING_BOOLEAN_KEYS, SETTING_KEYS, contentTag,
} from "./meta";
import {
  fallbackAchievements, fallbackCampaigns, fallbackCoreBeliefs, fallbackNicheTemplates,
  fallbackProcessSteps, fallbackProfile, fallbackProjects, fallbackServices, fallbackSettings,
  fallbackStudioContent, fallbackSystems,
} from "./fallback";
import type {
  Achievement, Base, CoreBelief, MarketingCampaign, Metric, NicheTemplate, ProcessStep, Profile,
  Project, ProjectMedia, ProjectWithMedia, Service, SiteSettings, StudioContent, SystemEdge,
  SystemNode, SystemWithGraph,
} from "./types";

export { hasValue } from "./visible";
export type * from "./types";

type Row = Record<string, unknown>;

/* ------------------------------------------------------------------ helpers */

const str = (v: unknown): string => (typeof v === "string" ? v : "");
const strOrNull = (v: unknown): string | null => (typeof v === "string" && v.trim() !== "" ? v : null);
const numOrNull = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const num = (v: unknown, def = 0): number => numOrNull(v) ?? def;
const strArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
function oneOf<T extends string>(v: unknown, allowed: readonly T[], def: T): T {
  return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : def;
}

function toBase(r: Row): Base {
  return {
    id: String(r.id),
    is_visible: r.is_visible !== false,
    order_index: num(r.order_index),
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
  };
}

function toMetrics(v: unknown): Metric[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((m): m is Row => !!m && typeof m === "object")
    .map((m) => ({
      label_en: str(m.label_en),
      label_ur: str(m.label_ur),
      value: strOrNull(m.value) ?? (typeof m.value === "number" ? String(m.value) : null),
    }));
}

const byOrder = <T extends Base>(a: T, b: T) =>
  a.order_index - b.order_index || a.created_at.localeCompare(b.created_at);

/* ------------------------------------------------------------------ data access */

/** Throws on any failure so unstable_cache never stores a failed result; callers fall back. */
async function selectAll(table: string, select = "*", visibleOnly = true): Promise<Row[]> {
  const sb = createPublicClient();
  if (!sb) throw new Error("Supabase is not configured");
  let q = sb.from(table).select(select);
  if (visibleOnly) q = q.eq("is_visible", true);
  const { data, error } = await q.order("order_index", { ascending: true }).order("created_at", { ascending: true });
  if (error) throw new Error(`[content:${table}] ${error.message}`);
  return (data ?? []) as unknown as Row[];
}

function cached<T>(table: string, key: string, loader: () => Promise<T>): Promise<T> {
  return unstable_cache(loader, ["content", table, key], {
    tags: [contentTag(table)],
    revalidate: CONTENT_REVALIDATE_SECONDS,
  })();
}

async function withFallback<T>(label: string, load: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.error(`[content] ${label} failed, using fallback:`, error instanceof Error ? error.message : error);
    return fallback();
  }
}

/* ------------------------------------------------------------------ normalizers */

const toProfile = (r: Row): Profile => {
  const layers = r.photo_layers && typeof r.photo_layers === "object" ? (r.photo_layers as Row) : null;
  const photo_layers = layers
    ? {
        ...(strOrNull(layers.dev) ? { dev: str(layers.dev) } : {}),
        ...(strOrNull(layers.ads) ? { ads: str(layers.ads) } : {}),
        ...(strOrNull(layers.creative) ? { creative: str(layers.creative) } : {}),
      }
    : null;
  return {
    ...toBase(r),
    name: str(r.name),
    tagline_en: str(r.tagline_en), tagline_ur: str(r.tagline_ur),
    bio_en: str(r.bio_en), bio_ur: str(r.bio_ur),
    photo_url: strOrNull(r.photo_url),
    photo_layers: photo_layers && Object.keys(photo_layers).length ? photo_layers : null,
  };
};

const toAchievement = (r: Row): Achievement => ({
  ...toBase(r),
  title_en: str(r.title_en), title_ur: str(r.title_ur),
  description_en: strOrNull(r.description_en), description_ur: strOrNull(r.description_ur),
  year: numOrNull(r.year),
  kind: oneOf(r.kind, ["course", "certificate", "result", "work", "other"] as const, "other"),
  image_url: strOrNull(r.image_url),
  proof_url: strOrNull(r.proof_url),
});

const toCoreBelief = (r: Row): CoreBelief => ({ ...toBase(r), text_en: str(r.text_en), text_ur: str(r.text_ur) });

const toProject = (r: Row): Project => {
  const tier = num(r.tier, 2);
  return {
    ...toBase(r),
    slug: str(r.slug),
    title: str(r.title),
    tier: tier === 1 || tier === 3 ? tier : 2,
    category: oneOf(r.category, ["client", "hackathon", "tool", "design-lab"] as const, "client"),
    summary_en: str(r.summary_en), summary_ur: str(r.summary_ur),
    role_en: strOrNull(r.role_en), role_ur: strOrNull(r.role_ur),
    stack: strArray(r.stack),
    live_url: strOrNull(r.live_url), repo_url: strOrNull(r.repo_url), cover_url: strOrNull(r.cover_url),
    status: oneOf(r.status, ["live", "in-progress", "archived"] as const, "live"),
    is_featured: r.is_featured === true,
    accent: oneOf(r.accent, ["violet", "azure", "mint", "amber"] as const, "violet"),
    metrics: toMetrics(r.metrics),
    story_en: strOrNull(r.story_en), story_ur: strOrNull(r.story_ur),
    highlights_en: strArray(r.highlights_en), highlights_ur: strArray(r.highlights_ur),
  };
};

const toProjectMedia = (r: Row): ProjectMedia => ({
  ...toBase(r),
  project_id: str(r.project_id),
  url: str(r.url),
  kind: oneOf(r.kind, ["desktop", "mobile", "video", "other"] as const, "desktop"),
  caption_en: strOrNull(r.caption_en), caption_ur: strOrNull(r.caption_ur),
});

const toCampaign = (r: Row): MarketingCampaign => ({
  ...toBase(r),
  title: str(r.title),
  client_label: strOrNull(r.client_label),
  platform: oneOf(r.platform, ["meta", "tiktok", "google", "linkedin", "other"] as const, "other"),
  objective_en: str(r.objective_en), objective_ur: str(r.objective_ur),
  start_date: strOrNull(r.start_date), end_date: strOrNull(r.end_date),
  spend: numOrNull(r.spend),
  currency: str(r.currency) || "PKR",
  results: toMetrics(r.results),
  notes_en: strOrNull(r.notes_en), notes_ur: strOrNull(r.notes_ur),
  project_id: strOrNull(r.project_id),
});

const toNode = (r: Row): SystemNode => ({
  ...toBase(r),
  system_id: str(r.system_id),
  key: str(r.key),
  label_en: str(r.label_en), label_ur: str(r.label_ur),
  kind: oneOf(r.kind, ["service", "db", "ai", "queue", "client", "api", "other"] as const, "other"),
  description_en: strOrNull(r.description_en), description_ur: strOrNull(r.description_ur),
  x: num(r.x, 50), y: num(r.y, 50),
});

const toEdge = (r: Row): SystemEdge => ({
  ...toBase(r),
  system_id: str(r.system_id),
  from_key: str(r.from_key), to_key: str(r.to_key),
  label_en: strOrNull(r.label_en), label_ur: strOrNull(r.label_ur),
});

const toService = (r: Row): Service => ({
  ...toBase(r),
  title_en: str(r.title_en), title_ur: str(r.title_ur),
  audience_en: str(r.audience_en), audience_ur: str(r.audience_ur),
  includes_en: strArray(r.includes_en), includes_ur: strArray(r.includes_ur),
  cta_label_en: str(r.cta_label_en), cta_label_ur: str(r.cta_label_ur),
});

const toProcessStep = (r: Row): ProcessStep => ({
  ...toBase(r),
  sender: oneOf(r.sender, ["abdullah", "client"] as const, "abdullah"),
  message_en: str(r.message_en), message_ur: str(r.message_ur),
});

const toNiche = (r: Row): NicheTemplate => {
  const p = r.palette && typeof r.palette === "object" ? (r.palette as Row) : {};
  const items = Array.isArray(r.sample_items) ? (r.sample_items as unknown[]) : [];
  return {
    ...toBase(r),
    key: str(r.key),
    label_en: str(r.label_en), label_ur: str(r.label_ur),
    palette: { bg: str(p.bg) || "#12163A", fg: str(p.fg) || "#F2F4FF", accent: str(p.accent) || "#8A5CFF" },
    headline_en: str(r.headline_en), headline_ur: str(r.headline_ur),
    sample_items: items
      .filter((i): i is Row => !!i && typeof i === "object")
      .map((i) => ({
        name_en: str(i.name_en), name_ur: str(i.name_ur),
        ...(strOrNull(i.price) ? { price: str(i.price) } : {}),
      })),
  };
};

const toStudio = (r: Row): StudioContent => ({
  ...toBase(r),
  heading_en: str(r.heading_en), heading_ur: str(r.heading_ur),
  tagline_en: str(r.tagline_en), tagline_ur: str(r.tagline_ur),
  body_en: str(r.body_en), body_ur: str(r.body_ur),
  offers_en: strArray(r.offers_en), offers_ur: strArray(r.offers_ur),
  status_note_en: strOrNull(r.status_note_en), status_note_ur: strOrNull(r.status_note_ur),
});

/* ------------------------------------------------------------------ getters */

/** Settings: empty strings and nulls are dropped, so an empty setting is simply "not set". */
export async function getSiteSettings(): Promise<SiteSettings> {
  return withFallback(
    "site_settings",
    () =>
      cached("site_settings", "all", async () => {
        const sb = createPublicClient();
        if (!sb) throw new Error("Supabase is not configured");
        const { data, error } = await sb.from("site_settings").select("key, value");
        if (error) throw new Error(`[content:site_settings] ${error.message}`);
        const out: Record<string, string | boolean> = {};
        for (const row of (data ?? []) as { key: string; value: unknown }[]) {
          const key = row.key as keyof SiteSettings;
          if (!SETTING_KEYS.includes(key)) continue;
          if (SETTING_BOOLEAN_KEYS.includes(key)) {
            if (typeof row.value === "boolean") out[row.key] = row.value;
          } else if (typeof row.value === "string" && row.value.trim() !== "") {
            out[row.key] = row.value.trim();
          }
        }
        return out as SiteSettings;
      }),
    () => fallbackSettings,
  );
}

export async function getProfile(): Promise<Profile | null> {
  return withFallback(
    "profile",
    () => cached("profile", "one", async () => {
      const rows = await selectAll("profile");
      return rows[0] ? toProfile(rows[0]) : null;
    }),
    () => fallbackProfile,
  );
}

export async function getAchievements(): Promise<Achievement[]> {
  return withFallback(
    "achievements",
    () => cached("achievements", "all", async () => (await selectAll("achievements")).map(toAchievement).sort(byOrder)),
    () => fallbackAchievements,
  );
}

export async function getCoreBeliefs(): Promise<CoreBelief[]> {
  return withFallback(
    "core_beliefs",
    () => cached("core_beliefs", "all", async () => (await selectAll("core_beliefs")).map(toCoreBelief).sort(byOrder)),
    () => fallbackCoreBeliefs,
  );
}

async function loadProjects(): Promise<ProjectWithMedia[]> {
  const rows = await selectAll("projects", "*, media:project_media(*)");
  return rows
    .map((r) => {
      const media = Array.isArray(r.media) ? (r.media as Row[]) : [];
      return {
        ...toProject(r),
        media: media.map(toProjectMedia).filter((m) => m.is_visible && m.url).sort(byOrder),
      };
    })
    .sort(byOrder);
}

export async function getProjects(opts?: { tier?: 1 | 2 | 3; featured?: boolean }): Promise<ProjectWithMedia[]> {
  const all = await withFallback(
    "projects",
    // Tags: projects, plus project_media so editing media republishes the page.
    () => unstable_cache(loadProjects, ["content", "projects", "all"], {
      tags: [contentTag("projects"), contentTag("project_media")],
      revalidate: CONTENT_REVALIDATE_SECONDS,
    })(),
    () => fallbackProjects,
  );
  return all.filter(
    (p) => (opts?.tier === undefined || p.tier === opts.tier) && (opts?.featured === undefined || p.is_featured === opts.featured),
  );
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithMedia | null> {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  const all = await getProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getCampaigns(): Promise<MarketingCampaign[]> {
  return withFallback(
    "marketing_campaigns",
    () => cached("marketing_campaigns", "all", async () => (await selectAll("marketing_campaigns")).map(toCampaign).sort(byOrder)),
    () => fallbackCampaigns,
  );
}

async function loadSystems(): Promise<SystemWithGraph[]> {
  const rows = await selectAll("systems", "*, nodes:system_nodes(*), edges:system_edges(*)");
  return rows
    .map((r) => {
      const nodes = Array.isArray(r.nodes) ? (r.nodes as Row[]) : [];
      const edges = Array.isArray(r.edges) ? (r.edges as Row[]) : [];
      return {
        ...toBase(r),
        slug: str(r.slug),
        title_en: str(r.title_en), title_ur: str(r.title_ur),
        description_en: str(r.description_en), description_ur: str(r.description_ur),
        nodes: nodes.map(toNode).filter((n) => n.is_visible).sort(byOrder),
        edges: edges.map(toEdge).filter((e) => e.is_visible).sort(byOrder),
      };
    })
    .sort(byOrder);
}

export async function getSystems(): Promise<SystemWithGraph[]> {
  return withFallback(
    "systems",
    () => unstable_cache(loadSystems, ["content", "systems", "all"], {
      tags: [contentTag("systems"), contentTag("system_nodes"), contentTag("system_edges")],
      revalidate: CONTENT_REVALIDATE_SECONDS,
    })(),
    () => fallbackSystems,
  );
}

export async function getServices(): Promise<Service[]> {
  return withFallback(
    "services",
    () => cached("services", "all", async () => (await selectAll("services")).map(toService).sort(byOrder)),
    () => fallbackServices,
  );
}

export async function getProcessSteps(): Promise<ProcessStep[]> {
  return withFallback(
    "process_steps",
    () => cached("process_steps", "all", async () => (await selectAll("process_steps")).map(toProcessStep).sort(byOrder)),
    () => fallbackProcessSteps,
  );
}

export async function getNicheTemplates(): Promise<NicheTemplate[]> {
  return withFallback(
    "niche_templates",
    () => cached("niche_templates", "all", async () => (await selectAll("niche_templates")).map(toNiche).sort(byOrder)),
    () => fallbackNicheTemplates,
  );
}

export async function getStudioContent(): Promise<StudioContent | null> {
  return withFallback(
    "studio_content",
    () => cached("studio_content", "one", async () => {
      const rows = await selectAll("studio_content");
      return rows[0] ? toStudio(rows[0]) : null;
    }),
    () => fallbackStudioContent,
  );
}

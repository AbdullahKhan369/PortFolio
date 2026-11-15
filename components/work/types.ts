// S3-private view types. The shared data-layer types stay in "@/lib/content/types" (S1).
import type { Lang, ProjectWithMedia } from "@/lib/content/types";

/**
 * Optional case-study copy, added by supabase/migrations/s3_project_story.sql.
 * The public pages read these defensively: if the migration has not run (or the getter
 * selects explicit columns) the fields are simply undefined and the sections stay hidden.
 */
export interface ProjectStoryFields {
  story_en?: string | null;
  story_ur?: string | null;
  highlights_en?: string[] | null;
  highlights_ur?: string[] | null;
}

export type ProjectView = ProjectWithMedia & ProjectStoryFields;

export type Messages = Record<string, string>;

export function storyOf(p: ProjectView, lang: Lang): string {
  const own = lang === "ur" ? p.story_ur : p.story_en;
  return (own && own.trim()) || (p.story_en ?? "").trim();
}

export function highlightsOf(p: ProjectView, lang: Lang): string[] {
  const own = lang === "ur" ? p.highlights_ur : p.highlights_en;
  const list = own && own.length ? own : p.highlights_en ?? [];
  return list.map((s) => s.trim()).filter(Boolean);
}

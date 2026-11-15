// Picks the screenshots used in a project band from its media rows (+ cover image fallback).
import { mediaUrl } from "@/lib/media";
import { pick } from "@/lib/i18n";
import type { Lang } from "@/lib/content/types";
import type { ProjectView, Messages } from "./types";
import { fill } from "./utils";
import type { SceneShot } from "./DeviceScene";

export function pickShots(project: ProjectView, lang: Lang, m: Messages): { desktop: SceneShot | null; mobile: SceneShot | null } {
  const media = [...(project.media ?? [])].sort((a, b) => a.order_index - b.order_index);
  const d = media.find((x) => x.kind === "desktop") ?? media.find((x) => x.kind === "other");
  const mo = media.find((x) => x.kind === "mobile");

  const desktopSrc = mediaUrl(d?.url) ?? mediaUrl(project.cover_url);
  const mobileSrc = mediaUrl(mo?.url);

  const desktop = desktopSrc
    ? { src: desktopSrc, alt: (d && pick(d, "caption", lang)) || fill(m.laptop_alt, { title: project.title }) }
    : null;
  const mobile = mobileSrc
    ? { src: mobileSrc, alt: (mo && pick(mo, "caption", lang)) || fill(m.phone_alt, { title: project.title }) }
    : null;
  return { desktop, mobile };
}

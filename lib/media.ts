export const MEDIA_BUCKET = "media";

/**
 * mediaUrl("https://...")            -> unchanged
 * mediaUrl("/images/x.png")          -> unchanged (file in /public)
 * mediaUrl("profile/me.png")         -> public Supabase Storage URL in bucket "media"
 * mediaUrl(null | "" | "  ")         -> null
 */
export function mediaUrl(pathOrUrl: string | null | undefined): string | null {
  const v = pathOrUrl?.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v) || v.startsWith("/")) return v;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${v.replace(/^\/+/, "")}`;
}

/** Storage object path for one of our public URLs (used by the admin to delete files). Null for other URLs. */
export function storagePathFromUrl(url: string | null | undefined): string | null {
  const v = url?.trim();
  if (!v) return null;
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const i = v.indexOf(marker);
  if (i === -1) return null;
  const path = v.slice(i + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

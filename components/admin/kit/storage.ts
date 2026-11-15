"use client";

import { createClient } from "@/lib/supabase/browser";
import { MEDIA_BUCKET } from "@/lib/media";

export const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/avif";
export const MEDIA_ACCEPT = `${IMAGE_ACCEPT},application/pdf,video/mp4,video/webm`;
const MAX_BYTES = 10 * 1024 * 1024; // matches the bucket limit in supabase/00-setup.sql (10 MB for every file type)
const MAX_EDGE = 2400;

const EXT: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/avif": "avif",
  "application/pdf": "pdf", "video/mp4": "mp4", "video/webm": "webm",
};

export function isAllowedType(type: string, accept: string = IMAGE_ACCEPT): boolean {
  return accept.split(",").includes(type);
}

function safeName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return (base || "file").slice(0, 48);
}

export function cleanFolder(folder: string | undefined): string {
  const f = (folder ?? "uploads").toLowerCase().replace(/[^a-z0-9/_-]+/g, "-").replace(/^\/+|\/+$/g, "");
  return f || "uploads";
}

/** Phones take 5 to 12 MB photos. Shrink big JPEG/WebP/PNG files (PNG stays PNG, so transparency is kept). */
export async function shrinkImage(file: File): Promise<File> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type) || typeof createImageBitmap !== "function") return file;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size <= 2.5 * 1024 * 1024) {
      bmp.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bmp.width * scale));
    canvas.height = Math.max(1, Math.round(bmp.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bmp.close();
      return file;
    }
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, file.type, 0.88));
    if (!blob || (scale === 1 && blob.size >= file.size)) return file;
    return new File([blob], file.name, { type: file.type });
  } catch {
    return file;
  }
}

export interface UploadResult { url: string; path: string }

/** Upload to bucket "media" and return the public URL. Throws an Error with a message safe to show. */
export async function uploadToMedia(
  input: File,
  folder: string | undefined,
  accept: string = IMAGE_ACCEPT,
): Promise<UploadResult> {
  if (!isAllowedType(input.type, accept)) {
    throw new Error("This file type is not allowed. Use PNG, JPG, WebP or AVIF (PDF, MP4 and WebM in the media library).");
  }
  const file = input.type.startsWith("image/") ? await shrinkImage(input) : input;
  if (file.size > MAX_BYTES) {
    throw new Error(
      file.type.startsWith("image/")
        ? "This image is over 10 MB. Choose a smaller image or export it at a lower quality."
        : "This file is over 10 MB. Compress it or upload a shorter clip, then try again.",
    );
  }
  const ext = EXT[file.type] ?? "bin";
  const path = `${cleanFolder(folder)}/${Date.now().toString(36)}-${safeName(input.name)}.${ext}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    throw new Error(
      /row-level security|not authorized|jwt/i.test(error.message)
        ? "Upload was refused. Sign in again, then retry."
        : `Upload failed: ${error.message}`,
    );
  }
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deleteFromMedia(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await createClient().storage.from(MEDIA_BUCKET).remove(paths);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export function formatBytes(n: number | undefined | null): string {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

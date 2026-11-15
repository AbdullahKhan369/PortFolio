"use client";

/** Ask the server to refresh the public site. Resolves false (never throws) so saving can still succeed. */
export async function revalidateTags(tags: string[] | "all"): Promise<boolean> {
  try {
    const res = await fetch("/api/revalidate", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tags === "all" ? { all: true } : { tags }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

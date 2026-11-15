/** Tiny helper for reading flat namespace messages loaded with getMessages(). S2-internal. */
export type Ns = Record<string, string> | undefined;

export function tr(ns: Ns, key: string, vars?: Record<string, string | number>): string {
  let out = ns?.[key] ?? "";
  if (vars) {
    for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  }
  return out;
}

/** Splits a plain-text body on blank lines into paragraphs. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

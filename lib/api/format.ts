/** Replaces {name} tokens in message strings. Missing tokens are left empty. */
export function fmt(template: string | undefined, vars: Record<string, string | number> = {}): string {
  return (template ?? "").replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

/** Splits a flat message value into paragraphs on blank lines. */
export function paragraphs(text: string | undefined): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

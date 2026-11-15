import type { Lang } from "@/lib/content/types";
import { getCopyOverrides } from "@/lib/content/copy";

type Dict = Record<string, string>;

const NS_PATTERN = /^[a-z0-9-]+$/;

/** Loads lib/i18n/messages/<ns>.<lang>.json. Missing files return {} (never throw). */
async function loadFile(ns: string, lang: Lang): Promise<Dict> {
  try {
    const mod = (await import(`./messages/${ns}.${lang}.json`)) as { default?: unknown };
    const data = mod.default ?? mod;
    return data && typeof data === "object" ? (data as Dict) : {};
  } catch {
    return {};
  }
}

/** The built-in text of one namespace (no admin overrides). For Roman Urdu, missing keys fall back to English. */
export async function loadDefaultNamespace(ns: string, lang: Lang): Promise<Dict> {
  if (!NS_PATTERN.test(ns)) return {};
  if (lang === "en") return loadFile(ns, "en");
  const [en, ur] = await Promise.all([loadFile(ns, "en"), loadFile(ns, "ur")]);
  return { ...en, ...ur };
}

/** One namespace with the admin's edits from Admin > Site text applied on top. */
export async function loadNamespace(ns: string, lang: Lang): Promise<Dict> {
  if (!NS_PATTERN.test(ns)) return {};
  const [base, overrides] = await Promise.all([loadDefaultNamespace(ns, lang), getCopyOverrides()]);
  const out: Dict = { ...base };
  const prefix = `${ns}.`;
  for (const [key, v] of Object.entries(overrides)) {
    if (!key.startsWith(prefix)) continue;
    const value = lang === "ur" ? v.ur : v.en;
    if (value && value.trim()) out[key.slice(prefix.length)] = value;
  }
  return out;
}

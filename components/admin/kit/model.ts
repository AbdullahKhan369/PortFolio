// Pure helpers: form values <-> database rows, and zod validation built from a CrudConfig.
import { z } from "zod";
import type { CrudConfig, FieldDef } from "./types";

export type FormValues = Record<string, unknown>;
export type DbRow = Record<string, unknown> & { id: string };
export interface MetricValue { label_en: string; label_ur: string; value: string }

const isBilingual = (t: FieldDef["type"]) =>
  t === "bilingual-text" || t === "bilingual-textarea" || t === "bilingual-list";

/** Form keys used by a field (one key, or _en/_ur for bilingual types). */
export function formKeys(f: FieldDef): string[] {
  return isBilingual(f.type) ? [`${f.name}_en`, `${f.name}_ur`] : [f.name];
}

function emptyFor(f: FieldDef): unknown {
  switch (f.type) {
    case "boolean": return false;
    case "tags":
    case "bilingual-list":
    case "metrics": return [];
    default: return "";
  }
}

function getPath(row: DbRow | null | undefined, path: string): unknown {
  if (!row) return undefined;
  if (!path.includes(".")) return row[path];
  let cur: unknown = row;
  for (const part of path.split(".")) {
    if (cur && typeof cur === "object") cur = (cur as Record<string, unknown>)[part];
    else return undefined;
  }
  return cur;
}

function toFormValue(f: FieldDef, raw: unknown, key: string): unknown {
  const isList = f.type === "tags" || f.type === "bilingual-list";
  if (isList) return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  if (f.type === "boolean") return raw === true;
  if (f.type === "metrics") {
    return Array.isArray(raw)
      ? raw.map((m) => {
          const o = (m ?? {}) as Record<string, unknown>;
          return {
            label_en: typeof o.label_en === "string" ? o.label_en : "",
            label_ur: typeof o.label_ur === "string" ? o.label_ur : "",
            value: o.value === null || o.value === undefined ? "" : String(o.value),
          } satisfies MetricValue;
        })
      : [];
  }
  if (raw === null || raw === undefined) return emptyFor(f);
  void key;
  return typeof raw === "string" ? raw : String(raw);
}

/** Values for the form. For a new row, config.defaultValues fill in first. */
export function toFormValues(config: CrudConfig, row?: DbRow | null): FormValues {
  const values: FormValues = {};
  for (const f of config.fields) {
    for (const key of formKeys(f)) {
      const fromRow = row ? getPath(row, key) : undefined;
      const fromDefault = row ? undefined : (config.defaultValues?.[key] ?? config.defaultValues?.[f.name]);
      values[key] = toFormValue(f, row ? fromRow : fromDefault, key);
    }
  }
  return values;
}

/* ------------------------------------------------------------------ validation */

const URL_RE = /^https?:\/\/\S+$/i;
const IMG_RE = /^(https?:\/\/|\/)\S+$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function textSchema(f: FieldDef, maxLen: number) {
  const base = z.string().max(maxLen, `${f.label} is too long (max ${maxLen} characters).`);
  return f.required ? base.trim().min(1, `${f.label} is required.`) : base;
}

function schemaFor(f: FieldDef): Record<string, z.ZodTypeAny> {
  switch (f.type) {
    case "text":
      return { [f.name]: textSchema(f, 300) };
    case "textarea":
      return { [f.name]: textSchema(f, 10000) };
    case "url":
      return {
        [f.name]: textSchema(f, 500).refine((v) => v.trim() === "" || URL_RE.test(v.trim()), {
          message: `${f.label} must be a full link starting with https://`,
        }),
      };
    case "image":
      return {
        [f.name]: textSchema(f, 700).refine((v) => v.trim() === "" || IMG_RE.test(v.trim()), {
          message: `${f.label} must be an uploaded image or a full link.`,
        }),
      };
    case "date":
      return {
        [f.name]: textSchema(f, 10).refine((v) => v.trim() === "" || DATE_RE.test(v.trim()), {
          message: `${f.label} must be a date.`,
        }),
      };
    case "color":
      return {
        [f.name]: textSchema(f, 7).refine((v) => v.trim() === "" || COLOR_RE.test(v.trim()), {
          message: `${f.label} must be a colour like #12163A.`,
        }),
      };
    case "number":
      return {
        [f.name]: textSchema(f, 30).superRefine((v, ctx) => {
          const t = v.trim();
          if (t === "") return;
          const n = Number(t);
          if (!Number.isFinite(n)) {
            ctx.addIssue({ code: "custom", message: `${f.label} must be a number.` });
            return;
          }
          if (f.min !== undefined && n < f.min) ctx.addIssue({ code: "custom", message: `${f.label} must be at least ${f.min}.` });
          if (f.max !== undefined && n > f.max) ctx.addIssue({ code: "custom", message: `${f.label} must be at most ${f.max}.` });
        }),
      };
    case "boolean":
      return { [f.name]: z.boolean() };
    case "select": {
      const allowed = (f.options ?? []).map((o) => o.value);
      return {
        [f.name]: z.string().refine((v) => (v === "" ? !f.required : allowed.includes(v)), {
          message: f.required ? `Choose a ${f.label.toLowerCase()}.` : `${f.label} is not a valid choice.`,
        }),
      };
    }
    case "tags": {
      const arr = z.array(z.string().trim().min(1).max(60, `Each ${f.label.toLowerCase()} item must be under 60 characters.`)).max(60);
      return { [f.name]: f.required ? arr.min(1, `Add at least one ${f.label.toLowerCase()}.`) : arr };
    }
    case "bilingual-text":
      return {
        [`${f.name}_en`]: textSchema(f, 300),
        [`${f.name}_ur`]: z.string().max(300, `${f.label} (Roman Urdu) is too long.`),
      };
    case "bilingual-textarea":
      return {
        [`${f.name}_en`]: textSchema(f, 10000),
        [`${f.name}_ur`]: z.string().max(10000, `${f.label} (Roman Urdu) is too long.`),
      };
    case "bilingual-list": {
      const item = z.string().max(300, `Each ${f.label.toLowerCase()} line must be under 300 characters.`);
      const en = z.array(item).max(60);
      return {
        [`${f.name}_en`]: f.required
          ? en.refine((a) => a.some((s) => s.trim() !== ""), { message: `Add at least one English ${f.label.toLowerCase()} line.` })
          : en,
        [`${f.name}_ur`]: z.array(item).max(60),
      };
    }
    case "metrics": {
      const metric = z
        .object({ label_en: z.string().max(80), label_ur: z.string().max(80), value: z.string().max(60) })
        .superRefine((m, ctx) => {
          const hasValue = m.value.trim() !== "";
          const hasLabel = m.label_en.trim() !== "";
          if (hasValue && !hasLabel) {
            ctx.addIssue({ code: "custom", path: ["label_en"], message: `Each ${f.label.toLowerCase()} entry with a value needs an English label.` });
          }
        });
      return { [f.name]: z.array(metric).max(30) };
    }
  }
}

export function buildSchema(config: CrudConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of config.fields) Object.assign(shape, schemaFor(f));
  return z.object(shape).passthrough();
}

/** Returns { errors } keyed by form key, or {} when valid. */
export function validate(config: CrudConfig, values: FormValues): Record<string, string> {
  const result = buildSchema(config).safeParse(values);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "_form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/* ------------------------------------------------------------------ payload */

const trim = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const nullIfEmpty = (v: unknown) => (trim(v) === "" ? null : trim(v));

function listOf(v: unknown): string[] {
  return Array.isArray(v) ? v.map((s) => trim(s)).filter(Boolean) : [];
}

function setPath(target: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  let cur = target;
  parts.slice(0, -1).forEach((p) => {
    if (typeof cur[p] !== "object" || cur[p] === null) cur[p] = {};
    cur = cur[p] as Record<string, unknown>;
  });
  cur[parts[parts.length - 1]] = value;
}

/**
 * Database columns from validated form values.
 * Empty optional text becomes null; required bilingual Roman Urdu stays "" (the column is NOT NULL);
 * optional bilingual Roman Urdu becomes null. Number "" becomes null.
 */
export function toPayload(config: CrudConfig, values: FormValues): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const nested: Record<string, Record<string, unknown>> = {};

  for (const f of config.fields) {
    const put = (key: string, value: unknown) => {
      if (key.includes(".")) {
        const [root] = key.split(".");
        nested[root] ??= {};
        if (value !== null && value !== "") setPath(nested[root], key.slice(root.length + 1), value);
      } else {
        out[key] = value;
      }
    };

    switch (f.type) {
      case "text":
      case "textarea":
      case "url":
      case "image":
      case "date":
      case "color":
      case "select":
        put(f.name, f.required ? trim(values[f.name]) : nullIfEmpty(values[f.name]));
        break;
      case "number": {
        const t = trim(values[f.name]);
        put(f.name, t === "" ? null : Number(t));
        break;
      }
      case "boolean":
        put(f.name, values[f.name] === true);
        break;
      case "tags":
        put(f.name, Array.from(new Set(listOf(values[f.name]))));
        break;
      case "bilingual-text":
      case "bilingual-textarea":
        put(`${f.name}_en`, f.required ? trim(values[`${f.name}_en`]) : nullIfEmpty(values[`${f.name}_en`]));
        put(`${f.name}_ur`, f.required ? trim(values[`${f.name}_ur`]) : nullIfEmpty(values[`${f.name}_ur`]));
        break;
      case "bilingual-list":
        put(`${f.name}_en`, listOf(values[`${f.name}_en`]));
        put(`${f.name}_ur`, listOf(values[`${f.name}_ur`]));
        break;
      case "metrics": {
        const list = Array.isArray(values[f.name]) ? (values[f.name] as MetricValue[]) : [];
        put(
          f.name,
          list
            .filter((m) => trim(m.label_en) !== "" || trim(m.value) !== "")
            .map((m) => ({ label_en: trim(m.label_en), label_ur: trim(m.label_ur), value: nullIfEmpty(m.value) })),
        );
        break;
      }
    }
  }

  for (const [root, obj] of Object.entries(nested)) out[root] = Object.keys(obj).length ? obj : null;
  return out;
}

/* ------------------------------------------------------------------ display */

/** Plain text for a list cell. */
export function cellText(f: FieldDef, row: DbRow): string {
  const get = (k: string) => row[k];
  switch (f.type) {
    case "bilingual-text":
    case "bilingual-textarea":
      return String(get(`${f.name}_en`) ?? "");
    case "bilingual-list": {
      const a = get(`${f.name}_en`);
      return Array.isArray(a) ? a.join(", ") : "";
    }
    case "boolean":
      return get(f.name) === true ? "Yes" : "No";
    case "select": {
      const v = get(f.name);
      return f.options?.find((o) => o.value === v)?.label ?? (v == null ? "" : String(v));
    }
    case "tags": {
      const a = get(f.name);
      return Array.isArray(a) ? a.join(", ") : "";
    }
    case "metrics": {
      const a = get(f.name);
      const filled = Array.isArray(a) ? a.filter((m) => (m as { value?: unknown })?.value) : [];
      return filled.length ? `${filled.length} with a value` : "None";
    }
    case "url": {
      const v = get(f.name);
      if (typeof v !== "string" || !v) return "";
      try { return new URL(v).hostname.replace(/^www\./, ""); } catch { return v; }
    }
    case "image":
      return get(f.name) ? "Has image" : "No image";
    default: {
      const v = getPath(row, f.name);
      return v === null || v === undefined ? "" : String(v);
    }
  }
}

export function rowTitle(config: CrudConfig, row: DbRow): string {
  const first = config.fields.find((f) => f.name === config.tableColumns[0]) ?? config.fields[0];
  const t = first ? cellText(first, row) : "";
  return t || `Untitled ${config.singular.toLowerCase()}`;
}

/** Row matches the search box (case-insensitive, across both languages). */
export function matchesQuery(config: CrudConfig, row: DbRow, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const names = config.searchFields?.length ? config.searchFields : config.tableColumns;
  return names.some((name) => {
    const f = config.fields.find((x) => x.name === name);
    const keys = f && isBilingual(f.type) ? [`${name}_en`, `${name}_ur`] : [name];
    return keys.some((k) => {
      const v = getPath(row, k);
      return (Array.isArray(v) ? v.join(" ") : String(v ?? "")).toLowerCase().includes(needle);
    });
  });
}

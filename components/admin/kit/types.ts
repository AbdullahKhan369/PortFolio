// CRUD kit: frozen API from contract.md section 7.
export type FieldType =
  | "text" | "textarea" | "number" | "date" | "boolean" | "select" | "url" | "color" | "tags"
  | "image"              // uploads to storage bucket "media"; stores public URL
  | "bilingual-text"     // base name "title" reads/writes title_en + title_ur
  | "bilingual-textarea"
  | "bilingual-list"     // base name "includes" reads/writes includes_en[] + includes_ur[]
  | "metrics";           // edits Metric[] (label_en, label_ur, value optional)

export interface FieldDef {
  /**
   * Column name. For bilingual types this is the base name ("title" -> title_en + title_ur).
   * Extension: a dotted name edits one key of a jsonb object column, for example "photo_layers.dev"
   * or "palette.bg". Empty keys are left out and an empty object is saved as null.
   */
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  help?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  /** image: storage folder inside the "media" bucket */
  folder?: string;
  showInTable?: boolean;
}

export interface CrudConfig {
  // MUST be plain JSON-serializable (no functions): it crosses from a Server Component to the client.
  table: string;
  title: string;
  singular: string;
  /** Revalidation tag, "content:<table>" */
  tag: string;
  fields: FieldDef[];
  /** Field names shown in the list (first one is the row title on phones). */
  tableColumns: string[];
  searchFields?: string[];
  defaultValues?: Record<string, unknown>;
  /** default true */
  orderable?: boolean;
  /** default true */
  hasVisibility?: boolean;
  /** default false. One row only (profile, studio_content): shows the form directly, no list. */
  singleRow?: boolean;
}

export function defineCrud(c: CrudConfig): CrudConfig {
  return c;
}

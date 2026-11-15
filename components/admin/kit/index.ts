// components/admin/kit/index.ts: the frozen CRUD kit API (contract.md section 7).
export type { CrudConfig, FieldDef, FieldType } from "./types";
export { defineCrud } from "./types";
export { CrudPage } from "./CrudPage";

// Extras (additive; pages may use them, nothing requires them):
export { ToastProvider, useToast } from "./Toast";
export { ConfirmDialog } from "./ConfirmDialog";
export { Modal } from "./Modal";
export { ImageUpload } from "./ImageUpload";
export { revalidateTags } from "./revalidate";

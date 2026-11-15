import { CrudPage, defineCrud } from "@/components/admin/kit";

const config = defineCrud({
  table: "services",
  title: "Services",
  singular: "Service",
  tag: "content:services",
  fields: [
    { name: "title", label: "Service name", type: "bilingual-text", required: true, showInTable: true, help: "Shown as the row title in the Services ledger." },
    { name: "audience", label: "Who it is for", type: "bilingual-textarea", required: true, help: "One or two plain sentences." },
    { name: "includes", label: "What is included", type: "bilingual-list", help: "One item per line. Keep the English and Roman Urdu lists in the same order." },
    { name: "cta_label", label: "Button text", type: "bilingual-text", required: true, help: "What happens on tap, for example: Ask about a website. The button opens WhatsApp." },
  ],
  tableColumns: ["title"],
  searchFields: ["title_en", "title_ur"],
  orderable: true,
  hasVisibility: true,
  defaultValues: { cta_label_en: "Ask about this", cta_label_ur: "Is ke baare mein poochein" },
});

export default function Page() {
  return <CrudPage config={config} />;
}

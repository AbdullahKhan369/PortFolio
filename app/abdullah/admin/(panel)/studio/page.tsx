import { CrudPage, defineCrud } from "@/components/admin/kit";

const config = defineCrud({
  table: "studio_content",
  title: "The Prism Arc (studio section)",
  singular: "Studio section",
  tag: "content:studio_content",
  fields: [
    { name: "heading", label: "Heading", type: "bilingual-text", required: true, showInTable: true },
    { name: "tagline", label: "Tagline", type: "bilingual-text", required: true, help: "For example: Where Businesses Evolve." },
    { name: "body", label: "Intro text", type: "bilingual-textarea", required: true, help: "Leave a blank line between paragraphs. Do not add team members, clients or awards that do not exist." },
    { name: "offers", label: "What the studio does", type: "bilingual-list", help: "One item per line, 3 to 6 items. Each one gets a marker on the arc." },
    { name: "status_note", label: "Status note (optional)", type: "bilingual-text", help: "A short line such as current availability. Leave empty to hide it." },
  ],
  tableColumns: ["heading"],
  singleRow: true,
  orderable: false,
  hasVisibility: true,
});

export default function Page() {
  return <CrudPage config={config} />;
}

import { CrudPage, defineCrud } from "@/components/admin/kit";
import NicheDetailsEditor from "@/components/admin-s3/NicheDetailsEditor";

const config = defineCrud({
  table: "niche_templates",
  title: "Niche templates",
  singular: "Niche",
  tag: "content:niche_templates",
  fields: [
    { name: "label", label: "Name", type: "bilingual-text", required: true, showInTable: true },
    { name: "key", label: "Key", type: "text", required: true, help: "Lowercase and unique, for example jewellery. Used in the brief sent to WhatsApp." },
    { name: "headline", label: "Sample headline", type: "bilingual-text", required: true, help: "Headline on the sample homepage for this niche." },
  ],
  tableColumns: ["label", "key"],
  searchFields: ["key", "label_en"],
});

export default function Page() {
  return (
    <>
      <CrudPage config={config} />
      <NicheDetailsEditor />
    </>
  );
}

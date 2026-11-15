import { CrudPage, defineCrud } from "@/components/admin/kit";
import SystemEdgesEditor from "@/components/admin-s3/SystemEdgesEditor";
import SystemNodesEditor from "@/components/admin-s3/SystemNodesEditor";

const config = defineCrud({
  table: "systems",
  title: "Systems",
  singular: "System",
  tag: "content:systems",
  fields: [
    { name: "title", label: "Title", type: "bilingual-text", required: true, showInTable: true },
    { name: "slug", label: "URL name", type: "text", required: true, help: "Lowercase letters, numbers and hyphens, for example car-quote." },
    { name: "description", label: "Description", type: "bilingual-textarea", required: true, help: "Describe Mehfil as an internal campaign tool. Do not name the auction site the car quote tool reads from." },
  ],
  tableColumns: ["title", "slug"],
  searchFields: ["slug", "title_en"],
});

export default function Page() {
  return (
    <>
      <CrudPage config={config} />
      <SystemNodesEditor />
      <SystemEdgesEditor />
    </>
  );
}

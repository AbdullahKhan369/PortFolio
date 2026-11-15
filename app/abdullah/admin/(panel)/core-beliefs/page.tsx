import { CrudPage, defineCrud } from "@/components/admin/kit";
import { PageHeader } from "@/components/admin/shell/PageHeader";

export const metadata = { title: "Core beliefs" };

const config = defineCrud({
  table: "core_beliefs",
  title: "Core beliefs",
  singular: "Belief",
  tag: "content:core_beliefs",
  tableColumns: ["text"],
  fields: [
    { name: "text", label: "Checkpoint", type: "bilingual-text", required: true,
      help: "One line that ticks on the pre-flight checklist. The order here is the order visitors see." },
  ],
});

export default function Page() {
  return (
    <>
      <PageHeader title="Core beliefs" intro="The checkpoints on your pre-flight checklist." />
      <CrudPage config={config} />
    </>
  );
}

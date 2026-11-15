import { CrudPage, defineCrud } from "@/components/admin/kit";
import { PageHeader } from "@/components/admin/shell/PageHeader";

export const metadata = { title: "Achievements" };

const config = defineCrud({
  table: "achievements",
  title: "Achievements",
  singular: "Achievement",
  tag: "content:achievements",
  tableColumns: ["title", "kind", "year"],
  searchFields: ["title", "description"],
  defaultValues: { kind: "course" },
  fields: [
    { name: "title", label: "Title", type: "bilingual-text", required: true },
    { name: "description", label: "Short text", type: "bilingual-textarea",
      help: "One or two plain sentences. Leave empty if the title says it all." },
    { name: "kind", label: "Type", type: "select", required: true, options: [
      { value: "course", label: "Course" }, { value: "certificate", label: "Certificate" },
      { value: "result", label: "Result" }, { value: "work", label: "Work" }, { value: "other", label: "Other" },
    ] },
    { name: "year", label: "Year", type: "number", min: 1990, max: 2100, placeholder: "Leave empty to show no year",
      help: "Only set it if you are sure. Empty means no year is shown." },
    { name: "image_url", label: "Proof image or certificate scan", type: "image", folder: "achievements" },
    { name: "proof_url", label: "Proof link", type: "url", help: "Optional link to a verification page or a file from the Media library." },
  ],
});

export default function Page() {
  return (
    <>
      <PageHeader title="Achievements" intro="Courses, results and work history shown on the comet timeline." />
      <CrudPage config={config} />
    </>
  );
}

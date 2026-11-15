import { CrudPage, defineCrud } from "@/components/admin/kit";
import ProjectMediaEditor from "@/components/admin-s3/ProjectMediaEditor";

const config = defineCrud({
  table: "projects",
  title: "Projects",
  singular: "Project",
  tag: "content:projects",
  fields: [
    { name: "title", label: "Title", type: "text", required: true, showInTable: true },
    { name: "slug", label: "URL name", type: "text", required: true, help: "Lowercase letters, numbers and hyphens. The case study opens at /en/work/<url name>." },
    { name: "tier", label: "Tier", type: "number", required: true, min: 1, max: 3, showInTable: true, help: "1 = featured band with a case study. 2 = compact card in the Design lab. 3 = GitHub only (keep it hidden)." },
    {
      name: "category", label: "Category", type: "select", required: true,
      options: [
        { value: "client", label: "Client project" },
        { value: "hackathon", label: "Hackathon project (labelled as such on the site)" },
        { value: "tool", label: "Internal tool" },
        { value: "design-lab", label: "Design lab" },
      ],
    },
    {
      name: "status", label: "Status", type: "select", required: true, showInTable: true,
      options: [
        { value: "live", label: "Live" },
        { value: "in-progress", label: "In progress" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      name: "accent", label: "Band colour", type: "select", required: true,
      options: [
        { value: "violet", label: "Violet" },
        { value: "azure", label: "Azure" },
        { value: "mint", label: "Mint" },
        { value: "amber", label: "Amber" },
      ],
    },
    { name: "is_featured", label: "Featured", type: "boolean" },
    { name: "summary", label: "Summary", type: "bilingual-textarea", required: true },
    { name: "role", label: "My role", type: "bilingual-text" },
    { name: "stack", label: "Built with", type: "tags", help: "Type a tool and press Enter." },
    { name: "live_url", label: "Live link", type: "url", help: "When set, a Live link button opens it in a new tab. Leave empty if there is no live site." },
    { name: "repo_url", label: "Source code link", type: "url" },
    { name: "cover_url", label: "Cover image", type: "image", folder: "projects", help: "Used in the laptop frame when the project has no desktop screenshot." },
    { name: "metrics", label: "Results", type: "metrics", help: "Only metrics with a value are shown. Leave the value empty to hide a metric." },
    { name: "story", label: "Case study story", type: "bilingual-textarea", help: "Optional. Plain text; a blank line starts a new paragraph. Shown on the case-study page." },
    { name: "highlights", label: "What's inside", type: "bilingual-list", help: "Optional bullet list on the case-study page, one item per line." },
  ],
  tableColumns: ["title", "tier", "status"],
  searchFields: ["title", "slug"],
  defaultValues: { tier: 1, category: "client", status: "live", accent: "violet", is_featured: false, stack: [], metrics: [] },
});

export default function Page() {
  return (
    <>
      <CrudPage config={config} />
      <ProjectMediaEditor />
    </>
  );
}

import { CrudPage, defineCrud } from "@/components/admin/kit";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  // Projects a campaign can belong to (shows its receipt on that project's case study too).
  // Read with the admin's own session so hidden and brand-new projects are listed too (not the public cache).
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("id, title").order("order_index", { ascending: true });
  const projects = ((data ?? []) as { id: string; title: string }[]).filter((p) => p.id && p.title);
  const config = defineCrud({
    table: "marketing_campaigns",
    title: "Campaigns",
    singular: "Campaign",
    tag: "content:marketing_campaigns",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, showInTable: true },
      { name: "client_label", label: "Client (optional)", type: "text", help: "Shown on the receipt. Leave empty to hide." },
      {
        name: "platform", label: "Platform", type: "select", required: true, showInTable: true,
        options: [
          { value: "meta", label: "Meta (Facebook and Instagram)" },
          { value: "tiktok", label: "TikTok" },
          { value: "google", label: "Google" },
          { value: "linkedin", label: "LinkedIn" },
          { value: "other", label: "Other" },
        ],
      },
      { name: "objective", label: "Objective", type: "bilingual-text", required: true, help: "For example: get WhatsApp messages." },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "end_date", label: "End date", type: "date" },
      { name: "spend", label: "Spend", type: "number", min: 0, help: "Empty = not shown on the site." },
      { name: "currency", label: "Currency code", type: "text", placeholder: "PKR", help: "Three letters, for example PKR, USD, AED." },
      { name: "results", label: "Results", type: "metrics", help: "Write each result as what it is, for example WhatsApp messages. A metric with an empty value is hidden." },
      { name: "notes", label: "Notes", type: "bilingual-textarea", help: "Optional short note on the receipt." },
      {
        name: "project_id", label: "Related project", type: "select",
        options: [{ value: "", label: "None" }, ...projects.map((p) => ({ value: p.id, label: p.title }))],
        help: "Optional. Adds a link on the receipt and shows it on that project's case study.",
      },
    ],
    tableColumns: ["title", "platform"],
    searchFields: ["title", "client_label"],
    defaultValues: { platform: "meta", currency: "PKR", results: [] },
  });
  return <CrudPage config={config} />;
}

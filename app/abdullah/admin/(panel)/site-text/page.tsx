import { PageHeader } from "@/components/admin/shell/PageHeader";
import { CopyEditor, type CopyGroup } from "@/components/admin/shell/CopyEditor";
import { loadDefaultNamespace } from "@/lib/i18n/loader";

export const metadata = { title: "Site text" };

const NAMESPACES: { ns: string; label: string }[] = [
  { ns: "hero", label: "Hero (top of the home page)" },
  { ns: "about", label: "About" },
  { ns: "achievements", label: "Achievements" },
  { ns: "projects", label: "Projects" },
  { ns: "marketing", label: "Marketing projects" },
  { ns: "systems", label: "Systems map" },
  { ns: "services", label: "Services" },
  { ns: "process", label: "How I work" },
  { ns: "tryit", label: "Try your business" },
  { ns: "studio", label: "Studio (The Prism Arc)" },
  { ns: "contact", label: "Contact" },
  { ns: "beliefs", label: "Core Beliefs" },
  { ns: "sparks", label: "3-6-9 sparks" },
  { ns: "nav", label: "Menu" },
  { ns: "common", label: "Shared (buttons, footer, labels)" },
  { ns: "errors", label: "Error and not-found pages" },
  { ns: "legal", label: "Legal pages" },
];

export default async function Page() {
  const groups: CopyGroup[] = await Promise.all(
    NAMESPACES.map(async ({ ns, label }) => {
      const [en, ur] = await Promise.all([loadDefaultNamespace(ns, "en"), loadDefaultNamespace(ns, "ur")]);
      return { ns, label, rows: Object.keys(en).map((key) => ({ key, en: en[key] ?? "", ur: ur[key] ?? "" })) };
    }),
  );
  return (
    <>
      <PageHeader
        title="Site text"
        intro="Every fixed sentence on the public site (headings, buttons, labels, hero cards, About facts). Type your own wording in English and Roman Urdu. Leave a box empty to keep the built-in text."
      />
      <CopyEditor groups={groups} />
    </>
  );
}

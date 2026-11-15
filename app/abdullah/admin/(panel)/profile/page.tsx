import { CrudPage, defineCrud } from "@/components/admin/kit";
import { PageHeader } from "@/components/admin/shell/PageHeader";

export const metadata = { title: "Profile" };

const config = defineCrud({
  table: "profile",
  title: "Profile",
  singular: "Profile",
  tag: "content:profile",
  singleRow: true,
  orderable: false,
  hasVisibility: false,
  tableColumns: ["name"],
  fields: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "tagline", label: "Tagline", type: "bilingual-text" },
    { name: "bio", label: "Bio", type: "bilingual-textarea" },
    { name: "photo_url", label: "Photo", type: "image", folder: "profile",
      help: "Transparent-background PNG. Phones can upload straight from the gallery." },
    { name: "photo_layers.dev", label: "Development layer", type: "image", folder: "profile",
      help: "Optional. Same photo tinted for the Development layer of the hero split." },
    { name: "photo_layers.ads", label: "Ads layer", type: "image", folder: "profile", help: "Optional." },
    { name: "photo_layers.creative", label: "Creative layer", type: "image", folder: "profile", help: "Optional." },
  ],
});

export default function Page() {
  return (
    <>
      <PageHeader title="Profile" intro="Your name, bio and photo." />
      <CrudPage config={config} />
    </>
  );
}

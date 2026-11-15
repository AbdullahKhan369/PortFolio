import { PageHeader } from "@/components/admin/shell/PageHeader";
import { AppearanceEditor } from "@/components/admin/shell/AppearanceEditor";

export const metadata = { title: "Appearance" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Appearance"
        intro="Colours, visual effects and which sections appear on the home page, and in what order. Empty colours keep the built-in Prism Arc palette."
      />
      <AppearanceEditor />
    </>
  );
}

import { PageHeader } from "@/components/admin/shell/PageHeader";
import { SecurityPanel } from "@/components/admin/shell/SecurityPanel";
import { SettingsEditor } from "@/components/admin/shell/SettingsEditor";

export const metadata = { title: "Settings" };

export default function Page() {
  return (
    <>
      <PageHeader title="Settings" intro="Contact details, home page copy and site options. Empty values are never shown on the public site." />
      <SettingsEditor />
      <SecurityPanel />
    </>
  );
}

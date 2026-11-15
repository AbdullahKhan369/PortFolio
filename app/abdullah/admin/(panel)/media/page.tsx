import { MediaLibrary } from "@/components/admin/shell/MediaLibrary";
import { PageHeader } from "@/components/admin/shell/PageHeader";

export const metadata = { title: "Media" };

export default function Page() {
  return (
    <>
      <PageHeader title="Media" intro="Photos, certificate scans, screenshots and videos. Copy a file link and paste it into any image or link field." />
      <MediaLibrary />
    </>
  );
}

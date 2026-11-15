"use client";

import { useState } from "react";
import { revalidateTags } from "../kit/revalidate";
import { useToast } from "../kit/Toast";

/** "Publish changes": refreshes every cached content tag so the public site shows the latest data. */
export function PublishButton() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function publish() {
    setBusy(true);
    const ok = await revalidateTags("all");
    setBusy(false);
    if (ok) toast.success("Published. The public site now shows your latest changes.");
    else toast.error("Could not publish. You may be signed out. Sign in again, then press Publish changes.");
  }

  return (
    <button type="button" className="a-btn a-btn-primary" onClick={() => void publish()} disabled={busy}>
      {busy ? "Publishing..." : "Publish changes"}
    </button>
  );
}

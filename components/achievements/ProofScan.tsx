"use client";

import { useState } from "react";
import Image from "next/image";
import { Sheet } from "@/components/ui/Sheet";

/** Certificate / proof thumbnail. Tapping opens the full scan in the shared Sheet. */
export function ProofScan({
  src,
  title,
  alt,
  openLabel,
}: {
  src: string;
  title: string;
  alt: string;
  openLabel: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="pa-scan" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={openLabel}>
        <Image className="pa-scan-img" src={src} alt={alt} fill sizes="160px" loading="lazy" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={title}>
        <div className="pa-scan-full">
          <Image className="pa-scan-img pa-scan-img--contain" src={src} alt={alt} fill sizes="(min-width: 768px) 560px, 100vw" />
        </div>
      </Sheet>
    </>
  );
}

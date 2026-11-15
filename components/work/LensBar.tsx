"use client";
// Three Lenses: look at every project as a developer (stack), as an ad runner (campaigns) or as a designer (visuals).
// The bands render all three panels on the server; this bar only sets data-lens on #projects and CSS shows one.
// A lens with no data is not offered, so nothing is ever invented. With only Dev available the bar is hidden.
import { useState } from "react";

type Lens = "dev" | "ads" | "creative";

export default function LensBar({ ads, creative, labels }: { ads: boolean; creative: boolean; labels: { aria: string; dev: string; ads: string; creative: string } }) {
  const [lens, setLens] = useState<Lens>("dev");
  if (!ads && !creative) return null;

  const options: { key: Lens; label: string }[] = [{ key: "dev", label: labels.dev }];
  if (ads) options.push({ key: "ads", label: labels.ads });
  if (creative) options.push({ key: "creative", label: labels.creative });

  const choose = (key: Lens): void => {
    setLens(key);
    document.getElementById("projects")?.setAttribute("data-lens", key);
  };

  return (
    <div className="pa-lens-bar" role="group" aria-label={labels.aria}>
      {options.map((o) => (
        <button key={o.key} type="button" className="pa-lens-btn" data-lens-btn={o.key} aria-pressed={lens === o.key} onClick={() => choose(o.key)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

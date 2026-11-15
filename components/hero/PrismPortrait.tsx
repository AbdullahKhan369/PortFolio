"use client";

import { useRef } from "react";
import Image from "next/image";
import { usePerformanceTier } from "@/lib/device";
import { smoothstep, useScrollLinked } from "@/lib/motion";
import { Morph } from "@/components/layout/Morph";
import { PortraitPlaceholder } from "./PortraitPlaceholder";

export type RoleKey = "dev" | "ads" | "creative";

export interface PortraitPhoto {
  /** Transparent PNG of Abdullah (profile.photo_url). Null shows the silhouette. */
  src: string | null;
  /** Optional ready-made layer images (profile.photo_layers). Missing ones are derived from `src`. */
  layers: { dev?: string; ads?: string; creative?: string } | null;
  alt: string;
}

export interface PortraitRole {
  key: RoleKey;
  title: string;
  line: string;
}

const KEYS: RoleKey[] = ["dev", "ads", "creative"];

/** Violet / azure / mint as 0..1 RGB, used to turn a photo into a luminous one-colour copy. */
const TINTS: Record<RoleKey, [number, number, number]> = {
  dev: [0.541, 0.361, 1],
  ads: [0.227, 0.627, 1],
  creative: [0.31, 0.89, 0.69],
};

function tintMatrix([r, g, b]: [number, number, number]): string {
  const gain = 1.3;
  const row = (c: number): string => `${(c * gain * 0.2126).toFixed(4)} ${(c * gain * 0.7152).toFixed(4)} ${(c * gain * 0.0722).toFixed(4)} 0 0`;
  return `${row(r)} ${row(g)} ${row(b)} 0 0 0 1 0`;
}

/**
 * The Prism Portrait. One portrait splits on scroll into three spectral layers
 * (Development, Ads, Creative) and recombines.
 *
 * Scroll is never hijacked: a tall rail holds a sticky stage, and the rail's own scroll
 * progress sets one CSS variable (--sx, 0..1). All layer geometry is CSS calc() on that variable.
 * Low-end phones, reduced motion and no-JS get the static version (portrait + the three roles listed).
 */
export function PrismPortrait({ photo, roles, rolesLabel }: { photo: PortraitPhoto; roles: PortraitRole[]; rolesLabel: string }) {
  const tier = usePerformanceTier();
  const live = tier === "high";
  const railRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef("none");

  useScrollLinked(
    railRef,
    (p) => {
      const stage = stageRef.current;
      if (!stage) return;
      // 0 to .10 hold, .10 to .34 split, hold, .74 to .94 recombine, hold.
      const sx = smoothstep(0.1, 0.34, p) * (1 - smoothstep(0.74, 0.94, p));
      const value = sx.toFixed(3);
      stage.style.setProperty("--sx", value);
      const track = stage.closest<HTMLElement>(".pa-hero-track");
      track?.style.setProperty("--sx", value);
      const next = sx < 0.55 ? "none" : p < 0.47 ? "dev" : p < 0.62 ? "ads" : p < 0.8 ? "creative" : "none";
      if (next !== activeRef.current) {
        activeRef.current = next;
        stage.dataset.active = next;
      }
    },
    { enter: 0, exit: 1, enabled: live },
  );

  const natural = photo.src ?? photo.layers?.ads ?? photo.layers?.dev ?? photo.layers?.creative ?? null;

  const renderPicture = (key: RoleKey | "base") => {
    if (!natural) return <PortraitPlaceholder />;
    const own = key === "base" ? undefined : photo.layers?.[key];
    const src = own ?? natural;
    const derived = key !== "base" && !own;
    return (
      <Image
        className={`pa-img${derived ? ` pa-tint pa-tint--${key}` : ""}`}
        src={src}
        alt=""
        fill
        sizes="(min-width: 1024px) 34vw, 72vw"
        priority={key === "base"}
        loading={key === "base" ? undefined : "lazy"}
        draggable={false}
      />
    );
  };

  return (
    <div ref={railRef} className="pa-hero-rail">
      <div ref={stageRef} className="pa-hero-stage" data-active="none">
        <svg className="pa-defs" width="0" height="0" aria-hidden="true" focusable="false">
          <defs>
            {KEYS.map((k) => (
              <filter key={k} id={`pa-tint-${k}`} colorInterpolationFilters="sRGB">
                <feColorMatrix type="matrix" values={tintMatrix(TINTS[k])} />
              </filter>
            ))}
          </defs>
        </svg>

        <div className="pa-portrait pa-reveal pa-d4" role="img" aria-label={photo.alt}>
          {KEYS.map((k) => (
            <div key={k} className={`pa-layer pa-layer--${k}`} aria-hidden="true">
              {renderPicture(k)}
            </div>
          ))}
          <div className="pa-layer pa-layer--base" aria-hidden="true">
            {renderPicture("base")}
          </div>
        </div>

        <ul className="pa-roles" aria-label={rolesLabel}>
          {roles.map((r) => (
            <li key={r.key} className="pa-role" data-role={r.key}>
              <span className="pa-role-dot" aria-hidden="true" />
              <Morph id={`hero.role.${r.key}.title`} text={r.title} />
            </li>
          ))}
        </ul>

        <div className="pa-captions">
          {roles.map((r) => (
            <p key={r.key} className="pa-caption" data-role={r.key}>
              <strong>
                <Morph id={`hero.role.${r.key}.title`} text={r.title} />
              </strong>{" "}
              <Morph id={`hero.role.${r.key}.line`} text={r.line} />
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

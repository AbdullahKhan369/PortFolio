"use client";
// The sample homepage. Built from small real components (nav, hero, items, gallery, story, hours, footer)
// that appear one after another when the niche or the chosen sections change. Content comes from the
// niche template in admin; story/gallery/hours are drawn as wireframes so nothing is invented.
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cssVars, hasPrice, readableOn } from "./colors";
import type { BlockKey } from "./brief";
import styles from "./tryit.module.css";

export interface MiniNiche {
  key: string;
  label: string;
  headline: string;
  palette: { bg: string; fg: string; accent: string };
  items: { name: string; price?: string }[];
}

function Piece({ id, index, animate, children }: { id: string; index: number; animate: boolean; children: ReactNode }) {
  if (!animate) return <div>{children}</div>;
  return (
    <motion.div key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

interface Props {
  niche: MiniNiche;
  name: string;
  blocks: BlockKey[];
  m: Record<string, string>;
  animate: boolean;
  label: string;
}

export default function MiniHome({ niche, name, blocks, m, animate, label }: Props) {
  const { bg, fg, accent } = niche.palette;
  const vars = cssVars({ "--mh-bg": bg, "--mh-fg": fg, "--mh-accent": accent, "--mh-on-accent": readableOn(accent) });
  const brand = name.trim() || niche.label;
  const on = (b: BlockKey) => blocks.includes(b);
  let i = 0;

  return (
    <div className={styles.browser}>
      <div className={styles.chrome} aria-hidden="true">
        <span className={styles.chromeDot} />
        <span className={styles.chromeDot} />
        <span className={styles.chromeDot} />
        <span className={styles.chromeBar} />
      </div>

      <div className={styles.mini} style={vars} role="group" aria-label={label} key={niche.key}>
        <Piece id="nav" index={i++} animate={animate}>
          <div className={styles.miniNav}>
            <span className={styles.miniBrand}>{brand}</span>
            <span className={styles.miniLinks}>
              <span>{m.mini_nav_home}</span>
              <span>{m.mini_nav_items}</span>
              <span>{m.mini_nav_contact}</span>
            </span>
          </div>
        </Piece>

        <Piece id="hero" index={i++} animate={animate}>
          <div className={styles.miniHero}>
            <p className={styles.miniHeadline}>{niche.headline}</p>
            <span className={styles.miniBtn}>{m.mini_cta}</span>
          </div>
        </Piece>

        {on("catalogue") && niche.items.length > 0 && (
          <Piece id="catalogue" index={i++} animate={animate}>
            <div className={styles.miniBlock}>
              <p className={styles.miniBlockTitle}>{m.block_catalogue}</p>
              <ul className={styles.miniItems}>
                {niche.items.map((it, k) => (
                  <li className={styles.miniItem} key={`${it.name}-${k}`}>
                    <span>{it.name}</span>
                    {hasPrice(it.price) && <span className={styles.miniPrice}>{it.price}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </Piece>
        )}

        {on("gallery") && (
          <Piece id="gallery" index={i++} animate={animate}>
            <div className={styles.miniBlock}>
              <p className={styles.miniBlockTitle}>{m.mini_gallery_title}</p>
              <div className={styles.miniGallery} aria-hidden="true">
                <span className={styles.miniTile} />
                <span className={styles.miniTile} />
                <span className={styles.miniTile} />
              </div>
            </div>
          </Piece>
        )}

        {on("story") && (
          <Piece id="story" index={i++} animate={animate}>
            <div className={styles.miniBlock}>
              <p className={styles.miniBlockTitle}>{m.mini_story_title}</p>
              <div className={styles.wire} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
          </Piece>
        )}

        {on("hours") && (
          <Piece id="hours" index={i++} animate={animate}>
            <div className={styles.miniBlock}>
              <p className={styles.miniBlockTitle}>{m.mini_hours_title}</p>
              <div className={styles.pin} aria-hidden="true">
                <svg className={styles.pinIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M10 18s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" strokeLinejoin="round" />
                  <circle cx="10" cy="8" r="2.2" />
                </svg>
                <div className={styles.wire} style={{ flex: 1 }}>
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </Piece>
        )}

        <Piece id="foot" index={i++} animate={animate}>
          <div className={styles.miniFoot}>
            <span className={styles.miniBrand}>{brand}</span>
            <span className={styles.miniBtn}>{m.mini_cta}</span>
          </div>
        </Piece>
      </div>
    </div>
  );
}

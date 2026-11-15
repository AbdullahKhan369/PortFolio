"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PrismGlyph } from "@/components/ui/PrismGlyph";
import { Morph } from "./Morph";

export interface HeaderLink {
  id: string;
  href: string;
  label: string;
}

export interface HeaderClientProps {
  homeHref: string;
  brand: string;
  links: HeaderLink[];
  labels: { menuOpen: string; menuClose: string; primaryNav: string; home: string };
  /** Server-built slots (they are client components themselves). */
  toggle: ReactNode;
  beliefsBar: ReactNode;
  beliefsMenu: ReactNode;
  cta: ReactNode;
}

/**
 * Sticky header shell: scroll state, mobile menu, active-section marker.
 * Below 1100px the links live in a menu; the language toggle and WhatsApp stay in the bar.
 */
export function HeaderClient({ homeHref, brand, links, labels, toggle, beliefsBar, beliefsMenu, cta }: HeaderClientProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const rootRef = useRef<HTMLElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const on = (): void => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent): void => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const ids = ["hero", ...links.map((l) => l.id)];
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id === "hero" ? "" : entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [links, pathname]);

  const onMenuClick = (e: MouseEvent<HTMLDivElement>): void => {
    const t = e.target as HTMLElement;
    if (t.closest("a,[data-pa-close]")) setOpen(false);
  };

  return (
    <header ref={rootRef} className="pa-header" data-scrolled={scrolled ? "true" : "false"} data-menu={open ? "open" : "closed"}>
      <div className="pa-header-row">
        <Link className="pa-brand" href={homeHref} aria-label={labels.home}>
          <PrismGlyph size={30} />
          <span className="pa-brand-name">{brand}</span>
        </Link>

        <nav className="pa-nav" aria-label={labels.primaryNav}>
          <ul>
            {links.map((l) => (
              <li key={l.id}>
                <Link className="pa-nav-link" href={l.href} aria-current={active === l.id ? "location" : undefined}>
                  <Morph id={`nav.${l.id}`} text={l.label} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pa-header-actions">
          {toggle}
          <div className="pa-bar-beliefs">{beliefsBar}</div>
          {cta}
          <button
            ref={menuBtnRef}
            type="button"
            className="pa-menu-btn"
            aria-expanded={open}
            aria-controls="pa-menu"
            aria-label={open ? labels.menuClose : labels.menuOpen}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="pa-burger" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div id="pa-menu" className="pa-menu" hidden={!open} onClick={onMenuClick}>
        <nav aria-label={labels.primaryNav}>
          <ul>
            {links.map((l) => (
              <li key={l.id}>
                <Link className="pa-menu-link" href={l.href} aria-current={active === l.id ? "location" : undefined}>
                  <Morph id={`menu.${l.id}`} text={l.label} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="pa-menu-extras">{beliefsMenu}</div>
      </div>
    </header>
  );
}

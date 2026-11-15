"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Modal } from "../kit/Modal";
import { PrismMark } from "./PrismMark";
import { PublishButton } from "./PublishButton";
import { SignOutButton } from "./SignOutButton";

export interface ShellNavGroup { group: string; items: { label: string; href: string }[] }

const BASE = "/abdullah/admin";
const PINNED = ["inquiries", "projects", "achievements", "media"];

/** Sidebar on desktop; top bar + bottom navigation + full menu on phones. */
export function AdminShell({ groups, email, children }: { groups: ShellNavGroup[]; email: string; children: ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);

  const all = groups.flatMap((g) => g.items);
  const pinned = PINNED.map((slug) => all.find((i) => i.href.endsWith(`/${slug}`))).filter((i): i is { label: string; href: string } => !!i).slice(0, 2);
  const current = (href: string) => (href === BASE ? pathname === BASE : pathname === href || pathname.startsWith(`${href}/`));

  const links = (
    <>
      <div className="a-nav-group">
        <ul className="a-nav-list">
          <li>
            <Link className="a-nav-link" href={BASE} aria-current={current(BASE) ? "page" : undefined} onClick={() => setMenu(false)}>
              Dashboard
            </Link>
          </li>
        </ul>
      </div>
      {groups.map((g) => (
        <div className="a-nav-group" key={g.group}>
          <h2>{g.group}</h2>
          <ul className="a-nav-list">
            {g.items.map((i) => (
              <li key={i.href}>
                <Link className="a-nav-link" href={i.href} aria-current={current(i.href) ? "page" : undefined} onClick={() => setMenu(false)}>
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );

  return (
    <div className="a-shell">
      <a href="#main" className="a-skip">Skip to content</a>
      <aside className="a-side">
        <Link href={BASE} className="a-brand"><span style={{ width: 32, height: 32, display: "inline-block" }}><PrismMark /></span>The Prism Arc</Link>
        <nav aria-label="Admin">{links}</nav>
        <div className="a-drawer-foot" style={{ padding: "0 8px", marginTop: "auto" }}>
          <p className="a-help" style={{ overflowWrap: "anywhere" }}>{email}</p>
          <a className="a-btn a-btn-ghost" href="/" target="_blank" rel="noopener noreferrer">
            View site<span className="a-sr-only"> (opens in a new tab)</span>
          </a>
          <SignOutButton />
        </div>
      </aside>

      <div className="a-main">
        <header className="a-top">
          <Link href={BASE} className="a-brand"><span style={{ width: 30, height: 30, display: "inline-block" }}><PrismMark /></span>Prism Arc</Link>
          <div className="a-top-actions"><PublishButton /></div>
        </header>
        <main id="main" className="a-content" tabIndex={-1}>{children}</main>
      </div>

      <nav className="a-bottom" aria-label="Quick links">
        <Link href={BASE} aria-current={current(BASE) ? "page" : undefined}>Dashboard</Link>
        {pinned.map((i) => (
          <Link key={i.href} href={i.href} aria-current={current(i.href) ? "page" : undefined}>{i.label}</Link>
        ))}
        <button type="button" className="a-menu-btn" onClick={() => setMenu(true)} aria-haspopup="dialog">Menu</button>
      </nav>

      <Modal open={menu} onClose={() => setMenu(false)} title="Menu" variant="sheet">
        <nav aria-label="All admin pages" className="a-drawer-nav">{links}</nav>
        <div className="a-drawer-foot">
          <p className="a-help" style={{ overflowWrap: "anywhere" }}>Signed in as {email}</p>
          <a className="a-btn a-btn-ghost" href="/" target="_blank" rel="noopener noreferrer">
            View site<span className="a-sr-only"> (opens in a new tab)</span>
          </a>
          <SignOutButton />
        </div>
      </Modal>
    </div>
  );
}

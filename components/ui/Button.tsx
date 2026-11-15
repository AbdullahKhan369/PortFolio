import Link from "next/link";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "ghost" | "wa";

export interface ButtonProps {
  variant: ButtonVariant;
  size?: "md" | "lg";
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
}

/** Class string shared by Button and WhatsAppButton. Styles live in styles/site.css (pa-btn). */
export function buttonClass(variant: ButtonVariant, size: "md" | "lg" = "md", extra?: string): string {
  return ["pa-btn", `pa-btn--${variant}`, size === "lg" ? "pa-btn--lg" : "", extra ?? ""].filter(Boolean).join(" ");
}

const isExternal = (href: string): boolean => /^https?:\/\//i.test(href);

/**
 * Pill button. With `href` it renders a link (internal paths use next/link, absolute http(s)
 * links open in a new tab with a hidden announcement). Without `href` it renders a <button>.
 */
export function Button({ variant, size = "md", href, onClick, children, ariaLabel, className }: ButtonProps) {
  const cls = buttonClass(variant, size, className);

  if (href) {
    if (isExternal(href)) {
      return (
        <a className={cls} href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} onClick={onClick}>
          {children}
          <span className="pa-sr"> (opens in a new tab)</span>
        </a>
      );
    }
    if (href.startsWith("/")) {
      return (
        <Link className={cls} href={href} aria-label={ariaLabel} onClick={onClick}>
          {children}
        </Link>
      );
    }
    return (
      <a className={cls} href={href} aria-label={ariaLabel} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={cls} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  );
}

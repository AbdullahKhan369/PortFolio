import type { ReactNode } from "react";

export interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  newTabLabel?: string;
}

/**
 * Every outbound "Live link" / repo link. ALWAYS opens in a new tab with
 * rel="noopener noreferrer" and announces that to screen readers.
 */
export function ExternalLink({ href, children, className, newTabLabel = "opens in a new tab" }: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="pa-sr"> ({newTabLabel})</span>
    </a>
  );
}

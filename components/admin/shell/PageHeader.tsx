import type { ReactNode } from "react";

export function PageHeader({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <header className="a-pagehead">
      <h1>{title}</h1>
      {intro ? <p>{intro}</p> : null}
      {children}
    </header>
  );
}

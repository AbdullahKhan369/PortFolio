// Plain, language-resolved view types handed from the server section to the client explorer.
export type NodeKind = "service" | "db" | "ai" | "queue" | "client" | "api" | "other";

export interface NodeView {
  key: string;
  label: string;
  kind: NodeKind;
  description: string;
  x: number;
  y: number;
}

export interface EdgeView {
  from: string;
  to: string;
  label: string;
}

export interface SystemView {
  slug: string;
  title: string;
  description: string;
  nodes: NodeView[];
  edges: EdgeView[];
}

export const KIND_ORDER: NodeKind[] = ["client", "service", "api", "queue", "db", "ai", "other"];

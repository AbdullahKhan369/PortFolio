"use client";
// Detail panel for the selected node: what it is, what it does, what comes in and what goes out.
import { neighbours } from "./layout";
import { KindGlyph } from "./SystemGraph";
import type { EdgeView, NodeKind, NodeView } from "./types";
import styles from "./systems.module.css";
import { cx } from "@/components/work/utils";

interface Props {
  node: NodeView | null;
  nodes: NodeView[];
  edges: EdgeView[];
  m: Record<string, string>;
  kindLabels: Record<NodeKind, string>;
  onSelect: (key: string) => void;
}

export default function NodeDetail({ node, nodes, edges, m, kindLabels, onSelect }: Props) {
  if (!node) {
    return (
      <div className={styles.detail}>
        <p className={cx(styles.muted, "font-body")}>{m.select_prompt}</p>
      </div>
    );
  }

  const byKey = new Map(nodes.map((n) => [n.key, n]));
  const { incoming, outgoing } = neighbours(node.key, edges);
  const uniq = (keys: string[]) => Array.from(new Set(keys)).filter((k) => byKey.has(k));
  const inn = uniq(incoming);
  const out = uniq(outgoing);

  const renderChips = (keys: string[]) => (
    <ul className={styles.chips}>
      {keys.map((k) => (
        <li key={k}>
          <button type="button" className={styles.chip} onClick={() => onSelect(k)}>
            {byKey.get(k)?.label}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={styles.detail}>
      <h4 className={cx(styles.detailTitle, "font-display")}>{node.label}</h4>
      <p className={styles.kindRow}>
        <KindGlyph kind={node.kind} />
        <span>{kindLabels[node.kind] ?? node.kind}</span>
      </p>
      {node.kind === "ai" && <p className={cx(styles.aiNote, "font-body")}>{m.ai_note}</p>}
      {node.description && <p className={cx(styles.desc, "font-body")}>{node.description}</p>}

      <div className={styles.group}>
        <p className={styles.groupTitle}>{m.receives_from}</p>
        {inn.length > 0 ? renderChips(inn) : <p className={styles.muted}>{m.nothing_in}</p>}
      </div>
      <div className={styles.group}>
        <p className={styles.groupTitle}>{m.sends_to}</p>
        {out.length > 0 ? renderChips(out) : <p className={styles.muted}>{m.nothing_out}</p>}
      </div>
    </div>
  );
}

import type { Lang } from "@/lib/content/types";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Morph } from "@/components/layout/Morph";

export interface LedgerRow {
  id: string;
  title: string;
  audience: string;
  includes: string[];
  cta: string;
  message: string;
}

export interface LedgerLabels {
  colService: string;
  colAudience: string;
  colIncludes: string;
}

/** Services as a ledger: one row per service, columns line up from 900px up, stacked on phones. */
export function ServicesLedger({
  lang,
  rows,
  labels,
  waNumber,
}: {
  lang: Lang;
  rows: LedgerRow[];
  labels: LedgerLabels;
  waNumber?: string;
}) {
  return (
    <div className="pa-ledger">
      <div className="pa-ledger-head" aria-hidden="true">
        <span>{labels.colService}</span>
        <span>{labels.colAudience}</span>
        <span>{labels.colIncludes}</span>
        <span />
      </div>
      <ul className="pa-ledger-list">
        {rows.map((r, i) => (
          <li key={r.id} className={`pa-row pa-c${i % 4}`}>
            <h3 className="pa-row-title">
              <Morph id={`svc.${r.id}.title`} text={r.title} />
            </h3>
            <p className="pa-row-audience">
              <Morph id={`svc.${r.id}.aud`} text={r.audience} />
            </p>
            <ul className="pa-row-includes">
              {r.includes.map((inc, k) => (
                <li key={k}>
                  <Morph id={`svc.${r.id}.inc.${k}`} text={inc} />
                </li>
              ))}
            </ul>
            <div className="pa-row-cta">
              <WhatsAppButton lang={lang} number={waNumber} message={r.message}>
                {r.cta}
              </WhatsAppButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

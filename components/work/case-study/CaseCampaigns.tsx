// Marketing receipts that belong to this project (marketing_campaigns.project_id = project.id).
import type { Lang, MarketingCampaign } from "@/lib/content/types";
import ReceiptStack from "@/components/marketing/ReceiptStack";
import styles from "../work.module.css";
import { cx } from "../utils";
import type { Messages } from "../types";

export default function CaseCampaigns({
  campaigns,
  lang,
  m,
  mk,
}: {
  campaigns: MarketingCampaign[];
  lang: Lang;
  /** projects namespace */
  m: Messages;
  /** marketing namespace */
  mk: Messages;
}) {
  if (campaigns.length === 0) return null;
  return (
    <section aria-labelledby="case-marketing-title">
      <h2 id="case-marketing-title" className={cx(styles.caseSectionTitle, "font-display")}>
        {m.case_marketing}
      </h2>
      <ReceiptStack campaigns={campaigns} lang={lang} m={mk} />
    </section>
  );
}

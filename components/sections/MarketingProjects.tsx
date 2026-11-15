// Home section "marketing" (anchor id: marketing): campaign receipts that print on scroll.
// All figures come from admin (marketing_campaigns). Empty values are never rendered (see Receipt).
import { getCampaigns, getProjects } from "@/lib/content";
import { getMessages, localePath } from "@/lib/i18n";
import type { Lang } from "@/lib/content/types";
import ReceiptStack from "@/components/marketing/ReceiptStack";
import type { ReceiptProject } from "@/components/marketing/Receipt";

export default async function MarketingProjects({ lang }: { lang: Lang }) {
  const [campaigns, projects, messages] = await Promise.all([getCampaigns(), getProjects(), getMessages(lang, ["marketing"])]);
  const m = messages.marketing ?? {};

  // Only link a receipt to a project that is visible (and therefore has a case-study page).
  const projectLinks: Record<string, ReceiptProject> = {};
  for (const p of projects) projectLinks[p.id] = { title: p.title, href: localePath(lang, `/work/${p.slug}`) };

  return (
    <section id="marketing" style={{ position: "relative" }} aria-labelledby="marketing-title" className="px-5 py-20 md:px-10 md:py-28 lg:px-16">
      <div className="mx-auto w-full max-w-[1280px]">
        <header className="mb-10 max-w-3xl md:mb-14">
          <h2 id="marketing-title" className="font-display text-[clamp(2rem,6vw,3.75rem)] leading-[1.04] tracking-tight text-text">
            {m.heading}
          </h2>
          <p className="font-body mt-4 max-w-[62ch] text-lg leading-relaxed text-muted">{m.intro}</p>
        </header>

        {campaigns.length === 0 ? (
          <p className="font-body text-muted">{m.empty}</p>
        ) : (
          <ReceiptStack campaigns={campaigns} lang={lang} m={m} label={m.heading} projects={projectLinks} />
        )}
      </div>
    </section>
  );
}

import type { Lang } from "@/lib/content/types";
import { getProcessSteps, getSiteSettings } from "@/lib/content";
import { getMessages, pick } from "@/lib/i18n";
import ProcessChat, { type ChatMessage } from "@/components/process/ProcessChat";

const NEW_TAB = { en: "opens in a new tab", ur: "naye tab mein khulta hai" } as const;

/** "How I work": a WhatsApp-style chat built from process_steps. Anchor id: process. */
export default async function Process({ lang }: { lang: Lang }) {
  const [steps, settings, msgs] = await Promise.all([
    getProcessSteps(),
    getSiteSettings(),
    getMessages(lang, ["process"]),
  ]);
  const t = msgs.process ?? {};

  const messages: ChatMessage[] = steps
    .map((s) => ({ id: s.id, sender: s.sender, text: pick(s, "message", lang).trim() }))
    .filter((m) => m.text.length > 0);

  if (messages.length === 0) return null;

  const number = (settings.whatsapp_number ?? "").trim();

  return (
    <section id="process" style={{ position: "relative" }} aria-labelledby="process-heading" className="bg-base px-4 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <div className="lg:pt-8">
          <h2 id="process-heading" className="font-display text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] text-text">
            {t.heading}
          </h2>
          <p className="mt-5 max-w-[34rem] font-body text-[18px] leading-[1.7] text-muted">{t.intro}</p>
          <p className="mt-4 max-w-[34rem] font-body text-[15px] leading-[1.7] text-muted">{t.note}</p>
        </div>

        <ProcessChat
          lang={lang}
          messages={messages}
          number={number}
          replyDefault={settings[lang === "ur" ? "whatsapp_default_message_ur" : "whatsapp_default_message_en"]?.trim() || t.reply_default || ""}
          labels={{
            title: t.chat_title ?? "",
            chatAria: t.chat_aria ?? "",
            typing: t.typing ?? "",
            showAll: t.show_all ?? "",
            fromAbdullah: t.from_abdullah ?? "",
            fromYou: t.from_you ?? "",
            reply: {
              label: t.reply_label ?? "",
              placeholder: t.reply_placeholder ?? "",
              cta: t.reply_cta ?? "",
              hint: t.reply_hint ?? "",
              newTab: NEW_TAB[lang],
            },
          }}
        />
      </div>
    </section>
  );
}

"use client";
// Niche picker + sample homepage + one-tap brief. The WhatsApp link opens in a new tab straight from the tap
// (so mobile browsers never block it) while the inquiry is saved in the background via POST /api/inquiries.
import { useId, useMemo, useRef, useState } from "react";
import { usePerformanceTier, usePrefersReducedMotion } from "@/lib/device";
import { buildWaLink } from "@/lib/whatsapp";
import type { Lang } from "@/lib/content/types";
import { BLOCKS, buildBrief, buildInquiry, type BlockKey } from "./brief";
import MiniHome, { type MiniNiche } from "./MiniHome";
import styles from "./tryit.module.css";
import { cx, fill } from "@/components/work/utils";

const ACCENTS = ["#8A5CFF", "#3AA0FF", "#4FE3B0", "#FFC857"] as const;

type Status = "idle" | "saving" | "saved" | "failed" | "need_contact";

export default function Configurator({
  lang,
  niches,
  whatsappNumber,
  m,
}: {
  lang: Lang;
  niches: MiniNiche[];
  whatsappNumber?: string;
  m: Record<string, string>;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const tier = usePerformanceTier();
  const reduced = usePrefersReducedMotion();
  const animate = tier === "high" && !reduced;

  const [nicheKey, setNicheKey] = useState(niches[0]?.key ?? "");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [blocks, setBlocks] = useState<BlockKey[]>(["catalogue", "gallery"]);
  const [accent, setAccent] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [viaWhatsApp, setViaWhatsApp] = useState(false);
  const savedFor = useRef("");
  const contactRef = useRef<HTMLInputElement>(null);

  const baseNiche = niches.find((n) => n.key === nicheKey) ?? niches[0];
  // The visitor can try their own brand colour; the brief and the saved inquiry are not affected.
  const niche = baseNiche && accent ? { ...baseNiche, palette: { ...baseNiche.palette, accent } } : baseNiche;
  const hasNumber = !!whatsappNumber && whatsappNumber.replace(/\D/g, "").length >= 6;

  const message = useMemo(
    () => buildBrief({ m, nicheLabel: niche?.label ?? "", name, blocks }),
    [m, niche?.label, name, blocks],
  );
  const waHref = hasNumber ? buildWaLink({ number: whatsappNumber, message }) : null;

  const toggleBlock = (b: BlockKey) => setBlocks((cur) => (cur.includes(b) ? cur.filter((x) => x !== b) : [...cur, b]));

  async function save(viaWa: boolean) {
    const key = `${niche.key}|${name}|${blocks.join(",")}|${contact}`;
    if (savedFor.current === key) return;
    savedFor.current = key;
    setViaWhatsApp(viaWa);
    setStatus("saving");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify(
          buildInquiry({ lang, nicheKey: niche.key, name, contact, fallbackContact: m.contact_fallback, message, honeypot }),
        ),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (res.ok && json.ok) {
        setStatus("saved");
      } else {
        savedFor.current = ""; // allow another try
        setStatus("failed");
      }
    } catch {
      savedFor.current = "";
      setStatus("failed");
    }
  }

  function onSaveOnly() {
    if (!contact.trim()) {
      setStatus("need_contact");
      contactRef.current?.focus();
      return;
    }
    void save(false);
  }

  const statusText =
    status === "saving"
      ? m.saving
      : status === "saved"
        ? m.status_saved
        : status === "failed"
          ? viaWhatsApp
            ? m.status_failed_wa
            : m.status_failed
          : status === "need_contact"
            ? m.status_need_contact
            : "";

  if (!niche) return null;

  return (
    <div className={styles.layout}>
      <div className={styles.nicheBox}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{m.niche_legend}</legend>
          <div className={styles.pills}>
            {niches.map((n) => (
              <label className={styles.choice} key={n.key}>
                <input type="radio" name={`${uid}-niche`} value={n.key} checked={n.key === niche.key} onChange={() => setNicheKey(n.key)} />
                <span className={styles.choiceText}>{n.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className={styles.preview}>
        <div className={styles.ctrlRow}>
          <div className={styles.seg} role="group" aria-label={m.device_legend || "Preview on"}>
            {(["desktop", "phone"] as const).map((d) => (
              <button key={d} type="button" className={styles.segBtn} aria-pressed={device === d} onClick={() => setDevice(d)}>
                {d === "desktop" ? m.device_desktop || "Laptop" : m.device_phone || "Phone"}
              </button>
            ))}
          </div>
          <div className={styles.swatches} role="group" aria-label={m.accent_legend || "Brand colour"}>
            <button type="button" className={cx(styles.swatch, styles.swatchAuto)} aria-pressed={accent === null} aria-label={m.accent_default || "Use the niche colours"} onClick={() => setAccent(null)} />
            {ACCENTS.map((c, i) => (
              <button key={c} type="button" className={styles.swatch} style={{ background: c }} aria-pressed={accent === c} aria-label={`${m.accent_legend || "Brand colour"} ${i + 1}`} onClick={() => setAccent(c)} />
            ))}
          </div>
        </div>
        <div className={styles.deviceWrap} data-device={device}>
        <MiniHome niche={niche} name={name} blocks={blocks} m={m} animate={animate} label={fill(m.preview_label, { niche: niche.label })} />
        </div>
        <p className={cx(styles.sampleNote, "font-body")}>{m.sample_note}</p>
      </div>

      <div className={styles.restBox} role="group" aria-label={m.heading}>
        <div className={styles.field}>
          <label htmlFor={`${uid}-name`}>{m.name_label}</label>
          <input
            id={`${uid}-name`}
            className={styles.input}
            type="text"
            value={name}
            maxLength={80}
            placeholder={m.name_placeholder}
            autoComplete="organization"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{m.blocks_legend}</legend>
          <div className={styles.pills}>
            {BLOCKS.map((b) => (
              <label className={styles.choice} key={b}>
                <input type="checkbox" checked={blocks.includes(b)} onChange={() => toggleBlock(b)} />
                <span className={styles.choiceText}>{m[`block_${b}`]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.field}>
          <label htmlFor={`${uid}-contact`}>{hasNumber ? m.contact_label : m.contact_label_required}</label>
          <input
            id={`${uid}-contact`}
            ref={contactRef}
            className={styles.input}
            type="text"
            value={contact}
            maxLength={120}
            autoComplete="off"
            aria-describedby={`${uid}-contact-hint`}
            aria-required={!hasNumber}
            onChange={(e) => {
              setContact(e.target.value);
              if (status === "need_contact") setStatus("idle");
            }}
          />
          <p id={`${uid}-contact-hint`} className={styles.hint}>
            {m.contact_hint}
          </p>
        </div>

        {/* Honeypot: hidden from people, bots tend to fill it. Sent as `website` and must stay empty. */}
        <div className={styles.trap} aria-hidden="true">
          <label htmlFor={`${uid}-website`}>Website</label>
          <input id={`${uid}-website`} type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </div>

        {waHref ? (
          <a className={styles.send} href={waHref} target="_blank" rel="noopener noreferrer" onClick={() => void save(true)}>
            <span>{m.send_wa}</span>
            <span className="sr-only"> ({m.new_tab})</span>
          </a>
        ) : (
          <button type="button" className={styles.send} onClick={onSaveOnly} disabled={status === "saving"}>
            {m.send_only}
          </button>
        )}

        <p className={styles.status} role="status" aria-live="polite">
          {statusText}
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { PageHeader } from "@/components/admin/shell/PageHeader";
import { requireAdmin } from "@/lib/supabase/guard";

export const metadata = { title: "Dashboard" };

const BASE = "/abdullah/admin";
const COUNTED: { table: string; label: string; href: string }[] = [
  { table: "achievements", label: "Achievements", href: "achievements" },
  { table: "core_beliefs", label: "Core beliefs", href: "core-beliefs" },
  { table: "projects", label: "Projects", href: "projects" },
  { table: "marketing_campaigns", label: "Campaigns", href: "campaigns" },
  { table: "systems", label: "Systems", href: "systems" },
  { table: "services", label: "Services", href: "services" },
  { table: "process_steps", label: "Process messages", href: "process" },
  { table: "niche_templates", label: "Niches", href: "niche-templates" },
];

export default async function Dashboard() {
  const { supabase } = await requireAdmin();

  const counts = await Promise.all(
    COUNTED.map(async (c) => {
      const [all, shown] = await Promise.all([
        supabase.from(c.table).select("id", { count: "exact", head: true }),
        supabase.from(c.table).select("id", { count: "exact", head: true }).eq("is_visible", true),
      ]);
      return { ...c, total: all.error ? null : (all.count ?? 0), shown: shown.error ? null : (shown.count ?? 0) };
    }),
  );

  const [settingsRes, profileRes, newInq, recent] = await Promise.all([
    supabase.from("site_settings").select("key, value"),
    supabase.from("profile").select("name, photo_url, photo_layers").limit(1).maybeSingle(),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("inquiries").select("id, name, contact, source, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const settings = new Map<string, unknown>((settingsRes.data ?? []).map((r: { key: string; value: unknown }) => [r.key, r.value]));
  const has = (k: string) => typeof settings.get(k) === "string" && String(settings.get(k)).trim() !== "";
  const countOf = (t: string) => counts.find((c) => c.table === t);

  const todo: { done: boolean; title: string; href: string; why: string }[] = [
    { done: has("whatsapp_number"), title: "Add your WhatsApp number", href: "settings",
      why: "Until it is set, every WhatsApp button is hidden on the public site." },
    { done: has("linkedin_url"), title: "Add your LinkedIn link", href: "settings", why: "Empty links are not shown." },
    { done: !!profileRes.data?.photo_url, title: "Upload your photo (transparent PNG)", href: "profile",
      why: "Without it the hero shows a silhouette placeholder." },
    { done: (countOf("core_beliefs")?.shown ?? 0) > 0, title: "Write your Core Beliefs checkpoints", href: "core-beliefs",
      why: "The pre-flight checklist is empty until you add them." },
    { done: (countOf("projects")?.shown ?? 0) > 0, title: "Add your projects", href: "projects", why: "The Work section stays empty until a project is visible." },
  ];
  const open = todo.filter((t) => !t.done);

  return (
    <>
      <PageHeader title="Dashboard" intro="What is set, what is missing, and what is waiting for you." />

      <section className="a-section" aria-labelledby="todo-h">
        <h2 id="todo-h">{open.length === 0 ? "Setup is complete" : `${open.length} thing${open.length === 1 ? "" : "s"} to finish`}</h2>
        <ul className="a-todo">
          {todo.map((t) => (
            <li key={t.title} data-done={t.done ? "true" : undefined}>
              {t.done ? <span>{t.title}: done</span> : <Link href={`${BASE}/${t.href}`}>{t.title}</Link>}
              {t.done ? null : <span className="a-muted">{t.why}</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="a-section" aria-labelledby="inq-h">
        <h2 id="inq-h">Inquiries</h2>
        {newInq.error ? (
          <p className="a-text">Inquiries are not available yet.</p>
        ) : (
          <p className="a-text">
            {newInq.count ? <>You have <strong>{newInq.count}</strong> new inquir{newInq.count === 1 ? "y" : "ies"}. <Link href={`${BASE}/inquiries`}>Open inbox</Link></> : "No new inquiries."}
          </p>
        )}
        {recent.data && recent.data.length > 0 ? (
          <table className="a-ledger">
            <caption>Latest five</caption>
            <thead><tr><th scope="col">From</th><th scope="col">Source</th><th scope="col">Received</th></tr></thead>
            <tbody>
              {recent.data.map((r: { id: string; name: string | null; contact: string; source: string; created_at: string }) => (
                <tr key={r.id}>
                  <td>{r.name || r.contact}</td>
                  <td>{r.source}</td>
                  <td>{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>

      <section className="a-section" aria-labelledby="content-h">
        <h2 id="content-h">Content on the site</h2>
        <table className="a-ledger">
          <caption>Shown means visible to visitors. The rest is hidden or still a draft.</caption>
          <thead><tr><th scope="col">Section</th><th scope="col">Shown</th><th scope="col">Total</th></tr></thead>
          <tbody>
            {counts.map((c) => (
              <tr key={c.table}>
                <td><Link href={`${BASE}/${c.href}`}>{c.label}</Link></td>
                <td>{c.shown ?? "n/a"}</td>
                <td>{c.total ?? "n/a"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="a-section" aria-labelledby="pub-h">
        <h2 id="pub-h">Publishing</h2>
        <p className="a-text">Saving updates the database and refreshes that section of the public site. If something still looks old, press Publish changes at the top.</p>
      </section>
    </>
  );
}

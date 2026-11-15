/**
 * Shared class strings for Session 4 admin pages (private folder, not a route).
 * Every container sets its own background AND text colour, so the pages stay readable
 * whatever theme the admin shell uses around them.
 */
export const panel = "rounded-[16px] bg-surface p-4 text-text sm:p-5";
export const label = "block font-display text-[14px] font-medium text-text";
export const input =
  "mt-2 w-full rounded-[10px] border border-text/25 bg-base px-3 py-3 font-body text-[16px] text-text placeholder:text-muted focus-visible:border-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure";
export const btnPrimary =
  "inline-flex min-h-[44px] items-center justify-center rounded-full bg-text px-5 font-display text-[15px] font-semibold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure disabled:opacity-60";
export const btnGhost =
  "inline-flex min-h-[44px] items-center justify-center rounded-full border border-text/30 bg-transparent px-5 font-display text-[15px] font-medium text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure disabled:opacity-60";
export const btnDanger =
  "inline-flex min-h-[44px] items-center justify-center rounded-full border border-amber/60 bg-transparent px-5 font-display text-[15px] font-medium text-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:opacity-60";
export const muted = "font-body text-[14px] leading-relaxed text-muted";

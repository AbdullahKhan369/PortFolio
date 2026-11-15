// Tiny re-exports so MiniHome imports colour helpers from one place next to it.
export { cssVars, readableOn } from "@/components/work/utils";
export function hasPrice(p: string | undefined | null): p is string {
  return typeof p === "string" && p.trim().length > 0;
}

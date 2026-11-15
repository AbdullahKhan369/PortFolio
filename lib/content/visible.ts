import type { Metric } from "./types";

/**
 * false for null, undefined, "", whitespace-only strings and NaN. Use it before rendering ANY number or metric.
 * (The number 0 is a real value and returns true. Leave a field empty if you do not want it shown.)
 */
export function hasValue(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (typeof v === "number") return !Number.isNaN(v);
  return true;
}

/** Metrics that may be shown publicly: only those with a real value. */
export function visibleMetrics(metrics: Metric[] | null | undefined): Metric[] {
  return (metrics ?? []).filter((m) => hasValue(m?.value));
}

"use client";

import { useSyncExternalStore } from "react";

type NavigatorExtras = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(callback: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReduced() {
  return window.matchMedia(REDUCED_QUERY).matches;
}

/** true when the visitor asked for less motion. Server snapshot is false. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, getReduced, () => false);
}

function subscribeNothing() {
  return () => {};
}

function getLowHardware(): boolean {
  const nav = navigator as NavigatorExtras;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return true;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 2) return true;
  if (nav.connection?.saveData) return true;
  return false;
}

/**
 * "low" when deviceMemory <= 2, hardwareConcurrency <= 2, Save-Data is on, or reduced motion is requested.
 * The server snapshot is "low": heavy effects only switch on after hydration, on capable devices.
 */
export function usePerformanceTier(): "high" | "low" {
  const lowHardware = useSyncExternalStore(subscribeNothing, getLowHardware, () => true);
  const reduced = usePrefersReducedMotion();
  return lowHardware || reduced ? "low" : "high";
}

/**
 * The place where a spark of the 3-6-9 hunt lives. It is part of the server HTML of its section, so React owns it
 * and hydration always matches. SparksClient portals the spark button into it once it has hydrated.
 * (The old version created this element with document.createElement inside the section before the page had hydrated,
 * which caused "Hydration failed" errors.)
 */
export default function SparkAnchor({ n }: { n: 3 | 6 | 9 }) {
  return <div data-spark-layer={n} aria-hidden="false" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 2 }} />;
}

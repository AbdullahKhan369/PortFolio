/**
 * Where each spark lives. Contract section 8: sparks are portaled into the sections with ids
 * `achievements`, `systems` and `about`. Offsets are percentages of the section box, kept near
 * the side gutters so they do not sit on top of body text. Adjust here after visual review.
 */
export interface SparkSpot {
  n: 3 | 6 | 9;
  sectionId: "achievements" | "systems" | "about";
  style: { top: string; left?: string; right?: string };
}

export const SPARK_SPOTS: readonly SparkSpot[] = [
  { n: 3, sectionId: "achievements", style: { top: "36%", right: "1.5%" } },
  { n: 6, sectionId: "systems", style: { top: "60%", left: "1.5%" } },
  { n: 9, sectionId: "about", style: { top: "24%", right: "3%" } },
];

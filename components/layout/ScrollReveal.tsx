/**
 * Scroll reveals are now pure CSS (animation-timeline: view(), see "scroll reveal" in styles/site.css).
 * The old version added a data attribute to elements that React had rendered, which caused a hydration error.
 * This component is kept as an empty placeholder so nothing that imports it breaks.
 */
export function ScrollReveal() {
  return null;
}

/**
 * Page transition. A template (unlike a layout) is re-created on every navigation, so each page, case study and
 * language switch eases in instead of snapping. CSS only (.pa-page-in in styles/premium.css), off for reduced motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="pa-page-in">{children}</div>;
}

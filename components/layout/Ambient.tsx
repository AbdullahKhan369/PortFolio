/** Fixed background depth: colour mesh + film grain. Pure CSS, no JavaScript, never intercepts clicks. */
export function Ambient() {
  return (
    <>
      <div className="pa-ambient" aria-hidden="true" />
      <div className="pa-grain" aria-hidden="true" />
    </>
  );
}

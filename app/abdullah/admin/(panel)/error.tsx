"use client";

export default function PanelError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="a-banner a-banner-error" role="alert">
      <p>This page could not load. Check your connection, then try again. If it keeps failing, sign out and sign in.</p>
      <button type="button" className="a-btn a-btn-ghost" onClick={reset}>Try again</button>
    </div>
  );
}

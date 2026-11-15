/**
 * Tasteful silhouette shown until the real transparent PNG is uploaded in admin (Profile).
 * It inherits `currentColor`, so the three spectral layers can tint it without filters.
 */
export function PortraitPlaceholder() {
  return (
    <svg className="pa-silhouette" viewBox="0 0 400 500" preserveAspectRatio="xMidYMax meet" focusable="false" aria-hidden="true">
      <path d="M52 500 C52 394 118 346 200 336 C282 346 348 394 348 500 Z" fill="currentColor" />
      <path d="M166 314 H234 L229 356 C214 368 186 368 171 356 Z" fill="currentColor" />
      <ellipse cx="200" cy="204" rx="68" ry="84" fill="currentColor" />
      <path d="M200 120 L268 204 L200 288 Z" fill="#F2F4FF" opacity=".08" />
      <path d="M200 336 L348 500 H200 Z" fill="#F2F4FF" opacity=".05" />
    </svg>
  );
}

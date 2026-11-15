/** Digits only, international format without "+" or leading "00". Returns "" if not plausible (8 to 15 digits). */
export function normalizeWaNumber(input: string | null | undefined): string {
  if (!input) return "";
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  return digits.length >= 8 && digits.length <= 15 ? digits : "";
}

export function hasWhatsApp(number: string | null | undefined): boolean {
  return normalizeWaNumber(number) !== "";
}

/**
 * https://wa.me/<digits>?text=<encoded>
 * Returns "" when there is no valid number, so callers can hide the button
 * (the public site never shows a WhatsApp action without a number).
 */
export function buildWaLink(opts: { number?: string; message?: string }): string {
  const digits = normalizeWaNumber(opts.number);
  if (!digits) return "";
  const text = opts.message?.trim();
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
}

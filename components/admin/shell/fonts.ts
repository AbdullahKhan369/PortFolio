import { Anybody } from "next/font/google";

// Headings only. Body text uses the system font stack (fast on phones, no extra download).
export const adminDisplay = Anybody({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-admin-display",
  weight: ["600", "700"],
});

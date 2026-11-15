import { redirect } from "next/navigation";

// middleware.ts already sends "/" to the visitor's saved language (cookie pa_lang) or /en.
// This is the fallback if middleware did not run.
export default function RootPage(): never {
  redirect("/en");
}

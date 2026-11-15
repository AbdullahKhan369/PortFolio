"use client";

import { signOutAction } from "@/lib/admin/actions";

export function SignOutButton({ className = "a-btn a-btn-ghost" }: { className?: string }) {
  return (
    <form action={signOutAction}>
      <button type="submit" className={className}>Sign out</button>
    </form>
  );
}

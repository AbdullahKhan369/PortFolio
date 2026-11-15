"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { signInAction, type SignInState } from "@/lib/admin/actions";
import { createClient } from "@/lib/supabase/browser";

const initial: SignInState = { status: "idle" };

export function LoginForm({ next, reason }: { next: string; reason?: string }) {
  const [state, action, pending] = useActionState(signInAction, initial);
  const router = useRouter();
  const [code, setCode] = useState("");
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setMfaError(null);
    setVerifying(true);
    try {
      const supabase = createClient();
      const { data: factors, error } = await supabase.auth.mfa.listFactors();
      const factor = factors?.totp?.find((f) => f.status === "verified");
      if (error || !factor) throw new Error("no factor");
      const { error: verr } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.trim() });
      if (verr) throw verr;
      router.replace(state.next ?? next);
      router.refresh();
    } catch {
      setMfaError("That code is not correct or has expired. Open your authenticator app and enter the new 6-digit code.");
      setVerifying(false);
    }
  }

  if (state.status === "mfa") {
    return (
      <form className="a-login-form" onSubmit={verify} noValidate>
        <p className="a-text">Enter the 6-digit code from your authenticator app.</p>
        <div className="a-field">
          <label className="a-label" htmlFor="code">Code</label>
          <input id="code" className="a-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]*"
            value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} aria-invalid={mfaError ? true : undefined}
            aria-describedby={mfaError ? "code-err" : undefined} autoFocus />
          {mfaError ? <p id="code-err" className="a-error" role="alert">{mfaError}</p> : null}
        </div>
        <button type="submit" className="a-btn a-btn-primary" disabled={verifying || code.length !== 6}>
          {verifying ? "Checking..." : "Verify code"}
        </button>
      </form>
    );
  }

  return (
    <form className="a-login-form" action={action}>
      <input type="hidden" name="next" value={next} />
      {reason === "timeout" ? (
        <p className="a-banner a-banner-warn" role="status">You were signed out after a period of inactivity. Sign in again to continue.</p>
      ) : null}
      {state.status === "error" ? <p className="a-banner a-banner-error" role="alert">{state.message}</p> : null}
      <div className="a-field">
        <label className="a-label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="a-input" autoComplete="username" inputMode="email"
          autoCapitalize="none" spellCheck={false} required />
      </div>
      <div className="a-field">
        <label className="a-label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="a-input" autoComplete="current-password" required />
      </div>
      <button type="submit" className="a-btn a-btn-primary" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</button>
    </form>
  );
}

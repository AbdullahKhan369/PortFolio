"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { ConfirmDialog } from "../kit/ConfirmDialog";
import { useToast } from "../kit/Toast";

interface Factor { id: string; status: string; friendly_name?: string | null }
interface Enrol { id: string; qr: string; secret: string }

/** Optional two-step verification (TOTP) and password change. */
export function SecurityPanel() {
  const toast = useToast();
  const supabase = useMemo(() => createClient(), []);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrol, setEnrol] = useState<Enrol | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Factor | null>(null);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwErr, setPwErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors([...(data?.totp ?? []), ...((data?.all ?? []).filter((f) => f.factor_type === "totp" && f.status === "unverified"))].filter(
      (f, i, a) => a.findIndex((x) => x.id === f.id) === i) as Factor[]);
  }, [supabase]);

  useEffect(() => { void refresh(); }, [refresh]);

  const verified = factors.find((f) => f.status === "verified");

  async function start() {
    setBusy(true); setErr(null);
    // Remove abandoned, unverified attempts first so enrolling does not collide.
    for (const f of factors.filter((x) => x.status !== "verified")) await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Admin ${Date.now().toString(36)}` });
    setBusy(false);
    if (error || !data) { setErr("Could not start setup. Try again."); return; }
    setEnrol({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!enrol) return;
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrol.id, code: code.trim() });
    setBusy(false);
    if (error) { setErr("That code is not correct. Enter the current 6-digit code from the app."); return; }
    setEnrol(null); setCode("");
    await refresh();
    toast.success("Two-step verification is on. You will enter a code every time you sign in.");
  }

  async function remove() {
    if (!removing) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: removing.id });
    setBusy(false);
    setRemoving(null);
    if (error) { toast.error("Could not turn it off. Sign out, sign in with your code, then try again."); return; }
    await refresh();
    toast.success("Two-step verification is off.");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwErr(null);
    if (pw.length < 12) { setPwErr("Use at least 12 characters."); return; }
    if (pw !== pw2) { setPwErr("The two passwords do not match."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { setPwErr("Could not change the password. Sign out, sign in again, then retry."); return; }
    setPw(""); setPw2("");
    toast.success("Password changed.");
  }

  return (
    <div className="a-stack">
      <fieldset className="a-fieldset">
        <legend>Two-step verification</legend>
        {verified ? (
          <>
            <p className="a-banner a-banner-ok">On. Signing in to the admin needs a 6-digit code from your authenticator app.</p>
            <div><button type="button" className="a-btn a-btn-ghost" onClick={() => setRemoving(verified)}>Turn off</button></div>
          </>
        ) : enrol ? (
          <form className="a-stack" onSubmit={confirm} noValidate>
            <p className="a-text">Scan this code with an authenticator app (Google Authenticator, Microsoft Authenticator or similar), then enter the 6-digit code it shows.</p>
            <div className="a-qr">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={enrol.qr} alt="QR code for your authenticator app" /></div>
            <p className="a-help">Cannot scan? Enter this key in the app instead:</p>
            <p className="a-code">{enrol.secret}</p>
            <div className="a-field">
              <label className="a-label" htmlFor="totp">6-digit code</label>
              <input id="totp" className="a-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
            </div>
            {err ? <p className="a-error" role="alert">{err}</p> : null}
            <div className="a-actions">
              <button type="submit" className="a-btn a-btn-primary" disabled={busy || code.length !== 6}>Turn on</button>
              <button type="button" className="a-btn a-btn-ghost" onClick={() => { setEnrol(null); setCode(""); }}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <p className="a-text">Optional. Adds a code from your phone on top of your password.</p>
            {err ? <p className="a-error" role="alert">{err}</p> : null}
            <div><button type="button" className="a-btn a-btn-primary" onClick={() => void start()} disabled={busy}>Set up two-step verification</button></div>
          </>
        )}
      </fieldset>

      <form onSubmit={changePassword} noValidate><fieldset className="a-fieldset">
        <legend>Change password</legend>
        <div className="a-field">
          <label className="a-label" htmlFor="pw">New password</label>
          <input id="pw" type="password" className="a-input" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <div className="a-field">
          <label className="a-label" htmlFor="pw2">Repeat new password</label>
          <input id="pw2" type="password" className="a-input" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        </div>
        {pwErr ? <p className="a-error" role="alert">{pwErr}</p> : null}
        <div><button type="submit" className="a-btn a-btn-ghost" disabled={busy || !pw}>Change password</button></div>
      </fieldset></form>

      <ConfirmDialog open={removing !== null} title="Turn off two-step verification?"
        message="Signing in will need only your password. You can turn it on again at any time."
        confirmLabel="Turn off" cancelLabel="Keep it on" busy={busy} onCancel={() => setRemoving(null)} onConfirm={() => void remove()} />
    </div>
  );
}

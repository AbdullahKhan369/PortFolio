import { LoginForm } from "@/components/admin/shell/LoginForm";
import { PrismMark } from "@/components/admin/shell/PrismMark";
import { safeNext } from "@/lib/admin/session";
import { getSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const sp = await searchParams;
  const configured = getSupabaseEnv() !== null;
  return (
    <main className="a-login">
      <div className="a-login-mark">
        <PrismMark />
        <h1 className="a-login-title">The Prism Arc</h1>
      </div>
      <div>
        {configured ? (
          <LoginForm next={safeNext(sp.next)} reason={sp.reason} />
        ) : (
          <p className="a-banner a-banner-warn" role="status">
            The site is not connected to Supabase yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
            (see .env.example), then redeploy.
          </p>
        )}
      </div>
    </main>
  );
}

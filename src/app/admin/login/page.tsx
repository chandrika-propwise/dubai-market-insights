import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Shell } from "@/components/shell";
import { authConfig } from "@/lib/auth/config";
import { LoginForm } from "./login-form";
export const dynamic = "force-dynamic";
const messages: Record<string, string> = {
  credentials:
    "Unable to sign in. Check your email and password and try again.",
  access:
    "This workspace is available to authorized Propwise administrators only.",
  service: "Sign-in could not be verified. Please try again.",
};
export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const configured = Boolean(authConfig());
  return (
    <Shell>
      <main className="placeholder-page">
        <section className="panel admin-login-card">
          <span className="admin-lock">
            <LockKeyhole size={27} />
          </span>
          <span className="eyebrow">PROPWISE · ADMIN ACCESS</span>
          <h1>Your intelligence workspace.</h1>
          <p>
            Sign in with your administrator account to access the Propwise
            workspace.
          </p>
          {!configured ? (
            <div className="internal-notice" role="status">
              <div>
                <strong>Admin sign-in is awaiting setup.</strong>
                <p>
                  The workspace stays private until authentication is
                  configured. Contact the site administrator to enable access.
                </p>
              </div>
            </div>
          ) : (
            <>
              {reason && messages[reason] && (
                <p role="alert" className="login-error">
                  {messages[reason]}
                </p>
              )}
              <LoginForm />
            </>
          )}
          <Link className="login-back" href="/">
            ← Return to the public dashboard
          </Link>
        </section>
      </main>
    </Shell>
  );
}

import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-card">
          <div className="auth-top">
            <p className="auth-kicker">Auth</p>
            <h1 className="auth-title">Reset your password</h1>
            <p className="auth-copy">
              Enter your email and we&apos;ll send a link to create a new password.
            </p>
          </div>

          <ForgotPasswordForm />

          <div className="helper-row">
            <span>Remembered it?</span>
            <Link href="/login" className="text-link">
              Back to sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-card">
          <div className="auth-top">
            <p className="auth-kicker">Auth</p>
            <h1 className="auth-title">Set a new password</h1>
            <p className="auth-copy">
              Use the secure link from your email to update the password for your account.
            </p>
          </div>

          <ResetPasswordForm />
        </div>
      </section>
    </main>
  );
}

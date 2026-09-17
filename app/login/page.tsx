import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import vaultIcon from "../../assets/brand/ChatGPT Image Jun 27, 2026, 06_34_03 PM.png";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            <Image src={vaultIcon} alt="LexiVault icon" width={64} height={64} priority />
          </div>
          <div className="auth-brand-name">LexiVault</div>
          <div className="auth-brand-subtitle">Intelligent Document Memory</div>
        </div>

        <div className="auth-card auth-card-login">
          <div className="auth-top auth-top-login">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-copy">Sign in to your account to continue.</p>
          </div>

          <LoginForm />

          <div className="auth-footer-link">
            <span>Don&apos;t have an account?</span>
            <Link href="/signup" className="text-link">
              Create one
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

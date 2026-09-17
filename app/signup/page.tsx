import Image from "next/image";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import vaultIcon from "../../assets/brand/ChatGPT Image Jun 27, 2026, 06_34_03 PM.png";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
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
            <h1 className="auth-title">Create your LexiVault account</h1>
            <p className="auth-copy">Start building your private document memory today.</p>
          </div>

          <SignupForm />

          <div className="auth-footer-link">
            <span>Already have an account?</span>
            <Link href="/login" className="text-link">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { LockIcon, MailIcon } from "@/components/ui/app-icons";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message || "Unable to sign in.");
          return;
        }

        router.replace("/config");
        router.refresh();
      } catch {
        setError("Unable to sign in right now.");
        return;
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-field-group">
        <label htmlFor="login-email" className="field-label">
          Email
        </label>
        <div className="field-input-shell">
          <MailIcon width={18} height={18} className="field-input-icon" />
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field-input field-input-with-icon"
            placeholder="you@company.com"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="auth-field-group">
        <label htmlFor="login-password" className="field-label">
          Password
        </label>
        <div className="field-input-shell">
          <LockIcon width={18} height={18} className="field-input-icon" />
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field-input field-input-with-icon"
            placeholder="••••••••••••"
            autoComplete="current-password"
          />
        </div>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <button type="submit" disabled={isPending} className="submit-button">
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

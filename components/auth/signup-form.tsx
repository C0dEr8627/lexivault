"use client";

import { LockIcon, MailIcon, ShieldIcon } from "@/components/ui/app-icons";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signupSchema } from "@/lib/validation/auth-schema";

type AuthResponse =
  | { success: true; data: { authenticated: boolean } }
  | { success: false; error: { code: string; message: string } };

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const parsed = signupSchema.safeParse({ email, password, confirmPassword });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please complete the signup form correctly.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.success) {
        setError(data.success ? "Unable to create account." : data.error.message);
        return;
      }

      router.replace("/config");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-field-group">
        <label htmlFor="signup-email" className="field-label">
          Email
        </label>
        <div className="field-input-shell">
          <MailIcon width={18} height={18} className="field-input-icon" />
          <input
            id="signup-email"
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
        <label htmlFor="signup-password" className="field-label">
          Password
        </label>
        <div className="field-input-shell">
          <LockIcon width={18} height={18} className="field-input-icon" />
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field-input field-input-with-icon"
            placeholder="Create a strong password"
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="auth-field-group">
        <label htmlFor="signup-confirm" className="field-label">
          Confirm password
        </label>
        <div className="field-input-shell">
          <ShieldIcon width={18} height={18} className="field-input-icon" />
          <input
            id="signup-confirm"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="field-input field-input-with-icon"
            placeholder="Repeat your password"
            autoComplete="new-password"
          />
        </div>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <button type="submit" disabled={isPending} className="submit-button">
        {isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useState, useTransition } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const redirectTo = `${window.location.origin}/reset-password`;

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo,
        });

        if (resetError) {
          setError(resetError.message || "Unable to send password reset email.");
          return;
        }

        setMessage("If the account exists, a password reset link has been sent to that email.");
      } catch {
        setError("Unable to start password reset right now.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div>
        <label htmlFor="forgot-email" className="field-label">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="field-input"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      {error ? <div className="error-banner">{error}</div> : null}
      {message ? <div className="error-banner" style={{ borderColor: "rgba(34, 197, 94, 0.28)", background: "rgba(240, 253, 244, 0.95)", color: "#166534" }}>{message}</div> : null}

      <button type="submit" disabled={isPending} className="submit-button">
        {isPending ? "Sending reset link..." : "Send reset link"}
      </button>
    </form>
  );
}

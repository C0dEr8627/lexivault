"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ResetPasswordForm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsRecoverySession(Boolean(data.session));
    };

    void syncSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoverySession(true);
      }

      if (session) {
        setIsRecoverySession(true);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isRecoverySession) {
      setError("Open this page from the password reset email to continue.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          setError(updateError.message || "Unable to update password.");
          return;
        }

        setMessage("Password updated successfully. Redirecting you to your workspace...");
        router.replace("/documents");
        router.refresh();
      } catch {
        setError("Unable to update password right now.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {!isRecoverySession ? (
        <div className="error-banner">
          Use the password reset link sent to your email to open this page.
        </div>
      ) : null}

      <div>
        <label htmlFor="new-password" className="field-label">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className="field-input"
          placeholder="Create a new password"
          autoComplete="new-password"
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="field-label">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="field-input"
          placeholder="Repeat your password"
          autoComplete="new-password"
        />
      </div>

      {error ? <div className="error-banner">{error}</div> : null}
      {message ? <div className="error-banner" style={{ borderColor: "rgba(34, 197, 94, 0.28)", background: "rgba(240, 253, 244, 0.95)", color: "#166534" }}>{message}</div> : null}

      <button type="submit" disabled={isPending} className="submit-button">
        {isPending ? "Updating password..." : "Update password"}
      </button>
    </form>
  );
}

"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type LogoutResponse =
  | { success: true; data: { signedOut: boolean } }
  | { success: false; error: { code: string; message: string } };

type LogoutButtonProps = {
  compact?: boolean;
  icon?: ReactNode;
};

export function LogoutButton({ compact = false, icon }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = (await response.json()) as LogoutResponse;

      if (!response.ok || !data.success) {
        return;
      }

      router.replace("/login");
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={`logout-button${compact ? " compact" : ""}`}
      aria-label="Logout"
    >
      {icon ? <span className="logout-button-icon">{icon}</span> : null}
      {compact ? null : isPending ? "Signing out..." : "Logout"}
    </button>
  );
}

import { redirect } from "next/navigation";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <ProtectedShell userEmail={user.email ?? null}>{children}</ProtectedShell>
  );
}

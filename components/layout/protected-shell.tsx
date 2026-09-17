"use client";

import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import vaultIcon from "@/assets/brand/ChatGPT Image Jun 27, 2026, 06_34_03 PM.png";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "@/components/ui/app-icons";

type ProtectedShellProps = {
  userEmail: string | null;
  children: React.ReactNode;
};

export function ProtectedShell({ userEmail, children }: ProtectedShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const isChatRoute = pathname === "/chat" || pathname.startsWith("/chat/");

  return (
    <main className="workspace-shell">
      <AppSidebar
        userEmail={userEmail}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapse={() => setIsCollapsed((value) => !value)}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="workspace-main">
        <div className="workspace-mobile-bar">
          <button
            type="button"
            className="workspace-mobile-toggle"
            onClick={() => setIsMobileOpen((value) => !value)}
            aria-label={isMobileOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isMobileOpen ? <PanelLeftCloseIcon width={18} height={18} /> : <PanelLeftOpenIcon width={18} height={18} />}
          </button>
          <div className="workspace-mobile-brand">
            <Image src={vaultIcon} alt="LexiVault icon" width={34} height={34} priority className="workspace-mobile-brand-icon" />
            <div className="workspace-mobile-brand-copy">
              <div className="workspace-mobile-brand-title">LexiVault</div>
              <div className="workspace-mobile-brand-subtitle">Document Memory</div>
            </div>
          </div>
        </div>

        <section className={`workspace-content${isChatRoute ? " workspace-content-chat" : ""}`}>{children}</section>
      </div>
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import vaultIcon from "@/assets/brand/ChatGPT Image Jun 27, 2026, 06_34_03 PM.png";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  ArrowRightExitIcon,
  ChatIcon,
  ConfigurationIcon,
  DocumentsIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "@/components/ui/app-icons";

const navigation = [
  { href: "/config", label: "Configuration", icon: ConfigurationIcon },
  { href: "/documents", label: "Documents", icon: DocumentsIcon },
  { href: "/chat", label: "Chat", icon: ChatIcon },
] as const;

type AppSidebarProps = {
  userEmail: string | null;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

export function AppSidebar({
  userEmail,
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: AppSidebarProps) {
  const pathname = usePathname();
  const avatarLabel = (userEmail?.trim()?.[0] || "A").toUpperCase();

  return (
    <>
      <div
        className={`workspace-sidebar-overlay${isMobileOpen ? " is-visible" : ""}`}
        onClick={onCloseMobile}
        aria-hidden={!isMobileOpen}
      />

      <aside
        className={`workspace-sidebar${isCollapsed ? " is-collapsed" : ""}${isMobileOpen ? " is-mobile-open" : ""}`}
      >
        <div className="workspace-sidebar-header">
          <Link href="/documents" className="workspace-brand" onClick={onCloseMobile}>
            <span className="workspace-brand-mark">
              <Image
                src={vaultIcon}
                alt="LexiVault icon"
                width={28}
                height={28}
                priority
                className="workspace-brand-image"
              />
            </span>
            <div className="workspace-brand-copy">
              <div className="workspace-brand-title">LexiVault</div>
              <div className="workspace-brand-subtitle">Document Memory</div>
            </div>
          </Link>

          <button
            type="button"
            className="workspace-sidebar-toggle"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpenIcon width={16} height={16} /> : <PanelLeftCloseIcon width={16} height={16} />}
          </button>
        </div>

        <nav className="workspace-nav" aria-label="Primary">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`workspace-nav-link${isActive ? " is-active" : ""}`}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="workspace-nav-link-icon">
                  <Icon width={20} height={20} />
                </span>
                <span className="workspace-nav-link-label">{item.label}</span>
                <span className="workspace-nav-link-dot" />
              </Link>
            );
          })}
        </nav>

        <div className="workspace-sidebar-footer">
          <div className="workspace-account">
            <div className="workspace-account-avatar" title={isCollapsed ? userEmail ?? "Authenticated user" : undefined}>
              {avatarLabel}
            </div>
            <div className="workspace-account-copy">
              <div className="workspace-account-email">{userEmail ?? "Authenticated user"}</div>
            </div>
            <LogoutButton compact icon={<ArrowRightExitIcon width={16} height={16} />} />
          </div>
        </div>
      </aside>
    </>
  );
}

import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "LexiVault",
  description: "Intelligent Document Memory System for private, grounded PDF chat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <style>{`
          :root {
            color-scheme: dark;
            --lv-bg: #0a1238;
            --lv-surface: rgba(21, 34, 101, 0.92);
            --lv-surface-strong: rgba(17, 28, 83, 0.98);
            --lv-border: rgba(106, 142, 255, 0.14);
            --lv-text: #dce8ff;
            --lv-muted: #9fb3e8;
            --lv-primary: #4169e8;
            --lv-accent: #6d35d4;
            --lv-shadow: 0 30px 80px rgba(0, 0, 0, 0.28);
          }

          html {
            scroll-behavior: smooth;
            background: radial-gradient(circle at 50% 0%, rgba(65, 105, 232, 0.28), transparent 32%), linear-gradient(180deg, #08102f 0%, #0c1642 100%);
          }

          body {
            margin: 0;
            min-height: 100vh;
            font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
            color: var(--lv-text);
            background: radial-gradient(circle at 50% 0%, rgba(65, 105, 232, 0.28), transparent 32%), linear-gradient(180deg, #08102f 0%, #0c1642 100%);
          }

          * { box-sizing: border-box; }
          img { display: block; max-width: 100%; }
          a { color: inherit; text-decoration: none; }
          button, input, textarea { font: inherit; }

          .landing-page,
          .auth-page,
          .protected-page {
            min-height: 100vh;
          }

          .landing-page {
            position: relative;
            overflow: hidden;
          }

          .landing-page::before,
          .landing-page::after {
            content: "";
            position: fixed;
            inset: auto;
            pointer-events: none;
            z-index: -1;
            border-radius: 999px;
            filter: blur(70px);
          }

          .landing-page::before {
            top: -5rem;
            left: 50%;
            width: 26rem;
            height: 26rem;
            transform: translateX(-50%);
            background: rgba(65, 105, 232, 0.22);
          }

          .landing-page::after {
            top: 10rem;
            right: -4rem;
            width: 20rem;
            height: 20rem;
            background: rgba(109, 53, 212, 0.18);
          }

          .landing-header,
          .landing-section,
          .landing-footer,
          .auth-shell,
          .protected-shell {
            width: min(100%, 80rem);
            margin-inline: auto;
          }

          .landing-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding: 1.25rem 1.5rem;
          }

          .landing-brand {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .landing-brand-text {
            display: grid;
            gap: 0.15rem;
          }

          .landing-brand-title,
          .auth-title,
          .page-title,
          .sidebar-title {
            font-weight: 700;
            letter-spacing: -0.03em;
            color: var(--lv-text);
          }

          .landing-brand-title { font-size: 1rem; }
          .landing-brand-subtitle,
          .landing-kicker,
          .section-kicker,
          .sidebar-kicker,
          .auth-kicker {
            font-family: "JetBrains Mono", ui-monospace, monospace;
            text-transform: uppercase;
            letter-spacing: 0.22em;
            font-size: 0.68rem;
            color: var(--lv-muted);
          }

          .landing-nav {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            font-size: 0.95rem;
            color: var(--lv-muted);
          }

          .landing-nav a,
          .text-link {
            transition: color 160ms ease, opacity 160ms ease, transform 160ms ease;
          }

          .landing-nav a:hover,
          .text-link:hover { color: var(--lv-text); }

          .button-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            border-radius: 999px;
            padding: 0.8rem 1.35rem;
            border: 1px solid transparent;
            font-weight: 700;
            box-shadow: 0 12px 30px rgba(37, 99, 235, 0.16);
          }

          .button-link.primary {
            color: white;
            background: linear-gradient(135deg, var(--lv-primary), #4f46e5);
          }

          .button-link.secondary {
            background: rgba(255,255,255,0.08);
            border-color: rgba(106, 142, 255, 0.16);
            color: var(--lv-text);
          }

          .button-link:disabled,
          .submit-button:disabled {
            opacity: 0.58;
            cursor: not-allowed;
            box-shadow: none;
          }

          .landing-section {
            padding: 0 1.5rem 5rem;
          }

          .hero-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
            gap: 3rem;
            align-items: center;
            padding-top: 1rem;
          }

          .hero-copy {
            max-width: 42rem;
          }

          .hero-chip {
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.65rem 1rem;
            border-radius: 999px;
            border: 1px solid rgba(106, 142, 255, 0.16);
            background: rgba(255,255,255,0.05);
            color: var(--lv-muted);
            font-size: 0.8rem;
            font-weight: 600;
            box-shadow: 0 10px 40px rgba(15, 23, 42, 0.05);
            backdrop-filter: blur(18px);
          }

          .hero-chip-dot {
            width: 0.55rem;
            height: 0.55rem;
            border-radius: 999px;
            background: var(--lv-primary);
            flex: none;
          }

          .hero-title {
            margin: 1.35rem 0 0;
            font-size: clamp(3rem, 7vw, 4.8rem);
            line-height: 0.98;
            letter-spacing: -0.05em;
          }

          .hero-title-accent {
            display: block;
            background: linear-gradient(90deg, #1d4ed8, #0891b2, #6d28d9);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }

          .hero-copy p,
          .section-copy,
          .card-copy,
          .trust-copy,
          .auth-copy,
          .page-copy {
            color: var(--lv-muted);
            line-height: 1.75;
          }

          .hero-actions {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            margin-top: 2rem;
          }

          .proof-grid,
          .feature-grid,
          .trust-grid,
          .step-grid {
            display: grid;
            gap: 1rem;
          }

          .proof-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            margin-top: 2rem;
          }

          .feature-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            margin-top: 2rem;
          }

          .step-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .trust-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .glass-panel,
          .proof-card,
          .feature-card,
          .step-card,
          .trust-card,
          .auth-card,
          .panel,
          .protected-sidebar,
          .protected-main {
            border-radius: 1.75rem;
            border: 1px solid var(--lv-border);
            background: var(--lv-surface);
            box-shadow: var(--lv-shadow);
            backdrop-filter: blur(20px);
          }

          .panel {
            padding: 1.25rem;
          }

          .hero-panel {
            position: relative;
            padding: 1.2rem;
            overflow: hidden;
          }

          .hero-panel::before {
            content: "";
            position: absolute;
            inset: 2.5rem 2.5rem auto;
            height: 10rem;
            border-radius: 999px;
            background: rgba(59, 130, 246, 0.14);
            filter: blur(50px);
            pointer-events: none;
          }

          .hero-panel-inner {
            position: relative;
          }

          .hero-panel-top {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(148, 163, 184, 0.22);
          }

          .hero-panel-badge {
            width: 2.75rem;
            height: 2.75rem;
            border-radius: 1rem;
            display: grid;
            place-items: center;
            font-weight: 800;
            color: white;
            background: linear-gradient(135deg, #4169e8, #6d35d4);
            box-shadow: 0 12px 30px rgba(65, 105, 232, 0.22);
            flex: none;
          }

          .hero-stack {
            display: grid;
            gap: 0.9rem;
            margin-top: 1rem;
          }

          .preview-block {
            border-radius: 1.2rem;
            border: 1px solid rgba(106, 142, 255, 0.14);
            background: rgba(255, 255, 255, 0.05);
            padding: 1rem;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
          }

          .preview-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
          }

          .status-pill,
          .source-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            white-space: nowrap;
          }

          .status-pill {
            padding: 0.45rem 0.7rem;
            color: #f5c16c;
            background: rgba(245, 158, 11, 0.14);
            border: 1px solid rgba(245, 158, 11, 0.18);
          }

          .source-pill {
            margin-top: 0.85rem;
            width: fit-content;
            padding: 0.4rem 0.7rem;
            color: #9cb7ff;
            background: rgba(65, 105, 232, 0.14);
            border: 1px solid rgba(106, 142, 255, 0.14);
          }

          .progress-bar {
            margin-top: 0.9rem;
            height: 0.55rem;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.08);
            overflow: hidden;
          }

          .progress-fill {
            width: 68%;
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, #4169e8, #6d35d4);
          }

          .proof-card,
          .feature-card,
          .step-card,
          .trust-card,
          .auth-card,
          .panel {
            padding: 1.25rem;
          }

          .proof-card {
            background: var(--lv-surface);
          }

          .feature-card {
            background: var(--lv-surface);
          }

          .step-card {
            background: var(--lv-surface);
          }

          .trust-card {
            background: var(--lv-surface);
          }

          .proof-card strong,
          .feature-card h3,
          .step-card h3,
          .trust-card strong {
            display: block;
            margin: 0;
            font-size: 0.98rem;
            color: var(--lv-text);
          }

          .feature-card h3,
          .step-card h3,
          .trust-card h3,
          .auth-title,
          .page-title {
            margin: 0;
            font-size: 1.1rem;
            color: var(--lv-text);
          }

          .sidebar-kicker {
            color: var(--lv-muted);
          }

          .section-copy,
          .card-copy,
          .trust-copy,
          .auth-copy,
          .page-copy {
            color: var(--lv-muted);
          }

          .section-heading {
            margin: 0.35rem 0 0;
            font-size: clamp(1.8rem, 3vw, 2.4rem);
            letter-spacing: -0.04em;
          }

          .section-row {
            display: grid;
            grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
            gap: 1.5rem;
            align-items: stretch;
          }

          .section-row .panel {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .trust-card strong,
          .proof-card strong,
          .feature-card strong,
          .step-card strong {
            display: block;
          }

          .landing-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding: 1rem 1.5rem 2rem;
            color: var(--lv-muted);
          }

          .auth-page {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 3.25rem 1.5rem;
            background:
              radial-gradient(circle at top left, rgba(65, 105, 232, 0.3), transparent 28%),
              radial-gradient(circle at bottom right, rgba(109, 53, 212, 0.18), transparent 24%),
              linear-gradient(180deg, #0a1238 0%, #0c1642 100%);
          }

          .auth-shell {
            width: min(100%, 31rem);
            display: grid;
            gap: 1.75rem;
            justify-items: center;
          }

          .auth-card {
            padding: 2.25rem;
          }

          .auth-brand {
            display: grid;
            justify-items: center;
            gap: 0.55rem;
            text-align: center;
          }

          .auth-brand-mark {
            width: 4.9rem;
            height: 4.9rem;
            border-radius: 1.35rem;
            display: grid;
            place-items: center;
            background: linear-gradient(180deg, rgba(65, 105, 232, 0.24), rgba(17, 28, 83, 0.98));
            box-shadow:
              0 14px 30px rgba(0, 0, 0, 0.25),
              inset 0 0 0 1px rgba(106, 142, 255, 0.12);
          }

          .auth-brand-mark img {
            border-radius: 1rem;
          }

          .auth-brand-name {
            font-size: 1.7rem;
            font-weight: 700;
            letter-spacing: -0.045em;
            color: var(--lv-text);
            line-height: 1;
          }

          .auth-brand-subtitle {
            font-size: 0.9rem;
            letter-spacing: 0.34em;
            text-transform: uppercase;
            color: var(--lv-muted);
          }

          .auth-card-login {
            width: 100%;
            border-radius: 1.9rem;
            padding: 2.1rem 2.3rem 1.8rem;
          }

          .auth-top-login {
            text-align: left;
            margin-bottom: 1.35rem;
          }

          .auth-top {
            text-align: center;
            margin-bottom: 1.5rem;
          }

          .auth-form {
            display: grid;
            gap: 1.15rem;
            margin-top: 0;
          }

          .auth-field-group {
            display: grid;
            gap: 0.45rem;
          }

          .field-label {
            display: block;
            margin: 0;
            font-size: 0.9rem;
            font-weight: 700;
            color: var(--lv-muted);
            letter-spacing: 0.02em;
          }

          .field-input-shell {
            position: relative;
          }

          .field-input-icon {
            position: absolute;
            left: 0.95rem;
            top: 50%;
            transform: translateY(-50%);
            color: #7b8ca8;
            pointer-events: none;
          }

          .field-input {
            width: 100%;
            border-radius: 1rem;
            border: 1px solid rgba(106, 142, 255, 0.14);
            background: rgba(10, 18, 56, 0.78);
            padding: 0.95rem 1rem;
            color: var(--lv-text);
            outline: none;
            transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
          }

          .field-input:focus {
            border-color: rgba(65, 105, 232, 0.55);
            box-shadow: 0 0 0 4px rgba(65, 105, 232, 0.12);
          }

          .field-input-with-icon {
            padding-left: 2.8rem;
          }

          .submit-button {
            margin-top: 0.25rem;
            width: 100%;
            border: 0;
            border-radius: 999px;
            padding: 1rem 1rem;
            background: linear-gradient(180deg, #4169e8, #2d56dd);
            color: #fff;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 16px 30px rgba(65, 105, 232, 0.28);
          }

          .error-banner {
            border-radius: 1rem;
            border: 1px solid rgba(248, 113, 113, 0.18);
            background: rgba(220, 38, 38, 0.14);
            color: #ffd6d6;
            padding: 0.9rem 1rem;
            font-size: 0.94rem;
            line-height: 1.55;
          }

          .helper-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            margin-top: 1.25rem;
            color: var(--lv-muted);
            font-size: 0.93rem;
          }

          .helper-row-centered {
            justify-content: center;
            gap: 0.3rem;
            margin-top: 0.35rem;
            font-size: 0.98rem;
          }

          .auth-footer-link {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.3rem;
            margin-top: 0.85rem;
            color: var(--lv-muted);
            font-size: 0.98rem;
          }

          .protected-page {
            padding: 1rem;
          }

          .protected-shell {
            display: grid;
            grid-template-columns: 260px minmax(0, 1fr);
            gap: 1rem;
            min-height: calc(100vh - 2rem);
          }

          .protected-sidebar {
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .protected-nav {
            display: grid;
            gap: 0.5rem;
            margin-top: 0.75rem;
          }

          .protected-nav a {
            display: block;
            padding: 0.9rem 1rem;
            border-radius: 1rem;
            color: var(--lv-muted);
            font-weight: 600;
            transition: background 160ms ease, color 160ms ease, transform 160ms ease;
          }

          .protected-nav a:hover {
            background: rgba(255,255,255,0.06);
            color: var(--lv-text);
          }

          .protected-user {
            margin-top: auto;
            padding: 1rem;
            border-radius: 1.25rem;
            border: 1px solid rgba(106, 142, 255, 0.14);
            background: rgba(255,255,255,0.05);
          }

          .protected-main {
            padding: 1.5rem;
            background: rgba(10, 18, 56, 0.62);
          }

          .logout-button {
            width: 100%;
            border: 1px solid rgba(106, 142, 255, 0.16);
            border-radius: 999px;
            padding: 0.75rem 1rem;
            background: rgba(255,255,255,0.06);
            font-weight: 700;
            color: var(--lv-text);
          }

          .page-copy {
            max-width: 42rem;
          }

          @media (max-width: 1024px) {
            .hero-grid,
            .section-row,
            .protected-shell {
              grid-template-columns: 1fr;
            }

            .proof-grid,
            .feature-grid,
            .step-grid,
            .trust-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 720px) {
            .landing-header,
            .landing-footer {
              flex-direction: column;
              align-items: flex-start;
            }

            .landing-nav {
              flex-wrap: wrap;
              gap: 1rem;
            }

            .landing-section,
            .landing-header,
            .landing-footer,
            .protected-page {
              padding-left: 1rem;
              padding-right: 1rem;
            }

            .auth-card,
            .protected-sidebar,
            .protected-main {
              padding: 1rem;
            }
          }
        `}</style>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

import Image from "next/image";
import Link from "next/link";
import vaultIcon from "../assets/brand/ChatGPT Image Jun 27, 2026, 06_34_03 PM.png";

const features = [
  {
    title: "Private PDF memory",
    description: "Turn text-based PDFs into a searchable knowledge base that stays scoped to one user.",
  },
  {
    title: "Grounded answers",
    description: "Ask questions and get responses that are limited to uploaded document context.",
  },
  {
    title: "Source-ready by design",
    description: "Keep a traceable path from assistant answers back to the chunks that support them.",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload",
    description: "Add a PDF and let the server validate and process the document.",
  },
  {
    step: "02",
    title: "Index",
    description: "Extract text, split it into chunks, and prepare it for retrieval.",
  },
  {
    step: "03",
    title: "Chat",
    description: "Ask questions in a private workspace that only uses your documents.",
  },
];

const proofPoints = [
  ["One user", "One private boundary"],
  ["Text PDFs", "MVP ingestion only"],
  ["Grounding", "Sources stay traceable"],
] as const;

const trustPoints = [
  ["Server-side AI", "Gemini key stays on the backend."],
  ["Per-user storage", "Uploads live under a user-scoped path."],
  ["Traceable context", "Answers map back to source chunks."],
  ["MVP boundaries", "No OCR or multi-provider complexity."],
] as const;

export default async function HomePage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link href="/" className="landing-brand">
          <Image src={vaultIcon} alt="LexiVault icon" width={52} height={52} priority className="landing-brand-icon" />
          <div className="landing-brand-text">
            <div className="landing-brand-title">LexiVault</div>
            <div className="landing-brand-subtitle">Intelligent Document Memory System</div>
          </div>
        </Link>

        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#trust">Privacy</a>
          <Link href="/login">Sign in</Link>
          <Link href="/signup" className="button-link primary">
            Get started
          </Link>
        </nav>
      </header>

      <section className="landing-section">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="hero-chip">
              <span className="hero-chip-dot" />
              Private document intelligence for PDF-heavy work
            </div>

            <h1 className="hero-title">
              <span className="hero-title-line">Your documents,</span>
              <span className="hero-title-accent">organized for grounded answers.</span>
            </h1>

            <p className="section-copy">
              LexiVault turns your PDFs into a private, searchable knowledge base. Upload text-based
              documents, inspect what was extracted, and ask questions against your own content.
            </p>

            <div className="hero-actions">
              <Link href="/signup" className="button-link primary">
                Get started
              </Link>
              <Link href="/login" className="button-link secondary">
                Sign in
              </Link>
            </div>

            <div className="proof-grid">
              {proofPoints.map(([title, copy]) => (
                <div key={title} className="proof-card">
                  <strong>{title}</strong>
                  <div className="card-copy">{copy}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-inner">
              <div className="panel">
                <div className="hero-panel-top">
                  <div className="hero-panel-badge">L</div>
                  <div>
                    <div className="page-title">Document workspace</div>
                    <div className="sidebar-kicker">Phase 0 foundation</div>
                  </div>
                </div>

                <div className="hero-stack">
                  <div className="preview-block">
                    <div className="preview-row">
                      <div>
                        <div className="page-title" style={{ fontSize: "0.98rem" }}>
                          employee-handbook.pdf
                        </div>
                        <div className="sidebar-kicker">processing</div>
                      </div>
                      <div className="status-pill">chunking</div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" />
                    </div>
                  </div>

                  <div className="preview-block">
                    <div className="sidebar-kicker">answer preview</div>
                    <p className="card-copy">
                      The answer is grounded in the uploaded documents. If the content is missing, the
                      assistant should say so clearly.
                    </p>
                    <div className="source-pill">cited</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-section">
        <p className="section-kicker">Features</p>
        <h2 className="section-heading">A calm interface for a private document workflow.</h2>
        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p className="card-copy">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="section-row">
          <div className="panel">
            <p className="section-kicker">How it works</p>
            <h2 className="section-heading">A simple flow that stays easy to explain.</h2>
            <p className="section-copy">
              Phase 0 establishes the shell and visual language. The later implementation phases
              will plug in auth, storage, ingestion, retrieval, and chat.
            </p>
          </div>

          <div className="step-grid">
            {steps.map((item) => (
              <article key={item.step} className="step-card">
                <div className="section-kicker" style={{ color: "var(--lv-primary)" }}>
                  {item.step}
                </div>
                <h3>{item.title}</h3>
                <p className="card-copy">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="landing-section">
        <div className="panel">
          <div className="section-row" style={{ gridTemplateColumns: "1fr 0.95fr", alignItems: "center" }}>
            <div>
              <p className="section-kicker">Privacy</p>
              <h2 className="section-heading">Built around one user and one private data boundary.</h2>
              <p className="trust-copy">
                The MVP is designed to keep document ownership simple: each user owns their own
                configuration, documents, chunks, sessions, and future vector namespace.
              </p>
            </div>

            <div className="trust-grid">
              {trustPoints.map(([title, copy]) => (
                <div key={title} className="trust-card">
                  <strong>{title}</strong>
                  <div className="card-copy">{copy}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div>LexiVault</div>
        <div className="sidebar-kicker">Phase 1 landing</div>
      </footer>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { BookIcon, ChevronDownIcon, LockIcon, SparklesIcon } from "@/components/ui/app-icons";
import { useToast } from "@/components/ui/toast-provider";
import {
  EMBEDDING_MODEL,
  GEMINI_MODEL,
  GEMINI_MODEL_OPTIONS,
  type ConfigInput,
} from "@/lib/validation/config-schema";
import type { ConfigRecord } from "@/types/config";

const defaultPrompt = `You are a document assistant.
Be accurate, concise, and helpful.
Use only the provided document context to answer the user's question.
If the answer is not supported by the documents, say:
"I could not find this information in your uploaded documents."
When helpful, quote or summarize the relevant passage and avoid guessing.`;

const geminiModelLabels: Record<(typeof GEMINI_MODEL_OPTIONS)[number], string> = {
  "gemini-2.5-flash": "Gemini 2.5 Flash",
  "gemini-2.5-pro": "Gemini 2.5 Pro",
  "gemini-2.0-flash": "Gemini 2.0 Flash",
};

type ConfigFormProps = {
  initialConfig: ConfigRecord | null;
};

type SaveResponse =
  | { success: true; data: ConfigRecord }
  | { success: false; error: { code: string; message: string } };

export function ConfigForm({ initialConfig }: ConfigFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const modelPickerRef = useRef<HTMLDivElement | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [langsmithApiKey, setLangsmithApiKey] = useState("");
  const [langsmithProject, setLangsmithProject] = useState(initialConfig?.langsmithProject ?? "");
  const [pineconeApiKey, setPineconeApiKey] = useState("");
  const [pineconeIndexName, setPineconeIndexName] = useState(initialConfig?.pineconeIndexName ?? "");
  const [geminiModel, setGeminiModel] = useState<ConfigInput["geminiModel"]>(
    initialConfig?.geminiModel ?? GEMINI_MODEL,
  );
  const [systemPrompt, setSystemPrompt] = useState(initialConfig?.systemPrompt ?? defaultPrompt);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGeminiModelOpen, setIsGeminiModelOpen] = useState(false);

  const hasExistingConfig = Boolean(initialConfig);
  const helperText = hasExistingConfig
    ? "Leave a secret field blank to keep the saved value."
    : "Save once to create your private configuration.";

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!modelPickerRef.current?.contains(event.target as Node)) {
        setIsGeminiModelOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsGeminiModelOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const trimmedGeminiApiKey = geminiApiKey.trim();
    const trimmedLangsmithApiKey = langsmithApiKey.trim();
    const trimmedLangsmithProject = langsmithProject.trim();
    const trimmedPineconeApiKey = pineconeApiKey.trim();
    const trimmedPineconeIndexName = pineconeIndexName.trim();
    const trimmedPrompt = systemPrompt.trim();

    if (!hasExistingConfig && trimmedGeminiApiKey.length < 10) {
      setError("Gemini API key must be at least 10 characters.");
      return;
    }

    if (!trimmedPrompt || trimmedPrompt.length < 20) {
      setError("System prompt must be at least 20 characters.");
      return;
    }

    if (!hasExistingConfig && !trimmedLangsmithApiKey) {
      setError("LangSmith API key is required for a new configuration.");
      return;
    }

    if (!trimmedLangsmithProject) {
      setError("LangSmith project is required.");
      return;
    }

    if (!hasExistingConfig && !trimmedPineconeApiKey) {
      setError("Pinecone API key is required for a new configuration.");
      return;
    }

    if (!trimmedPineconeIndexName) {
      setError("Pinecone index name is required.");
      return;
    }

    const payload: ConfigInput = {
      geminiApiKey: trimmedGeminiApiKey,
      langsmithApiKey: trimmedLangsmithApiKey,
      langsmithProject: trimmedLangsmithProject,
      pineconeApiKey: trimmedPineconeApiKey,
      pineconeIndexName: trimmedPineconeIndexName,
      geminiModel,
      embeddingModel: EMBEDDING_MODEL,
      systemPrompt: trimmedPrompt,
    };

    setIsSaving(true);

    void (async () => {
      try {
        const response = await fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as SaveResponse;

        if (!response.ok || !data.success) {
          setError(data.success ? "Unable to save configuration." : data.error.message);
          return;
        }

        setGeminiApiKey("");
        setLangsmithApiKey("");
        setLangsmithProject(data.data.langsmithProject);
        setPineconeApiKey("");
        setPineconeIndexName(data.data.pineconeIndexName);
        setGeminiModel(data.data.geminiModel);
        setSystemPrompt(data.data.systemPrompt);
        showToast({
          tone: "success",
          title: "Configuration saved",
          description: "Your Gemini, LangSmith, and Pinecone settings are ready.",
        });
        router.refresh();
      } catch {
        setError("Unable to save configuration right now.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  return (
    <form onSubmit={handleSubmit} className="config-form-figma">
      <section className="config-section-card">
        <div className="config-section-head">
          <div className="config-section-icon">
            <LockIcon width={22} height={22} />
          </div>
          <div>
            <h2>API Keys</h2>
            <p>Store the server-side keys used for inference, tracing, and retrieval.</p>
          </div>
        </div>

        <div className="config-helper-banner">{helperText}</div>

        <div className="config-key-grid">
          <div>
            <label htmlFor="gemini-api-key" className="config-label">
              Gemini API Key
            </label>
            <input
              id="gemini-api-key"
              type="password"
              value={geminiApiKey}
              onChange={(event) => setGeminiApiKey(event.target.value)}
              className="config-input"
              placeholder={hasExistingConfig ? "Enter to replace the saved Gemini key" : "Paste your Gemini API key"}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="langsmith-api-key" className="config-label">
              LangSmith API Key
            </label>
            <input
              id="langsmith-api-key"
              type="password"
              value={langsmithApiKey}
              onChange={(event) => setLangsmithApiKey(event.target.value)}
              className="config-input"
              placeholder={hasExistingConfig ? "Enter to replace the saved LangSmith key" : "Paste your LangSmith API key"}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="pinecone-api-key" className="config-label">
              Pinecone API Key
            </label>
            <input
              id="pinecone-api-key"
              type="password"
              value={pineconeApiKey}
              onChange={(event) => setPineconeApiKey(event.target.value)}
              className="config-input"
              placeholder={hasExistingConfig ? "Enter to replace the saved Pinecone key" : "Paste your Pinecone API key"}
              autoComplete="off"
            />
          </div>
        </div>
      </section>

      <section className="config-section-card">
        <div className="config-section-head">
          <div className="config-section-icon purple">
            <SparklesIcon width={22} height={22} />
          </div>
          <div>
            <h2>Tracing And Vector Store</h2>
            <p>Choose the tracing project and Pinecone connection for your workspace.</p>
          </div>
        </div>

        <div className="config-model-grid">
          <div>
            <label htmlFor="langsmith-project" className="config-label">
              LangSmith Project
            </label>
            <input
              id="langsmith-project"
              type="text"
              value={langsmithProject}
              onChange={(event) => setLangsmithProject(event.target.value)}
              className="config-input"
              placeholder="personal-document-rag-mvp"
            />
          </div>

          <div>
            <label htmlFor="pinecone-index-name" className="config-label">
              Pinecone Index Name
            </label>
            <input
              id="pinecone-index-name"
              type="text"
              value={pineconeIndexName}
              onChange={(event) => setPineconeIndexName(event.target.value)}
              className="config-input"
              placeholder="lexivault-documents"
            />
          </div>
        </div>
      </section>

      <section className="config-section-card">
        <div className="config-section-head">
          <div className="config-section-icon purple">
            <SparklesIcon width={22} height={22} />
          </div>
          <div>
            <h2>Models</h2>
            <p>Choose the Gemini model used for chat. Embeddings stay fixed for Pinecone compatibility.</p>
          </div>
        </div>

        <div className="config-model-grid">
          <div ref={modelPickerRef} className="config-model-picker">
            <label htmlFor="gemini-model" className="config-label">
              Gemini Model
            </label>
            <button
              id="gemini-model"
              type="button"
              className="config-input config-model-trigger"
              aria-haspopup="listbox"
              aria-expanded={isGeminiModelOpen}
              onClick={() => setIsGeminiModelOpen((value) => !value)}
            >
              <span>{geminiModelLabels[geminiModel]}</span>
              <ChevronDownIcon width={16} height={16} />
            </button>

            {isGeminiModelOpen ? (
              <div className="config-model-menu" role="listbox" aria-label="Gemini model">
                {GEMINI_MODEL_OPTIONS.map((option) => {
                  const isSelected = option === geminiModel;

                  return (
                    <button
                      key={option}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`config-model-option${isSelected ? " is-selected" : ""}`}
                      onClick={() => {
                        setGeminiModel(option);
                        setIsGeminiModelOpen(false);
                      }}
                    >
                      {geminiModelLabels[option]}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div>
            <label className="config-label" htmlFor="embedding-model">
              Embedding Model
            </label>
            <input id="embedding-model" type="text" value="Gemini Embedding 001" className="config-input" readOnly />
          </div>
        </div>

        <div className="config-model-note">
          <div className="config-helper-banner">
            Embeddings are fixed to {EMBEDDING_MODEL} so Pinecone keeps the required 1024-dimensional vectors.
          </div>
        </div>
      </section>

      <section className="config-section-card">
        <div className="config-section-head">
          <div className="config-section-icon">
            <BookIcon width={22} height={22} />
          </div>
          <div>
            <h2>System Prompt</h2>
            <p>Controls how the assistant responds to questions.</p>
          </div>
        </div>

        <div>
          <label htmlFor="system-prompt" className="config-label">
            Prompt
          </label>
          <textarea
            id="system-prompt"
            value={systemPrompt}
            onChange={(event) => setSystemPrompt(event.target.value)}
            className="config-textarea font-mono"
            rows={10}
          />
        </div>
      </section>

      {error ? (
        <Alert title="Unable to save" tone="error" className="workspace-inline-alert">
          {error}
        </Alert>
      ) : null}

      <div className="config-save-row">
        <button type="submit" disabled={isSaving} className="workspace-primary-button">
          {isSaving ? "Saving..." : "Save configuration"}
        </button>
      </div>
    </form>
  );
}

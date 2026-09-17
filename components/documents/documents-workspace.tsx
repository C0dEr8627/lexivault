"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { DocumentUploadCard } from "@/components/documents/document-upload-card";
import { DocumentsTable } from "@/components/documents/documents-table";
import type { DocumentRecord } from "@/types/documents";

type DocumentsWorkspaceProps = {
  hasConfig: boolean;
  initialDocuments: DocumentRecord[];
};

async function fetchDocuments() {
  const response = await fetch("/api/documents");
  const data = (await response.json()) as
    | { success: true; data: { documents: DocumentRecord[] } }
    | { success: false; error: { code: string; message: string } };

  if (!response.ok || !data.success) {
    throw new Error(data.success ? "Unable to load documents." : data.error.message);
  }

  return data.data.documents;
}

export function DocumentsWorkspace({ hasConfig, initialDocuments }: DocumentsWorkspaceProps) {
  const [serverDocuments, setServerDocuments] = useState<DocumentRecord[]>(initialDocuments);
  const [optimisticDocuments, setOptimisticDocuments] = useState<DocumentRecord[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    setServerDocuments(initialDocuments);
  }, [initialDocuments]);

  useEffect(() => {
    const shouldPoll =
      optimisticDocuments.length > 0 || serverDocuments.some((document) => document.status === "processing");

    if (!shouldPoll) {
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const latestDocuments = await fetchDocuments();

        if (cancelled) {
          return;
        }

        setLoadError("");
        setServerDocuments(latestDocuments);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Unable to refresh documents.");
        }
      }
    };

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [optimisticDocuments.length, serverDocuments]);

  const documents = useMemo(() => {
    const matchedClientIds = new Set(
      serverDocuments.map((document) => document.clientUploadId).filter((value): value is string => Boolean(value)),
    );

    const remainingOptimistic = optimisticDocuments.filter((document) => !matchedClientIds.has(document.clientUploadId ?? ""));

    return [...remainingOptimistic, ...serverDocuments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [optimisticDocuments, serverDocuments]);

  const handleUploadStarted = (document: DocumentRecord) => {
    setLoadError("");
    setOptimisticDocuments((current) => {
      const next = current.filter((item) => item.clientUploadId !== document.clientUploadId);
      return [document, ...next];
    });
  };

  const handleUploadFailed = (clientUploadId: string) => {
    setOptimisticDocuments((current) => current.filter((item) => item.clientUploadId !== clientUploadId));
  };

  const hasDocuments = documents.length > 0;

  return (
    <>
      {!hasConfig ? (
        <Alert title="Configuration required" tone="warning" className="workspace-inline-alert">
          Please add your Gemini API key in Configuration before uploading documents.
        </Alert>
      ) : null}

      <DocumentUploadCard
        hasConfig={hasConfig}
        onUploadStarted={handleUploadStarted}
        onUploadFailed={handleUploadFailed}
      />

      {loadError ? (
        <Alert title="Unable to refresh documents" tone="error" className="workspace-inline-alert">
          {loadError}
        </Alert>
      ) : null}

      {hasDocuments ? (
        <DocumentsTable documents={documents} />
      ) : (
        <div className="workspace-empty-card">
          <div className="workspace-empty-copy">
            <h2>Your document library is empty</h2>
            <p>Upload a PDF to begin building your private document memory.</p>
          </div>
          <Link href="/config" className="workspace-ghost-button">
            Check configuration
          </Link>
        </div>
      )}
    </>
  );
}

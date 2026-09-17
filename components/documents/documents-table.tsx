"use client";

import { useState, useTransition } from "react";
import { DeleteDocumentDialog } from "@/components/documents/delete-document-dialog";
import { Alert } from "@/components/ui/alert";
import {
  CheckIcon,
  EyeIcon,
  FilePdfIcon,
  LayersIcon,
  TrashIcon,
  XIcon,
} from "@/components/ui/app-icons";
import type { DocumentRecord } from "@/types/documents";

type DocumentsTableProps = {
  documents: DocumentRecord[];
};

type SignedUrlResponse =
  | { success: true; data: { signedUrl: string } }
  | { success: false; error: { code: string; message: string } };

const PIPELINE_LABELS = ["Loading", "Parsing", "Chunking", "Embedding"] as const;

function getStageIndex(processingStage: DocumentRecord["processingStage"]) {
  switch (processingStage) {
    case "uploading":
    case "loading":
      return 0;
    case "parsing":
      return 1;
    case "chunking":
      return 2;
    case "embedding":
      return 3;
    default:
      return 0;
  }
}

function getPipelineState(status: DocumentRecord["status"], processingStage: DocumentRecord["processingStage"]) {
  const buildStates = (stageIndex: number, failed = false) => {
    const states = PIPELINE_LABELS.map((_, index) =>
      index < stageIndex ? "complete" : index === stageIndex ? (failed ? "error" : "active") : "idle",
    );

    return states as ["complete" | "active" | "error" | "idle", "complete" | "active" | "error" | "idle", "complete" | "active" | "error" | "idle", "complete" | "active" | "error" | "idle"];
  };

  if (status === "ready") {
    return ["complete", "complete", "complete", "complete"] as const;
  }

  if (status === "failed") {
    return buildStates(getStageIndex(processingStage), true);
  }

  if (status === "deleted") {
    return ["idle", "idle", "idle", "idle"] as const;
  }

  return buildStates(getStageIndex(processingStage));
}

function formatUploadDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(bytes: number | null) {
  if (!bytes) {
    return "";
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<DocumentRecord | null>(null);
  const [actionError, setActionError] = useState("");
  const [isViewing, startViewing] = useTransition();

  const handleOpenPdf = (documentId: string) => {
    setActionError("");

    startViewing(async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}/signed-url`);
        const data = (await response.json()) as SignedUrlResponse;

        if (!response.ok || !data.success) {
          setActionError(data.success ? "Unable to open the document." : data.error.message);
          return;
        }

        window.open(data.data.signedUrl, "_blank", "noopener,noreferrer");
      } catch {
        setActionError("Unable to open the document right now.");
      }
    });
  };

  return (
    <div className="documents-panel">
      {actionError ? (
        <Alert title="Action failed" tone="error" className="workspace-inline-alert">
          {actionError}
        </Alert>
      ) : null}

      <div className="documents-panel-header">
        <h2>All Documents</h2>
        <div>{documents.length} files</div>
      </div>

      <div className="documents-table-head">
        <span>File Name</span>
        <span>Progress</span>
        <span>Chunks</span>
        <span>Uploaded</span>
        <span>Actions</span>
      </div>

      <div className="documents-table-body">
        {documents.map((document) => {
          const states = getPipelineState(document.status, document.processingStage);

          return (
            <div key={document.id} className="document-row">
              <div className="document-file-cell">
                <div className="document-file-icon">
                  <FilePdfIcon width={18} height={18} />
                </div>
                <div className="document-file-copy">
                  <div className="document-file-name">{document.fileName}</div>
                  <div className="document-file-meta">{formatFileSize(document.fileSize)}</div>
                  {document.processingMessage ? <div className="document-file-meta">{document.processingMessage}</div> : null}
                  {document.errorMessage ? <div className="document-file-error">{document.errorMessage}</div> : null}
                </div>
              </div>

              <div className="document-progress">
                <div className="document-progress-track">
                  {PIPELINE_LABELS.map((label, index) => {
                    const state = states[index];

                    return (
                      <div key={label} className={`document-step document-step-${state}`}>
                        <div className="document-step-icon">
                          {state === "complete" ? (
                            <CheckIcon width={14} height={14} />
                          ) : state === "error" ? (
                            <XIcon width={14} height={14} />
                          ) : state === "active" ? (
                            <span className="document-step-spinner" />
                          ) : (
                            <span className="document-step-dot" />
                          )}
                        </div>
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="document-chunk-cell">{document.status === "ready" ? document.chunkCount : "—"}</div>
              <div className="document-date-cell">{formatUploadDate(document.createdAt)}</div>

              <div className="document-actions-cell">
                {document.status === "ready" ? (
                  <div className="document-action-row">
                    <button
                      type="button"
                      className="document-action"
                      onClick={() => handleOpenPdf(document.id)}
                      disabled={isViewing}
                    >
                      <EyeIcon width={14} height={14} />
                      <span>View PDF</span>
                    </button>
                    <a href={`/documents/${document.id}/chunks`} className="document-action">
                      <LayersIcon width={14} height={14} />
                      <span>View Chunks</span>
                    </a>
                  </div>
                ) : null}

                <div className="document-action-row document-action-row-delete">
                  <button type="button" className="document-action danger" onClick={() => setDeleteTarget(document)}>
                    <TrashIcon width={14} height={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {deleteTarget ? (
        <DeleteDocumentDialog
          documentId={deleteTarget.id}
          documentName={deleteTarget.fileName}
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}

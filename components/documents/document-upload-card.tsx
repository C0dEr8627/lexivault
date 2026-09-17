"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { UploadIcon } from "@/components/ui/app-icons";
import { useToast } from "@/components/ui/toast-provider";
import type { DocumentRecord } from "@/types/documents";

type DocumentUploadCardProps = {
  hasConfig: boolean;
  onUploadStarted: (document: DocumentRecord) => void;
  onUploadFailed: (clientUploadId: string) => void;
};

type UploadResponse =
  | {
      success: true;
      data: {
        document: {
          id: string;
          fileName: string;
          status: "ready";
          chunkCount: number;
          createdAt: string;
        };
      };
    }
  | { success: false; error: { code: string; message: string } };

export function DocumentUploadCard({ hasConfig, onUploadStarted, onUploadFailed }: DocumentUploadCardProps) {
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const selectFile = (file: File | null) => {
    if (!file) {
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Only PDF files are supported.");
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!hasConfig) {
      setError("Please add your Gemini API key in Configuration before uploading documents.");
      return;
    }

    if (!selectedFile) {
      setError("Please choose a PDF file first.");
      return;
    }

    setIsUploading(true);

    void (async () => {
      const clientUploadId = crypto.randomUUID();
      onUploadStarted({
        id: clientUploadId,
        fileName: selectedFile.name,
        filePath: "",
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        status: "processing",
        processingStage: "uploading",
        processingMessage: "Uploading the PDF to storage.",
        clientUploadId,
        isActive: true,
        chunkCount: 0,
        errorMessage: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("clientUploadId", clientUploadId);

        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        const data = (await response.json()) as UploadResponse;

        if (!response.ok || !data.success) {
          setError(data.success ? "Unable to upload document." : data.error.message);
          onUploadFailed(clientUploadId);
          return;
        }

        setSelectedFile(null);
        showToast({
          tone: "success",
          title: "Upload started",
          description: `${data.data.document.fileName} is being processed now.`,
        });
      } catch {
        setError("Unable to upload the document right now.");
        onUploadFailed(clientUploadId);
      } finally {
        setIsUploading(false);
      }
    })();
  };

  return (
    <div className="document-upload-card">
      <form
        onSubmit={handleSubmit}
        className={`document-upload-form${isDragActive ? " is-drag-active" : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          setIsDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget === event.target) {
            setIsDragActive(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragActive(false);
          selectFile(event.dataTransfer.files?.[0] ?? null);
        }}
      >
        <input
          id="document-upload-input"
          type="file"
          accept="application/pdf"
          className="document-upload-input"
          onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
        />

        <div className="document-upload-icon-wrap">
          <UploadIcon width={28} height={28} />
        </div>

        <div className="document-upload-copy">
          <h2>Upload PDF</h2>
          <p>
            Drop a file here or click to browse. Only text-based PDFs are supported. Scanned PDFs and OCR are not
            available yet.
          </p>
          {isDragActive ? <div className="document-upload-drag-hint">Release to attach your PDF</div> : null}
          {selectedFile ? <div className="document-upload-selected">{selectedFile.name}</div> : null}
        </div>

        <label htmlFor="document-upload-input" className="document-upload-button">
          Choose File
        </label>

        {selectedFile ? (
          <button type="submit" className="document-upload-submit" disabled={!selectedFile || isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        ) : null}
      </form>

      {!hasConfig ? (
        <Alert title="Configuration required" tone="warning" className="document-upload-alert">
          Please add your Gemini API key in Configuration before uploading documents.
        </Alert>
      ) : null}

      {error ? (
        <Alert title="Upload failed" tone="error" className="document-upload-alert">
          {error}
        </Alert>
      ) : null}

      {hasConfig && !error ? (
        <div className="document-upload-footnote">
          Private PDFs are stored per account and prepared for retrieval after processing.
        </div>
      ) : null}
    </div>
  );
}

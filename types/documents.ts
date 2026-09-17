export type DocumentStatus = "processing" | "ready" | "failed" | "deleted";
export type DocumentProcessingStage = "uploading" | "loading" | "parsing" | "chunking" | "embedding";

export type DocumentRecord = {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  status: DocumentStatus;
  processingStage: DocumentProcessingStage | null;
  processingMessage: string | null;
  clientUploadId: string | null;
  isActive: boolean;
  chunkCount: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DocumentsListResponse = {
  documents: DocumentRecord[];
};

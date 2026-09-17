export type DocumentChunkRecord = {
  id: string;
  documentId: string;
  userId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number | null;
  pineconeVectorId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type DocumentChunksResponse = {
  document: {
    id: string;
    fileName: string;
    status: string;
    chunkCount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  chunks: DocumentChunkRecord[];
};

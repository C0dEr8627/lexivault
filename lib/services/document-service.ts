import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { documentChunksQuerySchema, documentIdSchema, documentsQuerySchema } from "@/lib/validation/document-schema";
import type { DocumentRecord, DocumentStatus } from "@/types/documents";
import type { DocumentChunkRecord } from "@/types/chunks";

type DocumentRow = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  status: DocumentStatus;
  processing_stage: "uploading" | "loading" | "parsing" | "chunking" | "embedding" | null;
  processing_message: string | null;
  client_upload_id: string | null;
  is_active: boolean;
  chunk_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

type DocumentChunkRow = {
  id: string;
  document_id: string;
  user_id: string;
  chunk_index: number;
  content: string;
  token_count: number | null;
  pinecone_vector_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

function isMissingStorageObjectError(message: string | undefined) {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();

  return (
    normalized.includes("object not found") ||
    normalized.includes("not found") ||
    normalized.includes("no such file") ||
    normalized.includes("does not exist")
  );
}

function mapRow(row: DocumentRow): DocumentRecord {
  return {
    id: row.id,
    fileName: row.file_name,
    filePath: row.file_path,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    status: row.status,
    processingStage: row.processing_stage,
    processingMessage: row.processing_message,
    clientUploadId: row.client_upload_id,
    isActive: row.is_active,
    chunkCount: row.chunk_count,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapChunkRow(row: DocumentChunkRow): DocumentChunkRecord {
  return {
    id: row.id,
    documentId: row.document_id,
    userId: row.user_id,
    chunkIndex: row.chunk_index,
    content: row.content,
    tokenCount: row.token_count,
    pineconeVectorId: row.pinecone_vector_id,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

async function getAuthedClient() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return { supabase, user: data.user };
  } catch {
    return null;
  }
}

export async function listCurrentUserDocuments(query: unknown): Promise<ServiceResult<{ documents: DocumentRecord[] }>> {
  const parsed = documentsQuerySchema.safeParse(query);

  if (!parsed.success) {
    return { ok: false, code: "VALIDATION_ERROR", message: "Invalid documents query." };
  }

  const session = await getAuthedClient();

  if (!session) {
    return { ok: false, code: "UNAUTHORIZED", message: "You must be signed in to view documents." };
  }

  const { supabase, user } = session;
  let request = supabase
    .from("documents")
    .select("id, file_name, file_path, file_size, mime_type, status, processing_stage, processing_message, client_upload_id, is_active, chunk_count, error_message, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (parsed.data.status) {
    request = request.eq("status", parsed.data.status);
  } else {
    request = request.eq("is_active", true).neq("status", "deleted");
  }

  const { data, error } = await request;

  if (error) {
    return { ok: false, code: "DATABASE_ERROR", message: error.message || "Unable to load documents." };
  }

  return { ok: true, data: { documents: (data ?? []).map((row) => mapRow(row as DocumentRow)) } };
}

export async function getCurrentUserDocument(documentId: string): Promise<ServiceResult<{ document: DocumentRecord | null }>> {
  const parsed = documentIdSchema.safeParse({ documentId });

  if (!parsed.success) {
    return { ok: false, code: "VALIDATION_ERROR", message: "Invalid document id." };
  }

  const session = await getAuthedClient();

  if (!session) {
    return { ok: false, code: "UNAUTHORIZED", message: "You must be signed in to view this document." };
  }

  const { supabase, user } = session;
  const { data, error } = await supabase
    .from("documents")
    .select("id, file_name, file_path, file_size, mime_type, status, processing_stage, processing_message, client_upload_id, is_active, chunk_count, error_message, created_at, updated_at")
    .eq("id", parsed.data.documentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, code: "DATABASE_ERROR", message: error.message || "Unable to load document." };
  }

  return { ok: true, data: { document: data ? mapRow(data as DocumentRow) : null } };
}

export async function softDeleteCurrentUserDocument(documentId: string): Promise<ServiceResult<{ documentId: string; status: "deleted"; isActive: false }>> {
  const parsed = documentIdSchema.safeParse({ documentId });

  if (!parsed.success) {
    return { ok: false, code: "VALIDATION_ERROR", message: "Invalid document id." };
  }

  const session = await getAuthedClient();

  if (!session) {
    return { ok: false, code: "UNAUTHORIZED", message: "You must be signed in to delete documents." };
  }

  const { supabase, user } = session;
  const { data, error } = await supabase
    .from("documents")
    .update({ is_active: false, status: "deleted" })
    .eq("id", parsed.data.documentId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, code: "DATABASE_ERROR", message: error.message || "Unable to delete document." };
  }

  if (!data) {
    return { ok: false, code: "NOT_FOUND", message: "Document not found." };
  }

  return { ok: true, data: { documentId: data.id, status: "deleted", isActive: false } };
}

export async function createDocumentSignedUrl(documentId: string): Promise<ServiceResult<{ signedUrl: string }>> {
  const parsed = documentIdSchema.safeParse({ documentId });

  if (!parsed.success) {
    return { ok: false, code: "VALIDATION_ERROR", message: "Invalid document id." };
  }

  const session = await getAuthedClient();

  if (!session) {
    return { ok: false, code: "UNAUTHORIZED", message: "You must be signed in to access documents." };
  }

  const { supabase, user } = session;
  const { data, error } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", parsed.data.documentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, code: "DATABASE_ERROR", message: error.message || "Unable to access document." };
  }

  if (!data?.file_path) {
    return { ok: false, code: "NOT_FOUND", message: "Document file not found." };
  }

  const admin = createSupabaseAdminClient();
  const { data: signedUrlData, error: signUrlError } = await admin.storage.from("documents").createSignedUrl(data.file_path, 60 * 5);

  if (signUrlError) {
    if (isMissingStorageObjectError(signUrlError.message)) {
      return { ok: false, code: "NOT_FOUND", message: "Document file not found." };
    }

    return { ok: false, code: "STORAGE_ERROR", message: signUrlError?.message || "Unable to create a signed URL." };
  }

  if (!signedUrlData?.signedUrl) {
    return { ok: false, code: "STORAGE_ERROR", message: "Unable to create a signed URL." };
  }

  return { ok: true, data: { signedUrl: signedUrlData.signedUrl } };
}

export async function listCurrentUserDocumentChunks(
  documentId: string,
  query: unknown,
): Promise<
  ServiceResult<{
    document: {
      id: string;
      fileName: string;
      status: DocumentStatus;
      processingStage: "uploading" | "loading" | "parsing" | "chunking" | "embedding" | null;
      processingMessage: string | null;
      clientUploadId: string | null;
      chunkCount: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    chunks: DocumentChunkRecord[];
  }>
> {
  const documentIdResult = documentIdSchema.safeParse({ documentId });
  const queryResult = documentChunksQuerySchema.safeParse(query);

  if (!documentIdResult.success || !queryResult.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Invalid chunks request.",
    };
  }

  const session = await getAuthedClient();

  if (!session) {
    return {
      ok: false,
      code: "UNAUTHORIZED",
      message: "You must be signed in to view document chunks.",
    };
  }

  const { supabase, user } = session;
  const { data: documentData, error: documentError } = await supabase
    .from("documents")
    .select("id, file_name, status, processing_stage, processing_message, client_upload_id, chunk_count, is_active")
    .eq("id", documentIdResult.data.documentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (documentError) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: documentError.message || "Unable to load document.",
    };
  }

  if (!documentData || !documentData.is_active) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "Document not found.",
    };
  }

  const page = queryResult.data.page;
  const limit = queryResult.data.limit;
  const offset = (page - 1) * limit;

  const [{ data: chunksData, error: chunksError }, { count, error: countError }] = await Promise.all([
    supabase
      .from("document_chunks")
      .select("id, document_id, user_id, chunk_index, content, token_count, pinecone_vector_id, metadata, created_at")
      .eq("document_id", documentIdResult.data.documentId)
      .eq("user_id", user.id)
      .order("chunk_index", { ascending: true })
      .range(offset, offset + limit - 1),
    supabase
      .from("document_chunks")
      .select("id", { count: "exact", head: true })
      .eq("document_id", documentIdResult.data.documentId)
      .eq("user_id", user.id),
  ]);

  if (chunksError || countError) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: chunksError?.message || countError?.message || "Unable to load document chunks.",
    };
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    ok: true,
    data: {
      document: {
        id: documentData.id,
        fileName: documentData.file_name,
        status: documentData.status,
        processingStage: documentData.processing_stage,
        processingMessage: documentData.processing_message,
        clientUploadId: documentData.client_upload_id,
        chunkCount: documentData.chunk_count,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      chunks: (chunksData ?? []).map((row) => mapChunkRow(row as DocumentChunkRow)),
    },
  };
}

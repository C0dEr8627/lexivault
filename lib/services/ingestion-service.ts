import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { withLangSmithChildTrace, withLangSmithTrace } from "@/lib/observability/langsmith";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserConfigSecrets } from "@/lib/services/config-service";
import { embedText, resolveEmbeddingModel } from "@/lib/langchain/gemini";
import { extractPdfText } from "@/lib/langchain/pdf-loader";
import { splitTextIntoChunks } from "@/lib/langchain/text-splitter";
import { upsertDocumentVectors } from "@/lib/pinecone/pinecone-service";

type UploadResult =
  | {
      ok: true;
      document: {
        id: string;
        fileName: string;
        status: "ready";
        chunkCount: number;
        createdAt: string;
      };
    }
  | { ok: false; code: string; message: string };

type UploadInput = {
  file: File;
  clientUploadId?: string | null;
};

type AuthSession = {
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;
  userId: string;
};

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const OCR_ERROR =
  "OCR is not supported in MVP. This PDF may be scanned or image-based.";

function getStorageBucketName() {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;

  if (!bucket) {
    throw new Error("Supabase storage bucket is not configured.");
  }

  return bucket;
}

async function getAuthedSession(): Promise<AuthSession | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return { supabase, userId: data.user.id };
  } catch {
    return null;
  }
}

async function failDocument(
  supabase: NonNullable<AuthSession["supabase"]>,
  documentId: string,
  message: string,
) {
  await supabase
    .from("documents")
    .update({
      status: "failed",
      processing_message: message,
      error_message: message,
    })
    .eq("id", documentId);
}

async function updateDocumentStage(
  supabase: NonNullable<AuthSession["supabase"]>,
  documentId: string,
  stage: "uploading" | "loading" | "parsing" | "chunking" | "embedding",
  message: string,
) {
  await supabase
    .from("documents")
    .update({
      status: "processing",
      processing_stage: stage,
      processing_message: message,
    })
    .eq("id", documentId);
}

async function readFileBuffer(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function processDocumentUpload(input: UploadInput): Promise<UploadResult> {
  const { file, clientUploadId } = input;
  const session = await getAuthedSession();

  if (!session) {
    return {
      ok: false,
      code: "UNAUTHORIZED",
      message: "You must be signed in to upload documents.",
    };
  }

  const configResult = await getCurrentUserConfigSecrets();

  if (!configResult.ok) {
    return {
      ok: false,
      code: configResult.code,
      message: configResult.message,
    };
  }

  if (!configResult.config) {
    return {
      ok: false,
      code: "CONFIG_REQUIRED",
      message: "Please add your Gemini API key in Configuration before uploading documents.",
    };
  }

  const userConfig = configResult.config;

  if (file.type !== "application/pdf") {
    return {
      ok: false,
      code: "INVALID_FILE_TYPE",
      message: "Only PDF files are supported.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      code: "FILE_TOO_LARGE",
      message: "PDF files must be 20MB or smaller.",
    };
  }

  return withLangSmithTrace<UploadResult>(
    {
      name: "document-upload-pipeline",
      runType: "chain",
      inputs: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      },
      tags: ["documents", "ingestion"],
    },
    {
      apiKey: userConfig.langsmithApiKey,
      project: userConfig.langsmithProject,
    },
    async (rootRun) => {
      const supabase = session.supabase;
      const bucket = getStorageBucketName();
      const documentId = crypto.randomUUID();
      const safeFileName = file.name.replace(/[\\/]/g, "_");
      const filePath = `${session.userId}/${documentId}/${safeFileName}`;

      const { data: insertedDocument, error: insertError } = await supabase
        .from("documents")
        .insert({
          id: documentId,
          user_id: session.userId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          status: "processing",
          processing_stage: "loading",
          processing_message: "Uploading the PDF to storage.",
          client_upload_id: clientUploadId ?? null,
          is_active: true,
          chunk_count: 0,
          error_message: null,
        })
        .select("id, file_name, status, processing_stage, processing_message, client_upload_id, chunk_count, created_at")
        .single();

      if (insertError || !insertedDocument) {
        return {
          result: {
            ok: false,
            code: "DATABASE_ERROR",
            message: insertError?.message || "Unable to create document record.",
          } satisfies UploadResult,
          outputs: { success: false, code: "DATABASE_ERROR" },
        };
      }

      const admin = createSupabaseAdminClient();
      const buffer = await readFileBuffer(file);
      const uploadResult = await admin.storage.from(bucket).upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

      if (uploadResult.error) {
        await failDocument(supabase, documentId, uploadResult.error.message || "Unable to store the PDF.");
        return {
          result: {
            ok: false,
            code: "STORAGE_ERROR",
            message: uploadResult.error.message || "Unable to store the PDF.",
          } satisfies UploadResult,
          outputs: { success: false, code: "STORAGE_ERROR" },
        };
      }

      let extractedText: string;

      try {
        await updateDocumentStage(supabase, documentId, "parsing", "Reading PDF text.");
        extractedText = await withLangSmithChildTrace(
          rootRun,
          {
            name: "extract-pdf-text",
            runType: "tool",
            inputs: { documentId, fileName: file.name },
            tags: ["documents", "ingestion", "pdf"],
          },
          {
            apiKey: userConfig.langsmithApiKey,
            project: userConfig.langsmithProject,
          },
          async () => {
            const text = await extractPdfText(buffer);
            return {
              result: text,
              outputs: { extractedCharacters: text.length },
            };
          },
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to read the PDF.";
        await failDocument(supabase, documentId, message);
        return {
          result: {
            ok: false,
            code: "PDF_PARSE_ERROR",
            message,
          } satisfies UploadResult,
          outputs: { success: false, code: "PDF_PARSE_ERROR" },
        };
      }

      if (extractedText.length < 100) {
        await failDocument(supabase, documentId, OCR_ERROR);
        return {
          result: {
            ok: false,
            code: "OCR_NOT_SUPPORTED",
            message: OCR_ERROR,
          } satisfies UploadResult,
          outputs: { success: false, code: "OCR_NOT_SUPPORTED" },
        };
      }

      const chunks = await withLangSmithChildTrace(
        rootRun,
        {
          name: "chunk-pdf-text",
          runType: "tool",
          inputs: { documentId, chunkSize: 1000, chunkOverlap: 200 },
          tags: ["documents", "ingestion", "chunking"],
        },
        {
          apiKey: userConfig.langsmithApiKey,
          project: userConfig.langsmithProject,
        },
        async () => {
          await updateDocumentStage(supabase, documentId, "chunking", "Splitting the document into chunks.");
          const chunkRows = splitTextIntoChunks(extractedText, 1000, 200);
          return {
            result: chunkRows,
            outputs: { chunkCount: chunkRows.length },
          };
        },
      );

      if (!chunks.length) {
        await failDocument(supabase, documentId, "Unable to split PDF content into chunks.");
        return {
          result: {
            ok: false,
            code: "CHUNKING_ERROR",
            message: "Unable to split PDF content into chunks.",
          } satisfies UploadResult,
          outputs: { success: false, code: "CHUNKING_ERROR" },
        };
      }

      try {
        const vectorRows = await withLangSmithChildTrace(
          rootRun,
          {
            name: "generate-chunk-embeddings",
            runType: "llm",
            inputs: {
              documentId,
              fileName: file.name,
              chunkCount: chunks.length,
              embeddingModel: userConfig.embeddingModel,
            },
            tags: ["documents", "ingestion", "embeddings"],
          },
          {
            apiKey: userConfig.langsmithApiKey,
            project: userConfig.langsmithProject,
          },
          async () => {
            await updateDocumentStage(supabase, documentId, "embedding", "Generating and storing embeddings.");
            const rows = [];

            for (const chunk of chunks) {
              const embedding = await embedText(
                chunk.content,
                userConfig.geminiApiKey,
                userConfig.embeddingModel,
              );
              rows.push({
                id: `${documentId}:${chunk.chunkIndex}`,
                values: embedding,
                metadata: {
                  user_id: session.userId,
                  document_id: documentId,
                  chunk_id: `${documentId}:${chunk.chunkIndex}`,
                  file_name: file.name,
                  chunk_index: chunk.chunkIndex,
                  is_active: true,
                },
              });
            }

            return {
              result: rows,
              outputs: {
                vectorCount: rows.length,
                embeddingModel: resolveEmbeddingModel(userConfig.embeddingModel),
              },
            };
          },
        );

        await withLangSmithChildTrace(
          rootRun,
          {
            name: "upsert-pinecone-vectors",
            runType: "tool",
            inputs: {
              documentId,
              namespace: session.userId,
              vectorCount: vectorRows.length,
            },
            tags: ["documents", "ingestion", "pinecone"],
          },
          {
            apiKey: userConfig.langsmithApiKey,
            project: userConfig.langsmithProject,
          },
        async () => {
            await upsertDocumentVectors(session.userId, vectorRows, {
              apiKey: userConfig.pineconeApiKey,
              indexName: userConfig.pineconeIndexName,
            });
            return {
              result: undefined,
              outputs: {
                namespace: session.userId,
                vectorCount: vectorRows.length,
              },
            };
          },
        );

        const { error: chunkInsertError } = await supabase.from("document_chunks").insert(
          chunks.map((chunk) => ({
            document_id: documentId,
            user_id: session.userId,
            chunk_index: chunk.chunkIndex,
            content: chunk.content,
            token_count: chunk.tokenCount,
            pinecone_vector_id: `${documentId}:${chunk.chunkIndex}`,
            metadata: {
              file_name: file.name,
              chunk_index: chunk.chunkIndex,
              document_id: documentId,
              user_id: session.userId,
            },
          })),
        );

        if (chunkInsertError) {
          await failDocument(supabase, documentId, chunkInsertError.message || "Unable to store document chunks.");
          return {
            result: {
              ok: false,
              code: "DATABASE_ERROR",
              message: chunkInsertError.message || "Unable to store document chunks.",
            } satisfies UploadResult,
            outputs: { success: false, code: "DATABASE_ERROR" },
          };
        }

        const { error: readyError } = await supabase
          .from("documents")
          .update({
            status: "ready",
            processing_stage: null,
            processing_message: null,
            chunk_count: chunks.length,
            error_message: null,
          })
          .eq("id", documentId);

        if (readyError) {
          return {
            result: {
              ok: false,
              code: "DATABASE_ERROR",
              message: readyError.message || "Unable to finalize document upload.",
            } satisfies UploadResult,
            outputs: { success: false, code: "DATABASE_ERROR" },
          };
        }

        return {
          result: {
            ok: true,
            document: {
              id: documentId,
              fileName: file.name,
              status: "ready",
              chunkCount: chunks.length,
              createdAt: insertedDocument.created_at,
            },
          } satisfies UploadResult,
          outputs: {
            success: true,
            documentId,
            chunkCount: chunks.length,
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to process the PDF.";
        await failDocument(supabase, documentId, message);
        return {
          result: {
            ok: false,
            code: "PROCESSING_ERROR",
            message,
          } satisfies UploadResult,
          outputs: { success: false, code: "PROCESSING_ERROR" },
        };
      }
    },
  );
}

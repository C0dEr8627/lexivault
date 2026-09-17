import { createSupabaseServerClient } from "@/lib/supabase/server";
import { embedText, generateText, resolveEmbeddingModel } from "@/lib/langchain/gemini";
import { withLangSmithChildTrace, withLangSmithTrace } from "@/lib/observability/langsmith";
import { queryDocumentVectors } from "@/lib/pinecone/pinecone-service";
import { getCurrentUserConfigSecrets } from "@/lib/services/config-service";
import { chatMessageSchema, chatSessionTitleSchema } from "@/lib/validation/chat-schema";
import type { ChatMessageRecord, ChatMessageSource, ChatSessionRecord } from "@/types/chat";

type ChatSessionRow = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type ChatMessageRow = {
  id: string;
  session_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources: ChatMessageSource[];
  created_at: string;
};

type DocumentChunkLookupRow = {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  pinecone_vector_id: string;
};

type ActiveDocumentLookupRow = {
  id: string;
  file_name: string;
};

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

const CHAT_FALLBACK_ANSWER = "I could not find this information in your uploaded documents.";

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

    return { supabase, userId: data.user.id };
  } catch {
    return null;
  }
}

function mapSession(row: ChatSessionRow): ChatSessionRecord {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMessage(row: ChatMessageRow): ChatMessageRecord {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    sources: row.sources ?? [],
    createdAt: row.created_at,
  };
}

export async function listCurrentUserChatSessions(): Promise<ServiceResult<{ sessions: ChatSessionRecord[] }>> {
  const session = await getAuthedClient();

  if (!session) {
    return { ok: false, code: "UNAUTHORIZED", message: "You must be signed in to view chat sessions." };
  }

  const { data, error } = await session.supabase
    .from("chat_sessions")
    .select("id, title, created_at, updated_at")
    .eq("user_id", session.userId)
    .order("updated_at", { ascending: false });

  if (error) {
    return { ok: false, code: "DATABASE_ERROR", message: error.message || "Unable to load chat sessions." };
  }

  return { ok: true, data: { sessions: (data ?? []).map((row) => mapSession(row as ChatSessionRow)) } };
}

export async function createCurrentUserChatSession(input: unknown): Promise<ServiceResult<{ session: ChatSessionRecord }>> {
  const parsed = chatSessionTitleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: parsed.error.issues[0]?.message || "Unable to create chat session.",
    };
  }

  const session = await getAuthedClient();

  if (!session) {
    return { ok: false, code: "UNAUTHORIZED", message: "You must be signed in to create chat sessions." };
  }

  const { data, error } = await session.supabase
    .from("chat_sessions")
    .insert({
      user_id: session.userId,
      title: parsed.data.title || "New Chat",
    })
    .select("id, title, created_at, updated_at")
    .single();

  if (error || !data) {
    return { ok: false, code: "DATABASE_ERROR", message: error?.message || "Unable to create chat session." };
  }

  return { ok: true, data: { session: mapSession(data as ChatSessionRow) } };
}

export async function getCurrentUserChatSession(sessionId: string): Promise<ServiceResult<{ session: ChatSessionRecord | null }>> {
  const session = await getAuthedClient();

  if (!session) {
    return { ok: false, code: "UNAUTHORIZED", message: "You must be signed in to view chat sessions." };
  }

  const { data, error } = await session.supabase
    .from("chat_sessions")
    .select("id, title, created_at, updated_at")
    .eq("id", sessionId)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error) {
    return { ok: false, code: "DATABASE_ERROR", message: error.message || "Unable to load chat session." };
  }

  return { ok: true, data: { session: data ? mapSession(data as ChatSessionRow) : null } };
}

export async function listCurrentUserChatMessages(sessionId: string): Promise<ServiceResult<{ session: ChatSessionRecord | null; messages: ChatMessageRecord[] }>> {
  const session = await getAuthedClient();

  if (!session) {
    return { ok: false, code: "UNAUTHORIZED", message: "You must be signed in to view messages." };
  }

  const { data: chatSession, error: sessionError } = await session.supabase
    .from("chat_sessions")
    .select("id, title, created_at, updated_at")
    .eq("id", sessionId)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (sessionError) {
    return { ok: false, code: "DATABASE_ERROR", message: sessionError.message || "Unable to load chat session." };
  }

  if (!chatSession) {
    return { ok: true, data: { session: null, messages: [] } };
  }

  const { data: messages, error: messageError } = await session.supabase
    .from("chat_messages")
    .select("id, session_id, user_id, role, content, sources, created_at")
    .eq("session_id", sessionId)
    .eq("user_id", session.userId)
    .order("created_at", { ascending: true });

  if (messageError) {
    return { ok: false, code: "DATABASE_ERROR", message: messageError.message || "Unable to load messages." };
  }

  return {
    ok: true,
    data: {
      session: mapSession(chatSession as ChatSessionRow),
      messages: (messages ?? []).map((row) => mapMessage(row as ChatMessageRow)),
    },
  };
}

export async function updateCurrentUserChatSessionTitle(
  sessionId: string,
  input: unknown,
): Promise<ServiceResult<{ session: ChatSessionRecord }>> {
  const parsed = chatSessionTitleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: parsed.error.issues[0]?.message || "Unable to update chat session.",
    };
  }

  const session = await getAuthedClient();

  if (!session) {
    return { ok: false, code: "UNAUTHORIZED", message: "You must be signed in to update chat sessions." };
  }

  const { data, error } = await session.supabase
    .from("chat_sessions")
    .update({ title: parsed.data.title || "New Chat" })
    .eq("id", sessionId)
    .eq("user_id", session.userId)
    .select("id, title, created_at, updated_at")
    .single();

  if (error || !data) {
    return { ok: false, code: "DATABASE_ERROR", message: error?.message || "Unable to update chat session." };
  }

  return { ok: true, data: { session: mapSession(data as ChatSessionRow) } };
}

export async function deleteCurrentUserChatSession(sessionId: string): Promise<ServiceResult<{ sessionId: string; deleted: true }>> {
  const session = await getAuthedClient();

  if (!session) {
    return { ok: false, code: "UNAUTHORIZED", message: "You must be signed in to delete chat sessions." };
  }

  const { error: messageDeleteError } = await session.supabase
    .from("chat_messages")
    .delete()
    .eq("session_id", sessionId)
    .eq("user_id", session.userId);

  if (messageDeleteError) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: messageDeleteError.message || "Unable to delete chat session messages.",
    };
  }

  const { error } = await session.supabase.from("chat_sessions").delete().eq("id", sessionId).eq("user_id", session.userId);

  if (error) {
    return { ok: false, code: "DATABASE_ERROR", message: error.message || "Unable to delete chat session." };
  }

  return { ok: true, data: { sessionId, deleted: true } };
}

export async function updateCurrentUserChatSessionAfterFirstMessage(sessionId: string, firstMessage: string) {
  const title = firstMessage.trim().slice(0, 60);
  const session = await getAuthedClient();

  if (!session) {
    return;
  }

  const { data } = await session.supabase
    .from("chat_sessions")
    .select("title")
    .eq("id", sessionId)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (!data || data.title !== "New Chat") {
    return;
  }

  await session.supabase.from("chat_sessions").update({ title: title || "New Chat" }).eq("id", sessionId).eq("user_id", session.userId);
}

function buildPrompt(messages: ChatMessageRecord[], sources: Array<{ documentName: string; chunkIndex: number; content: string }>, question: string) {
  const history = messages
    .map((message) => `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`)
    .join("\n\n");

  const context = sources
    .map(
      (source, index) =>
        `Source ${index + 1}\nDocument: ${source.documentName}\nChunk: ${source.chunkIndex + 1}\nContent:\n${source.content}`,
    )
    .join("\n\n---\n\n");

  return [
    "Use only the document context below to answer the user's question.",
    "If the answer is not supported by the context, reply exactly with:",
    `"${CHAT_FALLBACK_ANSWER}"`,
    "",
    "Recent conversation:",
    history || "No previous conversation.",
    "",
    "Document context:",
    context || "No relevant context found.",
    "",
    `Current user question: ${question}`,
  ].join("\n");
}

export async function sendCurrentUserChatMessage(
  input: unknown,
): Promise<ServiceResult<{ userMessage: ChatMessageRecord; message: ChatMessageRecord; session: ChatSessionRecord }>> {
  const parsed = chatMessageSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: parsed.error.issues[0]?.message || "Unable to send message.",
    };
  }

  const session = await getAuthedClient();

  if (!session) {
    return {
      ok: false,
      code: "UNAUTHORIZED",
      message: "You must be signed in to chat.",
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
      code: "CONFIG_MISSING",
      message: "Please add your Gemini API key in configuration before chatting.",
    };
  }

  const userConfig = configResult.config;
  const { sessionId, message } = parsed.data;
  const chatSessionResult = await getCurrentUserChatSession(sessionId);

  if (!chatSessionResult.ok) {
    return {
      ok: false,
      code: chatSessionResult.code,
      message: chatSessionResult.message,
    };
  }

  if (!chatSessionResult.data.session) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "Chat session not found.",
    };
  }

  return withLangSmithTrace<
    ServiceResult<{ userMessage: ChatMessageRecord; message: ChatMessageRecord; session: ChatSessionRecord }>
  >(
    {
      name: "chat-request",
      runType: "chain",
      inputs: typeof input === "object" && input ? (input as Record<string, unknown>) : { rawInput: String(input) },
      tags: ["chat", "rag"],
    },
    {
      apiKey: userConfig.langsmithApiKey,
      project: userConfig.langsmithProject,
    },
    async (rootRun) => {
      const { data: insertedUserMessage, error: insertUserMessageError } = await session.supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          user_id: session.userId,
          role: "user",
          content: message,
          sources: [],
        })
        .select("id, session_id, user_id, role, content, sources, created_at")
        .single();

      if (insertUserMessageError || !insertedUserMessage) {
        return {
          result: {
            ok: false,
            code: "DATABASE_ERROR",
            message: insertUserMessageError?.message || "Unable to store the chat message.",
          } satisfies ServiceResult<{ userMessage: ChatMessageRecord; message: ChatMessageRecord; session: ChatSessionRecord }>,
          outputs: { success: false, code: "DATABASE_ERROR" },
        };
      }

      const userMessage = mapMessage(insertedUserMessage as ChatMessageRow);

      const { data: recentMessagesData, error: recentMessagesError } = await session.supabase
        .from("chat_messages")
        .select("id, session_id, user_id, role, content, sources, created_at")
        .eq("session_id", sessionId)
        .eq("user_id", session.userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (recentMessagesError) {
        return {
          result: {
            ok: false,
            code: "DATABASE_ERROR",
            message: recentMessagesError.message || "Unable to load recent chat history.",
          } satisfies ServiceResult<{ userMessage: ChatMessageRecord; message: ChatMessageRecord; session: ChatSessionRecord }>,
          outputs: { success: false, code: "DATABASE_ERROR" },
        };
      }

      const recentMessages = (recentMessagesData ?? []).map((row) => mapMessage(row as ChatMessageRow)).reverse();

      let assistantText = CHAT_FALLBACK_ANSWER;
      let assistantSources: ChatMessageSource[] = [];
      let vectorIds: string[] = [];
      let embedding: number[] = [];

      try {
        embedding = await withLangSmithChildTrace(
          rootRun,
          {
            name: "embed-user-query",
            runType: "llm",
            inputs: {
              sessionId,
              message,
              embeddingModel: userConfig.embeddingModel,
            },
            tags: ["chat", "retrieval", "embeddings"],
          },
          {
            apiKey: userConfig.langsmithApiKey,
            project: userConfig.langsmithProject,
          },
          async () => {
            const values = await embedText(message, userConfig.geminiApiKey, userConfig.embeddingModel);
            return {
              result: values,
              outputs: {
                vectorLength: values.length,
                embeddingModel: resolveEmbeddingModel(userConfig.embeddingModel),
              },
            };
          },
        );
      } catch (error) {
        return {
          result: {
            ok: false,
            code: "GEMINI_ERROR",
            message: error instanceof Error ? error.message : "Unable to generate a query embedding.",
          } satisfies ServiceResult<{ userMessage: ChatMessageRecord; message: ChatMessageRecord; session: ChatSessionRecord }>,
          outputs: { success: false, code: "GEMINI_ERROR" },
        };
      }

      try {
        vectorIds = await withLangSmithChildTrace(
          rootRun,
          {
            name: "retrieve-relevant-vectors",
            runType: "tool",
            inputs: {
              namespace: session.userId,
              topK: 5,
              sessionId,
            },
            tags: ["chat", "retrieval", "pinecone"],
          },
          {
            apiKey: userConfig.langsmithApiKey,
            project: userConfig.langsmithProject,
          },
          async () => {
            const vectorMatches = await queryDocumentVectors(session.userId, embedding, 5, {
              apiKey: userConfig.pineconeApiKey,
              indexName: userConfig.pineconeIndexName,
            });
            return {
              result: vectorMatches.map((match) => match.id),
              outputs: {
                namespace: session.userId,
                topK: 5,
                matchCount: vectorMatches.length,
              },
            };
          },
        );
      } catch (error) {
        return {
          result: {
            ok: false,
            code: "PINECONE_ERROR",
            message: error instanceof Error ? error.message : "Unable to search document vectors.",
          } satisfies ServiceResult<{ userMessage: ChatMessageRecord; message: ChatMessageRecord; session: ChatSessionRecord }>,
          outputs: { success: false, code: "PINECONE_ERROR" },
        };
      }

      if (vectorIds.length) {
        const { data: chunkRows, error: chunkLookupError } = await session.supabase
          .from("document_chunks")
          .select("id, document_id, chunk_index, content, pinecone_vector_id")
          .eq("user_id", session.userId)
          .in("pinecone_vector_id", vectorIds);

        if (chunkLookupError) {
          return {
            result: {
              ok: false,
              code: "DATABASE_ERROR",
              message: chunkLookupError.message || "Unable to load retrieved chunks.",
            } satisfies ServiceResult<{ userMessage: ChatMessageRecord; message: ChatMessageRecord; session: ChatSessionRecord }>,
            outputs: { success: false, code: "DATABASE_ERROR" },
          };
        }

        const chunksByVectorId = new Map(
          (chunkRows ?? []).map((row) => {
            const chunk = row as DocumentChunkLookupRow;
            return [chunk.pinecone_vector_id, chunk] as const;
          }),
        );

        const documentIds = Array.from(
          new Set(
            vectorIds
              .map((vectorId) => chunksByVectorId.get(vectorId)?.document_id)
              .filter((value): value is string => Boolean(value)),
          ),
        );

        let activeDocumentsById = new Map<string, ActiveDocumentLookupRow>();

        if (documentIds.length) {
          const { data: activeDocuments, error: activeDocumentsError } = await session.supabase
            .from("documents")
            .select("id, file_name")
            .eq("user_id", session.userId)
            .eq("is_active", true)
            .eq("status", "ready")
            .in("id", documentIds);

          if (activeDocumentsError) {
            return {
              result: {
                ok: false,
                code: "DATABASE_ERROR",
                message: activeDocumentsError.message || "Unable to load active documents.",
              } satisfies ServiceResult<{ userMessage: ChatMessageRecord; message: ChatMessageRecord; session: ChatSessionRecord }>,
              outputs: { success: false, code: "DATABASE_ERROR" },
            };
          }

          activeDocumentsById = new Map(
            (activeDocuments ?? []).map((row) => {
              const document = row as ActiveDocumentLookupRow;
              return [document.id, document] as const;
            }),
          );
        }

        const relevantChunks = vectorIds
          .map((vectorId) => chunksByVectorId.get(vectorId))
          .filter((chunk): chunk is DocumentChunkLookupRow => Boolean(chunk))
          .filter((chunk) => activeDocumentsById.has(chunk.document_id));

        if (relevantChunks.length) {
          assistantSources = relevantChunks.map((chunk) => ({
            documentId: chunk.document_id,
            documentName: activeDocumentsById.get(chunk.document_id)?.file_name || "Document",
            chunkId: chunk.id,
            chunkIndex: chunk.chunk_index,
            snippet: chunk.content.slice(0, 280),
          }));

          const prompt = buildPrompt(
            recentMessages,
            relevantChunks.map((chunk) => ({
              documentName: activeDocumentsById.get(chunk.document_id)?.file_name || "Document",
              chunkIndex: chunk.chunk_index,
              content: chunk.content,
            })),
            message,
          );

          try {
            assistantText = await withLangSmithChildTrace(
              rootRun,
              {
                name: "generate-grounded-response",
                runType: "llm",
                inputs: {
                  sessionId,
                  question: message,
                  sourceCount: relevantChunks.length,
                  model: userConfig.geminiModel,
                },
                tags: ["chat", "generation", "gemini"],
              },
              {
                apiKey: userConfig.langsmithApiKey,
                project: userConfig.langsmithProject,
              },
              async () => {
                const response = await generateText(prompt, {
                  apiKey: userConfig.geminiApiKey,
                  model: userConfig.geminiModel,
                  systemInstruction: userConfig.systemPrompt,
                });
                return {
                  result: response,
                  outputs: {
                    text: response,
                    sourceCount: relevantChunks.length,
                  },
                };
              },
            );
          } catch (error) {
            return {
              result: {
                ok: false,
                code: "GEMINI_ERROR",
                message: error instanceof Error ? error.message : "Unable to generate a chat response.",
              } satisfies ServiceResult<{ userMessage: ChatMessageRecord; message: ChatMessageRecord; session: ChatSessionRecord }>,
              outputs: { success: false, code: "GEMINI_ERROR" },
            };
          }
        }
      }

      const { data: insertedAssistantMessage, error: insertAssistantMessageError } = await session.supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          user_id: session.userId,
          role: "assistant",
          content: assistantText,
          sources: assistantSources,
        })
        .select("id, session_id, user_id, role, content, sources, created_at")
        .single();

      if (insertAssistantMessageError || !insertedAssistantMessage) {
        return {
          result: {
            ok: false,
            code: "DATABASE_ERROR",
            message: insertAssistantMessageError?.message || "Unable to store the assistant response.",
          } satisfies ServiceResult<{ userMessage: ChatMessageRecord; message: ChatMessageRecord; session: ChatSessionRecord }>,
          outputs: { success: false, code: "DATABASE_ERROR" },
        };
      }

      await updateCurrentUserChatSessionAfterFirstMessage(sessionId, message);

      const { data: updatedSessionData, error: updatedSessionError } = await session.supabase
        .from("chat_sessions")
        .select("id, title, created_at, updated_at")
        .eq("id", sessionId)
        .eq("user_id", session.userId)
        .single();

      if (updatedSessionError || !updatedSessionData) {
        return {
          result: {
            ok: false,
            code: "DATABASE_ERROR",
            message: updatedSessionError?.message || "Unable to refresh the chat session.",
          } satisfies ServiceResult<{ userMessage: ChatMessageRecord; message: ChatMessageRecord; session: ChatSessionRecord }>,
          outputs: { success: false, code: "DATABASE_ERROR" },
        };
      }

      return {
        result: {
          ok: true,
          data: {
            userMessage,
            message: mapMessage(insertedAssistantMessage as ChatMessageRow),
            session: mapSession(updatedSessionData as ChatSessionRow),
          },
        } satisfies ServiceResult<{ userMessage: ChatMessageRecord; message: ChatMessageRecord; session: ChatSessionRecord }>,
        outputs: {
          success: true,
          sessionId,
          usedFallback: assistantText === CHAT_FALLBACK_ANSWER,
          sourceCount: assistantSources.length,
        },
      };
    },
  );
}

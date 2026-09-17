export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type DocumentStatus = "processing" | "ready" | "failed" | "deleted";
export type ChatMessageRole = "user" | "assistant" | "system";

export interface UserConfigRow {
  id: string;
  user_id: string;
  gemini_api_key: string;
  langsmith_api_key: string;
  langsmith_project: string;
  pinecone_api_key: string;
  pinecone_index_name: string;
  gemini_model: "gemini-2.5-flash" | "gemini-2.5-pro" | "gemini-2.0-flash";
  embedding_model: "gemini-embedding-001";
  system_prompt: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentRow {
  id: string;
  user_id: string;
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
}

export interface DocumentChunkRow {
  id: string;
  document_id: string;
  user_id: string;
  chunk_index: number;
  content: string;
  token_count: number | null;
  pinecone_vector_id: string;
  metadata: Record<string, Json>;
  created_at: string;
}

export interface ChatSessionRow {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageSource {
  documentId: string;
  documentName: string;
  chunkId: string;
  chunkIndex: number;
  snippet: string;
}

export interface ChatMessageRow {
  id: string;
  session_id: string;
  user_id: string;
  role: ChatMessageRole;
  content: string;
  sources: ChatMessageSource[];
  created_at: string;
}

export interface DatabaseSchema {
  public: {
    Tables: {
      user_configs: {
        Row: UserConfigRow;
        Insert: Omit<UserConfigRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserConfigRow, "id" | "user_id" | "created_at" | "updated_at">> & {
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: DocumentRow;
        Insert: Omit<DocumentRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DocumentRow, "id" | "user_id" | "created_at" | "updated_at">> & {
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_chunks: {
        Row: DocumentChunkRow;
        Insert: Omit<DocumentChunkRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DocumentChunkRow, "id" | "document_id" | "user_id" | "created_at">> & {
          document_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      chat_sessions: {
        Row: ChatSessionRow;
        Insert: Omit<ChatSessionRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ChatSessionRow, "id" | "user_id" | "created_at" | "updated_at">> & {
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: ChatMessageRow;
        Insert: Omit<ChatMessageRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ChatMessageRow, "id" | "session_id" | "user_id" | "created_at">> & {
          session_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
}

# Project Plan: Personal Document RAG Chat App

## 1. Project Goal

Build a full-stack Next.js application where each authenticated user can upload PDF documents, process them into chunks, store embeddings in Pinecone, and chat with Gemini using only their uploaded documents as the knowledge base.

The app should work like a simple ChatGPT-style interface, but responses must be grounded in the user’s uploaded documents.

## 2. Final MVP Scope

### In Scope

* Next.js full-stack application
* Supabase Authentication
* Supabase Database
* Supabase Storage for uploaded PDFs
* User-specific document isolation
* PDF text extraction
* Text chunking using LangChainJS
* Embedding generation using Gemini embedding model
* Vector storage in Pinecone
* One Pinecone index with namespace per user
* User-provided Gemini API key
* Backend-owned Pinecone and LangSmith API keys
* Document upload page
* Uploaded document list
* PDF view/download link
* Soft delete documents
* Chunk viewer page
* Config page for Gemini API key, model, and system prompt
* ChatGPT-style chat page
* Chat sessions and messages stored in Supabase
* RAG-based answering using only active uploaded documents
* Source citations in chat response
* LangSmith tracing

### Out of Scope for MVP

* OCR for scanned/image-only PDFs
* MCP integration
* Multiple LLM providers
* Shared documents between users
* Admin dashboard
* Fine-tuning
* Production-grade billing
* Complex agentic workflows

## 3. Tech Stack

### Frontend and Backend

* Next.js with App Router
* TypeScript
* Tailwind CSS
* Server Actions or API Routes for backend logic

### Auth and Database

* Supabase Auth
* Supabase Postgres
* Supabase Storage

### AI/RAG

* LangChainJS
* Gemini LLM
* Gemini embedding model
* Pinecone vector database
* LangSmith for tracing

## 4. Security Rules

Never expose these keys to the frontend:

* Pinecone API key
* LangSmith API key
* Supabase service role key

The user’s Gemini API key is entered from the frontend but should be stored securely in Supabase and used only on the server side.

Use Supabase Row Level Security so users can only access their own documents, chunks, chat sessions, messages, and config.

## 5. Recommended Folder Structure

```txt
app/
  page.tsx
  login/
  signup/
  documents/
  documents/[documentId]/chunks/
  config/
  chat/
  api/
    upload/
    documents/
    documents/[documentId]/
    chat/
    config/

components/
  auth/
  documents/
  chat/
  config/
  ui/

lib/
  supabase/
    client.ts
    server.ts
    admin.ts
  langchain/
    pdf-loader.ts
    chunker.ts
    embeddings.ts
    rag-chain.ts
  pinecone/
    client.ts
    vector-store.ts
  utils/
    auth.ts
    encryption.ts
    constants.ts

types/
  database.ts
  rag.ts
```

## 6. Database Schema

Create the following Supabase tables.

### user_configs

Stores each user’s Gemini settings.

```sql
create table user_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  gemini_api_key text not null,
  gemini_model text default 'gemini-1.5-flash',
  embedding_model text default 'text-embedding-004',
  system_prompt text default 'You are a helpful assistant. Answer only from the provided context. If the answer is not in the documents, say you do not know.',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);
```

### documents

Stores uploaded PDF metadata.

```sql
create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  status text default 'processing',
  is_active boolean default true,
  chunk_count int default 0,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Status values:

* processing
* ready
* failed
* deleted

### document_chunks

Stores text chunks and metadata.

```sql
create table document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  chunk_index int not null,
  content text not null,
  token_count int,
  pinecone_vector_id text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
```

### chat_sessions

Stores user chat sessions.

```sql
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text default 'New Chat',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### chat_messages

Stores chat messages.

```sql
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null,
  content text not null,
  sources jsonb default '[]',
  created_at timestamptz default now()
);
```

Role values:

* user
* assistant
* system

## 7. Pinecone Design

Use one Pinecone index.

Use one namespace per user:

```txt
namespace = user_id
```

Each vector should include metadata:

```json
{
  "user_id": "uuid",
  "document_id": "uuid",
  "chunk_id": "uuid",
  "file_name": "example.pdf",
  "chunk_index": 1,
  "is_active": true
}
```

For retrieval, always filter:

```json
{
  "user_id": "current-user-id",
  "is_active": true
}
```

On soft delete, update Supabase document status and mark related Pinecone vectors inactive if supported. If metadata update is inconvenient, filter using active document IDs from Supabase before generating answer.

## 8. Main Pages

### Landing Page

Path:

```txt
/
```

Features:

* Product overview
* CTA to signup
* CTA to login
* Privacy/trust messaging
* Redirect authenticated users to `/documents`

### Signup Page

Path:

```txt
/signup
```

Features:

* Email/password signup
* Redirect to `/documents` after success

### Login Page

Path:

```txt
/login
```

Features:

* Email/password login
* Redirect to `/documents` after success

### Documents Page

Path:

```txt
/documents
```

Features:

* Upload PDF
* Show uploaded documents
* Show status: processing, ready, failed, deleted
* Show file name, upload date, chunk count
* View PDF link
* View chunks button
* Soft delete button

### Chunks Page

Path:

```txt
/documents/[documentId]/chunks
```

Features:

* Show document metadata
* List all chunks
* Show chunk index and content preview
* Expand full chunk text

### Config Page

Path:

```txt
/config
```

Features:

* Gemini API key input
* Gemini model selection
* Embedding model selection
* System prompt textarea
* Save config to Supabase

For MVP, support only Gemini.

### Chat Page

Path:

```txt
/chat
```

Features:

* ChatGPT-style UI
* New chat button
* Chat session list
* Message history
* User input box
* Assistant response
* Source citations below answer
* Sources should show file name, chunk index, and relevant snippet

## 9. API Routes

### POST /api/upload

Responsibilities:

1. Verify authenticated user.
2. Accept PDF file.
3. Upload PDF to Supabase Storage.
4. Create document row with status `processing`.
5. Extract text from PDF.
6. If extracted text is too small, mark document as failed with message: `OCR is not supported in MVP`.
7. Chunk text using LangChainJS.
8. Generate embeddings using user’s Gemini API key.
9. Store vectors in Pinecone under namespace `user_id`.
10. Store chunks in Supabase.
11. Mark document as `ready`.

### GET /api/documents

Return current user’s active documents.

### DELETE /api/documents/[documentId]

Soft delete document.

Actions:

* Set `is_active = false`
* Set `status = deleted`
* Prevent future retrieval from this document

### GET /api/documents/[documentId]/chunks

Return chunks for one document owned by current user.

### GET /api/config

Return current user config.

### POST /api/config

Create or update current user config.

### POST /api/chat

Responsibilities:

1. Verify authenticated user.
2. Accept `session_id` and user message.
3. Load user config.
4. Store user message in Supabase.
5. Load recent chat messages for short-term memory.
6. Embed the latest user query.
7. Retrieve top relevant chunks from Pinecone namespace `user_id`.
8. Filter only active documents.
9. Build prompt using:

   * system prompt
   * recent conversation history
   * retrieved document chunks
   * user question
10. Call Gemini.
11. Store assistant response in Supabase with sources.
12. Return answer and sources.

## 10. RAG Prompt Rule

Use this rule in the final prompt:

```txt
You must answer only using the provided document context.
If the answer is not present in the context, say:
"I could not find this information in your uploaded documents."

Do not use outside knowledge.
Do not make assumptions.
Cite the document sources used.
```

## 11. Chat Memory Rule

Use chat history only for conversation continuity.

Do not allow chat history to override document context.

If the user asks a follow-up question, rewrite or interpret it using recent chat messages, but still retrieve fresh context from Pinecone before answering.

## 12. PDF Handling Rule

For MVP:

* Support text-based PDFs only.
* Do not implement OCR.
* If PDF extraction returns too little text, mark the file as failed.

Suggested condition:

```ts
if (extractedText.trim().length < 100) {
  throw new Error("OCR is not supported in MVP. This PDF may be scanned or image-based.");
}
```

## 13. LangSmith

Enable LangSmith tracing using backend environment variables.

```env
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=personal-document-rag-mvp
```

Do not expose LangSmith config to frontend.

## 14. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

PINECONE_API_KEY=
PINECONE_INDEX_NAME=

LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=personal-document-rag-mvp
```

Gemini API key is not in `.env` because it is user-provided and stored in Supabase.

## 15. Build Order

Follow this order strictly:

1. Create Next.js app with TypeScript and Tailwind.
2. Configure Supabase client/server helpers.
3. Implement signup and login.
4. Create Supabase tables and RLS policies.
5. Create config page.
6. Create document upload page.
7. Implement Supabase Storage upload.
8. Implement PDF text extraction.
9. Implement chunking.
10. Implement Gemini embeddings.
11. Implement Pinecone upsert.
12. Store chunks in Supabase.
13. Build document list.
14. Build chunk viewer.
15. Implement soft delete.
16. Build chat sessions.
17. Build chat messages.
18. Implement RAG retrieval.
19. Implement Gemini response generation.
20. Show source citations.
21. Add LangSmith tracing.
22. Polish UI and error states.

## 16. Acceptance Criteria

The MVP is successful if:

* User can sign up.
* User can log in.
* User can save Gemini API key.
* User can upload a text-based PDF.
* App extracts and chunks PDF text.
* App stores document metadata in Supabase.
* App stores embeddings in Pinecone.
* User can see uploaded documents.
* User can view chunks.
* User can soft delete a document.
* User can create a chat session.
* User can ask questions.
* Assistant answers only from uploaded documents.
* Assistant shows sources.
* Chat history is stored.
* One user cannot access another user’s documents or chats.

## 17. Codex Instructions

Build this project as a production-style MVP, not a throwaway demo.

Use clean TypeScript, reusable components, server-side key handling, and proper error states.

Do not implement OCR.

Do not implement MCP.

Do not add extra providers beyond Gemini.

Do not expose backend API keys to the browser.

Focus first on making the full RAG flow work end-to-end.

After the core flow works, improve UI.

## 18. Important Implementation Notes

Use server-side logic for:

* PDF parsing
* Gemini calls
* Pinecone calls
* LangSmith tracing
* Supabase service role operations

Use frontend only for:

* Forms
* File selection
* Chat UI
* Displaying documents
* Displaying chunks
* Displaying sources

Use Supabase RLS wherever possible.

Use service role only when necessary on the server.

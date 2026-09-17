# CODING_RULES.md

# LexiVault Coding Rules

## Purpose

This document defines implementation rules for Codex.

Codex must follow these rules strictly while building LexiVault.

---

# Core Principle

Build a stable production-style MVP.

Do not create a quick hack.

Prefer simple, readable, maintainable code over clever abstractions.

---

# Technology Rules

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Shadcn UI
- Supabase
- LangChainJS
- Pinecone
- Gemini
- LangSmith
- Zod

Do not use:

- JavaScript files
- Redux
- Next.js Pages Router
- Client-side Gemini calls
- Client-side Pinecone calls
- OCR libraries
- MCP libraries
- Multiple LLM providers

---

# TypeScript Rules

## Required

- Use TypeScript everywhere.
- Define explicit types for API responses.
- Use `unknown` instead of `any` when type is uncertain.
- Avoid `any` unless absolutely necessary.
- Export shared types from `types/`.

## Avoid

- Large untyped objects
- Deeply nested anonymous types
- Duplicated type definitions

---

# File Naming Rules

Use kebab-case for files.

Examples:

```txt
document-upload-card.tsx
documents-table.tsx
chat-message-bubble.tsx
rag-chain.ts
pinecone-client.ts
```

Use PascalCase for React components.

Example:

```ts
export function DocumentUploadCard() {}
```

---

# Next.js Rules

## App Router

Use the `app/` directory only.

Do not use `pages/`.

---

## Server and Client Components

Default to Server Components.

Use `"use client"` only when needed for:

- Form state
- Upload interaction
- Chat input
- Client-side navigation interaction
- Local UI state

---

## API Routes

Use Route Handlers:

```txt
app/api/.../route.ts
```

API routes should be thin.

They should:

1. Authenticate user.
2. Validate input.
3. Call service functions from `lib/`.
4. Return standardized JSON.

Do not put large business logic directly inside route handlers.

---

# Folder Structure

Use this structure:

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
    health/
    config/
    documents/
    documents/upload/
    documents/[documentId]/
    documents/[documentId]/chunks/
    documents/[documentId]/signed-url/
    chat/
    chat/sessions/
    chat/sessions/[sessionId]/
    chat/sessions/[sessionId]/messages/

components/
  marketing/
  auth/
  layout/
  documents/
  chunks/
  config/
  chat/
  ui/

lib/
  supabase/
    client.ts
    server.ts
    admin.ts
  services/
    config-service.ts
    document-service.ts
    ingestion-service.ts
    chat-service.ts
    retrieval-service.ts
  langchain/
    pdf-loader.ts
    text-splitter.ts
    gemini.ts
    rag-prompt.ts
  pinecone/
    pinecone-client.ts
    pinecone-service.ts
  validation/
    config-schema.ts
    chat-schema.ts
    document-schema.ts
  utils/
    api-response.ts
    auth.ts
    constants.ts
    errors.ts

types/
  api.ts
  database.ts
  documents.ts
  chat.ts
  config.ts
```

---

# API Response Rules

All APIs must return consistent JSON.

## Success

```ts
{
  success: true,
  data: ...
}
```

## Error

```ts
{
  success: false,
  error: {
    code: string,
    message: string
  }
}
```

Create helper functions:

```ts
successResponse(data, status?)
errorResponse(code, message, status?)
```

Place in:

```txt
lib/utils/api-response.ts
```

---

# Validation Rules

Use Zod for:

- Config API body
- Chat API body
- Session title body
- Document route params where useful

Never trust client-provided input.

Never trust `userId` from body.

Always derive user ID from Supabase auth.

---

# Supabase Rules

## Client Usage

Use separate clients:

```txt
browser client
server client
admin client
```

### Browser Client

Use only for auth-aware frontend operations.

### Server Client

Use in server components and route handlers for user-scoped reads.

### Admin Client

Use only server-side for privileged operations such as Storage management if required.

Never expose service role key.

---

# Row Level Security Rules

Enable RLS on:

- user_configs
- documents
- document_chunks
- chat_sessions
- chat_messages

Users can only access rows where:

```sql
user_id = auth.uid()
```

---

# Database Rules

## Naming

Database columns use snake_case.

Frontend types use camelCase.

Create mapping where needed.

---

## Timestamps

Use:

```txt
created_at
updated_at
```

Always update `updated_at` when modifying records.

---

# Security Rules

Never expose:

- Supabase service role key
- Pinecone API key
- LangSmith API key
- Raw saved Gemini API key

Never call these from frontend:

- Pinecone
- Gemini
- LangSmith

All AI and vector operations must happen on the server.

---

# Gemini API Key Rules

The user provides Gemini API key.

Store it in `user_configs`.

For MVP, plain database storage is acceptable if encryption is not implemented immediately, but isolate access with RLS and never return the key to frontend.

If simple encryption is feasible, implement server-side encryption using an environment secret.

Do not block MVP on encryption complexity.

---

# Pinecone Rules

Use:

```txt
One index
Namespace per user
```

Namespace:

```ts
const namespace = user.id;
```

Vector IDs:

```txt
documentId:chunkIndex
```

or

```txt
chunkId
```

Preferred:

```txt
chunkId
```

because it maps directly to Supabase chunk records.

---

# Vector Metadata Rules

Each Pinecone vector must include:

```json
{
  "user_id": "uuid",
  "document_id": "uuid",
  "chunk_id": "uuid",
  "file_name": "document.pdf",
  "chunk_index": 0,
  "is_active": true
}
```

---

# Soft Delete Rules

Documents are soft deleted.

Set:

```txt
is_active = false
status = deleted
```

Do not hard delete vectors from Pinecone for MVP.

During retrieval:

1. Retrieve top 5 from Pinecone.
2. Check the related documents in Supabase.
3. Use only chunks from active documents.

---

# PDF Processing Rules

Support text-based PDFs only.

Do not implement OCR.

If extracted text is below 100 characters:

Throw:

```txt
OCR is not supported in MVP. This PDF may be scanned or image-based.
```

Mark document as failed.

---

# Chunking Rules

Use LangChainJS RecursiveCharacterTextSplitter.

```txt
chunkSize = 1000
chunkOverlap = 200
```

Store chunks in Supabase.

Store embeddings in Pinecone.

---

# Retrieval Rules

Use similarity search only.

```txt
topK = 5
```

No hybrid search.

No reranking.

No MMR.

---

# Chat Memory Rules

Use last 10 messages from the active session.

Do not send entire chat history.

Chat history is for continuity only.

Document chunks are the source of truth.

---

# Prompt Rules

The prompt must include:

1. System prompt from user config.
2. RAG grounding rule.
3. Last 10 chat messages.
4. Retrieved document context.
5. Current user question.

The assistant must answer only from retrieved context.

If answer is missing:

```txt
I could not find this information in your uploaded documents.
```

---

# LangSmith Rules

Enable LangSmith via environment variables.

Trace:

- PDF ingestion
- Chunking
- Embedding generation
- Retrieval
- Gemini response generation

Do not show LangSmith details in frontend.

---

# UI Rules

Use reusable components.

Every page must handle:

- Loading
- Empty
- Error
- Success where relevant

Every destructive action needs confirmation.

Do not overbuild animations.

Do not overbuild dashboard analytics.

---

# Testing Rules

At minimum, manually test:

## Landing

- Landing page loads
- Get started goes to signup
- Sign in goes to login
- Authenticated user visiting `/` redirects to `/documents`

## Auth

- Signup works
- Login works
- Logout works
- Protected pages redirect if not logged in

## Config

- Save Gemini key
- Config loads without exposing raw key

## Documents

- Upload valid text PDF
- Upload invalid/scanned PDF fails gracefully
- List documents
- View chunks
- Soft delete document

## Chat

- Create session
- Send message
- Receive RAG answer
- Sources appear
- Follow-up question uses recent context
- Deleted documents are not used

---

# Error Handling Rules

Never show raw stack traces to user.

Log server errors.

Return user-friendly messages.

Example:

```txt
The assistant could not generate a response. Please check your Gemini API key and try again.
```

---

# Performance Rules

For MVP:

- Max PDF size: 20MB
- Top K: 5
- Last messages: 10
- Chunk size: 1000
- Chunk overlap: 200

Do not optimize prematurely.

---

# Dependencies Rule

Before adding any dependency, ask:

1. Is it necessary for MVP?
2. Is it maintained?
3. Can Next.js support it server-side?
4. Does it increase deployment complexity?

Avoid unnecessary packages.

---

# Out of Scope Rules

Do not implement:

- OCR
- MCP
- Agentic workflows
- Multi-provider LLM
- Model marketplace
- Billing
- Admin dashboard
- Shared workspaces
- Public document sharing
- Advanced analytics
- Knowledge graph
- Reranking
- Hybrid search

---

# Final Codex Instruction

Implement the smallest complete version that satisfies the end-to-end flow:

```txt
Signup
Login
Save Gemini config
Upload PDF
Extract text
Chunk
Embed
Store vectors
View document
View chunks
Chat with documents
Show sources
Store chat history
Soft delete document
```

Do not deviate from this scope.

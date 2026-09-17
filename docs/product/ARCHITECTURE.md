# ARCHITECTURE.md

# LexiVault Architecture

## 1. Product Summary

LexiVault is a multi-tenant personal document intelligence platform.

Users can:

- Visit a public landing page
- Sign up and log in
- Save their own Gemini API key
- Upload text-based PDF documents
- Convert documents into searchable chunks
- Store embeddings in Pinecone
- Chat with their uploaded documents
- See source citations
- Persist chat sessions and messages
- Soft delete documents

The MVP must focus on a stable end-to-end RAG workflow.

---

## 2. Architecture Style

LexiVault uses a full-stack Next.js architecture.

```txt
Browser
  ↓
Next.js App Router UI
  ↓
Next.js API Routes / Server Actions
  ↓
Supabase + LangChainJS + Gemini + Pinecone + LangSmith
```

---

## 3. Core Systems

### Frontend

Responsible for:

- Landing page UI
- Authentication screens
- Document upload UI
- Document list UI
- Chunk viewer UI
- Configuration UI
- ChatGPT-style chat UI
- Displaying sources and error states

Frontend must not call:

- Gemini directly
- Pinecone directly
- LangSmith directly
- Supabase service role directly

---

### Backend

Implemented inside Next.js API routes and server-side services.

Responsible for:

- Auth verification
- Config management
- PDF processing
- Text chunking
- Embedding generation
- Pinecone upsert/query
- RAG prompt construction
- Gemini response generation
- Chat memory persistence
- LangSmith tracing

---

### Supabase

Used for:

- Authentication
- Postgres database
- PDF file storage
- User configuration
- Document metadata
- Chunk metadata
- Chat sessions
- Chat messages

---

### Pinecone

Used for:

- Vector storage
- Similarity search
- Per-user vector isolation using namespaces

---

### Gemini

Used for:

- Chat completion
- Embeddings

User provides only the Gemini API key.

---

### LangChainJS

Used for:

- PDF loading
- Text splitting
- Embedding integration
- RAG chain orchestration

---

### LangSmith

Used for:

- Tracing ingestion
- Tracing retrieval
- Tracing chat generation
- Debugging RAG quality

---

## 4. Multi-Tenant Design

Each user has private data.

Isolation happens at four levels:

### Supabase Auth

Every request is mapped to authenticated `user.id`.

### Supabase RLS

Every user-owned table must enforce:

```sql
user_id = auth.uid()
```

### Supabase Storage

Uploaded PDFs are stored under user-specific paths:

```txt
{user_id}/{document_id}/{file_name}
```

### Pinecone Namespace

Each user gets a Pinecone namespace:

```txt
namespace = user_id
```

No query should ever search across multiple namespaces.

---

## 5. High-Level Data Flow

## 5.1 Public Entry Flow

```txt
Visitor
  â†“
Landing Page (/)
  â†“
Signup/Login UI
  â†“
Supabase Auth
  â†“
Authenticated App Layout
```

Authenticated users visiting `/` should be redirected to:

```txt
/documents
```

---

## 5.2 Authentication Flow

```txt
User
  ↓
Signup/Login UI
  ↓
Supabase Auth
  ↓
Authenticated App Layout
```

After login, redirect to:

```txt
/documents
```

---

## 5.3 Configuration Flow

```txt
User enters Gemini API key
  ↓
Next.js server route validates input
  ↓
Store config in Supabase user_configs
  ↓
Return hasGeminiApiKey = true
```

Important:

- Never return the raw Gemini API key to the frontend.
- The key is used only server-side.

---

## 5.4 Document Ingestion Flow

```txt
User uploads PDF
  ↓
Next.js upload API
  ↓
Validate auth and config
  ↓
Upload PDF to Supabase Storage
  ↓
Create document record as processing
  ↓
Extract PDF text
  ↓
Reject if extracted text is too small
  ↓
Chunk text
  ↓
Generate Gemini embeddings
  ↓
Upsert vectors to Pinecone namespace=user_id
  ↓
Store chunks in Supabase
  ↓
Mark document ready
```

---

## 5.5 RAG Chat Flow

```txt
User sends message
  ↓
Verify chat session ownership
  ↓
Store user message
  ↓
Load last 10 messages
  ↓
Embed latest user query
  ↓
Query Pinecone namespace=user_id
  ↓
Retrieve top 5 chunks
  ↓
Filter deleted/inactive documents
  ↓
Build RAG prompt
  ↓
Call Gemini
  ↓
Store assistant response and sources
  ↓
Return answer to frontend
```

---

## 6. Database Architecture

Core tables:

```txt
user_configs
documents
document_chunks
chat_sessions
chat_messages
```

---

## 6.1 user_configs

Stores user-level AI configuration.

Fields:

```txt
id
user_id
gemini_api_key
gemini_model
embedding_model
system_prompt
created_at
updated_at
```

One row per user.

---

## 6.2 documents

Stores uploaded document metadata.

Fields:

```txt
id
user_id
file_name
file_path
file_size
mime_type
status
is_active
chunk_count
error_message
created_at
updated_at
```

Status values:

```txt
processing
ready
failed
deleted
```

---

## 6.3 document_chunks

Stores chunk text and Pinecone linkage.

Fields:

```txt
id
document_id
user_id
chunk_index
content
token_count
pinecone_vector_id
metadata
created_at
```

---

## 6.4 chat_sessions

Stores chat conversations.

Fields:

```txt
id
user_id
title
created_at
updated_at
```

---

## 6.5 chat_messages

Stores messages inside each chat session.

Fields:

```txt
id
session_id
user_id
role
content
sources
created_at
```

Roles:

```txt
user
assistant
system
```

---

## 7. Pinecone Architecture

Use a single Pinecone index.

Use one namespace per user:

```txt
namespace = user_id
```

Each vector ID should map to the Supabase chunk ID.

Recommended vector ID:

```txt
chunk_id
```

Vector metadata:

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

## 8. RAG Architecture

## 8.1 Chunking

Use:

```txt
RecursiveCharacterTextSplitter
```

Settings:

```txt
chunkSize = 1000
chunkOverlap = 200
```

---

## 8.2 Retrieval

Use:

```txt
Similarity Search
Top K = 5
```

No reranking, MMR, or hybrid search in MVP.

---

## 8.3 Memory

Use:

```txt
Last 10 chat messages
```

Chat memory helps with continuity only.

Document chunks remain the source of truth.

---

## 8.4 Prompt Construction

Prompt must include:

1. User-configured system prompt
2. Hard grounding instruction
3. Last 10 messages
4. Retrieved document chunks
5. Current question

Grounding rule:

```txt
Answer only from the provided document context.
If the answer is missing, say:
"I could not find this information in your uploaded documents."
```

---

## 9. Soft Delete Architecture

When a user deletes a document:

```txt
documents.is_active = false
documents.status = deleted
```

Do not hard delete vectors from Pinecone in MVP.

During retrieval:

1. Retrieve candidate chunks from Pinecone.
2. Confirm related documents are still active in Supabase.
3. Use only active document chunks.

---

## 10. Error Handling Architecture

Use consistent API errors:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

Never expose raw stack traces to frontend.

---

## 11. Deployment Architecture

Recommended MVP deployment:

```txt
Vercel          Next.js App
Supabase        Auth + DB + Storage
Pinecone        Vector DB
LangSmith       Observability
Gemini          LLM + Embeddings
```

---

## 12. Future Architecture Extensions

Out of scope for MVP, but architecture should not block them:

- OCR
- MCP tools
- Agentic RAG
- Multi-provider model support
- Reranking
- Hybrid search
- Shared workspaces
- Admin dashboard
- Billing

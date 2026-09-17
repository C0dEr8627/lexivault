# Codex Execution Decision Plan

## Objective

Build a production-style MVP for a Personal Document RAG Chat application using Next.js, Supabase, Pinecone, LangChainJS, and Gemini.

The application should allow users to upload PDFs, create a private knowledge base, and chat with their documents through a ChatGPT-style interface.

---

# Final Technology Decisions

## Frontend

* Next.js 15+
* App Router
* TypeScript
* Tailwind CSS
* Shadcn UI

## Backend

* Next.js API Routes / Server Actions
* TypeScript

## Authentication

* Supabase Auth

## Database

* Supabase Postgres

## File Storage

* Supabase Storage

## Vector Database

* Pinecone

## LLM

* Gemini 2.5 Flash

## Embedding Model

* text-embedding-004

## RAG Framework

* LangChainJS

## Observability

* LangSmith

## Future Scope

* MCP Integration (Phase 2)
* OCR Support (Phase 2)

---

# Fixed Product Decisions

## User Isolation

Each user is completely isolated.

Users cannot:

* View other user documents
* Access other user chats
* Access other user vectors

---

## API Key Strategy

### User Managed

Users provide:

```txt
Gemini API Key
```

Stored securely in Supabase.

### Backend Managed

System owns:

```txt
Pinecone API Key
LangSmith API Key
Supabase Service Role Key
```

Never expose these keys to the frontend.

---

# PDF Support

## Supported

Text-based PDFs

## Not Supported

* Scanned PDFs
* Image-only PDFs
* OCR

If extracted text is below threshold:

```txt
OCR is not supported in MVP.
```

Mark document as failed.

---

# Chunking Strategy

Use:

```txt
RecursiveCharacterTextSplitter
```

Configuration:

```txt
Chunk Size: 1000
Chunk Overlap: 200
```

Reason:

* Good retrieval quality
* Low implementation complexity
* Proven default for document RAG

---

# Embedding Strategy

Use:

```txt
text-embedding-004
```

for all embeddings.

Do not support multiple embedding models in MVP.

---

# Pinecone Strategy

## Index

Single Pinecone Index

## Multi-Tenancy

Namespace per user.

Example:

```txt
namespace = user_id
```

Reason:

* Simple
* Secure
* Scalable

---

# Retrieval Strategy

Use:

```txt
Similarity Search
```

Parameters:

```txt
Top K = 5
```

Do not implement:

* Hybrid Search
* MMR
* Reranking

These are future optimizations.

---

# Chat Memory Strategy

## Selected Strategy

Use recent chat history only.

Include:

```txt
Last 10 Messages
```

inside prompt context.

---

## Do Not Use

Entire chat history.

Reason:

* Expensive
* Larger prompts
* Poor scalability

---

# Long-Term Memory Strategy

Store in Supabase:

* Chat Sessions
* Chat Messages
* User Configurations

Purpose:

* Conversation persistence
* Session restoration
* User history

Not used as knowledge source.

---

# RAG Grounding Rules

The model must answer only from:

1. Retrieved document chunks
2. Current conversation context

If information is missing:

```txt
I could not find this information in your uploaded documents.
```

Never hallucinate.

Never use external knowledge.

---

# System Prompt Strategy

Each user can configure:

```txt
System Prompt
```

Stored in:

```txt
user_configs
```

Default Prompt:

```txt
You are a document assistant.

Answer only using the provided document context.

If the answer cannot be found in the documents, say:

"I could not find this information in your uploaded documents."

Do not invent information.
```

---

# Chat UX

Use ChatGPT-style interface.

Features:

* New Chat
* Session List
* Message History
* Streaming Responses
* Source Citations

---

# Source Citation Format

Each response should show:

```txt
Document Name
Chunk Number
Snippet Preview
```

Example:

```txt
Source:
Employee_Handbook.pdf
Chunk 12
```

---

# Soft Delete Strategy

Documents are never permanently removed.

When deleted:

```txt
is_active = false
status = deleted
```

Document becomes unavailable for retrieval.

Vectors remain in Pinecone.

---

# LangSmith Strategy

Enable tracing for:

* Upload Pipeline
* Embedding Generation
* Retrieval
* Chat Chains

Project Name:

```txt
personal-document-rag-mvp
```

---

# Build Sequence

## Phase 1

Public Landing Page

* Landing page at `/`
* Product hero
* Privacy/trust messaging
* CTA to signup and login
* Redirect authenticated users from `/` to `/documents`

---

## Phase 2

Authentication

* Signup
* Login
* Logout
* Protected Routes

---

## Phase 3

Database

Create:

* user_configs
* documents
* document_chunks
* chat_sessions
* chat_messages

Enable RLS.

---

## Phase 4

Configuration

Build:

```txt
/config
```

Features:

* Gemini API Key
* Gemini Model
* System Prompt

---

## Phase 5

Document Upload

Build:

```txt
/documents
```

Features:

* Upload PDF
* List Documents
* View Document
* Delete Document

---

## Phase 6

Document Processing

Pipeline:

```txt
PDF
↓
Extract Text
↓
Chunk
↓
Embed
↓
Pinecone
↓
Store Metadata
```

---

## Phase 7

Chunk Viewer

Build:

```txt
/documents/[documentId]/chunks
```

Display:

* Chunk Number
* Chunk Content
* Metadata

---

## Phase 8

Chat

Build:

```txt
/chat
```

Features:

* Chat Sessions
* Messages
* Streaming Responses
* Sources

---

## Phase 9

RAG

Flow:

```txt
User Query
↓
Load Last 10 Messages
↓
Embed Query
↓
Pinecone Retrieval
↓
Top 5 Chunks
↓
Build Prompt
↓
Gemini Response
↓
Store Chat
↓
Return Sources
```

---

## Phase 10

LangSmith

Enable:

* Tracing
* Debugging
* Monitoring

---

# Success Criteria

The MVP is complete when:

* User can sign up
* User can log in
* User can save Gemini API key
* User can upload PDF
* PDF is processed successfully
* Chunks are generated
* Embeddings are stored in Pinecone
* Documents are visible
* Chunks are viewable
* Documents can be soft deleted
* User can create chats
* User can continue chats
* Last 10 messages are remembered
* Answers come from uploaded documents only
* Sources are shown
* User data is isolated
* LangSmith tracing works

---

# Explicitly Out of Scope

Do not build:

* OCR
* MCP
* Multi-provider LLM support
* Agentic workflows
* Hybrid Search
* Reranking
* Fine-tuning
* Billing
* Admin dashboard
* Shared document access

Focus only on delivering a stable, end-to-end RAG experience.

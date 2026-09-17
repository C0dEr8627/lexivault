# API_CONTRACT.md

# LexiVault API Contract

## Purpose

This document defines the exact backend API contract for LexiVault.

Codex must follow this contract strictly and must not invent alternate request or response shapes.

The application uses:

- Next.js App Router
- TypeScript
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Pinecone
- LangChainJS
- Gemini
- LangSmith

All sensitive operations must run server-side.

---

# Global API Rules

## Authentication

All API routes except public auth pages and public utility routes require an authenticated Supabase user.

Every protected route must:

1. Read the current authenticated user from Supabase.
2. Reject unauthenticated requests with `401`.
3. Scope all database and vector operations to `user.id`.

---

## Standard Success Response

Use this shape unless a route defines a more specific response:

```json
{
  "success": true,
  "data": {}
}
```

---

## Standard Error Response

All API errors must use this shape:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

---

## Common Error Codes

```txt
UNAUTHORIZED
VALIDATION_ERROR
NOT_FOUND
FORBIDDEN
CONFIG_MISSING
DOCUMENT_PROCESSING_FAILED
PDF_TEXT_EXTRACTION_FAILED
OCR_NOT_SUPPORTED
PINECONE_ERROR
GEMINI_ERROR
SUPABASE_ERROR
INTERNAL_SERVER_ERROR
```

---

## HTTP Status Rules

```txt
200 OK                  Successful GET / update
201 Created             Resource created
400 Bad Request         Invalid input
401 Unauthorized        Missing/invalid auth
403 Forbidden           Authenticated but not allowed
404 Not Found           Resource not found
409 Conflict            Duplicate/conflict state
500 Internal Server     Unexpected server error
```

---

# API Routes

---

# Public Route Note

The landing page lives at `/` and is rendered as a normal Next.js page.

It does not require a dedicated backend API route for MVP.

Authenticated users visiting `/` should be redirected server-side to `/documents`.

---

# 1. Config APIs

## GET /api/config

Returns the authenticated user's Gemini configuration.

### Auth

Required.

### Request

No request body.

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "geminiModel": "gemini-2.5-flash",
    "embeddingModel": "text-embedding-004",
    "systemPrompt": "You are a document assistant...",
    "hasGeminiApiKey": true,
    "createdAt": "2026-06-20T10:00:00.000Z",
    "updatedAt": "2026-06-20T10:00:00.000Z"
  }
}
```

### Important Security Rule

Never return the raw Gemini API key to the frontend.

Return only:

```json
{
  "hasGeminiApiKey": true
}
```

---

## POST /api/config

Creates or updates the authenticated user's Gemini configuration.

### Auth

Required.

### Request Body

```json
{
  "geminiApiKey": "user-provided-key",
  "geminiModel": "gemini-2.5-flash",
  "embeddingModel": "text-embedding-004",
  "systemPrompt": "You are a document assistant..."
}
```

### Validation

```txt
geminiApiKey: required string, min length 10
geminiModel: required string, must be gemini-2.5-flash for MVP
embeddingModel: required string, must be text-embedding-004 for MVP
systemPrompt: required string, min length 20, max length 4000
```

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "geminiModel": "gemini-2.5-flash",
    "embeddingModel": "text-embedding-004",
    "systemPrompt": "You are a document assistant...",
    "hasGeminiApiKey": true,
    "updatedAt": "2026-06-20T10:00:00.000Z"
  }
}
```

---

# 2. Document APIs

## GET /api/documents

Returns all non-deleted documents for the authenticated user.

### Auth

Required.

### Query Params

Optional:

```txt
status=processing|ready|failed|deleted
```

Default behavior:

- Return documents where `is_active = true`
- Exclude `status = deleted`

### Success Response

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "uuid",
        "fileName": "employee-handbook.pdf",
        "filePath": "user-id/document-id/employee-handbook.pdf",
        "fileSize": 1200000,
        "mimeType": "application/pdf",
        "status": "ready",
        "isActive": true,
        "chunkCount": 24,
        "errorMessage": null,
        "createdAt": "2026-06-20T10:00:00.000Z",
        "updatedAt": "2026-06-20T10:05:00.000Z"
      }
    ]
  }
}
```

---

## POST /api/documents/upload

Uploads and processes a PDF.

### Auth

Required.

### Content Type

```txt
multipart/form-data
```

### Form Fields

```txt
file: PDF file, required
```

### Validation

```txt
file must exist
file mime type must be application/pdf
file size max 20MB for MVP
user config must exist
Gemini API key must exist
```

### Processing Flow

1. Verify authenticated user.
2. Verify config exists.
3. Validate PDF file.
4. Create document row with `status = processing`.
5. Upload file to Supabase Storage.
6. Extract text from PDF.
7. If extracted text length < 100 characters:
   - Set document status to `failed`
   - Store error message: `OCR is not supported in MVP. This PDF may be scanned or image-based.`
   - Return `400 OCR_NOT_SUPPORTED`
8. Chunk text using RecursiveCharacterTextSplitter.
9. Generate embeddings using Gemini embedding model.
10. Upsert vectors to Pinecone under namespace `user_id`.
11. Store chunks in `document_chunks`.
12. Update document:
   - `status = ready`
   - `chunk_count = number of chunks`

### Success Response

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "uuid",
      "fileName": "employee-handbook.pdf",
      "status": "ready",
      "chunkCount": 24,
      "createdAt": "2026-06-20T10:00:00.000Z"
    }
  }
}
```

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "OCR_NOT_SUPPORTED",
    "message": "OCR is not supported in MVP. This PDF may be scanned or image-based."
  }
}
```

---

## GET /api/documents/[documentId]

Returns one document owned by the authenticated user.

### Auth

Required.

### Route Params

```txt
documentId: uuid
```

### Success Response

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "uuid",
      "fileName": "employee-handbook.pdf",
      "filePath": "user-id/document-id/employee-handbook.pdf",
      "fileSize": 1200000,
      "mimeType": "application/pdf",
      "status": "ready",
      "isActive": true,
      "chunkCount": 24,
      "errorMessage": null,
      "createdAt": "2026-06-20T10:00:00.000Z",
      "updatedAt": "2026-06-20T10:05:00.000Z"
    }
  }
}
```

---

## DELETE /api/documents/[documentId]

Soft deletes a document.

### Auth

Required.

### Route Params

```txt
documentId: uuid
```

### Behavior

Do not hard delete from Supabase or Pinecone.

Update document:

```txt
is_active = false
status = deleted
updated_at = now()
```

Also update related chunks in Supabase if an `is_active` column is added later.

For MVP retrieval, filter out deleted documents before final context construction.

### Success Response

```json
{
  "success": true,
  "data": {
    "documentId": "uuid",
    "status": "deleted",
    "isActive": false
  }
}
```

---

## GET /api/documents/[documentId]/chunks

Returns all chunks for one active document owned by the authenticated user.

### Auth

Required.

### Route Params

```txt
documentId: uuid
```

### Query Params

Optional:

```txt
page=1
limit=20
```

Default:

```txt
page=1
limit=20
```

### Success Response

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "uuid",
      "fileName": "employee-handbook.pdf",
      "status": "ready",
      "chunkCount": 24
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 24,
      "totalPages": 2
    },
    "chunks": [
      {
        "id": "uuid",
        "chunkIndex": 0,
        "content": "This is the chunk text...",
        "tokenCount": 230,
        "pineconeVectorId": "uuid-0",
        "metadata": {
          "source": "employee-handbook.pdf"
        },
        "createdAt": "2026-06-20T10:00:00.000Z"
      }
    ]
  }
}
```

---

# 3. Storage / File Access API

## GET /api/documents/[documentId]/signed-url

Creates a temporary signed URL for viewing/downloading the uploaded PDF.

### Auth

Required.

### Route Params

```txt
documentId: uuid
```

### Behavior

1. Verify the document belongs to current user.
2. Verify document is active.
3. Generate Supabase Storage signed URL.
4. Return signed URL.

### Success Response

```json
{
  "success": true,
  "data": {
    "signedUrl": "https://...",
    "expiresIn": 3600
  }
}
```

---

# 4. Chat Session APIs

## GET /api/chat/sessions

Returns all chat sessions for authenticated user.

### Auth

Required.

### Success Response

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "title": "Leave policy questions",
        "createdAt": "2026-06-20T10:00:00.000Z",
        "updatedAt": "2026-06-20T10:10:00.000Z"
      }
    ]
  }
}
```

---

## POST /api/chat/sessions

Creates a new chat session.

### Auth

Required.

### Request Body

```json
{
  "title": "New Chat"
}
```

### Validation

```txt
title optional string, max 120
```

### Success Response

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "title": "New Chat",
      "createdAt": "2026-06-20T10:00:00.000Z",
      "updatedAt": "2026-06-20T10:00:00.000Z"
    }
  }
}
```

---

## GET /api/chat/sessions/[sessionId]/messages

Returns all messages for a chat session owned by current user.

### Auth

Required.

### Route Params

```txt
sessionId: uuid
```

### Success Response

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "title": "Leave policy questions"
    },
    "messages": [
      {
        "id": "uuid",
        "role": "user",
        "content": "What is the leave policy?",
        "sources": [],
        "createdAt": "2026-06-20T10:00:00.000Z"
      },
      {
        "id": "uuid",
        "role": "assistant",
        "content": "The leave policy says...",
        "sources": [
          {
            "documentId": "uuid",
            "documentName": "employee-handbook.pdf",
            "chunkId": "uuid",
            "chunkIndex": 12,
            "snippet": "Employees are eligible for..."
          }
        ],
        "createdAt": "2026-06-20T10:01:00.000Z"
      }
    ]
  }
}
```

---

## PATCH /api/chat/sessions/[sessionId]

Updates chat session title.

### Auth

Required.

### Request Body

```json
{
  "title": "Updated title"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "title": "Updated title",
      "updatedAt": "2026-06-20T10:00:00.000Z"
    }
  }
}
```

---

## DELETE /api/chat/sessions/[sessionId]

Deletes a chat session and its messages.

### Auth

Required.

### Behavior

Hard delete is acceptable for chat sessions in MVP.

### Success Response

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "deleted": true
  }
}
```

---

# 5. Chat Completion API

## POST /api/chat

Main RAG chat endpoint.

### Auth

Required.

### Request Body

```json
{
  "sessionId": "uuid",
  "message": "What is the leave policy?"
}
```

### Validation

```txt
sessionId: required uuid
message: required string, min length 1, max length 4000
```

### Processing Flow

1. Verify authenticated user.
2. Verify chat session belongs to user.
3. Verify user config exists.
4. Store user message in `chat_messages`.
5. Load last 10 messages from this session.
6. Generate embedding for latest user message.
7. Query Pinecone namespace = `user_id`.
8. Retrieve top 5 chunks.
9. Cross-check retrieved chunk document IDs against Supabase active documents.
10. If no active relevant chunks:
    - assistant answer = `I could not find this information in your uploaded documents.`
11. Build prompt using:
    - user system prompt
    - last 10 messages
    - retrieved chunk context
    - current user question
12. Call Gemini.
13. Store assistant response with sources.
14. Update chat session `updated_at`.
15. If session title is `New Chat`, generate simple title from first user message or use truncated first message.
16. Return assistant response.

### Success Response

```json
{
  "success": true,
  "data": {
    "message": {
      "id": "uuid",
      "role": "assistant",
      "content": "According to your document, employees are eligible for...",
      "sources": [
        {
          "documentId": "uuid",
          "documentName": "employee-handbook.pdf",
          "chunkId": "uuid",
          "chunkIndex": 12,
          "snippet": "Employees are eligible for paid leave..."
        }
      ],
      "createdAt": "2026-06-20T10:01:00.000Z"
    },
    "session": {
      "id": "uuid",
      "title": "Leave policy questions",
      "updatedAt": "2026-06-20T10:01:00.000Z"
    }
  }
}
```

### Missing Config Response

```json
{
  "success": false,
  "error": {
    "code": "CONFIG_MISSING",
    "message": "Please add your Gemini API key in configuration before chatting."
  }
}
```

---

# 6. Health API

## GET /api/health

Basic app health check.

### Auth

Not required.

### Success Response

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "app": "LexiVault",
    "version": "1.0.0"
  }
}
```

---

# Data Models for Frontend

## Document

```ts
export type DocumentStatus = "processing" | "ready" | "failed" | "deleted";

export type Document = {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  status: DocumentStatus;
  isActive: boolean;
  chunkCount: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};
```

---

## DocumentChunk

```ts
export type DocumentChunk = {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number | null;
  pineconeVectorId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};
```

---

## ChatSession

```ts
export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};
```

---

## ChatMessage

```ts
export type ChatMessageRole = "user" | "assistant" | "system";

export type ChatSource = {
  documentId: string;
  documentName: string;
  chunkId: string;
  chunkIndex: number;
  snippet: string;
};

export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
  sources: ChatSource[];
  createdAt: string;
};
```

---

# Implementation Requirements

Codex must:

- Use Zod validation for request bodies.
- Use TypeScript types for all responses.
- Keep API routes thin.
- Move business logic into `lib/`.
- Never trust `user_id` from request body.
- Always use authenticated Supabase user ID.
- Never return raw API keys.
- Never call Pinecone or Gemini from client components.
- Never retrieve vectors from another user's namespace.

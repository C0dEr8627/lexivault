# LexiVault Complete Documentation

Last reviewed: 2026-07-16

## 1. Executive Summary

LexiVault is a private document memory platform. It lets an authenticated user upload text-based PDF files, process them into searchable chunks, store vector embeddings in Pinecone, and ask grounded questions through a Gemini-powered chat interface. Answers are constrained to the user's uploaded documents and include source citations that point back to the relevant chunks.

The project is implemented as a full-stack Next.js App Router application with Supabase for authentication, database, and PDF storage. Gemini is used for text generation and embeddings, Pinecone is used for vector retrieval, and LangSmith is used for tracing ingestion and chat runs.

The current MVP focuses on one user account as one private data boundary. There are no teams, public sharing, OCR, billing, multi-provider LLM support, reranking, hybrid search, or agentic workflows.

## 2. Product Purpose

LexiVault solves a focused problem: a user has private PDFs and wants a trustworthy AI assistant that can answer only from those PDFs.

Core product promise:

- Upload private text-based PDFs.
- Convert PDFs into retrievable chunks.
- Ask questions in a ChatGPT-style interface.
- Receive grounded answers with source citations.
- Keep each user's documents, chunks, chat sessions, and configuration isolated.

Primary audience:

- Individuals who need a private document Q&A workspace.
- Internal teams evaluating a document RAG MVP.
- Developers or stakeholders reviewing the architecture and implementation.

## 3. MVP Scope

### In Scope

- Next.js full-stack application.
- Supabase email/password authentication.
- Protected app shell with sidebar navigation.
- Per-user configuration for Gemini, LangSmith, and Pinecone.
- Text-based PDF upload.
- Supabase Storage for uploaded PDFs.
- PDF text extraction.
- Character-based chunking with overlap.
- Gemini embedding generation.
- Pinecone vector upsert and similarity search.
- Supabase persistence for documents, chunks, chat sessions, and messages.
- RAG chat endpoint.
- Source citations below assistant answers.
- Soft delete for documents.
- Hard delete for chat sessions.
- LangSmith tracing for ingestion and chat.
- Health endpoint.

### Out Of Scope

- OCR for scanned PDFs.
- Image-only PDF support.
- Multiple LLM providers.
- Public document sharing.
- Team workspaces.
- Admin dashboard.
- Billing.
- Fine-tuning.
- Hybrid search.
- Reranking.
- Agentic workflows.
- MCP integration.

## 4. Current Implementation Status

According to the tracker and source code, phases 0 through 11 are complete and phase 12 is in progress.

Completed:

- Project foundation.
- Landing page.
- Authentication and route protection.
- Supabase schema and RLS.
- Shared app shell and UI primitives.
- Configuration page and API.
- Documents page and upload UX.
- PDF ingestion pipeline.
- Chunk viewer.
- Chat sessions and chat UI.
- RAG chat backend.
- Source citation UI and UX polish.

In progress:

- LangSmith and final verification.

Known blocker from the existing tracker:

- Full external-service QA from the sandbox was blocked because Supabase-auth requests failed with `fetch failed` / `EACCES`.

## 5. Technology Stack

Runtime and framework:

- Next.js 15 App Router.
- React 19.
- TypeScript 5.6.
- Tailwind CSS 4 through PostCSS.

Backend and data:

- Supabase Auth.
- Supabase Postgres.
- Supabase Storage.
- Supabase SSR helpers.

AI and retrieval:

- Gemini generation API.
- Gemini embedding API.
- Pinecone vector database.
- LangSmith tracing.

Validation and utilities:

- Zod.
- Native `fetch`.
- Node `crypto` for optional secret encryption.
- `pdf-parse` for PDF text extraction.

Main npm scripts:

```bash
npm run dev
npm run build
npm run start
```

## 6. Repository Structure

```text
app/
  Next.js pages, layouts, API route handlers, global CSS, app icon.

assets/
  Brand images and logo/icon files.

components/
  Reusable UI components and feature components for auth, layout, documents,
  chunks, configuration, and chat.

docs/
  Product, API, architecture, design, environment, coding, implementation,
  and QA documentation used while building the MVP.

lib/
  Server helpers, auth helpers, service layer, validation schemas, Gemini,
  PDF, chunking, Pinecone, LangSmith, and shared utilities.

supabase/
  Database migrations for schema, RLS, processing-stage columns, LangSmith
  config columns, and Pinecone config columns.

types/
  Shared TypeScript types for database rows and frontend records.
```

Root project files:

- `.env.example` documents required environment variable names.
- `.gitignore` excludes generated and local-only files.
- `next.config.mjs` configures Next.js strict mode and server packages.
- `package.json` defines dependencies and scripts.
- `postcss.config.mjs` configures Tailwind CSS PostCSS.
- `README.md` gives the shorter project overview.
- `tsconfig.json` enables strict TypeScript and `@/*` path aliases.

Local-only/generated folders:

- `.git/` is version control metadata.
- `.next/` is generated Next.js build output.
- `node_modules/` is installed dependency output.

## 7. High-Level Architecture

LexiVault uses a full-stack Next.js architecture.

```text
Browser
  -> Next.js App Router UI
  -> Next.js Route Handlers and server services
  -> Supabase, Gemini, Pinecone, LangSmith
```

Frontend responsibilities:

- Render public landing page.
- Render login, signup, forgot password, and reset password screens.
- Render protected app shell.
- Manage form state and client-side interaction.
- Submit uploads and chat messages to internal API routes.
- Display document state, chunks, messages, and citations.

Backend responsibilities:

- Verify Supabase authenticated user.
- Validate request input with Zod.
- Read and write Supabase rows.
- Upload and sign PDF files through Supabase Storage.
- Extract PDF text.
- Split text into chunks.
- Generate Gemini embeddings.
- Upsert and query Pinecone vectors.
- Build grounded prompts.
- Generate Gemini responses.
- Persist chat messages and sources.
- Trace key workflows with LangSmith.

Security boundary:

- Browser never calls Gemini, Pinecone, LangSmith, or the Supabase service role directly.
- User identity is always derived from Supabase auth, never from request body data.
- Supabase RLS restricts user-owned data.
- Pinecone namespaces isolate vectors by user ID.

## 8. Route Map

Public pages:

```text
/                 Public landing page
/login            Login page
/signup           Signup page
/forgot-password  Password reset request page
/reset-password   New password page
```

Protected pages:

```text
/config                              User AI and retrieval configuration
/documents                           Upload, list, view, and delete PDFs
/documents/[documentId]/chunks        Inspect extracted chunks for one document
/chat                                Chat sessions and grounded Q&A
```

API routes:

```text
GET  /api/health
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/logout

GET  /api/config
POST /api/config

GET    /api/documents
POST   /api/documents/upload
GET    /api/documents/[documentId]
DELETE /api/documents/[documentId]
GET    /api/documents/[documentId]/chunks
GET    /api/documents/[documentId]/signed-url

POST   /api/chat
GET    /api/chat/sessions
POST   /api/chat/sessions
GET    /api/chat/sessions/[sessionId]
PATCH  /api/chat/sessions/[sessionId]
DELETE /api/chat/sessions/[sessionId]
GET    /api/chat/sessions/[sessionId]/messages
```

## 9. User Journey

1. Visitor lands on `/`.
2. Visitor signs up or logs in.
3. Authenticated user enters the protected app shell.
4. User saves configuration on `/config`.
5. User uploads a text-based PDF on `/documents`.
6. App processes the PDF through upload, parsing, chunking, embedding, and vector upsert.
7. User can view the document list, open a signed PDF URL, or inspect chunks.
8. User creates a chat session on `/chat`.
9. User asks a question.
10. App retrieves relevant chunks and asks Gemini to answer only from those chunks.
11. Assistant answer is stored with citations.
12. User can inspect citations and jump to the chunk viewer.
13. User can soft delete a document so it is removed from future retrieval.

## 10. Authentication

Authentication uses Supabase email/password auth.

Server helpers:

- `createSupabaseServerClient()` reads Supabase URL and anon key, attaches cookies, and returns a server-side Supabase client.
- `createSupabaseBrowserClient()` creates a browser auth client.
- `createSupabaseAdminClient()` creates a server-only client with the service role key.
- `getCurrentUser()` returns the current Supabase user or `null`.
- `requireCurrentUser()` redirects unauthenticated users to `/login`.

Auth service functions:

- `loginWithPassword(input)` validates email/password and signs in.
- `signupWithPassword(input)` validates signup input and creates the user.
- `signOutUser()` signs out.

Protected layout behavior:

- `app/(protected)/layout.tsx` checks the current user.
- If no user exists, it redirects to `/login`.
- If a user exists, it renders `ProtectedShell`.

Auth UI behavior:

- Login and signup forms submit to internal auth APIs.
- On successful login or signup, the current code redirects to `/config`.
- Logout redirects to `/login`.
- Forgot/reset password UI exists, with reset behavior handled from the client-side Supabase browser client.

## 11. Configuration

The configuration feature stores per-user provider settings.

Stored configuration fields:

- Gemini API key.
- LangSmith API key.
- LangSmith project.
- Pinecone API key.
- Pinecone index name.
- Gemini chat model.
- Fixed embedding model.
- System prompt.

Supported Gemini chat models in code:

- `gemini-2.5-flash`
- `gemini-2.5-pro`
- `gemini-2.0-flash`

Fixed embedding model in code:

- `gemini-embedding-001`

Embedding dimensionality:

- Defaults to `1024`.
- Can be controlled by `GEMINI_EMBEDDING_DIMENSION`.
- Pinecone index dimension must match this value.

Important behavior:

- Raw saved secrets are never returned to the frontend.
- API responses return booleans like `hasGeminiApiKey`, `hasLangsmithApiKey`, and `hasPineconeApiKey`.
- When updating an existing config, leaving a secret input blank preserves the saved value.
- `CONFIG_ENCRYPTION_SECRET` enables AES-256-GCM encryption at rest for saved secrets.
- If `CONFIG_ENCRYPTION_SECRET` is missing, values are stored as provided. RLS still limits user access, but encryption at rest is not added by the application layer.

Configuration validation:

- `systemPrompt` must be 20 to 4000 characters.
- `geminiModel` must be one of the allowed Gemini model options.
- `embeddingModel` must be `gemini-embedding-001`.
- New configuration requires Gemini, LangSmith, Pinecone, project, and index values.

## 12. Document Management

Documents are private PDFs uploaded by authenticated users.

Supported files:

- PDF only.
- Maximum file size: 20MB.
- Text-based PDFs only.
- OCR is not supported.

Document status values:

- `processing`
- `ready`
- `failed`
- `deleted`

Processing stages:

- `uploading`
- `loading`
- `parsing`
- `chunking`
- `embedding`

Document storage path:

```text
{user_id}/{document_id}/{safe_file_name}
```

Document list behavior:

- Default list returns active, non-deleted documents for the current user.
- Optional status filter supports `processing`, `ready`, `failed`, and `deleted`.
- The frontend polls `/api/documents` every 2 seconds while any document is processing or an optimistic upload is present.

Document actions:

- View PDF: fetches a temporary signed URL and opens it in a new tab.
- View Chunks: opens `/documents/[documentId]/chunks`.
- Delete: opens confirmation and soft deletes the document.

Soft delete behavior:

- `documents.is_active` is set to `false`.
- `documents.status` is set to `deleted`.
- Pinecone vectors are not hard deleted in the MVP.
- Chat retrieval cross-checks active ready documents in Supabase before using retrieved chunks.

## 13. PDF Ingestion Pipeline

Upload endpoint:

```text
POST /api/documents/upload
```

Request type:

```text
multipart/form-data
```

Fields:

- `file`: required PDF file.
- `clientUploadId`: optional frontend-generated ID used to match optimistic UI rows.

Pipeline steps:

1. Authenticate the user.
2. Load the user's saved configuration and secrets.
3. Validate file type and file size.
4. Create a `documents` row with `processing` status.
5. Upload the PDF to Supabase Storage using the admin client.
6. Extract text using `pdf-parse`.
7. Reject low-text PDFs with the OCR-not-supported error.
8. Split extracted text into chunks.
9. Generate Gemini embeddings for each chunk.
10. Upsert chunk vectors to Pinecone in the user's namespace.
11. Insert chunk rows into Supabase.
12. Mark the document `ready`.
13. If any major step fails after the document row exists, mark the document `failed` with a readable error.

OCR rejection rule:

```text
If extracted text has fewer than 100 characters, the document fails with:
OCR is not supported in MVP. This PDF may be scanned or image-based.
```

Chunking implementation:

- Implemented in `lib/langchain/text-splitter.ts`.
- Normalizes CRLF to LF.
- Uses character windows.
- Default chunk size: 1000 characters.
- Default overlap: 200 characters.
- Token count is estimated as `ceil(characters / 4)`.

Vector IDs:

```text
{documentId}:{chunkIndex}
```

Pinecone metadata:

- `user_id`
- `document_id`
- `chunk_id`
- `file_name`
- `chunk_index`
- `is_active`

## 14. Chat And RAG

Chat pages support stored sessions and messages.

Chat session features:

- List sessions ordered by most recently updated.
- Create new sessions with default title `New Chat`.
- Delete chat sessions permanently with confirmation.
- Update session title through the API.
- Automatically retitle a `New Chat` session from the first user message, truncated to 60 characters.

Message features:

- Store user messages.
- Store assistant messages.
- Store sources with assistant messages.
- Render source citations below assistant answers.

Main chat endpoint:

```text
POST /api/chat
```

Request shape:

```json
{
  "sessionId": "uuid",
  "message": "Question text"
}
```

RAG flow:

1. Validate request.
2. Authenticate user.
3. Load user provider configuration and secrets.
4. Confirm the chat session belongs to the user.
5. Store the user message.
6. Load the last 10 messages from the session.
7. Embed the current user question with Gemini.
8. Query Pinecone in namespace `user_id` with top K = 5.
9. Load matching chunks from Supabase by vector ID.
10. Load active ready documents for those chunks.
11. Filter out chunks from inactive, deleted, or non-ready documents.
12. Build a grounded prompt.
13. Generate Gemini response using the user's system prompt as system instruction.
14. Store the assistant response and sources.
15. Refresh and return the session.

Fallback answer:

```text
I could not find this information in your uploaded documents.
```

Prompt rules:

- Use only retrieved document context.
- If context does not support the answer, return the fallback answer.
- Recent chat history is for continuity only.
- Uploaded document chunks remain the source of truth.

Source citation fields:

- `documentId`
- `documentName`
- `chunkId`
- `chunkIndex`
- `snippet`

Snippet behavior:

- The code stores the first 280 characters of each cited chunk as the snippet.

## 15. API Response Format

All internal API routes use a consistent JSON response shape.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

Shared helpers:

- `successResponse(data, status?)`
- `errorResponse(code, message, status?)`

Common error codes used across docs and code:

- `UNAUTHORIZED`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFIG_MISSING`
- `CONFIG_REQUIRED`
- `DATABASE_ERROR`
- `STORAGE_ERROR`
- `INVALID_FILE_TYPE`
- `FILE_TOO_LARGE`
- `OCR_NOT_SUPPORTED`
- `PDF_PARSE_ERROR`
- `CHUNKING_ERROR`
- `PROCESSING_ERROR`
- `PINECONE_ERROR`
- `GEMINI_ERROR`

## 16. Database Schema

The base schema is defined in `supabase/migrations/20260620_phase3_schema.sql`, with later migrations for processing-stage columns and provider config columns.

### `user_configs`

Purpose: stores per-user AI, tracing, retrieval, and prompt settings.

Important columns:

- `id`
- `user_id`
- `gemini_api_key`
- `langsmith_api_key`
- `langsmith_project`
- `pinecone_api_key`
- `pinecone_index_name`
- `gemini_model`
- `embedding_model`
- `system_prompt`
- `created_at`
- `updated_at`

Constraints:

- Unique `user_id`.
- Gemini model constrained in the base migration to `gemini-2.5-flash`.
- Embedding model constrained to `gemini-embedding-001`.

Note:

- The TypeScript validation allows multiple Gemini model values. If the live database still has the base single-model constraint, model values other than `gemini-2.5-flash` may require a schema update.

### `documents`

Purpose: stores PDF metadata and processing state.

Important columns:

- `id`
- `user_id`
- `file_name`
- `file_path`
- `file_size`
- `mime_type`
- `status`
- `processing_stage`
- `processing_message`
- `client_upload_id`
- `is_active`
- `chunk_count`
- `error_message`
- `created_at`
- `updated_at`

Constraints:

- Status must be `processing`, `ready`, `failed`, or `deleted`.
- Processing stage must be one of the known stages or null.
- Chunk count must be non-negative.

### `document_chunks`

Purpose: stores extracted chunk text and links chunks to Pinecone vectors.

Important columns:

- `id`
- `document_id`
- `user_id`
- `chunk_index`
- `content`
- `token_count`
- `pinecone_vector_id`
- `metadata`
- `created_at`

Constraints:

- Unique `pinecone_vector_id`.
- Unique `(document_id, chunk_index)`.
- Chunk index must be non-negative.

### `chat_sessions`

Purpose: stores a user's conversations.

Important columns:

- `id`
- `user_id`
- `title`
- `created_at`
- `updated_at`

### `chat_messages`

Purpose: stores messages in a chat session.

Important columns:

- `id`
- `session_id`
- `user_id`
- `role`
- `content`
- `sources`
- `created_at`

Allowed roles:

- `user`
- `assistant`
- `system`

## 17. Row Level Security And Storage Security

RLS is enabled on:

- `user_configs`
- `documents`
- `document_chunks`
- `chat_sessions`
- `chat_messages`

RLS policy principle:

```sql
user_id = auth.uid()
```

Storage bucket:

- Bucket ID/name: `documents`.
- Public access: false.
- Storage object policies restrict operations to paths where the first folder is the authenticated user's ID.

Storage ownership pattern:

```text
documents bucket
  {auth.uid()}/{document_id}/{file_name}
```

Server service role:

- Used only server-side.
- Used for privileged storage upload and signed URL generation.
- Never exposed to the browser.

## 18. Environment Variables

Use `.env.example` as the safe reference. Do not share actual `.env.local` values.

Public app:

- `NEXT_PUBLIC_APP_URL`

Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

AI and retrieval:

- `GEMINI_API_KEY`
- `GEMINI_EMBEDDING_DIMENSION`
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `LANGSMITH_API_KEY`
- `LANGSMITH_PROJECT`
- `LANGSMITH_TRACING`
- `LANGSMITH_ENDPOINT`

Optional security:

- `CONFIG_ENCRYPTION_SECRET`

Important implementation nuance:

- The current services primarily use per-user saved Gemini, Pinecone, and LangSmith keys from `user_configs`.
- Environment-level Gemini/Pinecone/LangSmith values remain documented and may be used as fallback in some helper functions or for tracing status.

## 19. Frontend And UI

Design goal:

- Secure.
- Premium.
- Calm.
- Intelligent.
- Document-first.

Visual implementation:

- Dark blue/violet "Vault Glow" style in current CSS.
- Strong branded landing page.
- Centered auth cards.
- Protected workspace with collapsible sidebar.
- Document table with processing progress indicators.
- Chat interface with session sidebar and message thread.

Protected sidebar navigation:

- Configuration.
- Documents.
- Chat.

Reusable UI primitives:

- `Alert`
- `Card`
- `Dialog`
- `EmptyState`
- `ToastProvider`
- Custom app icons in `components/ui/app-icons.tsx`

Key UX behaviors:

- Configuration success uses toast feedback.
- Upload success uses toast feedback.
- Document deletion uses confirmation dialog and toast.
- Chat creation uses toast.
- Chat deletion uses confirmation dialog and toast.
- Chat composer supports Enter to send and Shift+Enter for a new line.
- Empty states guide the user to configuration, documents, or chat creation.

## 20. Important Components

Auth:

- `LoginForm`
- `SignupForm`
- `ForgotPasswordForm`
- `ResetPasswordForm`
- `LogoutButton`

Layout:

- `ProtectedShell`
- `AppSidebar`
- `PageHeader`

Configuration:

- `ConfigForm`

Documents:

- `DocumentsWorkspace`
- `DocumentUploadCard`
- `DocumentsTable`
- `DeleteDocumentDialog`
- `StatusBadge`

Chunks:

- `ChunkList`
- `ChunkCard`

Chat:

- `ChatSessionActions`
- `CreateChatButton`
- `ChatSessionList`
- `DeleteChatSessionDialog`
- `ChatMessageBubble`
- `SourceCitationList`
- `ChatComposer`
- `EmptyChatState`

## 21. Service Layer

The application keeps route handlers thin and places business logic in `lib/services`.

`config-service.ts`:

- Loads current user config.
- Loads config secrets server-side.
- Saves/upserts config.
- Encrypts/decrypts secrets when configured.
- Maps database rows from snake_case to frontend camelCase.

`document-service.ts`:

- Lists current user's documents.
- Gets one current-user document.
- Soft deletes a current-user document.
- Creates temporary signed URLs.
- Lists chunks with pagination.

`ingestion-service.ts`:

- Authenticates uploads.
- Validates config and file.
- Uploads PDF to Supabase Storage.
- Extracts text.
- Chunks text.
- Embeds chunks.
- Upserts Pinecone vectors.
- Persists chunk rows.
- Updates document status.
- Adds LangSmith traces.

`chat-service.ts`:

- Lists, creates, retrieves, updates, and deletes chat sessions.
- Lists messages.
- Handles RAG chat completion.
- Embeds query.
- Retrieves vector matches.
- Filters active documents.
- Builds prompt.
- Calls Gemini.
- Stores assistant response and sources.
- Adds LangSmith traces.

## 22. Gemini Integration

File:

```text
lib/langchain/gemini.ts
```

Embedding:

- Calls Gemini `embedContent`.
- Uses model resolved as `gemini-embedding-001`.
- Sends requested `outputDimensionality`.
- Throws if embedding is empty or dimensionality does not match expected value.

Generation:

- Calls Gemini `generateContent`.
- Uses configured chat model or defaults to `gemini-2.5-flash`.
- Sends the user's system prompt as `systemInstruction`.
- Throws if the response is not OK or contains no text.

## 23. Pinecone Integration

File:

```text
lib/pinecone/pinecone-service.ts
```

Behavior:

- Requires an API key and index name.
- Describes the Pinecone index to obtain the host.
- Uses one namespace per user.
- Upserts records into `index.namespace(userId)`.
- Queries top K vectors from `index.namespace(userId)`.

Namespace rule:

```text
namespace = user.id
```

## 24. LangSmith Integration

File:

```text
lib/observability/langsmith.ts
```

Tracing wrappers:

- `withLangSmithTrace`
- `withLangSmithChildTrace`

Document upload trace includes:

- Root upload pipeline.
- Extract PDF text.
- Chunk PDF text.
- Generate chunk embeddings.
- Upsert Pinecone vectors.

Chat trace includes:

- Root chat request.
- Embed user query.
- Retrieve relevant vectors.
- Generate grounded response.

Tracing status:

- `/api/health` returns tracing status.
- `LANGSMITH_TRACING=true` and a LangSmith API key enable environment-based tracing status.
- Runtime tracing can use per-user saved LangSmith credentials.

## 25. Validation Rules

Zod schemas live in `lib/validation`.

Auth:

- Login requires valid email and password.
- Signup requires valid email, password of at least 8 characters, and matching confirmation.

Config:

- Secret fields are strings.
- `systemPrompt` must be 20 to 4000 characters.
- `geminiModel` must be in the allowed model list.
- `embeddingModel` must equal `gemini-embedding-001`.

Documents:

- `documentId` must be a UUID.
- Query status must be one of known document statuses.
- Chunk pagination defaults to page 1 and limit 20.
- Chunk pagination limit maxes at 50.

Chat:

- Session title is optional and max 120 characters.
- Chat message requires UUID `sessionId`.
- Message length is 1 to 4000 characters.

## 26. File And Folder Details

### `app`

Contains route segments, pages, layouts, API route handlers, global CSS, and the app icon.

Important files:

- `app/layout.tsx`: root layout and metadata.
- `app/page.tsx`: public landing page.
- `app/globals.css`: main CSS for landing, auth, protected shell, documents, config, chunks, and chat.
- `app/(protected)/layout.tsx`: authentication guard for protected routes.
- `app/(protected)/documents/page.tsx`: documents workspace.
- `app/(protected)/documents/[documentId]/chunks/page.tsx`: chunk viewer.
- `app/(protected)/config/page.tsx`: configuration page.
- `app/(protected)/chat/page.tsx`: chat page.
- `app/api/**/route.ts`: API route handlers.

### `assets`

Contains brand images:

- `lexivault-logo.png`
- `lexivault-icon.png`
- `ChatGPT Image Jun 27, 2026, 06_34_03 PM.png`

The current UI imports the ChatGPT-generated icon image in auth and sidebar branding.

### `components`

Contains feature-oriented React components:

- `auth`
- `chat`
- `chunks`
- `config`
- `documents`
- `layout`
- `ui`

### `docs`

Contains the original project planning and implementation docs:

- Product docs: architecture, API contract, plan, project doc.
- Design docs: design direction, frontend guide, UI spec, master UI spec.
- Execution docs: coding rules, environment variables, phases, tracker, QA checklist.

### `lib`

Contains server-side implementation logic:

- `auth`
- `langchain`
- `observability`
- `pinecone`
- `services`
- `supabase`
- `utils`
- `validation`

### `supabase`

Contains SQL migrations:

- Base schema, constraints, RLS, storage policies.
- Document processing-stage columns.
- LangSmith user config columns.
- Pinecone user config columns.

### `types`

Contains shared TypeScript types:

- `chat.ts`
- `chunks.ts`
- `config.ts`
- `database.ts`
- `documents.ts`

## 27. Setup Guide

1. Install dependencies:

```bash
npm install
```

2. Create local environment:

```bash
copy .env.example .env.local
```

3. Fill in Supabase values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

4. Fill in AI/retrieval defaults if needed:

- `GEMINI_API_KEY`
- `GEMINI_EMBEDDING_DIMENSION`
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `LANGSMITH_API_KEY`
- `LANGSMITH_PROJECT`
- `LANGSMITH_TRACING`
- `LANGSMITH_ENDPOINT`

5. Add optional encryption:

- Set `CONFIG_ENCRYPTION_SECRET` before saving production secrets.

6. Apply Supabase migrations:

- Run the SQL migrations in `supabase/migrations` against the target Supabase project.

7. Ensure the Pinecone index exists:

- Dimension should match `GEMINI_EMBEDDING_DIMENSION`, default `1024`.

8. Start local development:

```bash
npm run dev
```

9. Build for production:

```bash
npm run build
```

10. Start production build locally:

```bash
npm run start
```

## 28. QA Checklist

Automated:

- Run `npm run build`.
- Check `GET /api/health`.

Manual:

- Sign up.
- Log in.
- Log out.
- Save configuration.
- Upload a valid text-based PDF.
- Upload an invalid or scanned PDF and confirm readable failure.
- Confirm processed document appears in documents table.
- Open signed PDF.
- Open chunks viewer.
- Create chat session.
- Send grounded question.
- Confirm source citations appear under assistant answer.
- Delete chat session.
- Delete document and confirm it is removed from future retrieval.

Tracing:

- Confirm tracing is enabled when expected.
- Confirm upload traces include nested ingestion steps.
- Confirm chat traces include retrieval and Gemini generation steps.

## 29. Security Notes

Do not expose to the frontend:

- Supabase service role key.
- Pinecone API key.
- LangSmith API key.
- Raw saved Gemini API key.
- Raw saved provider secrets.

Do not trust:

- Client-provided user IDs.
- Request body ownership claims.
- Browser-only validation.

Always enforce:

- Supabase authenticated user checks.
- RLS.
- Server-only AI/vector calls.
- Per-user Pinecone namespaces.
- Active-document filtering before chat prompt construction.

Shareable-document warning:

- This documentation intentionally does not include actual `.env.local` values or provider secrets.

## 30. Known Implementation Nuances

- The code currently redirects successful login/signup to `/config`, while some planning docs say `/documents`.
- The code uses `gemini-embedding-001`, while older docs mention `text-embedding-004`.
- The code allows `gemini-2.5-pro` and `gemini-2.0-flash` in TypeScript validation, while the base SQL migration constrains `gemini_model` to `gemini-2.5-flash`.
- The splitter is a local character-window implementation, while older planning docs refer to LangChainJS `RecursiveCharacterTextSplitter`.
- Source snippets are currently simple leading substrings of chunk content.
- Chat is non-streaming.
- Pinecone vectors are not deleted on document soft delete.
- Existing historical chat answers may still show citations to a now-deleted document, but deleted documents are excluded from future retrieval.
- `/api/config` returns 404 if no config exists; pages handle missing config through service calls rather than relying only on the API.
- Signed PDF URLs expire after 5 minutes in the current service implementation.

## 31. Suggested Handoff Summary

If sending this project to someone else, the shortest accurate explanation is:

LexiVault is a Next.js/Supabase RAG app for private PDF chat. Users authenticate, save Gemini/LangSmith/Pinecone settings, upload text PDFs, and the app extracts text, chunks it, embeds it with Gemini, stores vectors in Pinecone by user namespace, and stores metadata in Supabase. Chat retrieves the top five relevant chunks, filters out deleted documents, asks Gemini to answer only from retrieved context, stores the answer, and displays source citations. The app is an MVP: no OCR, no teams, no public sharing, no reranking, no hybrid search, and no multi-provider support.

## 32. Recommended Next Steps

- Run a fresh `npm run build`.
- Verify the live Supabase schema matches the current TypeScript model and accepted Gemini model list.
- Confirm the Pinecone index dimension is `1024`.
- Run the full manual QA checklist with real Supabase, Gemini, Pinecone, and LangSmith credentials.
- Decide whether login/signup should redirect to `/config` or `/documents`, then align docs and code.
- Decide whether to keep `gemini-embedding-001` or update docs/code/schema consistently.
- Set `CONFIG_ENCRYPTION_SECRET` before storing production user provider secrets.

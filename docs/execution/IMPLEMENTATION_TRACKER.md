# LexiVault Implementation Tracker

## Purpose

This file tracks progress against `IMPLEMENTATION_PHASES.md`.

Update this file during development so a new Codex chat can quickly understand:

- what is complete
- what is currently in progress
- what is blocked
- what decisions were made while building

---

## Status Legend

- `not started`
- `in progress`
- `done`
- `blocked`

---

## Current Project Status

Overall status: `in progress`

Current phase: `Phase 12 - LangSmith And Final Verification`

Last updated: `2026-06-23`

---

## Phase Checklist

### Phase 0: Project Foundation

Status: `done`

Notes:

- Next.js app shell is created at the repo root.
- Public landing route and auth route scaffolds are in place.
- Global theme tokens and environment docs are in place.
- The Figma export folder remains reference-only.

### Phase 1: Public Landing Page

Status: `done`

Notes:

- Landing page and auth route scaffolds are in place.
- Root app shell has been verified with a successful build.
- Authenticated redirect from `/` to `/documents` will be finalized with auth in Phase 2.

### Phase 2: Authentication And Route Protection

Status: `done`

Notes:

- Supabase browser, server, and admin helpers are in place.
- Login, signup, and logout routes are wired.
- Root, login, signup, and protected pages redirect correctly in the app shell.
- Route protection is enforced through server layouts and page redirects.
- Password recovery flow is now available via `/forgot-password` and `/reset-password`.

### Phase 3: Database Schema And RLS

Status: `done`

Notes:

- Supabase schema migration added at `supabase/migrations/20260620_phase3_schema.sql`.
- Shared database row types added at `types/database.ts`.
- RLS policies cover all MVP tables plus the private `documents` storage bucket strategy.
- Migration has been applied in Supabase and the live schema now matches the contract.

### Phase 4: Shared App Shell And Reusable UI

Status: `done`

Notes:

- Protected app shell now uses a shared sidebar component and consistent page header pattern.
- Reusable UI primitives were added for cards, alerts, dialogs, and empty states.
- Protected routes now present a consistent shell on desktop and mobile.

### Phase 5: Configuration Feature

Status: `done`

Notes:

- `/config` now loads the current user configuration and renders a reusable config form.
- `GET /api/config` and `POST /api/config` are implemented.
- Gemini model and embedding model are fixed for the MVP.
- Raw Gemini API keys are never returned to the frontend.

### Phase 6: Documents Page And Upload UX

Status: `done`

Notes:

- `/documents` now loads the current user documents from Supabase.
- Upload card UI is present with configuration warnings and Phase 7 messaging.
- Documents can be viewed via signed URL and soft-deleted through the app.
- Loading, empty, and error states are in place for the documents workspace.

### Phase 7: PDF Ingestion Pipeline

Status: `done`

Notes:

- `POST /api/documents/upload` now validates PDF uploads and runs the ingestion pipeline.
- PDFs are stored in Supabase Storage under `{user_id}/{document_id}/{file_name}`.
- Text extraction, chunking, Gemini embeddings, Pinecone upsert, and Supabase chunk persistence are wired up.
- Failed or scanned PDFs are marked failed with a readable OCR warning.

### Phase 8: Document Chunks Viewer

Status: `done`

Notes:

- `/documents/[documentId]/chunks` is implemented.
- Chunks are loaded from Supabase with pagination and ownership checks.
- The document summary card and chunk list are live.
- The documents table links into the chunks viewer.

### Phase 9: Chat Sessions And Chat UI

Status: `done`

Notes:

- `/chat` now shows a dedicated sidebar session shell with the stored conversation history.
- Users can create a new chat session and delete the active chat session from the UI.
- The chat composer and message thread were landed here so the RAG backend could plug into an existing shell in Phase 10.
- Loading and empty states are in place so the page stays stable while data resolves.

### Phase 10: RAG Chat Backend

Status: `done`

Notes:

- `POST /api/chat` is implemented.
- User messages are stored, embedded with Gemini, and used to query Pinecone in the current user namespace.
- Retrieved vectors are cross-checked against active ready documents before context is sent to Gemini.
- Assistant responses are stored in `chat_messages`, and new sessions are retitled from the first user prompt.

### Phase 11: Source Citations And UX Polish

Status: `done`

Notes:

- Assistant answers now render clearer source citation cards with links into the chunk viewer.
- Major success actions use shared toast feedback for config saves, uploads, document deletion, and chat session changes.
- Chat deletion now uses a proper confirmation dialog instead of a browser confirm prompt.
- Chat and documents copy/layout were polished to better match the Figma reference direction and trust cues.

### Phase 12: LangSmith And Final Verification

Status: `in progress`

Notes:

- LangSmith tracing is wired through the official `langsmith` SDK and stays environment-controlled.
- Upload tracing now covers PDF extraction, chunking, embedding generation, and Pinecone upsert.
- Chat tracing now covers query embedding, retrieval, and grounded Gemini response generation.
- `GET /api/health` is live and reports app plus tracing status.
- `npm run build` passes and the health endpoint responds locally.
- Full external-service QA from this sandbox is currently blocked because Supabase-auth requests fail with `fetch failed` / `EACCES`.

---

## Decisions Made During Implementation

Use this section to record decisions that affect future chats.

Example entries:

- chose package X over package Y because of Next.js server compatibility
- kept non-streaming chat for MVP
- adjusted a schema field to match `API_CONTRACT.md`

Current decisions:

- root route `/` is the public landing page
- authenticated users visiting `/` should redirect to `/documents`
- the Figma export remains reference-only and is not treated as source code
- protected route access is handled server-side without edge middleware
- protected app pages should share one sidebar and page-header pattern
- chat sessions are managed through `/api/chat/sessions`, and grounded responses are generated through `POST /api/chat`
- the Phase 9 chat UI intentionally ships as a shell with message history and session management only
- LangSmith tracing uses the official JS SDK and should no-op cleanly when `LANGSMITH_TRACING` is disabled

---

## Active Risks Or Blockers

Use this section to track anything that could slow implementation.

Current risks:

- sandboxed runtime verification cannot complete auth/upload/chat flows because outbound requests to Supabase fail with `EACCES`

---

## Handoff Notes For Future Codex Chats

When resuming work:

1. read `IMPLEMENTATION_PHASES.md`
2. read this tracker
3. check any newer design-reference assets or Figma exports
4. continue from the current phase unless a blocker or explicit user direction changes the plan

# LexiVault Implementation Phases

## Purpose

This file is the execution guide for building LexiVault.

It is meant to help any future Codex chat quickly understand:

- what order implementation should follow
- what is included in each phase
- what must be completed before moving forward
- what is intentionally deferred

This file is implementation-focused.

For product scope, API behavior, and UI direction, also refer to:

- [API_CONTRACT.md](/C:/Users/MohammedUmar/Desktop/lexivault/docs/product/API_CONTRACT.md)
- [CODING_RULES.md](/C:/Users/MohammedUmar/Desktop/lexivault/docs/execution/CODING_RULES.md)
- [UI_MASTER_SPEC.md](/C:/Users/MohammedUmar/Desktop/lexivault/docs/design/UI_MASTER_SPEC.md)

---

## Ground Rules

The implementation must preserve these decisions:

- Next.js App Router only
- TypeScript everywhere
- Supabase for auth, database, and storage
- Pinecone for vectors
- Gemini for chat and embeddings
- LangChainJS for PDF loading and chunking
- LangSmith for tracing
- One user = one private data boundary
- One Pinecone namespace per user
- Text-based PDFs only in MVP
- No OCR in MVP
- No multi-provider LLM support in MVP
- No hybrid search, reranking, or agentic workflows in MVP

---

## Recommended Build Order

Build in this order so the app remains testable at every stage:

1. App foundation
2. Public landing page
3. Auth and route protection
4. Database and Supabase setup
5. UI shell and shared components
6. Configuration flow
7. Documents list and upload UI
8. PDF ingestion pipeline
9. Chunks viewer
10. Chat sessions and chat UI
11. RAG chat backend
12. Source citations and polish
13. LangSmith tracing and final QA

---

## Phase 0: Project Foundation

### Goal

Create a clean, stable starting point for the app.

### Deliverables

- initialize or validate Next.js app structure
- confirm TypeScript, Tailwind, and App Router setup
- configure base folder structure from `CODING_RULES.md`
- install only necessary MVP dependencies
- create baseline environment variable documentation
- add global styling foundation based on `UI_MASTER_SPEC.md`

### Exit Criteria

- app runs locally
- folder structure is stable
- global styles and base theme tokens exist
- no placeholder architecture conflicts remain

### Notes

Do not start with business logic before the app shell is clean.

---

## Phase 1: Public Landing Page

### Goal

Create the public entry point for the product.

### Deliverables

- landing page at `/`
- public navigation with signup and login entry points
- hero, features, trust, and CTA sections
- authenticated redirect from `/` to `/documents`
- design aligned with `UI_MASTER_SPEC.md` and Figma references

### Exit Criteria

- unauthenticated users can understand the product from `/`
- CTAs route correctly
- authenticated users do not remain on the public landing page

### Notes

This page should stay focused on product clarity, not broad marketing sprawl.

---

## Phase 2: Authentication And Route Protection

### Goal

Get secure user access working first.

### Deliverables

- Supabase browser, server, and admin helpers
- signup page at `/signup`
- login page at `/login`
- logout action
- protected layout behavior
- redirect unauthenticated users away from protected pages
- redirect authenticated users away from auth pages

### Related Pages

- `/login`
- `/signup`

### Exit Criteria

- signup works
- login works
- logout works
- protected pages require authentication
- auth pages redirect logged-in users to `/documents`

### Notes

Until auth works, avoid deeper feature implementation.

---

## Phase 3: Database Schema And RLS

### Goal

Create the storage model that all later features depend on.

### Deliverables

- Supabase tables:
  - `user_configs`
  - `documents`
  - `document_chunks`
  - `chat_sessions`
  - `chat_messages`
- timestamps and constraints
- row level security policies
- user-scoped read/write behavior
- storage bucket strategy for PDFs

### Exit Criteria

- tables exist
- RLS is enabled
- user isolation is enforced
- storage path strategy is defined as `{user_id}/{document_id}/{file_name}`

### Notes

If schema decisions conflict with older planning docs, follow the stricter contract docs.

---

## Phase 4: Shared App Shell And Reusable UI

### Goal

Create the reusable visual foundation before feature pages multiply.

### Deliverables

- protected app layout
- sidebar navigation
- page header component
- shared card, alert, dialog, and empty state patterns
- theme tokens based on the logo-inspired UI direction
- typography and spacing rules applied globally

### Related Areas

- Landing Page
- Documents
- Chat
- Configuration

### Exit Criteria

- all protected pages can plug into one consistent layout
- sidebar navigation works
- shared states for loading, empty, and error are reusable

### Notes

This phase should make later UI implementation faster and more consistent.

---

## Phase 5: Configuration Feature

### Goal

Allow users to save and manage their Gemini configuration.

### Deliverables

- `/config` page
- config form UI
- `GET /api/config`
- `POST /api/config`
- zod validation for config input
- secure handling of saved API key
- API response normalization

### Required Behavior

- never return raw Gemini API key
- show only whether a key exists
- keep model fields fixed for MVP:
  - `gemini-2.5-flash`
  - `text-embedding-004`

### Exit Criteria

- user can save config
- user can reload config state
- frontend never displays stored raw API key

### Notes

This phase must finish before document ingestion or chat.

---

## Phase 6: Documents Page And Upload UX

### Goal

Build the visible document management workflow before wiring full ingestion.

### Deliverables

- `/documents` page
- upload card UI
- documents table UI
- status badge component
- delete confirmation dialog
- document fetching via `GET /api/documents`
- document deletion via `DELETE /api/documents/[documentId]`
- signed URL action via `GET /api/documents/[documentId]/signed-url`

### Required States

- empty documents state
- upload loading state
- upload failure state
- missing config warning state

### Exit Criteria

- user can view document list
- delete flow works at UI level
- signed URL flow works once files exist
- layout matches the design direction

### Notes

At this phase the upload UI can exist before full ingestion is complete, but not be marked done until processing works.

---

## Phase 7: PDF Ingestion Pipeline

### Goal

Turn uploaded text-based PDFs into retrievable chunks.

### Deliverables

- `POST /api/documents/upload`
- PDF validation
- document row creation with `processing` status
- Supabase Storage upload
- PDF text extraction
- OCR rejection path for low-text PDFs
- chunking with `RecursiveCharacterTextSplitter`
- Gemini embeddings generation
- Pinecone upsert using `namespace = user.id`
- `document_chunks` persistence
- final document status update to `ready` or `failed`

### Required Rules

- file type must be PDF
- max file size is 20MB
- reject scanned/image-based PDFs
- store user-scoped metadata only

### Exit Criteria

- valid PDF upload completes end-to-end
- chunks are stored in Supabase
- vectors are stored in Pinecone
- failed PDFs show useful error messages

### Notes

This phase is one of the highest-risk areas. Keep implementation simple and observable.

---

## Phase 8: Document Chunks Viewer

### Goal

Let the user inspect what the ingestion pipeline produced.

### Deliverables

- `/documents/[documentId]/chunks`
- `GET /api/documents/[documentId]/chunks`
- document summary card
- chunk list UI
- pagination if needed
- expand/collapse for long chunk text

### Exit Criteria

- user can open a document and inspect its chunks
- chunk metadata is visible and readable
- only user-owned active documents are accessible

### Notes

This page is important for debugging ingestion quality and building trust.

---

## Phase 9: Chat Sessions And Chat UI

### Goal

Build the conversational shell before final RAG logic is wired in.

### Deliverables

- `/chat` page
- chat sessions sidebar
- new chat flow
- session deletion flow
- message list UI
- composer UI
- empty states for:
  - no sessions
  - no documents
  - missing config
- `GET /api/chat/sessions`
- `POST /api/chat/sessions`
- `PATCH /api/chat/sessions/[sessionId]`
- `DELETE /api/chat/sessions/[sessionId]`
- `GET /api/chat/sessions/[sessionId]/messages`

### Exit Criteria

- user can create a session
- user can load a session
- user can see stored messages
- page layout is stable and usable

### Notes

Keep the initial chat UX clean. Do not overbuild controls beyond the MVP.

---

## Phase 10: RAG Chat Backend

### Goal

Make chat actually answer from the user’s uploaded documents.

### Deliverables

- `POST /api/chat`
- user/session ownership validation
- config existence validation
- user message persistence
- recent message loading
- query embedding generation
- Pinecone similarity retrieval
- active document filtering
- prompt construction using:
  - system prompt
  - grounding rule
  - recent messages
  - retrieved chunks
  - current question
- Gemini completion call
- assistant message persistence with sources
- chat session title update for new chats

### Required Rules

- use top `5` chunks
- use last `10` messages
- answer only from retrieved context
- fallback answer when context is missing:
  - `I could not find this information in your uploaded documents.`

### Exit Criteria

- user can ask a question and receive a grounded answer
- sources are stored and returned
- deleted documents are excluded from usable context

### Notes

Streaming is optional. It should not block MVP completion.

---

## Phase 11: Source Citations And UX Polish

### Goal

Make the product trustworthy and pleasant to use.

### Deliverables

- source citation UI under assistant answers
- improved error copy
- better loading and empty states
- toasts for major success actions
- confirmation dialogs polished
- final status badge and table polish
- UI alignment with Figma references and `UI_MASTER_SPEC.md`

### Exit Criteria

- sources are readable and useful
- major user flows feel coherent
- the app no longer feels like an unfinished prototype

### Notes

This is polish, but it is meaningful polish, not decorative work.

---

## Phase 12: LangSmith And Final Verification

### Goal

Add observability and confirm the MVP works end-to-end.

### Deliverables

- LangSmith tracing wired through environment-based config
- ingestion tracing
- retrieval tracing
- Gemini response tracing
- manual QA across all major flows
- final cleanup of obvious UX and error issues

### Required Manual Verification

- signup
- login
- logout
- config save
- valid PDF upload
- invalid/scanned PDF failure
- documents list
- signed PDF view
- chunks page
- soft delete document
- chat session creation
- chat question/answer flow
- citation display
- deleted documents excluded from retrieval

### Exit Criteria

- end-to-end MVP flow is working
- traces are visible
- no major blockers remain for demo or internal use

---

## Deferred To Later Phases

These should not block the MVP:

- OCR support
- MCP integration
- multi-provider model support
- hybrid search
- reranking
- agentic workflows
- billing
- shared workspaces
- admin dashboard
- public sharing
- advanced analytics

---

## Source Of Truth Priority

If multiple docs disagree, follow this priority:

1. `API_CONTRACT.md`
2. `CODING_RULES.md`
3. `UI_MASTER_SPEC.md`
4. `ARCHITECTURE.md`
5. `FRONTEND.md`
6. `plan.md`
7. `project_doc.md`

### Important Current Alignment

For MVP, use:

- upload route: `POST /api/documents/upload`
- Gemini model: `gemini-2.5-flash`
- embedding model: `text-embedding-004`
- no OCR

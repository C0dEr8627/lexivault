# LexiVault

LexiVault is a private document memory platform built with Next.js App Router, Supabase, Gemini, Pinecone, and LangSmith.

It lets a user:

- upload text-based PDFs
- process them into searchable chunks
- ask grounded questions in chat
- inspect citations and extracted chunks
- manage configuration per account

Phase 1 of the implementation is complete, and the project now has a polished public landing page, authentication, protected app shell, configuration workflow, document management, and a chat experience that is wired for RAG.

## What It Does

- Private, user-scoped PDF ingestion
- Gemini-powered chat with document grounding
- Pinecone-backed vector retrieval
- LangSmith tracing for observability
- Supabase authentication, storage, and persistence
- Configurable Gemini, LangSmith, and Pinecone settings per user

## Current MVP Scope

LexiVault intentionally stays focused on the MVP path:

- text-based PDFs only
- no OCR
- one user = one private data boundary
- one Pinecone namespace per user
- no multi-provider LLM support
- no reranking or hybrid search
- no agentic workflows

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Supabase Auth, Database, and Storage
- Gemini for chat and embeddings
- Pinecone for vector search
- LangSmith for tracing
- Zod for validation

## Core Features

### Public Experience

- branded landing page
- auth entry points for sign in and sign up
- authenticated redirect behavior

### Authentication

- email/password sign up and sign in
- logout
- protected routes
- auth-aware redirects

### Configuration

- save Gemini API key securely
- save LangSmith API key and project name
- manage Pinecone API key and index name
- select Gemini chat model from a custom dropdown
- show a fixed embedding model for Pinecone compatibility

### Documents

- upload PDF documents
- track processing state in real time
- view uploaded documents in a table
- open PDF preview and chunk viewer
- soft delete documents

### Chat

- create and manage chat sessions
- grounded responses from uploaded documents
- source citations under assistant answers
- session deletion
- empty states for missing config, no documents, and no sessions

## Repository Structure

```text
app/            Next.js routes, layouts, and global styling
assets/         Brand and UI image assets
components/     Reusable UI and feature components
docs/          Product, design, and execution documentation
lib/           Server helpers, services, validation, and utilities
supabase/      Database migrations and related SQL
types/         Shared TypeScript types
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the required values.

### 3. Run the app in development

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

### 5. Start the production server

```bash
npm run start
```

## Environment Variables

See [.env.example](./.env.example) and [`docs/execution/ENVIRONMENT.md`](./docs/execution/ENVIRONMENT.md) for the full list.

### Public App Settings

- `NEXT_PUBLIC_APP_URL`

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

### AI And Retrieval

- `GEMINI_API_KEY`
- `GEMINI_EMBEDDING_DIMENSION`
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `LANGSMITH_API_KEY`
- `LANGSMITH_PROJECT`
- `LANGSMITH_TRACING`
- `LANGSMITH_ENDPOINT`

### Optional Security

- `CONFIG_ENCRYPTION_SECRET`

## Scripts

- `npm run dev` - start the Next.js development server
- `npm run build` - create an optimized production build
- `npm run start` - run the production build locally

## Documentation

Useful project docs:

- [`docs/execution/IMPLEMENTATION_PHASES.md`](./docs/execution/IMPLEMENTATION_PHASES.md)
- [`docs/execution/IMPLEMENTATION_TRACKER.md`](./docs/execution/IMPLEMENTATION_TRACKER.md)
- [`docs/execution/CODING_RULES.md`](./docs/execution/CODING_RULES.md)
- [`docs/execution/ENVIRONMENT.md`](./docs/execution/ENVIRONMENT.md)
- [`docs/design/UI_MASTER_SPEC.md`](./docs/design/UI_MASTER_SPEC.md)
- [`docs/product/API_CONTRACT.md`](./docs/product/API_CONTRACT.md)

## Implementation Status

- Phase 0: complete
- Phase 1: complete
- Phase 2: complete
- Phase 3: complete
- Phase 4: complete
- Phase 5: complete
- Phase 6: complete
- Phase 7: complete
- Phase 8: complete
- Phase 9: complete
- Phase 10: complete
- Phase 11: complete
- Phase 12: in progress

For the latest development progress, use the implementation tracker:

- [`docs/execution/IMPLEMENTATION_TRACKER.md`](./docs/execution/IMPLEMENTATION_TRACKER.md)

## Notes

- The Figma export folder is reference-only.
- UI styling and interaction details should follow the design docs and current implementation tracker.
- Use the tracker and phase docs as the source of truth for implementation order.

# LexiVault Environment Variables

This file records the baseline environment variables needed for the MVP.

Use [`/.env.example`](/C:/Users/MohammedUmar/Desktop/lexivault/.env.example) as the local starting point.

## Public App Settings

- `NEXT_PUBLIC_APP_URL`
  - Base URL for local development and later deployment.

## Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
  - Public Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Browser-safe Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY`
  - Server-only key for privileged storage or admin operations.
- `SUPABASE_STORAGE_BUCKET`
  - Name of the bucket used for uploaded PDFs.

## AI And Retrieval

- `GEMINI_API_KEY`
  - Server-side Gemini API key for assistant and embedding operations.
- `GEMINI_EMBEDDING_DIMENSION`
  - Output vector size requested from Gemini embeddings. Keep this aligned with your Pinecone index dimension.
- `PINECONE_API_KEY`
  - Server-side Pinecone API key.
- `PINECONE_INDEX_NAME`
  - Pinecone index used for per-user namespaces.
- `LANGSMITH_API_KEY`
  - LangSmith tracing key.
- `LANGSMITH_PROJECT`
  - LangSmith project name.
- `LANGSMITH_TRACING`
  - Enables or disables tracing.
- `LANGSMITH_ENDPOINT`
  - Optional LangSmith API base URL when using a non-default endpoint.

## Optional Security

- `CONFIG_ENCRYPTION_SECRET`
  - Optional server-side secret for encrypting stored Gemini keys.

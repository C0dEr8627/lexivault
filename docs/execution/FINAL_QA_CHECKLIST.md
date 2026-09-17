# LexiVault Final QA Checklist

Last updated: `2026-06-23`

## Automated Verification

- `npm run build`
- `GET /api/health`

## Manual Verification

- sign up
- login
- logout
- save configuration
- upload valid text-based PDF
- upload invalid or scanned PDF and confirm readable failure
- verify processed document appears in documents table
- open signed PDF
- open chunks viewer
- create chat session
- send grounded question
- confirm source citations appear under assistant answer
- delete chat session
- delete document and confirm it is removed from future retrieval

## Tracing Verification

- confirm `LANGSMITH_TRACING=true`
- confirm `LANGSMITH_API_KEY` is set
- confirm traces land in the configured `LANGSMITH_PROJECT`
- confirm document upload creates nested ingestion traces
- confirm chat requests create retrieval and Gemini generation traces

## Notes

- LangSmith remains server-only and is never exposed in frontend state.
- If `LANGSMITH_TRACING` is disabled, the app should continue working without tracing.

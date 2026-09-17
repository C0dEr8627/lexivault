# FRONTEND.md

# LexiVault Frontend Implementation Guide

## 1. Purpose

This document defines how the LexiVault frontend should be implemented.

It focuses on routes, components, state, user flows, and frontend behavior.

---

## 2. Frontend Stack

Use:

```txt
Next.js App Router
TypeScript
Tailwind CSS
Shadcn UI
Lucide React
```

Do not use:

```txt
Redux
Pages Router
Unnecessary animation libraries
Client-side AI SDK calls
```

---

## 3. Route Map

Public routes:

```txt
/
/login
/signup
```

Protected routes:

```txt
/documents
/documents/[documentId]/chunks
/config
/chat
```

API routes are defined separately in `API_CONTRACT.md`.

---

## 4. App Navigation

The root route `/` is the public landing page.

After login, redirect to:

```txt
/documents
```

If unauthenticated user visits protected pages, redirect to:

```txt
/login
```

If authenticated user visits login/signup, redirect to:

```txt
/documents
```

If authenticated user visits `/`, redirect to:

```txt
/documents
```

---

## 5. Layout

Protected app layout:

```txt
Sidebar
Main content
```

Sidebar items:

```txt
Documents
Chat
Configuration
```

Sidebar bottom:

```txt
User email
Logout button
```

---

## 6. Component Structure

Recommended components:

```txt
components/marketing/landing-header.tsx
components/marketing/landing-hero.tsx
components/marketing/feature-section.tsx
components/marketing/trust-section.tsx
components/marketing/landing-footer.tsx

components/layout/app-sidebar.tsx
components/layout/protected-layout.tsx
components/layout/page-header.tsx

components/auth/login-form.tsx
components/auth/signup-form.tsx

components/documents/document-upload-card.tsx
components/documents/documents-table.tsx
components/documents/document-status-badge.tsx
components/documents/delete-document-dialog.tsx

components/chunks/chunk-card.tsx
components/chunks/chunk-list.tsx

components/config/config-form.tsx

components/chat/chat-sidebar.tsx
components/chat/chat-session-list.tsx
components/chat/chat-message-bubble.tsx
components/chat/chat-composer.tsx
components/chat/source-citation-list.tsx
components/chat/empty-chat-state.tsx
```

---

## 7. Frontend Data Types

Use shared types from:

```txt
types/documents.ts
types/chat.ts
types/config.ts
types/api.ts
```

Do not duplicate types in components.

---

## 8. API Client Pattern

Create simple frontend fetch helpers.

Suggested file:

```txt
lib/client/api-client.ts
```

Responsibilities:

- Call app API routes
- Parse JSON
- Throw readable errors
- Keep components cleaner

Example shape:

```ts
export async function apiGet<T>(url: string): Promise<T> {}
export async function apiPost<T>(url: string, body: unknown): Promise<T> {}
export async function apiDelete<T>(url: string): Promise<T> {}
```

Do not put business logic in the API client.

---

## 9. Landing Page

Path:

```txt
/
```

Components:

```txt
LandingHeader
LandingHero
FeatureSection
TrustSection
LandingFooter
```

Behavior:

- unauthenticated users can browse
- primary CTA routes to `/signup`
- secondary CTA routes to `/login`
- authenticated users redirect to `/documents`

---

## 10. Auth Pages

## 10.1 Login

Path:

```txt
/login
```

Component:

```txt
LoginForm
```

Fields:

```txt
Email
Password
```

Actions:

```txt
Sign in
Go to signup
```

On success:

```txt
router.push("/documents")
```

---

## 10.2 Signup

Path:

```txt
/signup
```

Component:

```txt
SignupForm
```

Fields:

```txt
Email
Password
Confirm Password
```

Validation:

```txt
Email required
Password required
Confirm password must match
```

On success:

```txt
router.push("/documents")
```

---

## 11. Documents Page

Path:

```txt
/documents
```

Components:

```txt
PageHeader
DocumentUploadCard
DocumentsTable
```

---

## 11.1 Document Upload Behavior

User selects PDF and clicks upload.

Frontend sends:

```txt
POST /api/documents/upload
multipart/form-data
```

While uploading:

- Disable upload button
- Show progress/loading state
- Show `Uploading and processing...`

After success:

- Show toast
- Refresh document list

After failure:

- Show readable error

---

## 11.2 Document Table Behavior

Fetch:

```txt
GET /api/documents
```

Display:

```txt
File Name
Status
Chunk Count
Uploaded Date
Actions
```

Actions:

### View PDF

Call:

```txt
GET /api/documents/[documentId]/signed-url
```

Open returned signed URL in new tab.

### View Chunks

Navigate:

```txt
/documents/[documentId]/chunks
```

### Delete

Open confirmation dialog.

On confirm:

```txt
DELETE /api/documents/[documentId]
```

Refresh list.

---

## 12. Chunks Page

Path:

```txt
/documents/[documentId]/chunks
```

Fetch:

```txt
GET /api/documents/[documentId]/chunks
```

Display:

- Document summary
- Chunk list
- Pagination if implemented
- Back to documents button

Each chunk card:

```txt
Chunk #n
Token count
Content preview
Expand/collapse
```

---

## 13. Configuration Page

Path:

```txt
/config
```

Fetch on load:

```txt
GET /api/config
```

Submit:

```txt
POST /api/config
```

Fields:

```txt
Gemini API Key
Gemini Model
Embedding Model
System Prompt
```

MVP behavior:

- Gemini model is fixed to `gemini-2.5-flash`
- Embedding model is fixed to `text-embedding-004`
- Model fields can be disabled/read-only
- API key field must never show saved raw key

If API key exists, show:

```txt
A Gemini API key is already saved. Enter a new key only if you want to replace it.
```

---

## 14. Chat Page

Path:

```txt
/chat
```

Layout:

```txt
ChatSidebar
MainChatArea
ChatComposer
```

---

## 14.1 Initial Load

Fetch sessions:

```txt
GET /api/chat/sessions
```

If sessions exist:

- Select latest updated session

If no sessions:

- Show empty state with New Chat button

---

## 14.2 New Chat

Call:

```txt
POST /api/chat/sessions
```

Request:

```json
{
  "title": "New Chat"
}
```

Set returned session as active.

---

## 14.3 Load Messages

When active session changes:

```txt
GET /api/chat/sessions/[sessionId]/messages
```

Render message list.

---

## 14.4 Send Message

When user sends message:

```txt
POST /api/chat
```

Request:

```json
{
  "sessionId": "uuid",
  "message": "Question text"
}
```

Optimistic behavior:

1. Add user message locally.
2. Show assistant loading state.
3. Replace loading state with API response.

If API fails:

- Remove loading state
- Show error alert/toast
- Keep user message visible

---

## 14.5 Composer Behavior

Enter:

```txt
Send message
```

Shift+Enter:

```txt
New line
```

Disable send button if:

```txt
No active session
Input empty
Request loading
```

---

## 14.6 Sources Display

For assistant messages, if sources exist:

Show collapsible source list.

Each source:

```txt
Document name
Chunk number
Snippet
```

If no sources and answer is fallback, do not show empty sources box.

---

## 15. Frontend State Management

Use local React state.

Do not use Redux.

Recommended state per page:

### Landing Page

```txt
No complex client state required for MVP
```

### Documents Page

```txt
documents
isLoading
isUploading
error
```

### Config Page

```txt
config
isLoading
isSaving
error
```

### Chat Page

```txt
sessions
activeSessionId
messages
isLoadingSessions
isLoadingMessages
isSending
error
```

---

## 16. Loading States

Use skeleton loaders for:

- Documents table
- Chat sessions
- Messages
- Chunks

Use button loading text for:

- Upload
- Save config
- Send message
- Login
- Signup

---

## 17. Error Handling

Display user-friendly errors.

Examples:

```txt
Please add your Gemini API key before uploading documents.
This PDF appears to be scanned or image-based. OCR is not supported in the MVP.
The assistant could not generate a response. Please check your Gemini API key and try again.
```

Do not display stack traces.

---

## 18. Empty States

## Landing Page

```txt
The landing page should not depend on an empty state. It should always present core product messaging and calls to action.
```

## Documents

```txt
No documents uploaded yet.
Upload your first PDF to start building your private document memory.
```

## Chunks

```txt
No chunks found for this document.
```

## Chat

```txt
Start chatting with your documents.
Create a new chat to ask questions grounded in your uploaded PDFs.
```

## Sessions

```txt
No chats yet.
Start a new chat.
```

---

## 19. Form Validation

Client-side validation improves UX, but server-side validation remains mandatory.

Validate:

- Email format
- Password required
- Confirm password matches
- PDF selected
- PDF mime type
- Gemini API key present when saving
- Chat message not empty

---

## 20. Frontend Security Rules

Frontend must not:

- Store Gemini key in localStorage
- Store API keys in browser state longer than form submission
- Call Gemini directly
- Call Pinecone directly
- Display raw Gemini key after saving
- Accept user_id from user input

---

## 21. MVP Frontend Success Criteria

Frontend is complete when:

- Landing page explains the product clearly
- Auth pages work
- Protected layout works
- User can save config
- User can upload PDF
- User can see documents
- User can view chunks
- User can soft delete documents
- User can create chat sessions
- User can send messages
- Assistant responses appear
- Source citations appear
- Loading/error/empty states exist

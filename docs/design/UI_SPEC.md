# UI_SPEC.md

# LexiVault UI Specification

## Purpose

This document defines the UI structure for LexiVault.

Codex must follow this UI specification and must not invent unrelated screens or major layout changes.

The UI should be clean, modern, and product-like.

---

# Product Name

```txt
LexiVault
```

---

# Tagline

```txt
Intelligent Document Memory System
```

---

# Visual Direction

## Style

- Modern SaaS dashboard
- Clean and minimal
- Calm professional look
- Rounded cards
- Clear empty states
- Good loading states
- Good error states

## Recommended UI Stack

- Tailwind CSS
- Shadcn UI
- Lucide React icons

## Color Direction

Use a neutral base with a blue/purple accent.

Do not over-design.

Focus on clarity.

---

# Global Layout

## Authenticated App Layout

All protected pages should use the same layout:

```txt
Sidebar navigation
Main content area
Top header area
```

---

## Sidebar Navigation

Items:

```txt
Documents
Chat
Configuration
```

Optional bottom area:

```txt
User email
Logout button
```

---

## Main Header

Each page should have:

- Page title
- Short description
- Primary action button when relevant

---

# Public Pages

---

# 1. Landing Page

Path:

```txt
/
```

## Goal

Explain the product clearly and direct users into signup or login.

## Layout

- Top navigation
- Hero section
- Features section
- How it works section
- Privacy / trust section
- Final CTA
- Footer

## Elements

- LexiVault logo/text
- Tagline
- Main headline
- Short product description
- Primary CTA: `Get started`
- Secondary CTA: `Sign in`
- Product preview or stylized app mockup

## Behavior

- Unauthenticated users can browse this page
- `Get started` goes to `/signup`
- `Sign in` goes to `/login`
- Authenticated users visiting `/` should redirect to `/documents`

## Notes

This should be a focused product landing page, not a generic marketing site.

---

# 2. Signup Page

Path:

```txt
/signup
```

## Goal

Allow a new user to create an account.

## Layout

Centered auth card.

## Elements

- LexiVault logo/text
- Heading: `Create your LexiVault account`
- Email input
- Password input
- Confirm password input
- Signup button
- Link to login page

## States

### Loading

Button text:

```txt
Creating account...
```

### Error

Show error alert above form.

### Success

Redirect to:

```txt
/documents
```

---

# 3. Login Page

Path:

```txt
/login
```

## Goal

Allow existing user to sign in.

## Layout

Centered auth card.

## Elements

- LexiVault logo/text
- Heading: `Welcome back`
- Email input
- Password input
- Login button
- Link to signup page

## States

### Loading

Button text:

```txt
Signing in...
```

### Error

Show error alert above form.

### Success

Redirect to:

```txt
/documents
```

---

# Protected Pages

---

# 4. Documents Page

Path:

```txt
/documents
```

## Goal

Upload, view, and manage user's PDF documents.

## Header

Title:

```txt
Documents
```

Description:

```txt
Upload PDFs and turn them into a private searchable knowledge base.
```

---

## Sections

### A. Upload Card

Components:

- File picker
- Upload button
- Helper text

Helper text:

```txt
Only text-based PDFs are supported in this MVP. Scanned PDFs and OCR are not supported yet.
```

Allowed file type:

```txt
PDF only
```

Max file size:

```txt
20MB
```

---

### B. Documents Table

Columns:

```txt
File Name
Status
Chunks
Uploaded At
Actions
```

---

## Status Badges

Use these badges:

```txt
processing  = yellow badge
ready       = green badge
failed      = red badge
deleted     = gray badge
```

---

## Actions

For each document:

### View PDF

Opens signed URL in new tab.

Disabled if status is failed or deleted.

### View Chunks

Navigates to:

```txt
/documents/[documentId]/chunks
```

Disabled unless status is ready.

### Delete

Soft deletes document.

Show confirmation dialog before delete.

Confirmation text:

```txt
This will remove the document from future chat retrieval. The original record will be kept for audit purposes.
```

---

## Empty State

If no documents exist:

Title:

```txt
No documents uploaded yet
```

Description:

```txt
Upload your first PDF to start building your private document memory.
```

CTA:

```txt
Upload PDF
```

---

## Error States

If upload fails because OCR is needed:

```txt
This PDF appears to be scanned or image-based. OCR is not supported in the MVP.
```

If config is missing:

```txt
Please add your Gemini API key in Configuration before uploading documents.
```

---

# 5. Chunks Page

Path:

```txt
/documents/[documentId]/chunks
```

## Goal

Allow user to inspect generated chunks for a document.

## Header

Title:

```txt
Document Chunks
```

Description:

```txt
Review the text chunks created from this document.
```

## Top Card

Show:

```txt
File Name
Status
Chunk Count
Uploaded Date
```

---

## Chunk List

Each chunk appears as a card.

Each card shows:

```txt
Chunk #1
Token Count
Chunk Text
```

If chunk is long, show first 800 characters with expand/collapse.

---

## Actions

- Back to Documents
- View PDF

---

## Empty State

```txt
No chunks found for this document.
```

---

# 6. Configuration Page

Path:

```txt
/config
```

## Goal

Allow user to configure Gemini key and prompt.

## Header

Title:

```txt
Configuration
```

Description:

```txt
Manage your Gemini settings and document assistant behavior.
```

---

## Fields

### Gemini API Key

Input type:

```txt
password
```

Label:

```txt
Gemini API Key
```

Placeholder:

```txt
Enter your Gemini API key
```

Important:

- Never display saved raw API key.
- If key exists, show helper text:

```txt
A Gemini API key is already saved. Enter a new key only if you want to replace it.
```

---

### Gemini Model

For MVP, fixed value:

```txt
gemini-2.5-flash
```

UI can show disabled select or read-only input.

---

### Embedding Model

For MVP, fixed value:

```txt
text-embedding-004
```

UI can show disabled select or read-only input.

---

### System Prompt

Textarea.

Default value:

```txt
You are a document assistant.

Answer only using the provided document context.

If the answer cannot be found in the documents, say:

"I could not find this information in your uploaded documents."

Do not invent information.
```

---

## Buttons

```txt
Save Configuration
```

---

## States

### Loading

```txt
Saving...
```

### Success

Toast:

```txt
Configuration saved.
```

### Error

Show alert with error message.

---

# 7. Chat Page

Path:

```txt
/chat
```

## Goal

Provide a ChatGPT-style interface for chatting with uploaded documents.

---

## Layout

Two-column layout.

```txt
Left sidebar: chat sessions
Right main area: active chat
```

---

## Left Sidebar

Components:

- New Chat button
- Chat session list
- Session title
- Last updated date
- Delete session button

---

## Main Chat Area

Components:

- Empty state if no active chat
- Message list
- Source citations below assistant messages
- Input composer at bottom

---

## New Chat Behavior

When user clicks New Chat:

1. Create session via `/api/chat/sessions`.
2. Set it as active session.
3. Show empty message area.

---

## Message Bubble Design

### User Message

- Right aligned
- Label optional
- Simple bubble

### Assistant Message

- Left aligned
- Markdown formatted
- Sources below answer

---

## Sources UI

Below each assistant message, show collapsible section:

Title:

```txt
Sources
```

Each source card shows:

```txt
Document name
Chunk number
Snippet
```

Example:

```txt
Employee_Handbook.pdf
Chunk 12
Employees are eligible for paid leave...
```

---

## Chat Input

Elements:

- Textarea
- Send button

Placeholder:

```txt
Ask a question about your uploaded documents...
```

---

## Chat Rules in UI

Before sending a message:

- Require active chat session.
- Require non-empty input.
- Disable send while response is loading.

---

## Empty Chat State

If no session selected:

Title:

```txt
Start chatting with your documents
```

Description:

```txt
Create a new chat to ask questions grounded in your uploaded PDFs.
```

CTA:

```txt
New Chat
```

---

## No Documents State

If user has no ready documents:

Show warning:

```txt
Upload and process at least one PDF before asking questions.
```

CTA:

```txt
Go to Documents
```

---

## Missing Config State

If user has not added Gemini API key:

Show warning:

```txt
Add your Gemini API key before using chat.
```

CTA:

```txt
Go to Configuration
```

---

## Loading State

When assistant is generating:

```txt
Thinking with your documents...
```

---

## Failure State

If Gemini fails:

```txt
The assistant could not generate a response. Please check your Gemini API key and try again.
```

If retrieval finds no chunks:

```txt
I could not find this information in your uploaded documents.
```

---

# 8. Root Route Behavior

No separate dashboard is required for MVP.

The root route `/` is the public landing page.

After login, redirect to:

```txt
/documents
```

---

# Reusable Components

Codex should create reusable components where practical.

## Suggested Components

```txt
AppSidebar
LandingHeader
LandingHero
FeatureSection
TrustSection
LandingFooter
PageHeader
LoadingButton
EmptyState
ErrorAlert
DocumentUploadCard
DocumentsTable
StatusBadge
ChunkCard
ConfigForm
ChatSidebar
ChatMessageBubble
SourceCitationList
ChatComposer
```

---

# Frontend Data Fetching Rules

Use simple fetch calls or server actions.

Do not over-engineer state management.

Do not add Redux.

Use local React state where enough.

Use URL params for active routes.

---

# UX Quality Rules

Every async operation must have:

- Loading state
- Error state
- Success state where relevant

Every destructive action must have:

- Confirmation dialog

Every empty page must have:

- Helpful empty state
- Clear next action

---

# Accessibility Rules

- Inputs must have labels.
- Buttons must have clear text.
- Use semantic HTML where possible.
- Do not rely only on color for status.
- Keyboard submit should work in chat.

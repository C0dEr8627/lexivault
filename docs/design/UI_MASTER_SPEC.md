# LexiVault UI Master Spec

## Purpose

This file is the single UI source of truth for LexiVault.

It combines the page layouts, visual direction, key MVP behaviors, and interaction rules from the existing project docs into one consolidated reference.

The product should feel:

- secure
- premium
- calm
- intelligent
- document-first

This is a product UI, not a technical demo.

---

## 1. Brand Direction

### Product Name

LexiVault

### Tagline

Intelligent Document Memory System

### Brand Idea

LexiVault should visually suggest:

- a protected vault
- private knowledge storage
- AI-powered document understanding

The logo already sets the tone well, so the UI should extend it rather than fight it.

---

## 2. Visual Theme

### Theme Name

Vault Glow

### Core Look

- light neutral background
- glassy white surfaces
- cobalt and electric blue accents
- violet highlight accents
- subtle metallic and silver-gray neutrals
- soft glows, not heavy neon

### Color Direction From Logo

The logo suggests four main tones:

- deep blue for trust and structure
- bright cyan-blue for energy and clarity
- violet for intelligence and AI flavor
- silver-gray for the vault / premium background

### Recommended Palette

- `Background`: very light silver-gray, almost white
- `Surface`: white with slight translucency
- `Border`: cool gray
- `Text`: slate / graphite
- `Muted text`: blue-gray
- `Primary`: cobalt blue
- `Secondary accent`: violet
- `Highlight`: cyan-blue glow
- `Success`: green
- `Warning`: amber
- `Error`: red

### Color Usage Rules

- Do not use random bright colors.
- Keep the interface mostly neutral.
- Use blue for actions, violet only as an accent.
- Use gradients sparingly, mainly in hero blocks, active states, and logo-adjacent areas.
- Never make the app feel like a neon dashboard.

### Background Style

Use a subtle layered background rather than a flat white canvas:

- soft silver gradient
- faint radial glow behind the logo or page header
- low-contrast patterning or blur shapes only where it adds polish

### Suggested Tailwind Direction

- neutral base: slate / zinc / gray
- primary accent: blue
- secondary accent: violet
- hover states: slightly brighter blue
- active states: blue-to-violet gradient only for emphasis

---

## 3. Typography

### Preferred Feel

Clean, modern, and highly readable.

### Recommended Direction

- sans-serif
- medium-bold headings
- comfortable body size
- strong line height for reading long document content

### Tone

The typography should feel:

- professional
- trusted
- precise
- calm

### Usage Rules

- Page titles should be clearly prominent.
- Body copy should never be cramped.
- Chunk text, sources, and chat messages must stay readable.
- Avoid overly playful typography.

---

## 4. Global Layout

### Public Layout

Public pages can use a lighter marketing shell without the authenticated sidebar.

Recommended structure:

- top navigation
- hero section
- feature sections
- final call-to-action
- simple footer

### Authenticated Layout

All protected pages use the same shell:

- left sidebar navigation
- top page header
- main content area

### Sidebar Width

- desktop: about 260px
- tablet: slightly narrower if needed

### Sidebar Contents

Primary items:

- Documents
- Chat
- Configuration

Bottom area:

- user email
- logout

### Main Header Pattern

Every protected page should have:

- title
- short description
- primary action when relevant

### Responsive Behavior

- desktop: sidebar fixed on the left
- tablet: sidebar can collapse or compress
- mobile: sidebar stacks above content or becomes a drawer

The MVP should be strongest on desktop, but still usable on smaller screens.

---

## 5. Shared UI Rules

### Page States

Every page must have:

- loading state
- empty state
- error state
- success feedback where relevant

### Destructive Actions

Every destructive action requires confirmation.

Examples:

- delete document
- delete chat session

### Feedback

Use:

- toast notifications for success
- alert banners for errors
- skeletons for loading

### No Technical Noise

Do not expose internal implementation language in the UI.

Prefer:

- Upload PDF
- Save Configuration
- Start Chat
- View Chunks

Avoid:

- execute ingestion pipeline
- semantic retrieval
- vectorization

---

## 6. Core Routes And Page Layouts

## 6.1 Landing Page

### Path

`/`

### Goal

Introduce LexiVault, explain the product clearly, and convert visitors into signup or login flows.

### Layout

- top navigation bar
- hero section
- product proof / feature strip
- how-it-works section
- privacy and trust section
- final CTA section
- footer

### Navigation

Top navigation should include:

- logo / wordmark
- Features anchor or section link
- Security or Privacy anchor or section link
- Sign in
- Get started

### Hero Section

The landing page should feel premium and product-led, not like a generic SaaS template.

Hero content should communicate:

- private document intelligence
- grounded answers
- user-owned API key model
- fast path into the app

Suggested content direction:

- headline focused on private document memory
- short supporting paragraph
- primary CTA: `Get started`
- secondary CTA: `Sign in`
- product preview panel or stylized app mockup

### Landing Page Visual Style

- strongest use of the logo-inspired glow system
- silver gradient background with restrained cobalt and violet highlights
- more expressive than the in-app pages
- still clean and trustworthy

### Recommended Sections

#### Features

Communicate:

- upload private PDFs
- inspect chunks
- ask grounded questions
- review source citations

#### How It Works

Simple flow:

- upload
- process
- chat

#### Trust / Privacy

Communicate:

- documents are private per account
- Gemini key is used server-side
- answers are grounded in uploaded documents

### CTA Rules

- unauthenticated user clicking `Get started` goes to `/signup`
- unauthenticated user clicking `Sign in` goes to `/login`
- authenticated user visiting `/` should be redirected to `/documents`

### Notes

This page should sell the product clearly, but it should not become a bloated marketing website.

---

## 6.2 Login Page

### Path

`/login`

### Goal

Allow an existing user to sign in.

### Layout

- centered auth card
- LexiVault logo at the top
- simple form fields
- clean, secure feel

### Elements

- logo / wordmark
- heading: `Welcome back`
- email input
- password input
- sign in button
- link to signup

### Visual Style

- soft silver background
- white card
- faint blue glow behind the card or logo
- subtle border and shadow

### State Copy

- loading: `Signing in...`
- error: clear readable alert

### Success Behavior

Redirect to `/documents`

---

## 6.3 Signup Page

### Path

`/signup`

### Goal

Allow a new user to create an account.

### Layout

- centered auth card
- logo and branding first
- minimal but premium signup form

### Elements

- logo / wordmark
- heading: `Create your LexiVault account`
- email input
- password input
- confirm password input
- create account button
- link to login

### Visual Style

Same base as login, but allow a slightly more welcoming feel:

- a stronger blue-violet glow
- a more generous header area

### State Copy

- loading: `Creating account...`
- error: clear readable alert

### Success Behavior

Redirect to `/documents`

---

## 6.4 Documents Page

### Path

`/documents`

### Goal

Upload, view, and manage PDF documents.

### Header

Title:

`Documents`

Description:

`Upload PDFs and turn them into a private searchable knowledge base.`

### Page Layout

The page should feel like the product home after login.

Recommended structure:

- top header
- upload card
- document list/table

### Upload Card

This should be the most visually prominent card on the page.

Include:

- file picker
- upload button
- helper text

Helper text:

`Only text-based PDFs are supported in this MVP. Scanned PDFs and OCR are not supported yet.`

### Upload Card Visual Style

- slightly elevated white card
- subtle cobalt border or glow when active
- strong primary button
- clear drag-and-drop affordance if implemented

### Documents Table

Columns:

- File Name
- Status
- Chunks
- Uploaded At
- Actions

### Status Badge Colors

- processing: amber or yellow
- ready: green
- failed: red
- deleted: gray

### Document Actions

- View PDF
- View Chunks
- Delete

### Action Rules

- View PDF opens signed URL in a new tab
- View Chunks navigates to the chunk page
- Delete requires confirmation

### Delete Confirmation Copy

`This will remove the document from future chat retrieval. The original record will be kept for audit purposes.`

### Empty State

Title:

`No documents uploaded yet`

Description:

`Upload your first PDF to start building your private document memory.`

CTA:

`Upload PDF`

### Error States

If config is missing:

`Please add your Gemini API key in Configuration before uploading documents.`

If PDF is scanned or image-based:

`This PDF appears to be scanned or image-based. OCR is not supported in the MVP.`

---

## 6.5 Document Chunks Page

### Path

`/documents/[documentId]/chunks`

### Goal

Let the user inspect the chunks generated from a document.

### Header

Title:

`Document Chunks`

Description:

`Review the text chunks created from this document.`

### Page Layout

- summary card at the top
- chunk list below
- back button to return to Documents

### Summary Card

Show:

- file name
- status
- chunk count
- uploaded date

### Chunk Cards

Each chunk should be shown as a card with:

- chunk number
- token count
- content preview
- expand/collapse if content is long

### Chunk Card Style

- plain, readable, content-first
- no decorative complexity
- make long text easy to scan

### Empty State

`No chunks found for this document.`

### Optional Action

- View PDF

---

## 6.6 Configuration Page

### Path

`/config`

### Goal

Let the user manage their Gemini API key and prompt behavior.

### Header

Title:

`Configuration`

Description:

`Manage your Gemini settings and document assistant behavior.`

### Page Layout

- one centered or left-aligned settings card
- clear explanation of BYOK
- simple form, not a dense settings screen

### Fields

#### Gemini API Key

- input type: password
- never display the saved raw key
- if a key exists, show helper text:

`A Gemini API key is already saved. Enter a new key only if you want to replace it.`

#### Gemini Model

For MVP:

- fixed to `gemini-2.5-flash`
- read-only or disabled display

#### Embedding Model

For MVP:

- fixed to `text-embedding-004`
- read-only or disabled display

#### System Prompt

Textarea with a calm, readable writing area.

Default prompt:

`You are a document assistant.`

`Answer only using the provided document context.`

`If the answer cannot be found in the documents, say:`

`"I could not find this information in your uploaded documents."`

`Do not invent information.`

### Buttons

- Save Configuration

### State Copy

- loading: `Saving...`
- success toast: `Configuration saved.`

### Visual Style

- slightly more utility-focused than documents
- still premium, still calm
- no excessive settings clutter

---

## 6.7 Chat Page

### Path

`/chat`

### Goal

Provide a ChatGPT-style experience for asking questions about uploaded documents.

### Layout

Two-column desktop layout:

- left: chat sessions
- right: active conversation

On smaller screens, stack the sidebar above the main chat area.

### Left Sidebar

Include:

- New Chat button
- chat session list
- last updated timestamp
- delete session action

### Main Area

Include:

- message history
- assistant source citations
- composer pinned to the bottom

### Empty Chat State

Title:

`Start chatting with your documents`

Description:

`Create a new chat to ask questions grounded in your uploaded PDFs.`

CTA:

`New Chat`

### No Documents State

`Upload and process at least one PDF before asking questions.`

CTA:

`Go to Documents`

### Missing Config State

`Add your Gemini API key before using chat.`

CTA:

`Go to Configuration`

### Message Bubble Design

#### User Message

- right aligned
- compact
- clean and direct

#### Assistant Message

- left aligned
- slightly larger
- markdown friendly
- more spacious

### Sources Under Assistant Messages

Sources should appear as a collapsible section under assistant answers.

Each source card should show:

- document name
- chunk number
- short snippet

### Source Presentation Tone

Sources should look trustworthy and traceable, not noisy.

### Composer

Include:

- multiline text area
- send button

Placeholder:

`Ask a question about your uploaded documents...`

### Composer Rules

- Enter sends
- Shift+Enter inserts a new line
- disable send when no session exists
- disable send when input is empty
- disable send while a request is in progress

### Loading State

Show:

`Thinking with your documents...`

### Error State

Show:

`The assistant could not generate a response. Please check your Gemini API key and try again.`

If retrieval finds nothing:

`I could not find this information in your uploaded documents.`

---

## 7. Shared Component Direction

These are the reusable UI building blocks the app should rely on.

### Layout

- LandingHeader
- LandingHero
- FeatureSection
- TrustSection
- LandingFooter
- AppSidebar
- ProtectedLayout
- PageHeader

### Auth

- LoginForm
- SignupForm

### Documents

- DocumentUploadCard
- DocumentsTable
- StatusBadge
- DeleteDocumentDialog

### Chunks

- ChunkCard
- ChunkList

### Config

- ConfigForm

### Chat

- ChatSidebar
- ChatSessionList
- ChatMessageBubble
- ChatComposer
- SourceCitationList
- EmptyChatState

### Generic UI

- Button
- Input
- Textarea
- Card
- Badge
- Dialog
- Skeleton
- Alert
- Toast

---

## 8. Loading, Empty, And Error Styling

### Loading

Use skeletons for:

- document table
- chunk list
- chat sessions
- message history

Use button loading labels for:

- upload
- save config
- sign in
- sign up
- send message

### Empty States

Every empty state should contain:

- a title
- a short explanation
- a clear next action

### Error States

Use human-readable text only.

Do not show raw stack traces.

### Success Feedback

Use toast messages for:

- config saved
- document uploaded
- document deleted
- chat session created

---

## 9. Copy Tone

The product voice should sound:

- direct
- secure
- helpful
- calm

Preferred wording:

- Upload PDF
- View Chunks
- Save Configuration
- Ask a question about your documents

Avoid overly technical or internal wording.

---

## 10. Accessibility Rules

- Every input needs a label.
- Every button needs clear text.
- Status must not rely on color alone.
- Dialogs must be keyboard accessible.
- Chat input must support Enter to send.
- Shift+Enter must create a new line.
- Use semantic headings.

---

## 11. Content And Product Boundaries

Do not add screens that are not part of the product:

- analytics dashboard
- theme switcher
- admin console
- team workspace UI
- folders
- billing
- public sharing

Do not overbuild visual polish at the cost of the actual workflow.

The app should feel premium, but the workflow should remain simple.

---

## 12. MVP Success Criteria

The UI is successful if a user can immediately understand how to:

1. understand what LexiVault does from the landing page
2. log in or sign up
3. upload a PDF
4. save Gemini configuration
5. view processing status
6. inspect chunks
7. start a chat
8. ask a question
9. see grounded answers
10. review source citations
11. delete a document safely

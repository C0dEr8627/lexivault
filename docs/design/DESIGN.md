# DESIGN.md

# LexiVault Design Document

## 1. Design Goal

LexiVault should feel like a clean, trustworthy AI SaaS product.

The design should communicate:

- Security
- Intelligence
- Simplicity
- Document-first workflow
- Professional AI assistant experience

Do not make the MVP look like a raw technical demo.

---

## 2. Product Identity

## Name

```txt
LexiVault
```

## Tagline

```txt
Intelligent Document Memory System
```

## Short Description

```txt
Upload private documents and chat with them using grounded AI.
```

## Landing Page Role

LexiVault should have a focused public landing page that explains the product and converts visitors into signup.

This landing page should:

- feel premium and product-led
- explain privacy clearly
- show the core workflow simply
- avoid becoming a bloated marketing website

---

## 3. Design Principles

## 3.1 Clarity First

Every page should immediately answer:

- Where am I?
- What can I do here?
- What should I do next?

---

## 3.2 Trust First

Because users upload private documents and API keys, the UI should feel secure.

Use copy like:

```txt
Your documents are private to your account.
Your Gemini API key is used only server-side.
```

---

## 3.3 No Over-Design

Avoid:

- Excessive animations
- Complex dashboards
- Decorative charts
- Unnecessary gradients everywhere
- Too many colors

---

## 3.4 Strong Empty States

Every empty state should guide the user to the next action.

Example:

```txt
No documents uploaded yet.
Upload your first PDF to start building your private document memory.
```

---

## 4. Visual Style

## Overall Style

```txt
Modern SaaS
Minimal
Calm
Professional
AI-native
```

---

## Color Palette

Use a neutral base with blue/purple accent.

Suggested tokens:

```txt
Background: neutral white or near-white
Surface: white
Border: light neutral gray
Text: dark slate
Muted text: gray
Primary accent: blue/purple
Success: green
Warning: amber
Error: red
```

Do not hardcode too many custom colors. Prefer Tailwind/Shadcn defaults.

---

## Typography

Use clean sans-serif typography.

Recommended:

```txt
Inter
Geist
System font stack
```

Headings should be clear and medium-bold.

Body text should be readable and not too small.

---

## Spacing

Use generous spacing.

Recommended:

```txt
Page padding: 24px to 32px
Card padding: 20px to 24px
Table spacing: comfortable
Chat message spacing: moderate
```

---

## Components

Use Shadcn UI where possible:

```txt
Button
Input
Textarea
Card
Table
Badge
Dialog
Dropdown
ScrollArea
Separator
Toast
Alert
Skeleton
```

---

## 5. App Layout Design

Authenticated pages should use:

```txt
Left Sidebar
Main Content
Top Page Header
```

---

## Sidebar

Width:

```txt
240px to 280px
```

Items:

```txt
Documents
Chat
Configuration
```

Bottom:

```txt
User email
Logout
```

Active item should be visually clear.

---

## Page Header

Each page should have:

```txt
Title
Description
Primary action if needed
```

Example:

```txt
Documents
Upload PDFs and turn them into a private searchable knowledge base.
```

---

## 6. Page-Level Design

## 6.1 Login Page

Design:

- Centered card
- LexiVault name/logo at top
- Email/password form
- Link to signup

Tone:

```txt
Welcome back
```

---

## 6.2 Landing Page

Design:

- Public top navigation
- Strong product hero
- Product preview or visual panel
- Features section
- How-it-works section
- Privacy/trust section
- Final call-to-action

Tone:

```txt
Private document intelligence for your account only
```

The landing page should feel more expressive than the in-app screens, but still calm and trustworthy.

---

## 6.3 Signup Page

Design:

- Centered card
- LexiVault branding
- Email/password/confirm password fields
- Link to login

Tone:

```txt
Create your LexiVault account
```

---

## 6.4 Documents Page

Main sections:

```txt
Upload Card
Documents Table
```

Upload card should be visually prominent because it is the main first action.

Document table should be simple and scannable.

Columns:

```txt
File Name
Status
Chunks
Uploaded At
Actions
```

Actions:

```txt
View PDF
View Chunks
Delete
```

---

## 6.5 Chunks Page

Design:

- Document summary card at top
- Chunk cards below
- Expand/collapse long chunks

Each chunk card should show:

```txt
Chunk number
Token count
Text preview
```

The goal is inspection, not editing.

---

## 6.6 Configuration Page

Design:

- Settings form inside card
- Clear explanation of Gemini BYOK
- Password field for API key
- Read-only model fields for MVP
- System prompt textarea

Important helper text:

```txt
Your Gemini API key is stored for server-side use and is never displayed back in the browser.
```

---

## 6.7 Chat Page

Design should resemble a simple ChatGPT-style layout.

```txt
Left: Chat sessions
Right: Conversation
Bottom: Composer
```

Chat sidebar:

- New Chat button
- Session list
- Delete session action

Main area:

- Messages
- Sources under assistant messages
- Composer pinned to bottom

---

## 7. Chat Design Details

## User Message

- Right aligned
- Compact bubble
- Clear text

## Assistant Message

- Left aligned
- Markdown formatted
- More spacious
- Source section underneath

## Sources

Sources should be collapsible.

Each source card:

```txt
Document Name
Chunk Number
Snippet
```

Keep snippets short.

---

## 8. State Design

## Loading

Use skeletons for:

- Document table
- Chunk list
- Chat sessions
- Message history

Use button loading text for form submits.

---

## Empty

Every empty state should include:

```txt
Icon
Title
Description
CTA
```

---

## Error

Use alert components.

Error text should be human-readable.

Do not show raw technical errors.

---

## Success

Use toast notifications for:

- Config saved
- Document uploaded
- Document deleted
- Chat session created

---

## 9. Copy Guidelines

Use direct product language.

Good:

```txt
Upload PDF
View Chunks
Save Configuration
Ask a question about your documents
```

Avoid:

```txt
Execute ingestion pipeline
Run vectorization
Perform semantic retrieval
```

The user does not need internal technical language.

---

## 10. Accessibility Rules

- Every input has a label.
- Every button has clear text.
- Status badges include text, not only color.
- Dialogs are keyboard accessible.
- Chat input can send with Enter.
- Shift+Enter creates a new line.
- Use semantic headings.

---

## 11. Responsive Design

MVP should work best on desktop.

Minimum acceptable behavior:

- Landing page works on mobile.
- Auth pages work on mobile.
- Dashboard pages are usable on tablet/desktop.
- Chat layout can stack sidebar above main area on small screens.

Do not spend excessive MVP time on perfect mobile design.

---

## 12. Logo Usage

Use LexiVault wordmark in:

- Landing page
- Login
- Signup
- Sidebar top

Do not overuse the full logo in every page.

---

## 13. Design Anti-Patterns to Avoid

Do not build:

- Dashboard analytics cards
- Fake charts
- Theme switcher
- Avatar system
- Document folders
- Team workspace UI
- Admin UI

Focus on the product workflow.

---

## 14. MVP Design Success Criteria

The design is successful if a user can immediately understand how to:

1. Understand what LexiVault does from the landing page
2. Log in
3. Add Gemini API key
4. Upload a PDF
5. See document status
6. Inspect chunks
7. Start a chat
8. Ask a question
9. See answer sources
10. Delete a document

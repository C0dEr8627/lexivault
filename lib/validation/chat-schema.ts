import { z } from "zod";

export const chatSessionTitleSchema = z.object({
  title: z.string().trim().max(120, "Title must be 120 characters or fewer.").optional(),
});

export const chatMessageSchema = z.object({
  sessionId: z.string().uuid("Invalid session id."),
  message: z.string().trim().min(1, "Message is required.").max(4000, "Message must be 4000 characters or fewer."),
});

export type ChatSessionTitleInput = z.infer<typeof chatSessionTitleSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

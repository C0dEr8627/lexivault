import { z } from "zod";

export const GEMINI_MODEL = "gemini-2.5-flash";
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const GEMINI_MODEL_OPTIONS = [GEMINI_MODEL, "gemini-2.5-pro", "gemini-2.0-flash"] as const;

export const configSchema = z.object({
  geminiApiKey: z.string().trim().default(""),
  langsmithApiKey: z.string().trim().default(""),
  langsmithProject: z.string().trim().default(""),
  pineconeApiKey: z.string().trim().default(""),
  pineconeIndexName: z.string().trim().default(""),
  geminiModel: z.enum(GEMINI_MODEL_OPTIONS),
  embeddingModel: z.literal(EMBEDDING_MODEL),
  systemPrompt: z
    .string()
    .trim()
    .min(20, "System prompt must be at least 20 characters.")
    .max(4000, "System prompt must be 4000 characters or fewer."),
});

export type ConfigInput = z.infer<typeof configSchema>;

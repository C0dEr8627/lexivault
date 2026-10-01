import { z } from "zod";

export const GEMINI_MODEL = "gemini-3.8-flash";
export const EMBEDDING_MODEL = "gemini-embedding-001";

// Current Gemini text-generation models supported by the Gemini API.
export const GEMINI_MODEL_OPTIONS = [
  GEMINI_MODEL,
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
] as const;

// Retain support for existing accounts that have access to older 2.5 models.
export const LEGACY_GEMINI_MODEL_OPTIONS = ["gemini-2.5-flash", "gemini-2.5-pro"] as const;
export const GEMINI_MODEL_VALUES = [...GEMINI_MODEL_OPTIONS, ...LEGACY_GEMINI_MODEL_OPTIONS] as const;

export const configSchema = z.object({
  geminiApiKey: z.string().trim().default(""),
  langsmithApiKey: z.string().trim().default(""),
  langsmithProject: z.string().trim().default(""),
  pineconeApiKey: z.string().trim().default(""),
  pineconeIndexName: z.string().trim().default(""),
  geminiModel: z.enum(GEMINI_MODEL_VALUES),
  embeddingModel: z.literal(EMBEDDING_MODEL),
  systemPrompt: z
    .string()
    .trim()
    .min(20, "System prompt must be at least 20 characters.")
    .max(4000, "System prompt must be 4000 characters or fewer."),
});

export type ConfigInput = z.infer<typeof configSchema>;

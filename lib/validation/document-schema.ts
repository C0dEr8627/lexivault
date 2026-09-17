import { z } from "zod";

export const documentIdSchema = z.object({
  documentId: z.string().uuid("Invalid document id."),
});

export const documentsQuerySchema = z.object({
  status: z.enum(["processing", "ready", "failed", "deleted"]).optional(),
});

export type DocumentsQuery = z.infer<typeof documentsQuerySchema>;

export const documentChunksQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type DocumentChunksQuery = z.infer<typeof documentChunksQuerySchema>;

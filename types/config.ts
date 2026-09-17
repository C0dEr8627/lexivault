export type GeminiModel = "gemini-2.5-flash" | "gemini-2.5-pro" | "gemini-2.0-flash";
export type EmbeddingModel = "gemini-embedding-001";

export type ConfigRecord = {
  id: string;
  geminiModel: GeminiModel;
  embeddingModel: EmbeddingModel;
  langsmithProject: string;
  pineconeIndexName: string;
  systemPrompt: string;
  hasGeminiApiKey: boolean;
  hasLangsmithApiKey: boolean;
  hasPineconeApiKey: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ConfigFormValues = {
  geminiApiKey: string;
  langsmithApiKey: string;
  langsmithProject: string;
  pineconeApiKey: string;
  pineconeIndexName: string;
  geminiModel: GeminiModel;
  embeddingModel: EmbeddingModel;
  systemPrompt: string;
};

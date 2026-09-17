import { Pinecone } from "@pinecone-database/pinecone";

type PineconeVector = {
  id: string;
  values: number[];
  metadata: Record<string, string | number | boolean>;
};

type PineconeQueryMatch = {
  id: string;
  score?: number;
  metadata?: Record<string, string | number | boolean>;
};

type PineconeRuntimeConfig = {
  apiKey?: string;
  indexName?: string;
};

function getPineconeClient(apiKeyOverride?: string) {
  const apiKey = apiKeyOverride;

  if (!apiKey) {
    throw new Error("Pinecone API key is not configured.");
  }

  return new Pinecone({ apiKey });
}

function getPineconeIndexName(indexNameOverride?: string) {
  const indexName = indexNameOverride;

  if (!indexName) {
    throw new Error("Pinecone index name is not configured.");
  }

  return indexName;
}

export async function upsertDocumentVectors(namespace: string, vectors: PineconeVector[], runtimeConfig?: PineconeRuntimeConfig) {
  const pc = getPineconeClient(runtimeConfig?.apiKey);
  const indexModel = await pc.describeIndex(getPineconeIndexName(runtimeConfig?.indexName));
  const index = pc.index({ host: indexModel.host });

  await index.namespace(namespace).upsert({
    records: vectors,
  });
}

export async function queryDocumentVectors(namespace: string, vector: number[], topK = 5, runtimeConfig?: PineconeRuntimeConfig): Promise<PineconeQueryMatch[]> {
  const pc = getPineconeClient(runtimeConfig?.apiKey);
  const indexModel = await pc.describeIndex(getPineconeIndexName(runtimeConfig?.indexName));
  const index = pc.index({ host: indexModel.host });
  const result = await index.namespace(namespace).query({
    vector,
    topK,
    includeMetadata: true,
  });

  return (result.matches ?? []) as PineconeQueryMatch[];
}

export type TextChunk = {
  content: string;
  chunkIndex: number;
  tokenCount: number;
};

function estimateTokenCount(text: string) {
  return Math.max(1, Math.ceil(text.trim().length / 4));
}

export function splitTextIntoChunks(text: string, chunkSize = 1000, chunkOverlap = 200): TextChunk[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < normalized.length) {
    const end = Math.min(normalized.length, start + chunkSize);
    const content = normalized.slice(start, end).trim();

    if (content) {
      chunks.push({
        content,
        chunkIndex,
        tokenCount: estimateTokenCount(content),
      });
      chunkIndex += 1;
    }

    if (end >= normalized.length) {
      break;
    }

    start = Math.max(0, end - chunkOverlap);
  }

  return chunks;
}

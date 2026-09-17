import { ChunkCard } from "@/components/chunks/chunk-card";
import type { DocumentChunkRecord } from "@/types/chunks";

type ChunkListProps = {
  chunks: DocumentChunkRecord[];
};

export function ChunkList({ chunks }: ChunkListProps) {
  return (
    <div className="chunk-list">
      {chunks.map((chunk) => (
        <ChunkCard key={chunk.id} chunk={chunk} />
      ))}
    </div>
  );
}

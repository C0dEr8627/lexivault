import { Card } from "@/components/ui/card";
import type { DocumentChunkRecord } from "@/types/chunks";

type ChunkCardProps = {
  chunk: DocumentChunkRecord;
};

export function ChunkCard({ chunk }: ChunkCardProps) {
  return (
    <Card className="chunk-card">
      <div className="chunk-card-head">
        <div>
          <div className="section-kicker">Chunk {chunk.chunkIndex + 1}</div>
          <div className="chunk-card-meta">
            {chunk.tokenCount ?? "?"} tokens • {chunk.pineconeVectorId}
          </div>
        </div>
      </div>

      <p className="chunk-card-content">{chunk.content}</p>
    </Card>
  );
}

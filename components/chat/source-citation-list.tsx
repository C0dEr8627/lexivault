import Link from "next/link";
import type { ChatMessageSource } from "@/types/chat";
import { ChevronDownIcon } from "@/components/ui/app-icons";

type SourceCitationListProps = {
  sources: ChatMessageSource[];
};

export function SourceCitationList({ sources }: SourceCitationListProps) {
  return (
    <details className="chat-sources" open>
      <summary>
        <span className="chat-sources-summary-left">
          <ChevronDownIcon width={14} height={14} />
          <span>{sources.length} source{sources.length === 1 ? "" : "s"}</span>
        </span>
        <span className="chat-sources-count">{sources.length}</span>
      </summary>

      <div className="chat-sources-list">
        {sources.map((source) => (
          <article key={source.chunkId} className="chat-source-card">
            <div className="chat-source-head">
              <div>
                <div className="chat-source-title">{source.documentName}</div>
                <div className="chat-source-meta">Chunk {source.chunkIndex + 1}</div>
              </div>

              <Link href={`/documents/${source.documentId}/chunks`} className="chat-source-link">
                View chunks
              </Link>
            </div>

            <div className="chat-source-snippet">{source.snippet}</div>
          </article>
        ))}
      </div>
    </details>
  );
}

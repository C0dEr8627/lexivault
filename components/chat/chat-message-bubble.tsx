import type { ChatMessageRecord } from "@/types/chat";
import { SourceCitationList } from "@/components/chat/source-citation-list";
import { SparklesIcon } from "@/components/ui/app-icons";

type ChatMessageBubbleProps = {
  message: ChatMessageRecord;
};

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  const timestamp = new Date(message.createdAt).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className={`chat-bubble ${isAssistant ? "assistant" : "user"}`}>
      {isAssistant ? (
        <div className="chat-assistant-label">
          <span className="chat-assistant-badge">
            <SparklesIcon width={14} height={14} />
          </span>
          <span>LEXIVAULT</span>
        </div>
      ) : null}

      <div className="chat-bubble-meta">
        <span className={`chat-bubble-role ${isAssistant ? "assistant" : "user"}`}>
          {isAssistant ? "Grounded answer" : "You"}
        </span>
        <span className="chat-bubble-time">{timestamp}</span>
      </div>

      <div className="chat-bubble-content">{message.content}</div>

      {isAssistant ? (
        message.sources.length ? (
          <SourceCitationList sources={message.sources} />
        ) : (
          <div className="chat-citation-empty">
            No matching source chunks were available for this answer.
          </div>
        )
      ) : null}
    </article>
  );
}

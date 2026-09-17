"use client";

import { useState } from "react";
import Link from "next/link";
import { ChatIcon, TrashIcon } from "@/components/ui/app-icons";
import { DeleteChatSessionDialog } from "@/components/chat/delete-chat-session-dialog";
import type { ChatSessionRecord } from "@/types/chat";

type ChatSessionListProps = {
  sessions: ChatSessionRecord[];
  activeSessionId: string | null;
};

export function ChatSessionList({ sessions, activeSessionId }: ChatSessionListProps) {
  const [deleteTarget, setDeleteTarget] = useState<ChatSessionRecord | null>(null);
  const formatRelative = (value: string) => {
    const now = Date.now();
    const diffMinutes = Math.max(0, Math.floor((now - new Date(value).getTime()) / 1000 / 60));

    if (diffMinutes < 60) {
      return `${diffMinutes || 1}m ago`;
    }

    if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    }

    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  return (
    <div className="chat-session-list">
      {sessions.map((session) => {
        const isActive = session.id === activeSessionId;

        return (
          <div key={session.id} className={`chat-session-item${isActive ? " is-active" : ""}`}>
            <Link href={`/chat?sessionId=${session.id}`} className="chat-session-item-link">
              <div className="chat-session-item-icon">
                <ChatIcon width={16} height={16} />
              </div>
              <div className="chat-session-item-copy">
                <div className="chat-session-title">{session.title}</div>
                <div className="chat-session-meta">{formatRelative(session.updatedAt)}</div>
              </div>
            </Link>

            <button
              type="button"
              className="chat-session-delete-icon"
              aria-label={`Delete ${session.title}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setDeleteTarget(session);
              }}
            >
              <TrashIcon width={14} height={14} />
            </button>
          </div>
        );
      })}

      {deleteTarget ? (
        <DeleteChatSessionDialog
          sessionId={deleteTarget.id}
          sessionTitle={deleteTarget.title}
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}

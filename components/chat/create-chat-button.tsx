"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusIcon } from "@/components/ui/app-icons";
import { useToast } from "@/components/ui/toast-provider";

type CreateChatButtonProps = {
  className?: string;
  label?: string;
};

type CreateSessionResponse =
  | {
      success: true;
      data: {
        session: {
          id: string;
        };
      };
    }
  | { success: false; error: { code: string; message: string } };

export function CreateChatButton({ className = "chat-new-session-button", label = "New Chat" }: CreateChatButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = () => {
    setIsCreating(true);

    void (async () => {
      try {
        const response = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: "New Chat" }),
        });

        const data = (await response.json()) as CreateSessionResponse;

        if (!response.ok || !data.success) {
          showToast({
            tone: "error",
            title: "Unable to create chat",
            description: data.success ? "Please try again." : data.error.message,
          });
          return;
        }

        showToast({
          tone: "success",
          title: "Chat session created",
          description: "Your new private chat is ready.",
        });
        router.replace(`/chat?sessionId=${data.data.session.id}`);
        router.refresh();
      } catch {
        showToast({
          tone: "error",
          title: "Unable to create chat",
          description: "Please try again in a moment.",
        });
      } finally {
        setIsCreating(false);
      }
    })();
  };

  return (
    <button type="button" className={className} onClick={handleCreateSession} disabled={isCreating}>
      <PlusIcon width={18} height={18} />
      {isCreating ? "Creating..." : label}
    </button>
  );
}

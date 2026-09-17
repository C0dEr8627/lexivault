"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast-provider";

type DeleteChatSessionDialogProps = {
  sessionId: string;
  sessionTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type DeleteSessionResponse =
  | { success: true; data: { sessionId: string; deleted: true } }
  | { success: false; error: { code: string; message: string } };

export function DeleteChatSessionDialog({
  sessionId,
  sessionTitle,
  open,
  onOpenChange,
}: DeleteChatSessionDialogProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setError("");

    startTransition(async () => {
      try {
        const response = await fetch(`/api/chat/sessions/${sessionId}`, {
          method: "DELETE",
        });

        const data = (await response.json()) as DeleteSessionResponse;

        if (!response.ok || !data.success) {
          setError(data.success ? "Unable to delete the chat session." : data.error.message);
          return;
        }

        showToast({
          tone: "success",
          title: "Chat session deleted",
          description: `"${sessionTitle}" was removed from your workspace.`,
        });
        onOpenChange(false);
        router.replace("/chat");
        router.refresh();
      } catch {
        setError("Unable to delete the chat session right now.");
      }
    });
  };

  return (
    <Dialog
      open={open}
      title="Delete chat session?"
      description={`This will permanently remove "${sessionTitle}" and all of its messages.`}
      footer={
        <>
          <button type="button" className="dialog-button secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button type="button" className="dialog-button danger" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete chat"}
          </button>
        </>
      }
    >
      {error ? <div className="error-banner">{error}</div> : null}
      <p className="page-copy" style={{ margin: 0 }}>
        This keeps your workspace tidy, but the conversation cannot be recovered from the app once it is deleted.
      </p>
    </Dialog>
  );
}

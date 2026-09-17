"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast-provider";

type DeleteDocumentDialogProps = {
  documentId: string;
  documentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type DeleteResponse =
  | { success: true; data: { documentId: string; status: "deleted"; isActive: false } }
  | { success: false; error: { code: string; message: string } };

export function DeleteDocumentDialog({
  documentId,
  documentName,
  open,
  onOpenChange,
}: DeleteDocumentDialogProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setError("");

    startTransition(async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`, {
          method: "DELETE",
        });

        const data = (await response.json()) as DeleteResponse;

        if (!response.ok || !data.success) {
          setError(data.success ? "Unable to delete the document." : data.error.message);
          return;
        }

        showToast({
          tone: "success",
          title: "Document deleted",
          description: `${documentName} was removed from future retrieval.`,
        });
        onOpenChange(false);
        router.refresh();
      } catch {
        setError("Unable to delete the document right now.");
      }
    });
  };

  return (
    <Dialog
      open={open}
      title="Delete document?"
      description={`This will remove ${documentName} from future chat retrieval. The record stays soft-deleted for audit purposes.`}
      footer={
        <>
          <button type="button" className="dialog-button secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button type="button" className="dialog-button danger" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete document"}
          </button>
        </>
      }
    >
      {error ? <div className="error-banner">{error}</div> : null}
      <p className="page-copy" style={{ margin: 0 }}>
        Existing chats may still show earlier answers, but this document will no longer be used as active grounding context.
      </p>
    </Dialog>
  );
}

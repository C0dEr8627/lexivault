"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { SendIcon } from "@/components/ui/app-icons";

type ChatComposerProps = {
  sessionId: string;
  disabled?: boolean;
};

type SendMessageResponse =
  | {
      success: true;
      data: {
        message: {
          id: string;
        };
      };
    }
  | { success: false; error: { code: string; message: string } };

export function ChatComposer({ sessionId, disabled = false }: ChatComposerProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSend = !disabled && !isSubmitting && message.trim().length > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    void (async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            message: message.trim(),
          }),
        });

        const data = (await response.json()) as SendMessageResponse;

        if (!response.ok || !data.success) {
          setError(data.success ? "Unable to send the message right now." : data.error.message);
          return;
        }

        setMessage("");
        router.refresh();
      } catch {
        setError("Unable to send the message right now.");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <div className="chat-composer-shell">
      <form className="chat-composer" onSubmit={handleSubmit}>
        <div className="chat-composer-field">
          <textarea
            className="chat-composer-input"
            placeholder="Ask a question about your uploaded documents..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            disabled={disabled || isSubmitting}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (canSend) {
                  void handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
                }
              }
            }}
          />

          <button type="submit" className="chat-send-button" disabled={!canSend} aria-label="Send message">
            <SendIcon width={18} height={18} />
          </button>
        </div>

        <div className="chat-composer-hint">Enter to send · Shift+Enter for new line</div>
      </form>

      {error ? (
        <Alert title="Chat request failed" tone="error">
          {error}
        </Alert>
      ) : null}
    </div>
  );
}

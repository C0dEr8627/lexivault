import Link from "next/link";

type EmptyChatStateProps = {
  kind: "sessions" | "documents" | "config";
};

export function EmptyChatState({ kind }: EmptyChatStateProps) {
  if (kind === "documents") {
    return (
      <div className="chat-blank-state">
        <h2>Upload and process at least one PDF before asking questions.</h2>
        <p>Chat becomes useful after you have at least one processed document in your workspace.</p>
        <Link href="/documents" className="workspace-primary-button">
          Go to Documents
        </Link>
      </div>
    );
  }

  if (kind === "config") {
    return (
      <div className="chat-blank-state">
        <h2>Add your Gemini API key before using chat.</h2>
        <p>Chat needs your saved Gemini settings before it can answer from your documents.</p>
        <Link href="/config" className="workspace-primary-button">
          Go to Configuration
        </Link>
      </div>
    );
  }

  return (
    <div className="chat-session-empty-note">
      <span>No chats yet.</span>
    </div>
  );
}

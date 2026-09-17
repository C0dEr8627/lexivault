import { ChatSessionActions } from "@/components/chat/chat-session-actions";
import { CreateChatButton } from "@/components/chat/create-chat-button";
import { ChatSessionList } from "@/components/chat/chat-session-list";
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble";
import { ChatComposer } from "@/components/chat/chat-composer";
import { EmptyChatState } from "@/components/chat/empty-chat-state";
import { Alert } from "@/components/ui/alert";
import { ChatIcon, SendIcon } from "@/components/ui/app-icons";
import { getCurrentUserConfig } from "@/lib/services/config-service";
import { listCurrentUserDocuments } from "@/lib/services/document-service";
import { listCurrentUserChatSessions, listCurrentUserChatMessages } from "@/lib/services/chat-service";

type ChatPageProps = {
  searchParams: Promise<{
    sessionId?: string;
    new?: string;
  }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const query = await searchParams;
  const [configResult, documentsResult, sessionsResult] = await Promise.all([
    getCurrentUserConfig(),
    listCurrentUserDocuments({}),
    listCurrentUserChatSessions(),
  ]);

  const hasConfig = configResult.ok && Boolean(configResult.config);
  const hasDocuments = documentsResult.ok && documentsResult.data.documents.length > 0;
  const sessions = sessionsResult.ok ? sessionsResult.data.sessions : [];
  const shouldCreateNew = query.new === "1";
  const activeSessionId = shouldCreateNew ? null : query.sessionId ?? sessions[0]?.id ?? null;

  if (!configResult.ok) {
    return (
      <section className="workspace-page chat-page-layout">
        <header className="workspace-page-header">
          <div>
            <h1 className="workspace-page-title">Chat</h1>
            <p className="workspace-page-description">Ask questions about your uploaded documents.</p>
          </div>
        </header>
        <Alert title="Unable to load configuration" tone="error">
          {configResult.message}
        </Alert>
      </section>
    );
  }

  return (
    <section className="workspace-page chat-page-layout">
      {!hasConfig ? (
        <EmptyChatState kind="config" />
      ) : !hasDocuments ? (
        <EmptyChatState kind="documents" />
      ) : (
        <div className="chat-workspace">
          <aside className="chat-session-panel">
            <ChatSessionActions />
            {sessions.length ? <ChatSessionList sessions={sessions} activeSessionId={activeSessionId} /> : <EmptyChatState kind="sessions" />}
          </aside>

          <main className="chat-conversation-panel">
            {shouldCreateNew || !activeSessionId ? (
              <div className="chat-empty-workspace">
                <div className="chat-empty-header">Select a chat</div>
                <div className="chat-empty-stage">
                  <div className="chat-empty-stage-icon">
                    <ChatIcon width={28} height={28} />
                  </div>
                  <h2>Start chatting with your documents</h2>
                  <p>Create a new chat to ask questions grounded in your uploaded PDFs.</p>
                  <CreateChatButton className="chat-welcome-new-chat-button" />
                </div>
                <div className="chat-empty-composer">
                  <div className="chat-composer-field chat-empty-composer-field">
                    <textarea
                      className="chat-composer-input"
                      placeholder="Ask a question about your uploaded documents..."
                      rows={1}
                      disabled
                    />
                    <button type="button" className="chat-send-button" disabled aria-label="Send message">
                      <SendIcon width={18} height={18} />
                    </button>
                  </div>
                  <div className="chat-composer-hint">Enter to send · Shift+Enter for new line</div>
                </div>
              </div>
            ) : (
              await (async () => {
                const messagesResult = await listCurrentUserChatMessages(activeSessionId);

                if (!messagesResult.ok) {
                  return (
                    <Alert title="Unable to load messages" tone="error">
                      {messagesResult.message}
                    </Alert>
                  );
                }

                const { session, messages } = messagesResult.data;

                if (!session) {
                  return <EmptyChatState kind="sessions" />;
                }

                const hasMessages = messages.length > 0;

                return (
                  <div className="chat-thread-shell">
                    <div className="chat-thread-header">{session.title}</div>
                    <div className={`chat-thread-messages${hasMessages ? "" : " is-empty"}`}>
                      {hasMessages ? (
                        messages.map((message) => <ChatMessageBubble key={message.id} message={message} />)
                      ) : (
                        <div className="chat-thread-empty-state">
                          <div className="chat-thread-empty-icon">
                            <ChatIcon width={28} height={28} />
                          </div>
                          <h2>Start chatting with your documents</h2>
                          <p>Create a new chat to ask questions grounded in your uploaded PDFs.</p>
                          <CreateChatButton className="chat-thread-empty-button" />
                        </div>
                      )}
                    </div>
                    <ChatComposer sessionId={session.id} />
                  </div>
                );
              })()
            )}
          </main>
        </div>
      )}
    </section>
  );
}

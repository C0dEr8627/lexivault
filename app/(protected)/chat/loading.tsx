import { Card } from "@/components/ui/card";

export default function ChatLoading() {
  return (
    <section className="page-stack">
      <div className="loading-panel loading-header" />
      <div className="chat-shell">
        <div className="page-stack">
          <Card>
            <div className="loading-panel" />
          </Card>
          <Card>
            <div className="loading-skeleton" />
          </Card>
        </div>
        <Card>
          <div className="loading-panel" />
        </Card>
      </div>
    </section>
  );
}

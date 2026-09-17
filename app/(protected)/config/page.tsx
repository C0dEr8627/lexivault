import { Alert } from "@/components/ui/alert";
import { ConfigForm } from "@/components/config/config-form";
import { getCurrentUserConfig } from "@/lib/services/config-service";

export default async function ConfigPage() {
  const result = await getCurrentUserConfig();

  if (!result.ok) {
    return (
      <section className="workspace-page">
        <header className="workspace-page-header">
          <div>
            <h1 className="workspace-page-title">Configuration</h1>
            <p className="workspace-page-description">Manage your Gemini, LangSmith, Pinecone, and document assistant settings.</p>
          </div>
        </header>

        <Alert title="Unable to load configuration" tone="error">
          {result.message}
        </Alert>
      </section>
    );
  }

  return (
    <section className="workspace-page">
      <header className="workspace-page-header">
        <div>
          <h1 className="workspace-page-title">Configuration</h1>
            <p className="workspace-page-description">Manage your Gemini, LangSmith, Pinecone, and document assistant settings.</p>
        </div>
      </header>

      {result.config ? null : (
        <Alert title="No configuration saved yet" tone="warning" className="workspace-inline-alert">
          Add your Gemini, LangSmith, and Pinecone settings to enable uploads, chat, and document processing.
        </Alert>
      )}

      <ConfigForm initialConfig={result.config} />
    </section>
  );
}

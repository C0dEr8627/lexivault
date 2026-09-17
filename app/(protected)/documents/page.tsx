import { Alert } from "@/components/ui/alert";
import { DocumentsWorkspace } from "@/components/documents/documents-workspace";
import { getCurrentUserConfig } from "@/lib/services/config-service";
import { listCurrentUserDocuments } from "@/lib/services/document-service";

export default async function DocumentsPage() {
  const [configResult, documentsResult] = await Promise.all([
    getCurrentUserConfig(),
    listCurrentUserDocuments({}),
  ]);

  const hasConfig = configResult.ok && Boolean(configResult.config);

  if (!documentsResult.ok) {
    return (
      <section className="workspace-page">
        <header className="workspace-page-header">
          <div>
            <h1 className="workspace-page-title">Documents</h1>
            <p className="workspace-page-description">Upload PDFs and turn them into a private searchable knowledge base.</p>
          </div>
        </header>

        <Alert title="Unable to load documents" tone="error">
          {documentsResult.message}
        </Alert>
      </section>
    );
  }

  return (
    <section className="workspace-page">
      <header className="workspace-page-header">
        <div>
          <h1 className="workspace-page-title">Documents</h1>
          <p className="workspace-page-description">Upload PDFs and turn them into a private searchable knowledge base.</p>
        </div>
      </header>

      <DocumentsWorkspace hasConfig={hasConfig} initialDocuments={documentsResult.data.documents} />
    </section>
  );
}

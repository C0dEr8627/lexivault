import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { ChunkList } from "@/components/chunks/chunk-list";
import { getCurrentUserDocument, listCurrentUserDocumentChunks } from "@/lib/services/document-service";

type ChunkPageProps = {
  params: Promise<{
    documentId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
};

export default async function DocumentChunksPage({ params, searchParams }: ChunkPageProps) {
  const { documentId } = await params;
  const query = await searchParams;

  const [documentResult, chunksResult] = await Promise.all([
    getCurrentUserDocument(documentId),
    listCurrentUserDocumentChunks(documentId, {
      page: query.page ?? undefined,
      limit: query.limit ?? undefined,
    }),
  ]);

  if (!documentResult.ok || !chunksResult.ok) {
    const message = !documentResult.ok
      ? documentResult.message
      : !chunksResult.ok
        ? chunksResult.message
        : "Unable to load document chunks.";

    return (
      <section className="page-stack chunks-page">
        <PageHeader
          eyebrow="Protected page"
          title="Document Chunks"
          description="Review the text chunks created from this document."
          action={
            <Link href="/documents" className="button-link secondary">
              Back to documents
            </Link>
          }
        />

        <Alert title="Unable to load chunks" tone="error">
          {message}
        </Alert>
      </section>
    );
  }

  const { document, pagination, chunks } = chunksResult.data;

  return (
    <section className="page-stack chunks-page">
      <PageHeader
        eyebrow="Protected page"
        title="Document Chunks"
        description="Review the text chunks created from this document."
        action={
          <Link href="/documents" className="button-link secondary">
            Back to documents
          </Link>
        }
      />

      <Card className="chunk-summary-card">
        <div className="chunk-summary-grid">
          <div>
            <div className="section-kicker">File</div>
            <div className="chunk-summary-value">{document.fileName}</div>
          </div>
          <div>
            <div className="section-kicker">Status</div>
            <div className="chunk-summary-value">{document.status}</div>
          </div>
          <div>
            <div className="section-kicker">Chunk count</div>
            <div className="chunk-summary-value">{document.chunkCount}</div>
          </div>
          <div>
            <div className="section-kicker">Page</div>
            <div className="chunk-summary-value">
              {pagination.page} of {pagination.totalPages}
            </div>
          </div>
        </div>
      </Card>

      {chunks.length ? (
        <>
          <ChunkList chunks={chunks} />

          {pagination.totalPages > 1 ? (
            <div className="chunk-pagination">
              {pagination.page > 1 ? (
                <Link
                  href={`/documents/${documentId}/chunks?page=${pagination.page - 1}&limit=${pagination.limit}`}
                  className="button-link secondary"
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}

              {pagination.page < pagination.totalPages ? (
                <Link
                  href={`/documents/${documentId}/chunks?page=${pagination.page + 1}&limit=${pagination.limit}`}
                  className="button-link secondary"
                >
                  Next
                </Link>
              ) : (
                <span />
              )}
            </div>
          ) : null}
        </>
      ) : (
        <Card>
          <EmptyState
            eyebrow="Chunks"
            title="No chunks found for this document."
            description="This document may still be processing, or it may not have produced any chunkable text yet."
            action={
              <Link href="/documents" className="button-link primary">
                Back to documents
              </Link>
            }
          />
        </Card>
      )}
    </section>
  );
}

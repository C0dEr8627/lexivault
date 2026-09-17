import { listCurrentUserDocumentChunks } from "@/lib/services/document-service";
import { errorResponse, successResponse } from "@/lib/utils/api-response";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { documentId } = await params;
  const url = new URL(request.url);
  const result = await listCurrentUserDocumentChunks(documentId, {
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!result.ok) {
    const status = result.code === "UNAUTHORIZED" ? 401 : result.code === "NOT_FOUND" ? 404 : 500;
    return errorResponse(result.code, result.message, status);
  }

  return successResponse(result.data);
}

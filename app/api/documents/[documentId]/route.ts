import { getCurrentUserDocument, softDeleteCurrentUserDocument } from "@/lib/services/document-service";
import { errorResponse, successResponse } from "@/lib/utils/api-response";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { documentId } = await params;
  const result = await getCurrentUserDocument(documentId);

  if (!result.ok) {
    return errorResponse(result.code, result.message, result.code === "UNAUTHORIZED" ? 401 : 500);
  }

  if (!result.data.document) {
    return errorResponse("NOT_FOUND", "Document not found.", 404);
  }

  return successResponse({ document: result.data.document });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { documentId } = await params;
  const result = await softDeleteCurrentUserDocument(documentId);

  if (!result.ok) {
    const status = result.code === "UNAUTHORIZED" ? 401 : result.code === "NOT_FOUND" ? 404 : 500;
    return errorResponse(result.code, result.message, status);
  }

  return successResponse(result.data);
}

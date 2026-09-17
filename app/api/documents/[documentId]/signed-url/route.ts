import { createDocumentSignedUrl } from "@/lib/services/document-service";
import { errorResponse, successResponse } from "@/lib/utils/api-response";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { documentId } = await params;
  const result = await createDocumentSignedUrl(documentId);

  if (!result.ok) {
    const status =
      result.code === "UNAUTHORIZED"
        ? 401
        : result.code === "NOT_FOUND"
          ? 404
          : result.code === "STORAGE_ERROR"
            ? 502
            : 500;

    return errorResponse(result.code, result.message, status);
  }

  return successResponse(result.data);
}

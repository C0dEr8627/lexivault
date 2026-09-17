import { listCurrentUserDocuments } from "@/lib/services/document-service";
import { errorResponse, successResponse } from "@/lib/utils/api-response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = await listCurrentUserDocuments({ status: url.searchParams.get("status") || undefined });

  if (!result.ok) {
    return errorResponse(result.code, result.message, result.code === "UNAUTHORIZED" ? 401 : 500);
  }

  return successResponse(result.data);
}

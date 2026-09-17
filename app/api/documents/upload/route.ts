import { processDocumentUpload } from "@/lib/services/ingestion-service";
import { errorResponse, successResponse } from "@/lib/utils/api-response";

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return errorResponse("VALIDATION_ERROR", "Please upload a PDF file.", 400);
  }

  const file = formData.get("file");
  const clientUploadId = formData.get("clientUploadId");

  if (!(file instanceof File)) {
    return errorResponse("VALIDATION_ERROR", "Please upload a PDF file.", 400);
  }

  const result = await processDocumentUpload({
    file,
    clientUploadId: typeof clientUploadId === "string" ? clientUploadId : null,
  });

  if (!result.ok) {
    const status =
      result.code === "UNAUTHORIZED"
        ? 401
        : result.code === "CONFIG_REQUIRED" || result.code === "INVALID_FILE_TYPE" || result.code === "FILE_TOO_LARGE"
          ? 400
          : result.code === "OCR_NOT_SUPPORTED"
            ? 400
            : 500;

    return errorResponse(result.code, result.message, status);
  }

  return successResponse({ document: result.document }, 201);
}

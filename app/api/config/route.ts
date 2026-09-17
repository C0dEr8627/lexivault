import { getCurrentUserConfig, saveCurrentUserConfig } from "@/lib/services/config-service";
import { errorResponse, successResponse } from "@/lib/utils/api-response";

export async function GET() {
  const result = await getCurrentUserConfig();

  if (!result.ok) {
    return errorResponse(result.code, result.message, result.code === "UNAUTHORIZED" ? 401 : 500);
  }

  if (!result.config) {
    return errorResponse("NOT_FOUND", "No configuration found.", 404);
  }

  return successResponse(result.config);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;
  const result = await saveCurrentUserConfig(body);

  if (!result.ok) {
    return errorResponse(result.code, result.message, result.code === "VALIDATION_ERROR" ? 400 : 500);
  }

  return successResponse(result.config, 201);
}

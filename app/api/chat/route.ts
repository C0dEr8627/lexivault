import { sendCurrentUserChatMessage } from "@/lib/services/chat-service";
import { errorResponse, successResponse } from "@/lib/utils/api-response";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;
  const result = await sendCurrentUserChatMessage(body);

  if (!result.ok) {
    const status =
      result.code === "VALIDATION_ERROR"
        ? 400
        : result.code === "UNAUTHORIZED"
          ? 401
          : result.code === "NOT_FOUND"
            ? 404
            : result.code === "CONFIG_MISSING"
              ? 400
              : 500;

    return errorResponse(result.code, result.message, status);
  }

  return successResponse(result.data, 201);
}

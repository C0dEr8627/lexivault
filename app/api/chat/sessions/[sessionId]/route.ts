import {
  deleteCurrentUserChatSession,
  getCurrentUserChatSession,
  updateCurrentUserChatSessionTitle,
} from "@/lib/services/chat-service";
import { errorResponse, successResponse } from "@/lib/utils/api-response";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { sessionId } = await params;
  const result = await getCurrentUserChatSession(sessionId);

  if (!result.ok) {
    return errorResponse(result.code, result.message, result.code === "UNAUTHORIZED" ? 401 : 500);
  }

  if (!result.data.session) {
    return errorResponse("NOT_FOUND", "Chat session not found.", 404);
  }

  return successResponse({ session: result.data.session });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { sessionId } = await params;
  const body = (await request.json().catch(() => null)) as unknown;
  const result = await updateCurrentUserChatSessionTitle(sessionId, body);

  if (!result.ok) {
    return errorResponse(result.code, result.message, result.code === "VALIDATION_ERROR" ? 400 : 500);
  }

  return successResponse(result.data);
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { sessionId } = await params;
  const result = await deleteCurrentUserChatSession(sessionId);

  if (!result.ok) {
    return errorResponse(result.code, result.message, result.code === "UNAUTHORIZED" ? 401 : 500);
  }

  return successResponse(result.data);
}

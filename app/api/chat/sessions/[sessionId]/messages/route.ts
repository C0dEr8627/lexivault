import { listCurrentUserChatMessages } from "@/lib/services/chat-service";
import { errorResponse, successResponse } from "@/lib/utils/api-response";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { sessionId } = await params;
  const result = await listCurrentUserChatMessages(sessionId);

  if (!result.ok) {
    return errorResponse(result.code, result.message, result.code === "UNAUTHORIZED" ? 401 : 500);
  }

  return successResponse(result.data);
}
